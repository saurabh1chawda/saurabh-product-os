import type { Certification, CertificationId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type CertificationRepository = Repository<Certification, CertificationId>;
