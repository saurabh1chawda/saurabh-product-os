import type { GenerateResumeCommand } from "@career-companion/application";
import { Confidence } from "@career-companion/career-intelligence";
import { createAlternative, createDecision, createDecisionExplanation, createRecommendation } from "@career-companion/decision-model";
import type {
  Alternative,
  Constraint,
  Decision,
  DecisionConfidence,
  DecisionReference,
  DecisionScore
} from "@career-companion/decision-model";
import { ExplanationAssembler } from "@career-companion/explainability";
import { SummaryBuilder, ExperienceBuilder, SkillsBuilder, ImpactPrioritizer } from "../builders";
import { ResumeEvidenceSelector } from "../evidence";
import { ResumeGapAnalyzer } from "../gap";
import type {
  ResumeExplanation,
  ResumeModel,
  ResumeRecommendation,
  ResumeSourceData
} from "../models";
import { immutableArray, immutableRecord } from "../models";
import { ResumeScoreCalculator } from "../score";
import { SectionBuilder } from "../sections";

export interface ResumeAnalyzerInput {
  readonly source: ResumeSourceData;
  readonly command?: GenerateResumeCommand;
}

export class ResumeAnalyzer {
  private readonly evidenceSelector = new ResumeEvidenceSelector();
  private readonly gapAnalyzer = new ResumeGapAnalyzer();
  private readonly summaryBuilder = new SummaryBuilder();
  private readonly experienceBuilder = new ExperienceBuilder();
  private readonly skillsBuilder = new SkillsBuilder();
  private readonly impactPrioritizer = new ImpactPrioritizer();
  private readonly scoreCalculator = new ResumeScoreCalculator();
  private readonly sectionBuilder = new SectionBuilder();
  private readonly explanationAssembler = new ExplanationAssembler();

  analyze(input: ResumeAnalyzerInput): ResumeModel {
    const selectedEvidence = this.evidenceSelector.select({
      evidence: input.source.evidence,
      limit: Math.min(input.source.evidence.length, 5)
    });
    const prioritizedAchievements = this.impactPrioritizer.prioritizeAchievements(input.source.achievements);
    const prioritizedMetrics = this.impactPrioritizer.prioritizeMetrics(input.source.metrics);
    const gaps = this.gapAnalyzer.analyze({
      requiredCompetencyIds: input.source.requiredCompetencyIds,
      demonstratedCompetencies: input.source.competencies
    });
    const summary = this.summaryBuilder.build({ source: input.source, selectedEvidence });
    const experience = this.experienceBuilder.build({ source: input.source, selectedEvidence });
    const skills = this.skillsBuilder.build(input.source);
    const score = this.scoreCalculator.calculate({
      selectedEvidence,
      demonstratedCompetencyCount: input.source.competencies.length,
      requiredCompetencyCount: input.source.requiredCompetencyIds.length,
      impactCount: prioritizedAchievements.length + prioritizedMetrics.length,
      gaps
    });
    const decision = createResumeDecision(input.source, score.value);
    const alternatives = createResumeAlternatives(input.source);
    const constraints = createResumeConstraints(input.source);
    const explanationSummary = this.explanationAssembler.assemble({
      decision,
      alternatives,
      constraints
    });
    const explanation = immutableRecord({
      selectedEvidence,
      competencies: immutableArray(input.source.competencies),
      confidence: Confidence.from(score.value / 100),
      decisionTraceReference: decisionTraceReference(input.source),
      alternativeConsideration: explanationSummary.alternatives,
      explanationSummary
    } satisfies ResumeExplanation);
    const recommendations = immutableArray([
      createResumeRecommendation({
        explanation,
        scoreValue: score.value,
        source: input.source
      })
    ]);
    const sections = this.sectionBuilder.build({
      summary,
      experience,
      skills,
      evidence: selectedEvidence,
      gaps,
      recommendations
    });

    return immutableRecord({
      resumeId: `resume:${input.source.careerProfile.id.toString()}`,
      profileId: input.source.careerProfile.id.toString(),
      sections,
      summary,
      experience,
      skills,
      evidence: selectedEvidence,
      gaps,
      recommendations,
      score,
      explanation
    });
  }
}

function createResumeDecision(source: ResumeSourceData, scoreValue: number): Decision {
  const references = createDecisionReferences(source);
  const decisionScore = createDecisionScore(scoreValue);
  const decisionConfidence = createDecisionConfidence(scoreValue);
  const reasons = immutableArray([
    {
      code: "resume-evidence-selection",
      statement: "Resume model is based on selected validated career evidence.",
      weight: 0.4,
      references
    },
    {
      code: "resume-competency-fit",
      statement: "Resume model reflects demonstrated competencies against target requirements.",
      weight: 0.4,
      references
    }
  ]);

  return createDecision({
    id: `decision:resume:${source.careerProfile.id.toString()}`,
    title: "Resume model recommendation",
    question: "Which validated career knowledge should shape the resume model?",
    outcome: scoreValue >= 70 ? "recommended" : "requires-review",
    status: "recommended",
    score: decisionScore,
    confidence: decisionConfidence,
    reasons,
    references,
    recommendations: [
      createRecommendation({
        id: `recommendation:resume:${source.careerProfile.id.toString()}`,
        recommendationType: "select",
        title: "Use deterministic resume model",
        statement: "Construct the resume model from selected evidence, competencies, and impact signals.",
        status: "recommended",
        score: decisionScore,
        confidence: decisionConfidence,
        reasons,
        references,
        explanation: createDecisionExplanation({
          summary: "Resume recommendation is derived from evidence, competency coverage, and deterministic scoring.",
          reasons,
          nodes: [],
          edges: [],
          paths: []
        }),
        metadata: decisionMetadata(source)
      })
    ],
    explanation: createDecisionExplanation({
      summary: "Resume model recommendation is explainable through selected evidence and competency coverage.",
      reasons,
      nodes: [],
      edges: [],
      paths: []
    }),
    summary: {
      headline: "Deterministic resume model",
      summary: "Validated career knowledge is transformed into an explainable resume model.",
      outcome: scoreValue >= 70 ? "recommended" : "requires-review",
      reasons
    },
    metadata: decisionMetadata(source)
  });
}

