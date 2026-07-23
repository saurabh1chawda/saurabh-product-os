import type { Education, EducationId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type EducationRepository = Repository<Education, EducationId>;
