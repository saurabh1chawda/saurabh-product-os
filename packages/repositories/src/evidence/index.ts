import type { EvidenceReference, EvidenceReferenceId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type EvidenceReferenceRepository = Repository<EvidenceReference, EvidenceReferenceId>;
