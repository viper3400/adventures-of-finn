import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";
import stage4 from "./stage-4";
import stage5 from "./stage-5";
import stage6 from "./stage-6";

const level3: LevelDefinition = {
  id: "level-3",
  name: "Kraehenchaos",
  intro: {
    speech:
      "Vielleicht ist es das beste Geschenk, wenn ich ganz brav den Garten bewache. Ich verjage alle Kraehen. Dann sieht mein Herrchen bestimmt, was fuer ein guter Hund ich bin.",
  },
  completion: {
    speech:
      "Die Kraehen sind weg ... aber mein Herrchen war ja gar nicht da, um das zu sehen. Vielleicht braucht es ohnehin gar kein Geschenk. Am schoensten ist es doch, wenn wir einfach alle drei zusammen sind.",
  },
  timing: {
    failSeconds: 220,
    hurrySeconds: 15,
  },
  stages: [stage1, stage2, stage3, stage4, stage5, stage6],
};

export default level3;
