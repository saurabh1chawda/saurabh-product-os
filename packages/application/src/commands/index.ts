import type { DecisionReference } from "@career-companion/decision-model";
import type { VersionToken } from "@career-companion/persistence";
import type { ApplicationCapability, ApplicationReference, ApplicationRequestId } from "../shared";

export interface ApplicationCommand<TPayload = unknown> {
  readonly commandId: ApplicationRequestId;
  readonly commandName: ApplicationCapability;
  readonly payload: TPayload;
  readonly references: readonly ApplicationReference[];
  readonly expectedVersion?: VersionToken;
}

export interface GenerateResumePayload {
  readonly careerProfileId: string;
  readonly targetOpportunityId?: string;
  readonly decisionReferences: readonly DecisionReference[];
}

export interface GeneratePortfolioPayload {
  readonly careerProfileId: string;
  readonly portfolioAssetIds: readonly string[];
  readonly decisionReferences: readonly DecisionReference[];
}

export interface PrepareInterviewPayload {
  readonly careerProfileId: string;
  readonly opportunityId: string;
  readonly interviewContextReference?: ApplicationReference;
}

export interface AnalyzeJobDescriptionPayload {
  readonly jobDescriptionReference: ApplicationReference;
  readonly careerProfileId?: string;
}

export interface EvaluateQualificationPayload {
  readonly careerProfileId: string;
  readonly jobDescriptionReference: ApplicationReference;
}

export interface GenerateLinkedInProfilePayload {
  readonly careerProfileId: string;
  readonly positioningDecisionReferences: readonly DecisionReference[];
}

export type GenerateResumeCommand = ApplicationCommand<GenerateResumePayload>;
export type GeneratePortfolioCommand = ApplicationCommand<GeneratePortfolioPayload>;
export type PrepareInterviewCommand = ApplicationCommand<PrepareInterviewPayload>;
export type AnalyzeJobDescriptionCommand = ApplicationCommand<AnalyzeJobDescriptionPayload>;
export type EvaluateQualificationCommand = ApplicationCommand<EvaluateQualificationPayload>;
export type GenerateLinkedInProfileCommand = ApplicationCommand<GenerateLinkedInProfilePayload>;

