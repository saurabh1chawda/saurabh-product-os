import type { Competency, CompetencyId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type CompetencyRepository = Repository<Competency, CompetencyId>;
