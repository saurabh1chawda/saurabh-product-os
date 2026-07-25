import type { ClassificationResult, FunctionClassification } from "../models";
import { classifySignals } from "./RoleClassifier";

const FUNCTION_SIGNALS: Readonly<Record<Exclude<FunctionClassification, "Unknown">, readonly string[]>> = Object.freeze({
  ProductManagement: ["roadmap", "requirements", "product management", "product strategy"],
  ProductStrategy: ["strategy", "market", "competitive", "positioning"],
  ProductOperations: ["operations", "process", "governance", "operating"],
  Growth: ["growth", "activation", "retention", "conversion"],
  Platform: ["platform", "ai platform", "api", "developer", "infrastructure", "platform architecture", "technical trade-offs"],
  DataProduct: ["analytics", "data", "metrics", "experimentation"],
  TechnicalProduct: ["technical", "architecture", "engineering", "system"]
});

export class FunctionClassifier {
  classify(description: string): ClassificationResult<FunctionClassification> {
    return classifySignals(description, FUNCTION_SIGNALS, "Function classification");
  }
}
