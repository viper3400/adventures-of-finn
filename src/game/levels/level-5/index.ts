import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";
import stage4 from "./stage-4";
import stage5 from "./stage-5";
import stage6 from "./stage-6";

const level5: LevelDefinition = {
  id: "level-5",
  name: "Abendruhe",
  intro: {
    speech:
      "Vielleicht braucht es gar kein grosses Geschenk. Vielleicht reicht es, wenn es fuer uns alle zusammen gemuetlich wird.",
  },
  completion: {
    speech:
      "Jetzt ist alles bereit. Kein Geschenk war so wichtig wie das hier: wir drei zusammen.",
  },
  timing: {
    failSeconds: 210,
    hurrySeconds: 25,
  },
  presentation: {
    themeKey: "retroIndoor",
  },
  stages: [stage1, stage2, stage3, stage4, stage5, stage6],
};

export default level5;
