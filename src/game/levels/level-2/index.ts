import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";

const level2: LevelDefinition = {
  id: "level-2",
  name: "Lieferdienst",
  intro: {
    speech:
      "Diesmal nur sammeln reicht nicht. Ich muss jede Wurst ins Laedeli tragen.",
  },
  completion: {
    speech: "Alles geliefert. Das war anstrengend, aber sehr professionell.",
  },
  presentation: {
    themeKey: "retroIndoor",
  },
  stages: [stage1],
};

export default level2;
