import type { Decision } from "@career-companion/decision-model";
import type { EvidenceNode, EvidenceTrace, ExplanationEdge } from "../models";
import { immutableArray, immutableRecord } from "../models";

export class EvidenceTraceBuilder {
  build(decision: Decision): EvidenceTrace {
    const evidenceNodes = decision.references.map((reference): EvidenceNode => immutableRecord({
      id: `evidence:${reference.referenceId}`,
      nodeType: "evidence",
      label: reference.label ?? reference.referenceId,
      strength: reference.authority === "authoritative" ? "primary" : reference.authority === "supporting" ? "supporting" : "contextual",
      references: immutableArray([reference])
    }));
    const edges = evidenceNodes.map((node): ExplanationEdge => immutableRecord({
      id: `${node.id}->decision:${decision.id}:derivedFrom`,
      fromNodeId: node.id,
      toNodeId: `decision:${decision.id}`,
      edgeType: "derivedFrom",
      references: node.references
    }));

    return immutableRecord({
      traceId: `evidence-trace:${decision.id}`,
      decisionId: decision.id,
      evidenceNodes: immutableArray(evidenceNodes),
      edges: immutableArray(edges),
      references: immutableArray(decision.references)
    });
  }
}