function createResumeAlternatives(source: ResumeSourceData): readonly Alternative[] {
  const evidenceReference = decisionReference("resume-model", "resume-model", "derived", "Deterministic ResumeModel");

  return immutableArray([
    createAlternative({
      id: `alternative:resume-model:${source.careerProfile.id.toString()}`,
      option: {
        id: `alternative-option:resume-model:${source.careerProfile.id.toString()}`,
        label: "Evidence-led ResumeModel",
        description: "Use validated career knowledge to construct an explainable resume model.",
        status: "preferred",
        references: [evidenceReference]
      },
      score: createDecisionScore(90),
      confidence: createDecisionConfidence(90),
      reasons: [{
        code: "preferred-deterministic-model",
        statement: "This option preserves deterministic behavior and defers rendering.",
        references: [evidenceReference]
      }]
    }),
    createAlternative({
      id: `alternative:rendered-resume:${source.careerProfile.id.toString()}`,
      option: {
        id: `alternative-option:rendered-resume:${source.careerProfile.id.toString()}`,
        label: "Rendered resume output",
        description: "Generate document output directly.",
        status: "rejected",
        references: [evidenceReference]
      },
      score: createDecisionScore(20),
      confidence: createDecisionConfidence(80),
      reasons: [{
        code: "rendering-out-of-scope",
        statement: "Rendering is outside the resume intelligence package boundary.",
        references: [evidenceReference]
      }]
    })
  ]);
}

function createResumeConstraints(source: ResumeSourceData): readonly Constraint[] {
  return immutableArray([
    {
      id: `constraint:validated-knowledge:${source.careerProfile.id.toString()}`,
      constraintType: "other",
      label: "Validated career knowledge only",
      description: "Resume intelligence must transform existing career knowledge without generating rendered output.",
      required: true,
      references: createDecisionReferences(source)
    }
  ]);
}

function createResumeRecommendation(input: {
  readonly explanation: ResumeExplanation;
  readonly scoreValue: number;
  readonly source: ResumeSourceData;
}): ResumeRecommendation {
  return immutableRecord({
    recommendationId: `resume-recommendation:${input.source.careerProfile.id.toString()}`,
    title: "Construct evidence-led resume model",
    reason: "Selected evidence and competency coverage provide deterministic resume support.",
    selectedEvidence: input.explanation.selectedEvidence,
    competencies: input.explanation.competencies,
    confidence: input.explanation.confidence,
    decisionTraceReference: input.explanation.decisionTraceReference,
    alternativeConsideration: input.explanation.alternativeConsideration,
    explanation: input.explanation
  });
}

function createDecisionReferences(source: ResumeSourceData): readonly DecisionReference[] {
  return immutableArray([
    decisionReference(source.careerProfile.id.toString(), "career-profile", "authoritative", source.careerProfile.displayName),
    ...source.evidence.map((evidence) => {
      return decisionReference(evidence.id.toString(), "evidence", "supporting", evidence.title);
    }),
    ...source.competencies.map((competency) => {
      return decisionReference(competency.id.toString(), "competency", "supporting", competency.name);
    })
  ]);
}

function decisionReference(
  referenceId: string,
  referenceType: string,
  authority: DecisionReference["authority"],
  label: string
): DecisionReference {
  return Object.freeze({ referenceId, referenceType, authority, label });
}

function createDecisionScore(value: number): DecisionScore {
  return Object.freeze({
    value,
    scale: "zero-to-one-hundred",
    label: value >= 70 ? "strong" : "needs-review"
  });
}

function createDecisionConfidence(scoreValue: number): DecisionConfidence {
  return Object.freeze({
    value: scoreValue / 100,
    level: scoreValue >= 80 ? "high" : scoreValue >= 50 ? "medium" : "low",
    rationale: "Confidence is derived deterministically from the resume score."
  });
}

function decisionMetadata(source: ResumeSourceData) {
  return Object.freeze({
    decisionId: `decision:resume:${source.careerProfile.id.toString()}`,
    modelVersion: 1,
    createdAt: source.decisionTrace.executionTimestamp,
    source: "resume-intelligence"
  });
}

function decisionTraceReference(source: ResumeSourceData): string {
  return `${source.decisionTrace.pipeline}:${source.decisionTrace.executionTimestamp}`;
}
