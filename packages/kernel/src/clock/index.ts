import type { DomainTimestamp } from "../primitives";

export interface Clock {
  now(): DomainTimestamp;
}

export interface DomainClock extends Clock {
  today(): DomainTimestamp;
}
