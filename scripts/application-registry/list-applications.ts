import { spawnSync } from "node:child_process";
import path from "node:path";
const result = spawnSync(process.execPath, [...process.execArgv, path.join(process.cwd(), "scripts/application-registry/registry-cli.ts"), "list", ...process.argv.slice(2)], { stdio: "inherit" });
process.exitCode = result.status ?? 1;

