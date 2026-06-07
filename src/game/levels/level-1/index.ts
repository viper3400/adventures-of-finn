import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";

const level1: LevelDefinition = {
  name: "Wurst-Strecke",
  introText:
    "Ich liebe Wuerste. Mein Herrchen liebt Wuerste bestimmt auch. Ich werde alle Wuerste einsammeln!",
  completionText:
    "Alle Wuerste gesammelt. Hmm, wo sind sie denn hin? Ich habe sie vermutlich gefressen, naja, mein Herrchen kann sich ja selber welche kaufen.",
  stages: [stage1, stage2, stage3],
};

export default level1;
