import type { ClassificationResult, SeniorityClassification } from "../models";
import { classifySignals } from "./RoleClassifier";

const SENIORITY_SIGNALS: Readonly<Record<Exclude<SeniorityClassification, "Unknown">, readonly string[]>> = Object.freeze({
  Intern: ["intern", "internship"],
  Associate: ["associate", "junior", "entry level"],
  MidLevel: ["product manager", "3+ years", "4+ years"],
  Senior: ["senior", "5+ years", "6+ years", "experienced"],
  Lead: ["lead", "staff", "group", "7+ years"],
  Principal: ["principal", "expert", "10+ years"],
  Director: ["director", "head of", "people manager"],
  Executive: ["vp", "vice president", "chief product"]
});

export class SeniorityClassifier {
  classify(description: string): ClassificationResult<SeniorityClassification> {
    return classifySignals(description, SENIORITY_SIGNALS, "Seniority classification");
  }
}
