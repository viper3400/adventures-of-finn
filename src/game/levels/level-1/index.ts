import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";
import stage4 from "./stage-4";
import stage5 from "./stage-5";
import stage6 from "./stage-6";

const level1: LevelDefinition = {
  id: "level-1",
  name: "Wurst-Strecke",
  intro: {
    speech:
      "Ich liebe Wuerste. Mein Herrchen liebt Wuerste bestimmt auch. Ich werde alle Wuerste einsammeln!",
  },
  completion: {
    speech:
      "Alle Wuerste gesammelt. Hmm, wo sind sie denn hin? Ich habe sie vermutlich gefressen, naja, mein Herrchen kann sich ja selber welche kaufen.",
  },
  stages: [stage1, stage2, stage3, stage4, stage5, stage6],
};

export default level1;
