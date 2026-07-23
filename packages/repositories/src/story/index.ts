import type { Story, StoryId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type StoryRepository = Repository<Story, StoryId>;
