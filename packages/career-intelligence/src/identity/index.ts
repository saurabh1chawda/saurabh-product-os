import type { ProfessionalIdentitySnapshot } from "@career-companion/career-knowledge";
import {
  createReason,
  createRecommendation,
  idToString,
  rankRecommendations,
  uniqueByReference
} from "../shared";
import type { Ranking, Recommendation } from "../shared";

export type IdentityRecommendation = Recommendation<ProfessionalIdentitySnapshot>;

export interface IdentityRankingStrategy {
  rank(identity: ProfessionalIdentitySnapshot): IdentityRecommendation;
}

export class EvidenceBackedIdentityRankingStrategy implements IdentityRankingStrategy {
  rank(identity: ProfessionalIdentitySnapshot): IdentityRecommendation {
    const identityId = idToString(identity.id);
    const statusWeight = identity.status === "active" ? 25 : identity.status === "draft" ? 10 : 0;
    const competencyWeight = Math.min(identity.competencyIds.length * 15, 35);
    const storyWeight = Math.min(identity.storyIds.length * 12, 25);
    const metricWeight = Math.min(identity.metricIds.length * 8, 15);
    const reasons = [
      createReason("identity-status", `${identity.status} identity receives lifecycle weighting.`, statusWeight, [identityId]),
      createReason("identity-competencies", `${identity.competencyIds.length} competencies support this identity.`, competencyWeight, [identityId]),
      createReason("identity-stories", `${identity.storyIds.length} stories support this identity.`, storyWeight, [identityId]),
      createReason("identity-metrics", `${identity.metricIds.length} metrics support this identity.`, metricWeight, [identityId])
    ];

    return createRecommendation({
      subject: identity,
      score: statusWeight + competencyWeight + storyWeight + metricWeight,
      confidence: identity.status === "active" ? 0.85 : 0.5,
      reasons,
      summary: `Identity ${identity.name} is ranked by lifecycle status and attached support.`
    });
  }
}

export class ProfessionalIdentityAssembler {
  assemble(identities: readonly ProfessionalIdentitySnapshot[]): readonly ProfessionalIdentitySnapshot[] {
    return [...uniqueByReference(identities, (identity) => idToString(identity.id))].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }
}

export class IdentitySelector {
  constructor(private readonly strategy: IdentityRankingStrategy = new EvidenceBackedIdentityRankingStrategy()) {}

  select(identities: readonly ProfessionalIdentitySnapshot[]): readonly Ranking<ProfessionalIdentitySnapshot>[] {
    return rankRecommendations(identities.map((identity) => this.strategy.rank(identity)));
  }

  explainHighest(identities: readonly ProfessionalIdentitySnapshot[]): IdentityRecommendation | undefined {
    return this.select(identities)[0];
  }
}
