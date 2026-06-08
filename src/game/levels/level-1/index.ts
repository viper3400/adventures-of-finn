import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";
import stage4 from "./stage-4";
import stage5 from "./stage-5";
import stage6 from "./stage-6";

const level1: LevelDefinition = {
  id: "level-1",
  name: "Wurstsuche",
  intro: {
    speech:
      "Der eine Papa hat mir erzaehlt, dass der andere Papa bald Geburtstag hat. Dafuer braucht es wohl ein Geschenk. Ich suche erst mal Wuerste, weil das Geburtstagskind die bestimmt auch gern frisst.",
  },
  completion: {
    speech:
      "Ich hatte ein tolles Wurstgeschenk gefunden ... aber jetzt sind alle weg. Oh. Ich habe sie unterwegs wohl selber aufgefressen. Dann muss ich weiter nach etwas anderem suchen.",
  },
  timing: {
    failSeconds: 100,
    hurrySeconds: 15,
  },
  stages: [stage1, stage2, stage3, stage4, stage5, stage6],
};

export default level1;
