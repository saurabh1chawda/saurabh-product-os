import { immutableArray, immutableRecord } from "../shared";

export type CareerStrategyStage =
  | "CareerGoal"
  | "CurrentState"
  | "CareerGap"
  | "StrategyOptions"
  | "StrategyEvaluation"
  | "CareerStrategy";

export type CareerStrategyProfile =
  | "AggressiveGrowth"
  | "BalancedGrowth"
  | "OpportunityFirst"
  | "SkillFirst"
  | "LeadershipFirst"
  | "AITransformation"
  | "MarketPivot";

export type StrategyOptionKind =
  | "AggressiveGrowth"
  | "BalancedGrowth"
  | "AIFirst"
  | "LeadershipFirst"
  | "StartupFocus"
  | "EnterpriseFocus"
  | "GeographicPivot";

export interface CareerStrategyPolicy {
  readonly policyId: string;
  readonly aggressiveThreshold: number;
  readonly balancedThreshold: number;
  readonly opportunityWeight: number;
  readonly readinessWeight: number;
  readonly gapWeight: number;
  readonly leverageWeight: number;
}

export interface StrategicPreference {
  readonly preferenceId: string;
  readonly label: string;
  readonly value: string;
  readonly weight: number;
}

export function defaultCareerStrategyPolicy(input: Partial<CareerStrategyPolicy> = {}): CareerStrategyPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "career-strategy-policy:default",
    aggressiveThreshold: input.aggressiveThreshold ?? 82,
    balancedThreshold: input.balancedThreshold ?? 62,
    opportunityWeight: input.opportunityWeight ?? 0.25,
    readinessWeight: input.readinessWeight ?? 0.25,
    gapWeight: input.gapWeight ?? 0.25,
    leverageWeight: input.leverageWeight ?? 0.25
  });
}

export function defaultStrategicPreferences(): readonly StrategicPreference[] {
  return immutableArray([
    preference("preference:ai", "AI Transformation", "AI", 0.9),
    preference("preference:leadership", "Leadership Growth", "Leadership", 0.8),
    preference("preference:platform", "Platform Scope", "Platform", 0.75)
  ]);
}

function preference(preferenceId: string, label: string, value: string, weight: number): StrategicPreference {
  return immutableRecord({ preferenceId, label, value, weight });
}
