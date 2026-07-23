import type { Achievement, AchievementId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type AchievementRepository = Repository<Achievement, AchievementId>;
