import { describe, expect, it } from "vitest";
import {
  Achievement,
  AchievementId,
  CapabilityEvidence,
  CapabilityEvidenceId,
  CareerProfile,
  CareerProfileId,
  Competency,
  CompetencyId,
  DateRange,
  EmploymentRecord,
  EmploymentRecordId,
  EvidenceReference,
  EvidenceReferenceId,
  Metric,
  MetricId,
  PortfolioAsset,
  PortfolioAssetId,
  ProfessionalIdentity,
  ProfessionalIdentityId,
  ProjectId,
  Story,
  StoryId
} from "../src";
import type { ISODateString } from "../src";

const date = (value: string): ISODateString => value as ISODateString;

describe("career knowledge aggregates", () => {
  it("enforces career profile lifecycle rules and duplicate employment prevention", () => {
    const profile = CareerProfile.create({
      id: new CareerProfileId("profile-1"),
      displayName: "Saurabh"
    }).value!;
    const employmentId = new EmploymentRecordId("employment-1");

    expect(profile.publish().isFailure).toBe(true);
    expect(profile.addEmployment(employmentId).isSuccess).toBe(true);
    expect(profile.addEmployment(employmentId).isFailure).toBe(true);
    expect(profile.publish().isSuccess).toBe(true);
    expect(profile.publish().isFailure).toBe(true);
    expect(profile.domainEvents.map((event) => event.eventType)).toContain("CareerProfilePublished");
  });

  it("enforces employment date and duplicate achievement invariants", () => {
    const dateRange = DateRange.create({ startDate: date("2024-01-01"), isCurrent: true }).value!;
    const employment = EmploymentRecord.start({
      id: new EmploymentRecordId("employment-2"),
      employerName: "Acme",
      roleTitle: "PM",
      dateRange
    }).value!;
    const achievementId = new AchievementId("achievement-1");

    expect(employment.end(date("2023-01-01")).isFailure).toBe(true);
    expect(employment.addAchievement(achievementId).isSuccess).toBe(true);
    expect(employment.addAchievement(achievementId).isFailure).toBe(true);
    expect(employment.end(date("2025-01-01")).isSuccess).toBe(true);
    expect(employment.end(date("2025-02-01")).isFailure).toBe(true);
    expect(employment.domainEvents.map((event) => event.eventType)).toContain("EmploymentEnded");
  });

  it("requires evidence before achievement verification", () => {
    const achievement = Achievement.create({
      id: new AchievementId("achievement-2"),
      title: "Improved funnel",
      description: "Improved onboarding",
      ownerId: new EmploymentRecordId("employment-3")
    }).value!;
    const evidenceId = new EvidenceReferenceId("evidence-1");

    expect(achievement.verify().isFailure).toBe(true);
    expect(achievement.attachEvidence(evidenceId).isSuccess).toBe(true);
    expect(achievement.attachEvidence(evidenceId).isFailure).toBe(true);
    expect(achievement.verify().isSuccess).toBe(true);
    expect(achievement.archive().isSuccess).toBe(true);
    expect(achievement.archive().isFailure).toBe(true);
    expect(achievement.domainEvents.map((event) => event.eventType)).toContain("AchievementVerified");
  });

  it("prevents duplicate competency references and duplicate deactivation", () => {
    const competency = Competency.create({
      id: new CompetencyId("competency-1"),
      name: "AI Product Management",
      category: "ai-product-management"
    }).value!;
    const projectId = new ProjectId("project-1");

    expect(competency.attachProject(projectId).isSuccess).toBe(true);
    expect(competency.attachProject(projectId).isFailure).toBe(true);
    expect(competency.deactivate().isSuccess).toBe(true);
    expect(competency.deactivate().isFailure).toBe(true);
  });

  it("tracks professional identity activation and duplicate references", () => {
    const identity = ProfessionalIdentity.create({
      id: new ProfessionalIdentityId("identity-1"),
      name: "AI Product Leader"
    }).value!;
    const storyId = new StoryId("story-1");

    expect(identity.attachStory(storyId).isSuccess).toBe(true);
    expect(identity.attachStory(storyId).isFailure).toBe(true);
    expect(identity.activate().isSuccess).toBe(true);
    expect(identity.activate().isFailure).toBe(true);
    expect(identity.toSnapshot().status).toBe("active");
  });

  it("requires supporting artifacts before capability evidence verification", () => {
    const capabilityEvidence = CapabilityEvidence.create({
      id: new CapabilityEvidenceId("capability-evidence-1"),
      competencyId: new CompetencyId("competency-2"),
      description: "Evidence of platform leadership"
    }).value!;

    expect(capabilityEvidence.verify().isFailure).toBe(true);
    expect(capabilityEvidence.attachProject(new ProjectId("project-2")).isSuccess).toBe(true);
    expect(capabilityEvidence.verify().isSuccess).toBe(true);
    expect(capabilityEvidence.archive().isSuccess).toBe(true);
    expect(capabilityEvidence.archive().isFailure).toBe(true);
  });

  it("validates metrics and evidence lifecycle rules", () => {
    expect(Metric.create({
      id: new MetricId("metric-invalid"),
      name: "Revenue",
      unit: "USD",
      value: Number.NaN
    }).isFailure).toBe(true);

    const metric = Metric.create({
      id: new MetricId("metric-1"),
      name: "Revenue",
      unit: "USD",
      value: 100,
      confidence: "high"
    }).value!;
    expect(metric.verify().isSuccess).toBe(true);
    expect(metric.verify().isFailure).toBe(true);

    const evidence = EvidenceReference.attach({
      id: new EvidenceReferenceId("evidence-2"),
      evidenceType: "document",
      title: "Case study",
      strength: "primary"
    }).value!;
    expect(evidence.invalidate().isSuccess).toBe(true);
    expect(evidence.verify().isFailure).toBe(true);
  });

  it("models stories with duplicate prevention and archive invariants", () => {
    const story = Story.create({
      id: new StoryId("story-2"),
      title: "Platform modernization",
      content: {
        situation: "Legacy platform",
        problem: "Slow releases",
        decision: "Modernize architecture",
        actions: ["Mapped migration"],
        outcome: "Improved release cadence"
      }
    }).value!;
    const metricId = new MetricId("metric-2");

    expect(story.attachMetric(metricId).isSuccess).toBe(true);
    expect(story.attachMetric(metricId).isFailure).toBe(true);
    expect(story.archive().isSuccess).toBe(true);
    expect(story.archive().isFailure).toBe(true);
    expect(story.domainEvents.map((event) => event.eventType)).toContain("StoryArchived");
  });

  it("publishes portfolio assets only once", () => {
    const asset = PortfolioAsset.create({
      id: new PortfolioAssetId("asset-1"),
      title: "Portfolio case study",
      assetType: "case-study"
    }).value!;

    expect(asset.publish().isSuccess).toBe(true);
    expect(asset.publish().isFailure).toBe(true);
  });
});
