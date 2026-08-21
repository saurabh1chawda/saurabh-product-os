import { request } from "node:http";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  NodeHttpApiServer,
  NodeHttpApiServerConfigurationError,
  NodeHttpApiServerLifecycle,
  type NodeHttpRequest,
  type NodeHttpResponse
} from "../src";

describe("Node HTTP API server primitives", () => {
  it("starts on an ephemeral loopback port and reports safe status", async () => {
    const server = new NodeHttpApiServer({
      handler: () => ({ status: 200, body: { ok: true } })
    });

    const status = await server.start({ port: 0, host: "127.0.0.1" });

    expect(status.lifecycle).toBe(NodeHttpApiServerLifecycle.Listening);
    expect(status.listening).toBe(true);
    expect(status.port).toBeGreaterThan(0);
    expect(JSON.stringify(server)).not.toMatch(/handler|socket|authorization|token|runtime|repository/i);

    await server.stop();
    expect(server.status().toJSON()).toMatchObject({
      lifecycle: NodeHttpApiServerLifecycle.Stopped,
      listening: false
    });
  });

  it("normalizes method, pathname, search, and headers for the injected handler", async () => {
    const seen: NodeHttpRequest[] = [];
    const server = await startedServer({
      handler: (input) => {
        seen.push(input);
        return {
          status: 200,
          headers: { "x-correlation-id": "correlation:transport" },
          body: { received: true }
        };
      }
    });

    try {
      const response = await send({
        port: server.status().port!,
        path: "/alpha/bravo?x=1",
        method: "get",
        headers: {
          Authorization: "Bearer public-token",
          "X-Correlation-ID": "correlation:incoming"
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.headers["x-correlation-id"]).toBe("correlation:transport");
      expect(response.body).toEqual({ received: true });
      expect(seen).toHaveLength(1);
      expect(seen[0]).toMatchObject({
        method: "GET",
        pathname: "/alpha/bravo",
        search: "?x=1"
      });
      expect(seen[0]?.headers.authorization).toBe("Bearer public-token");
      expect(seen[0]?.headers["x-correlation-id"]).toBe("correlation:incoming");
    } finally {
      await server.stop();
    }
  });

  it("serializes handler responses as safe JSON and never exposes Error objects", async () => {
    const server = await startedServer({
      handler: () => ({
        status: 404,
        headers: { "x-safe": "yes" },
        body: {
          error: {
            code: "not-found",
            message: "Not found."
          }
        }
      })
    });

    try {
      const response = await send({ port: server.status().port!, path: "/missing" });

      expect(response.status).toBe(404);
      expect(response.headers["x-safe"]).toBe("yes");
      expect(response.body).toEqual({
        error: {
          code: "not-found",
          message: "Not found."
        }
      });
      expect(JSON.stringify(response.body)).not.toMatch(/stack|cause|Error:|name/i);
    } finally {
      await server.stop();
    }
  });

  it("contains unexpected handler rejection with a generic 500 response", async () => {
    const server = await startedServer({
      handler: async () => {
        throw new Error("secret token SQLSTATE stack trace");
      }
    });

    try {
      const response = await send({ port: server.status().port!, path: "/boom" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: {
          code: "internal-error",
          message: "Internal server error."
        }
      });
      expect(JSON.stringify(response.body)).not.toMatch(/secret|SQLSTATE|stack|token/i);
    } finally {
      await server.stop();
    }
  });

  it("rejects oversized headers safely before invoking the handler", async () => {
    let handlerCalls = 0;
    const server = await startedServer({
      maxHeaderValueLength: 8,
      handler: () => {
        handlerCalls += 1;
        return { status: 200, body: { ok: true } };
      }
    });

    try {
      const response = await send({
        port: server.status().port!,
        path: "/oversized",
        headers: { "x-large": "too-large-value" }
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: {
          code: "invalid-request",
          message: "Invalid request."
        }
      });
      expect(handlerCalls).toBe(0);
    } finally {
      await server.stop();
    }
  });

  it("transports Authorization and correlation headers without interpreting them", async () => {
    const seen: NodeHttpRequest[] = [];
    const server = await startedServer({
      handler: (input) => {
        seen.push(input);
        return { status: 200, body: { ok: true } };
      }
    });

    try {
      await send({
        port: server.status().port!,
        path: "/headers",
        headers: {
          Authorization: "Bearer not-decoded-here",
          "x-correlation-id": "not-normalized-here"
        }
      });

      expect(seen[0]?.headers.authorization).toBe("Bearer not-decoded-here");
      expect(seen[0]?.headers["x-correlation-id"]).toBe("not-normalized-here");
    } finally {
      await server.stop();
    }
  });

  it("makes repeated and concurrent stop calls safe", async () => {
    const server = await startedServer({
      handler: () => ({ status: 200, body: { ok: true } })
    });

    await Promise.all([server.stop(), server.stop()]);
    await server.stop();

    expect(server.status().toJSON()).toMatchObject({
      lifecycle: NodeHttpApiServerLifecycle.Stopped,
      listening: false
    });
  });

  it("validates listen configuration and avoids duplicate listeners", async () => {
    const server = new NodeHttpApiServer({
      handler: () => ({ status: 200, body: { ok: true } })
    });

    await expect(server.start({ port: -1 })).rejects.toBeInstanceOf(NodeHttpApiServerConfigurationError);
    await expect(server.start({ port: 65536 })).rejects.toBeInstanceOf(NodeHttpApiServerConfigurationError);
    await expect(server.start({ port: 0, host: " " })).rejects.toBeInstanceOf(NodeHttpApiServerConfigurationError);

    const first = await server.start({ port: 0, host: "127.0.0.1" });
    const second = await server.start({ port: 0, host: "127.0.0.1" });
    expect(second.port).toBe(first.port);

    await server.stop();
  });

  it("keeps generic HTTP source route-free, framework-free, and boundary-clean", () => {
    const source = readSource(httpSourceDirectoryPath());

    expect(source).toContain("node:http");
    expect(source).not.toContain(["portfolio", "workspace"].join("-"));
    expect(source).not.toContain(["Portfolio", "Execution"].join(""));
    expect(source).not.toContain(["Portfolio", "Workspace"].join(""));
    expect(source).not.toContain(["Postgres", "PortfolioExecutionRepository"].join(""));
    expect(source).not.toContain(["PortfolioExecution", "Repository"].join(""));
    expect(source).not.toContain(["drizzle", "("].join(""));
    expect(source).not.toContain(["new ", "Pool"].join(""));
    expect(source).not.toContain(["Presentation", "Principal"].join(""));
    expect(source).not.toContain(["Get", "PortfolioExecution", "PublicBinding"].join(""));
    expect(source).not.toContain(["Initialize", "PortfolioExecution"].join(""));
    expect(source).not.toContain(["express"].join(""));
    expect(source).not.toContain(["fast", "ify"].join(""));
    expect(source).not.toContain(["H", "ono"].join(""));
    expect(source).not.toContain(["next", "/"].join(""));
    expect(source).not.toContain(["Service", "Locator"].join(""));
    expect(source).not.toContain(["Command", "Bus"].join(""));
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("process.exit");
    expect(source).not.toContain("SIGTERM");
    expect(source).not.toContain("SIGINT");
  });
});

async function startedServer(input: {
  readonly handler: (request: NodeHttpRequest) => NodeHttpResponse | Promise<NodeHttpResponse>;
  readonly maxHeaderValueLength?: number;
}): Promise<NodeHttpApiServer> {
  const server = new NodeHttpApiServer(input);
  await server.start({ port: 0, host: "127.0.0.1" });
  return server;
}

function send(input: {
  readonly port: number;
  readonly path: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
}): Promise<{
  readonly status: number;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly body: unknown;
}> {
  return new Promise((resolve, reject) => {
    const clientRequest = request({
      host: "127.0.0.1",
      port: input.port,
      path: input.path,
      method: input.method ?? "GET",
      headers: input.headers
    }, (response) => {
      const chunks: Buffer[] = [];

      response.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      response.on("end", () => {
        const rawBody = Buffer.concat(chunks).toString("utf8");
        resolve({
          status: response.statusCode ?? 0,
          headers: response.headers,
          body: rawBody.length === 0 ? undefined : JSON.parse(rawBody)
        });
      });
    });

    clientRequest.on("error", reject);
    clientRequest.end();
  });
}

function readSource(directory: string): string {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return readSource(path);
    }

    return entry.endsWith(".ts") ? readFileSync(path, "utf8") : "";
  }).join("\n");
}

function httpSourceDirectoryPath(): string {
  const cwd = process.cwd();

  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "src", "http");
  }

  return join(cwd, "apps", "api", "src", "http");
}
