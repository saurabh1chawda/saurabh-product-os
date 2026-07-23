import type { EmploymentRecord, EmploymentRecordId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type EmploymentRecordRepository = Repository<EmploymentRecord, EmploymentRecordId>;
