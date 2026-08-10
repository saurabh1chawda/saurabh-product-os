import { PortfolioExecution } from "../aggregate/PortfolioExecution";
import type { PortfolioExecutionFact } from "../facts/PortfolioExecutionFacts";
import { ArtifactCandidateLifecycle } from "../models/ArtifactCandidateLifecycle";
import { PortfolioExecutionLifecycle } from "../models/PortfolioExecutionLifecycle";
import { CandidateId } from "../value-objects/CandidateId";
import { NoActionDecision, PolicyDecision, RecommendationDecision } from "./PolicyDecision";

export class CandidateAcceptancePolicy {
  private readonly __candidateAcceptancePolicyBrand!: never;

  constructor() {
    Object.freeze(this);
  }

  evaluate(
    execution: PortfolioExecution,
    candidateId: CandidateId,
    facts: readonly PortfolioExecutionFact[] = []
  ): PolicyDecision {
    const factTypes = facts.map((fact) => fact.type);
    const references = [execution.id.toJSON(), candidateId.toJSON()];
    const candidate = execution.findCandidate(candidateId);

    if (candidate === undefined) {
      return new NoActionDecision({
        decisionName: "ArtifactCandidateAcceptance",
        reason: "Artifact candidate is not known to this portfolio execution.",
        references,
        factTypes
      });
    }

    if (execution.lifecycle !== PortfolioExecutionLifecycle.Active) {
      return new NoActionDecision({
        decisionName: "ArtifactCandidateAcceptance",
        reason: "Artifact candidate acceptance requires an active portfolio execution.",
        references,
        factTypes
      });
    }

    if (candidate.lifecycle === ArtifactCandidateLifecycle.Accepted) {
      return new NoActionDecision({
        decisionName: "ArtifactCandidateAcceptance",
        reason: "Artifact candidate has already been accepted.",
        references,
        factTypes
      });
    }

    if (candidate.lifecycle === ArtifactCandidateLifecycle.Rejected) {
      return new NoActionDecision({
        decisionName: "ArtifactCandidateAcceptance",
        reason: "Artifact candidate has already been rejected.",
        references,
        factTypes
      });
    }

    return new RecommendationDecision({
      decisionName: "ArtifactCandidateAcceptance",
      reason: "Artifact candidate is registered and requires explicit human review before acceptance.",
      references,
      factTypes
    });
  }
}
