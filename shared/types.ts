export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// ElimuPlan Types
export interface LearningOutcome {
  id: string;
  outcome: string;
}
export interface SubStrand {
  id: string;
  name: string;
  learningOutcomes: LearningOutcome[];
}
export interface Strand {
  id: string;
  name: string;
  subStrands: SubStrand[];
}
export interface CurriculumParseRequest {
  url: string;
  name: string;
}
export interface CurriculumParseResponse {
  strands: Strand[];
}
export interface CurriculumDesign {
  id: string;
  name: string;
  sourceUrl: string;
  createdAt: number;
  strands: Strand[];
}