import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";
import stage4 from "./stage-4";
import stage5 from "./stage-5";
import stage6 from "./stage-6";

const level2: LevelDefinition = {
  id: "level-2",
  name: "Sockensuche",
  intro: {
    speech:
      "Wuerste waren keine gute Idee. Vielleicht sind Socken ein Geschenk? Ich sammle einfach ganz viele. Hunde wissen zwar nicht genau warum, aber Socken sind wichtig.",
  },
  completion: {
    speech:
      "Moment mal ... das sind ja gar nicht meine Socken. Die haette ich ueberhaupt nicht nehmen duerfen. Also weiter. Ich brauche noch immer ein richtiges Geschenk.",
  },
  timing: {
    failSeconds: 150,
    hurrySeconds: 20,
  },
  presentation: {
    themeKey: "retroIndoor",
  },
  stages: [stage1, stage2, stage3, stage4, stage5, stage6],
};

export default level2;
