import type { ClassificationResult, DomainClassification } from "../models";
import { classifySignals } from "./RoleClassifier";

const DOMAIN_SIGNALS: Readonly<Record<Exclude<DomainClassification, "Unknown">, readonly string[]>> = Object.freeze({
  AI: ["ai", "machine learning", "ml", "llm", "generative ai", "model"],
  FinTech: ["fintech", "financial", "banking", "risk", "compliance"],
  Payments: ["payments", "checkout", "cards", "wallet", "settlement"],
  SaaS: ["saas", "subscription", "b2b software"],
  Marketplace: ["marketplace", "supply", "demand"],
  Consumer: ["consumer", "mobile app", "users"],
  Enterprise: ["enterprise", "b2b", "platform", "admin"],
  Healthcare: ["healthcare", "clinical", "patient"]
});

export class DomainClassifier {
  classify(description: string): ClassificationResult<DomainClassification> {
    return classifySignals(description, DOMAIN_SIGNALS, "Domain classification");
  }
}
