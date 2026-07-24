import type { InterviewInput, InterviewModel } from "../models";

export interface InterviewAnalyzerContract {
  analyze(input: InterviewInput): InterviewModel;
}
