import { describe, expect, it } from "vitest";
import applicationPackage from "../../packages/application/package.json";

describe("application package dependency boundaries", () => {
  it("depends only on approved application-layer contract packages", () => {
    expect(packageDependencies(applicationPackage as PackageMetadata)).toEqual([
      "@career-companion/decision-engine",
      "@career-companion/decision-model",
      "@career-companion/kernel",
      "@career-companion/persistence",
      "@career-companion/repositories",
      "@career-companion/retrieval"
    ]);
  });

  it("does not depend on forbidden implementation, transport, workflow, or AI packages", () => {
    const dependencies = packageDependencies(applicationPackage as PackageMetadata);

    expect(dependencies).not.toContain("@career-companion/ai-platform");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/workflow");
    expect(dependencies).not.toContain("next");
    expect(dependencies).not.toContain("react");
  });
});

interface PackageMetadata {
  readonly dependencies?: Record<string, string>;
}

function packageDependencies(packageJson: PackageMetadata): readonly string[] {
  return Object.keys(packageJson.dependencies ?? {}).sort();
}
