import { immutableArray, immutableRecord } from "../shared";

export type OpportunityStage =
  | "OpportunityContext"
  | "CompanyAnalysis"
  | "RoleAnalysis"
  | "MarketAnalysis"
  | "CandidateFit"
  | "OpportunityDecision";

export type OpportunityDecisionOutcome =
  | "PursueImmediately"
  | "HighPriority"
  | "WorthExploring"
  | "Monitor"
  | "Decline";

export type OpportunitySignalCategory =
  | "company"
  | "role"
  | "market"
  | "candidate"
  | "constraint"
  | "assumption";

export interface OpportunitySignal {
  readonly signalId: string;
  readonly category: OpportunitySignalCategory;
  readonly label: string;
  readonly value: string;
  readonly weight: number;
}

export interface OpportunityEvaluationPolicy {
  readonly policyId: string;
  readonly minimumPursueScore: number;
  readonly highPriorityScore: number;
  readonly worthExploringScore: number;
  readonly monitorScore: number;
  readonly companySignalWeight: number;
  readonly roleSignalWeight: number;
  readonly marketSignalWeight: number;
  readonly fitSignalWeight: number;
}

export function defaultOpportunityPolicy(input: Partial<OpportunityEvaluationPolicy> = {}): OpportunityEvaluationPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "opportunity-policy:default",
    minimumPursueScore: input.minimumPursueScore ?? 85,
    highPriorityScore: input.highPriorityScore ?? 72,
    worthExploringScore: input.worthExploringScore ?? 55,
    monitorScore: input.monitorScore ?? 40,
    companySignalWeight: input.companySignalWeight ?? 0.2,
    roleSignalWeight: input.roleSignalWeight ?? 0.3,
    marketSignalWeight: input.marketSignalWeight ?? 0.2,
    fitSignalWeight: input.fitSignalWeight ?? 0.3
  });
}

export function defaultOpportunitySignals(): readonly OpportunitySignal[] {
  return immutableArray([
    signal("company:size", "company", "Company Size", "growth", 0.18),
    signal("company:maturity", "company", "Product Maturity", "mature", 0.2),
    signal("company:remote", "company", "Remote Policy", "remote", 0.12),
    signal("role:ownership", "role", "Ownership", "own", 0.2),
    signal("role:platform", "role", "Platform Scope", "platform", 0.18),
    signal("role:ai", "role", "AI Exposure", "ai", 0.16),
    signal("market:growth", "market", "Industry Growth", "growth", 0.22),
    signal("market:demand", "market", "Hiring Demand", "demand", 0.18)
  ]);
}

function signal(signalId: string, category: OpportunitySignalCategory, label: string, value: string, weight: number): OpportunitySignal {
  return immutableRecord({ signalId, category, label, value, weight });
}
