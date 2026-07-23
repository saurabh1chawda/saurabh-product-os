import type { CareerProfile, CareerProfileId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type CareerProfileRepository = Repository<CareerProfile, CareerProfileId>;
