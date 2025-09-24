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
export interface CurriculumData {
  grade: string;
  subject: string;
  strands: Strand[];
}
export interface SchemeOfWorkEntry {
  week: number;
  strand: string;
  subStrand: string;
  learningOutcomes: string;
  activities: string;
  resources: string;
  assessment: string;
}