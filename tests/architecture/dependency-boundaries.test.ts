import { describe, expect, it } from "vitest";
import careerIntelligencePackage from "../../packages/career-intelligence/package.json";
import decisionModelPackage from "../../packages/decision-model/package.json";
import kernelPackage from "../../packages/kernel/package.json";

describe("package dependency boundaries", () => {
  it("keeps decision-model independent from domain and orchestration packages", () => {
    const dependencies = packageDependencies(decisionModelPackage as PackageMetadata);

    expect(dependencies).toEqual(["@career-companion/kernel"]);
    expect(dependencies).not.toContain("@career-companion/career-knowledge");
    expect(dependencies).not.toContain("@career-companion/career-intelligence");
    expect(dependencies).not.toContain("@career-companion/decision-engine");
  });

  it("keeps career-intelligence independent from decision-engine", () => {
    const dependencies = packageDependencies(careerIntelligencePackage as PackageMetadata);

    expect(dependencies).not.toContain("@career-companion/decision-engine");
  });

  it("keeps kernel free of package dependencies", () => {
    expect(packageDependencies(kernelPackage as PackageMetadata)).toEqual([]);
  });
});

interface PackageMetadata {
  readonly dependencies?: Record<string, string>;
}

function packageDependencies(packageJson: PackageMetadata): readonly string[] {
  return Object.keys(packageJson.dependencies ?? {}).sort();
}
