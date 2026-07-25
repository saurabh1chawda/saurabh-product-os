import { HiringArtifactBuilder } from "../builders";
import type { HiringExpectation, HiringModel, JobModel } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class HiringAnalyzer {
  private readonly artifactBuilder = new HiringArtifactBuilder();

  analyze(jobModel: JobModel): HiringModel {
    const evidenceExpectations = jobModel.requiredCompetencies.flatMap((competency) => {
      return jobModel.evidenceExpectations.filter((expectation) => competency.evidenceExpectationIds.includes(expectation.expectationId));
    });
    const expectation = (id: string, dimension: string, text: string, evidence = evidenceExpectations): HiringExpectation => immutableRecord({
      expectationId: `hiring:${id}`,
      dimension,
      expectation: text,
      evidenceExpectations: immutableArray(evidence),
      confidence: confidenceFromScore(78, `Mapped ${dimension} from JobModel responsibilities and competencies.`)
    });
    const partial = immutableRecord({
      artifactKind: "HiringModel" as const,
      jobModelId: jobModel.source.jobDescriptionId,
      leadershipExpectations: immutableArray([expectation("leadership", "Leadership", "Demonstrate ownership, influence, and decision quality.")]),
      communicationExpectations: immutableArray([expectation("communication", "Communication", "Communicate trade-offs clearly with stakeholders.")]),
      stakeholderExpectations: immutableArray([expectation("stakeholders", "Stakeholders", "Work cross-functionally across product, engineering, design, and business teams.")]),
      executionExpectations: immutableArray([expectation("execution", "Execution", "Translate ambiguous goals into launched outcomes.")]),
      customerThinking: expectation("customer-thinking", "Customer Thinking", "Ground product choices in customer problems."),
      productThinking: expectation("product-thinking", "Product Thinking", "Frame product opportunities and roadmap priorities."),
      businessThinking: expectation("business-thinking", "Business Thinking", "Connect work to measurable business objectives."),
      technicalDepth: expectation("technical-depth", "Technical Depth", "Engage technical trade-offs at the depth implied by the role."),
      analyticalThinking: expectation("analytical-thinking", "Analytical Thinking", "Use metrics and experiments to evaluate success."),
      strategicThinking: expectation("strategic-thinking", "Strategic Thinking", "Explain market, domain, and product strategy choices."),
      ownership: expectation("ownership", "Ownership", "Show clear accountability for outcomes."),
      autonomy: expectation("autonomy", "Autonomy", "Operate with the autonomy expected by seniority."),
      decisionMaking: expectation("decision-making", "Decision Making", "Make evidence-backed decisions under constraints."),
      riskManagement: expectation("risk-management", "Risk Management", "Identify and mitigate execution and product risk."),
      experimentation: expectation("experimentation", "Experimentation", "Use tests or validation to reduce uncertainty."),
      influence: expectation("influence", "Influence", "Influence without relying solely on authority."),
      crossFunctionalCollaboration: expectation("cross-functional", "Cross-functional Collaboration", "Coordinate across functions to deliver outcomes."),
      behavioralExpectations: immutableArray([
        expectation("behavioral-ownership", "Behavioral", "Prepare examples showing ownership, conflict resolution, learning, and impact.")
      ]),
      evidenceExpectations: immutableArray(evidenceExpectations)
    });
    const built = this.artifactBuilder.build(partial, jobModel.source);

    return immutableRecord({ ...partial, ...built });
  }
}
