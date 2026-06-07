import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";

const level2: LevelDefinition = {
  name: "Lieferdienst",
  introText:
    "Diesmal nur sammeln reicht nicht. Ich muss jede Wurst ins Laedeli tragen.",
  completionText:
    "Alles geliefert. Das war anstrengend, aber sehr professionell.",
  stages: [stage1],
};

export default level2;
