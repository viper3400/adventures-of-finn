import type { LevelDefinition } from "../../types";
import stage1 from "./stage-1";
import stage2 from "./stage-2";
import stage3 from "./stage-3";
import stage4 from "./stage-4";
import stage5 from "./stage-5";
import stage6 from "./stage-6";

const level4: LevelDefinition = {
  id: "level-4",
  name: "Party-Vorbereitung",
  intro: {
    speech:
      "Wenn schon kein richtiges Geschenk, dann mache ich wenigstens alles fuer die Geburtstagsfeier bereit. Das wird bestimmt toll.",
  },
  completion: {
    speech:
      "Jetzt ist alles fertig fuer die Feier. Aber irgendwie ist das Schoenste daran nicht der Tisch oder die Deko. Am besten ist es, wenn wir nachher zusammen dort sind.",
  },
  timing: {
    failSeconds: 200,
    hurrySeconds: 25,
  },
  presentation: {
    themeKey: "retroIndoor",
  },
  stages: [stage1, stage2, stage3, stage4, stage5, stage6],
};

export default level4;
