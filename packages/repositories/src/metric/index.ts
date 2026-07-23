import type { Metric, MetricId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type MetricRepository = Repository<Metric, MetricId>;
