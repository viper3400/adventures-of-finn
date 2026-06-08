import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";
import stage4 from "./stage-4";
import stage5 from "./stage-5";
import stage6 from "./stage-6";

const level3: LevelDefinition = {
  id: "level-3",
  name: "Kraehenjagd",
  intro: {
    speech:
      "Diese Kraehen wollen meine Snacks klauen. Ich muss sie dreimal aufscheuchen, bevor sie verschwinden.",
  },
  completion: {
    speech: "Die Kraehen haben aufgegeben. Jetzt gehoert der Platz wieder mir.",
  },
  timing: {
    failSeconds: 120,
    hurrySeconds: 15,
  },
  stages: [stage1, stage2, stage3, stage4, stage5, stage6],
};

export default level3;
