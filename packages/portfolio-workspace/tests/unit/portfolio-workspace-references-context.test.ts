import { describe, expect, it } from "vitest";
import {
  ApprovalReference,
  InvalidPortfolioWorkspaceIdentifierError,
  PlanSnapshotReference,
  PortfolioExecutionCommandContext,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference
} from "../../src";

describe("portfolio workspace references and command context", () => {
  it("creates an immutable PortfolioPlanReference without embedding planning state", () => {
    const reference = new PortfolioPlanReference({
      planId: "portfolio-plan-1",
      roadmapId: "portfolio-roadmap-1",
      planArtifactReference: "artifact:portfolio-plan-1"
    });

    expect(reference.planId).toBe("portfolio-plan-1");
    expect(reference.roadmapId).toBe("portfolio-roadmap-1");
    expect(reference.planArtifactReference).toBe("artifact:portfolio-plan-1");
    expect(Object.isFrozen(reference)).toBe(true);
    expect(reference.toJSON()).toEqual({
      planId: "portfolio-plan-1",
      roadmapId: "portfolio-roadmap-1",
      planArtifactReference: "artifact:portfolio-plan-1"
    });
    expect(reference.equals(new PortfolioPlanReference(reference.toJSON()))).toBe(true);
    expect(reference.equals(new PortfolioPlanReference({
      ...reference.toJSON(),
      roadmapId: "portfolio-roadmap-2"
    }))).toBe(false);
    expect(reference).not.toHaveProperty("portfolioPlan");
    expect(reference).not.toHaveProperty("roadmapItems");
    expect(reference).not.toHaveProperty("orderedInitiatives");
  });

  it("creates an immutable PlanSnapshotReference without calculating hashes", () => {
    const reference = new PlanSnapshotReference({ snapshotReference: "snapshot:portfolio-plan-1:v1" });

    expect(reference.snapshotReference).toBe("snapshot:portfolio-plan-1:v1");
    expect(Object.isFrozen(reference)).toBe(true);
    expect(reference.toString()).toBe("snapshot:portfolio-plan-1:v1");
    expect(reference.toJSON()).toEqual({ snapshotReference: "snapshot:portfolio-plan-1:v1" });
    expect(reference.equals(new PlanSnapshotReference({ snapshotReference: "snapshot:portfolio-plan-1:v1" }))).toBe(true);
    expect(reference.equals(new PlanSnapshotReference({ snapshotReference: "snapshot:portfolio-plan-1:v2" }))).toBe(false);
    expect(reference).not.toHaveProperty("snapshotHash");
    expect(typeof (PlanSnapshotReference as unknown as { calculate?: unknown }).calculate).toBe("undefined");
  });

  it("creates an immutable ApprovalReference without approval workflow behavior", () => {
    const reference = new ApprovalReference({ approvalReference: "approval:portfolio-plan-1" });

    expect(reference.approvalReference).toBe("approval:portfolio-plan-1");
    expect(Object.isFrozen(reference)).toBe(true);
    expect(reference.toString()).toBe("approval:portfolio-plan-1");
    expect(reference.toJSON()).toEqual({ approvalReference: "approval:portfolio-plan-1" });
    expect(reference.equals(new ApprovalReference({ approvalReference: "approval:portfolio-plan-1" }))).toBe(true);
    expect(reference.equals(new ApprovalReference({ approvalReference: "approval:other" }))).toBe(false);
    expect(reference).not.toHaveProperty("approve");
    expect(reference).not.toHaveProperty("reject");
    expect(reference).not.toHaveProperty("history");
  });

  it("creates an immutable PortfolioExecutionCommandContext without transport or authentication objects", () => {
    const context = new PortfolioExecutionCommandContext({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:saura",
      occurredAt: "2026-07-28T00:00:00.000Z"
    });

    expect(context.commandId).toBe("command-1");
    expect(context.correlationId).toBe("correlation-1");
    expect(context.actorReference).toBe("actor:saura");
    expect(context.occurredAt).toBe("2026-07-28T00:00:00.000Z");
    expect(Object.isFrozen(context)).toBe(true);
    expect(context.toJSON()).toEqual({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:saura",
      occurredAt: "2026-07-28T00:00:00.000Z"
    });
    expect(context.equals(new PortfolioExecutionCommandContext(context.toJSON()))).toBe(true);
    expect(context.equals(new PortfolioExecutionCommandContext({
      ...context.toJSON(),
      commandId: "command-2"
    }))).toBe(false);
    expect(context).not.toHaveProperty("session");
    expect(context).not.toHaveProperty("request");
    expect(context).not.toHaveProperty("roles");
    expect(context).not.toHaveProperty("permissions");
  });

  it("creates an immutable authorization resource reference without provider, role, or transport data", () => {
    const reference = new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:owner:123"
    });

    expect(reference.authorizationResourceReference).toBe("portfolio-workspace:owner:123");
    expect(Object.isFrozen(reference)).toBe(true);
    expect(reference.toJSON()).toEqual({
      authorizationResourceReference: "portfolio-workspace:owner:123"
    });
    expect(reference.equals(new PortfolioWorkspaceAuthorizationResourceReference(reference.toJSON()))).toBe(true);
    expect(reference.equals(new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:owner:456"
    }))).toBe(false);
    expect(reference).not.toHaveProperty("principal");
    expect(reference).not.toHaveProperty("session");
    expect(reference).not.toHaveProperty("token");
    expect(reference).not.toHaveProperty("roles");
    expect(reference).not.toHaveProperty("permissions");
  });

  it("rejects empty required PortfolioPlanReference values", () => {
    expect(() => new PortfolioPlanReference({
      planId: "",
      roadmapId: "roadmap-1",
      planArtifactReference: "artifact:plan-1"
    })).toThrow("PortfolioPlanReference.planId cannot be empty.");
    expect(() => new PortfolioPlanReference({
      planId: "plan-1",
      roadmapId: "   ",
      planArtifactReference: "artifact:plan-1"
    })).toThrow(InvalidPortfolioWorkspaceIdentifierError);
    expect(() => new PortfolioPlanReference({
      planId: "plan-1",
      roadmapId: "roadmap-1",
      planArtifactReference: "\t\n"
    })).toThrow("PortfolioPlanReference.planArtifactReference cannot be empty.");
  });

  it("rejects empty required snapshot, approval, and command context values", () => {
    expect(() => new PlanSnapshotReference({ snapshotReference: "" })).toThrow("PlanSnapshotReference.snapshotReference cannot be empty.");
    expect(() => new ApprovalReference({ approvalReference: " " })).toThrow("ApprovalReference.approvalReference cannot be empty.");
    expect(() => new PortfolioExecutionCommandContext({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "",
      occurredAt: "2026-07-28T00:00:00.000Z"
    })).toThrow("PortfolioExecutionCommandContext.actorReference cannot be empty.");
    expect(() => new PortfolioExecutionCommandContext({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:saura",
      occurredAt: " "
    })).toThrow(InvalidPortfolioWorkspaceIdentifierError);
    expect(() => new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "\t"
    })).toThrow(InvalidPortfolioWorkspaceIdentifierError);
    expect(() => new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:owner\u0000"
    })).toThrow(InvalidPortfolioWorkspaceIdentifierError);
    expect(() => new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio workspace owner"
    })).toThrow(InvalidPortfolioWorkspaceIdentifierError);
  });

  it("preserves surrounding whitespace for otherwise nonempty values", () => {
    const reference = new ApprovalReference({ approvalReference: " approval:1 " });

    expect(reference.approvalReference).toBe(" approval:1 ");
    expect(reference.toString()).toBe(" approval:1 ");
    expect(reference.toJSON()).toEqual({ approvalReference: " approval:1 " });
  });

  it("keeps references and command context as distinct domain concepts at compile time", () => {
    function acceptsApprovalReference(reference: ApprovalReference): string {
      return reference.approvalReference;
    }

    expect(acceptsApprovalReference(new ApprovalReference({ approvalReference: "approval:1" }))).toBe("approval:1");

    // @ts-expect-error PlanSnapshotReference is intentionally not assignable to ApprovalReference.
    const notApprovalReference: ApprovalReference = new PlanSnapshotReference({ snapshotReference: "snapshot:1" });
    expect(notApprovalReference).toBeInstanceOf(PlanSnapshotReference);
  });
});
