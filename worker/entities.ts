import { IndexedEntity } from "./core-utils";
import type { CurriculumDesign } from "@shared/types";
// CURRICULUM DESIGN ENTITY: one DO instance per parsed curriculum design
export class CurriculumDesignEntity extends IndexedEntity<CurriculumDesign> {
  static readonly entityName = "curriculum";
  static readonly indexName = "curriculums";
  static readonly initialState: CurriculumDesign = {
    id: "",
    name: "",
    sourceUrl: "",
    createdAt: 0,
    strands: [],
  };
}