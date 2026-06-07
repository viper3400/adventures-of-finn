import { Container, Graphics, Sprite, Text, type Application } from "pixi.js";

import type { StageObjectiveType } from "../types";

export interface HudState {
  levelIndex: number;
  levelName: string;
  stageName: string;
  objectiveType: StageObjectiveType;
  progressCount: number;
  totalCollectibles: number;
  hasCarriedCollectible: boolean;
  goalOpen: boolean;
}

export interface HudController {
  update(state: HudState): void;
}

export interface TransitionController {
  show(title: string, subtitle: string, speech: string): void;
  hide(): void;
  layout(): void;
}

export interface TitleScreenController {
  show(): void;
  hide(): void;
  layout(): void;
}

export interface StartupMenuController {
  show(hasContinue: boolean, continueLabel: string): void;
  hide(): void;
  layout(): void;
  selectPrevious(): void;
  selectNext(): void;
  getSelectedAction(): "new" | "continue";
}

export function createHud(app: Application): HudController {
  const label = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontSize: 28,
      fontWeight: "700",
      stroke: { color: 0x1f2a44, width: 4 },
    },
  });
  label.position.set(24, 24);
  app.stage.addChild(label);

  return {
    update(state: HudState): void {
      const goalState = state.goalOpen ? "Open" : "Closed";
      const modeStatus =
        state.objectiveType === "transport"
          ? `Delivered ${state.progressCount}/${state.totalCollectibles} Carrying ${state.hasCarriedCollectible ? "Yes" : "No"}`
          : `Treats ${state.progressCount}/${state.totalCollectibles}`;

      label.text = `Level ${state.levelIndex + 1}: ${state.levelName} - ${state.stageName}  ${modeStatus}  Goal ${goalState}`;
    },
  };
}

export function createTransitionOverlay(
  app: Application,
  playerTexture: Sprite["texture"],
  speechBubbleTexture: Sprite["texture"],
): TransitionController {
  const overlay = new Container();
  const backdrop = new Graphics();
  const title = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontSize: 54,
      fontWeight: "800",
      stroke: { color: 0x1f2a44, width: 6 },
    },
  });
  title.anchor.set(0.5);

  const subtitle = new Text({
    text: "",
    style: {
      fill: 0xfff4cf,
      fontSize: 28,
      fontWeight: "700",
      stroke: { color: 0x1f2a44, width: 4 },
    },
  });
  subtitle.anchor.set(0.5);

  const speech = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontSize: 24,
      fontWeight: "700",
      stroke: { color: 0x20324d, width: 3 },
      wordWrap: true,
      wordWrapWidth: 360,
    },
  });

  const prompt = new Text({
    text: "Press Space",
    style: {
      fill: 0xffffff,
      fontSize: 22,
      fontWeight: "700",
      stroke: { color: 0x1f2a44, width: 4 },
    },
  });
  prompt.anchor.set(0.5);

  const transitionDog = new Sprite(playerTexture);
  const transitionSpeechBubble = new Sprite(speechBubbleTexture);
  overlay.visible = false;
  overlay.addChild(backdrop);
  overlay.addChild(transitionDog);
  overlay.addChild(transitionSpeechBubble);
  overlay.addChild(title);
  overlay.addChild(subtitle);
  overlay.addChild(speech);
  overlay.addChild(prompt);
  app.stage.addChild(overlay);

  function layout(): void {
    const bubbleX = Math.max(app.screen.width * 0.39, 310);
    const bubbleY = Math.max(172, app.screen.height * 0.2);
    const bubbleWidth = Math.min(app.screen.width * 0.5, 620);
    const bubbleHeight = Math.min(app.screen.height * 0.34, 260);

    backdrop
      .clear()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x102030, alpha: 1 });

    transitionSpeechBubble.position.set(bubbleX, bubbleY);
    transitionSpeechBubble.width = bubbleWidth;
    transitionSpeechBubble.height = bubbleHeight;

    title.position.set(app.screen.width / 2, 82);
    subtitle.position.set(app.screen.width / 2, 132);
    speech.position.set(bubbleX + 84, bubbleY + 44);
    speech.style.wordWrapWidth = bubbleWidth - 160;
    prompt.position.set(app.screen.width / 2, app.screen.height - 72);

    const targetWidth = Math.min(app.screen.width * 0.38, 560);
    const targetHeight = Math.min(app.screen.height * 0.54, 530);
    const scale = Math.min(
      targetWidth / transitionDog.texture.width,
      targetHeight / transitionDog.texture.height,
    );
    transitionDog.anchor.set(0.5);
    transitionDog.scale.set(scale);
    transitionDog.position.set(
      app.screen.width * 0.26,
      app.screen.height * 0.73,
    );
  }

  return {
    show(nextTitle: string, nextSubtitle: string, nextSpeech: string): void {
      title.text = nextTitle;
      subtitle.text = nextSubtitle;
      speech.text = nextSpeech;
      overlay.visible = true;
      layout();
    },
    hide(): void {
      overlay.visible = false;
    },
    layout,
  };
}

export function createTitleScreen(
  app: Application,
  titleTexture: Sprite["texture"],
): TitleScreenController {
  const overlay = new Container();
  const backdrop = new Graphics();
  const titleImage = new Sprite(titleTexture);
  const prompt = new Text({
    text: "Press Space",
    style: {
      fill: 0xffffff,
      fontSize: 24,
      fontWeight: "800",
      stroke: { color: 0x1f2a44, width: 4 },
    },
  });

  titleImage.anchor.set(0.5);
  prompt.anchor.set(0.5);

  overlay.visible = false;
  overlay.addChild(backdrop);
  overlay.addChild(titleImage);
  overlay.addChild(prompt);
  app.stage.addChild(overlay);

  function layout(): void {
    backdrop
      .clear()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x102030, alpha: 1 });

    const maxWidth = app.screen.width * 0.9;
    const maxHeight = app.screen.height * 0.78;
    const scale = Math.min(
      maxWidth / titleImage.texture.width,
      maxHeight / titleImage.texture.height,
      1,
    );

    titleImage.scale.set(scale);
    titleImage.position.set(app.screen.width / 2, app.screen.height * 0.45);
    prompt.position.set(app.screen.width / 2, app.screen.height - 72);
  }

  return {
    show(): void {
      overlay.visible = true;
      layout();
    },
    hide(): void {
      overlay.visible = false;
    },
    layout,
  };
}

export function createStartupMenu(
  app: Application,
  titleTexture: Sprite["texture"],
): StartupMenuController {
  const overlay = new Container();
  const backdrop = new Graphics();
  const panel = new Graphics();
  const selector = new Text({
    text: "▶",
    style: {
      fill: 0xfff48a,
      fontFamily: "Courier New, monospace",
      fontSize: 30,
      fontWeight: "900",
      stroke: { color: 0x2d1557, width: 5 },
    },
  });
  const titleImage = new Sprite(titleTexture);
  const heading = new Text({
    text: "Spiel starten",
    style: {
      fill: 0xfff7b1,
      fontFamily: "Courier New, monospace",
      fontSize: 34,
      fontWeight: "800",
      stroke: { color: 0x35115b, width: 6 },
      dropShadow: {
        alpha: 1,
        angle: Math.PI / 4,
        blur: 0,
        color: 0x0e0624,
        distance: 4,
      },
    },
  });
  const hint = new Text({
    text: "UP/DOWN WAEHLEN  SPACE START",
    style: {
      fill: 0xb8d8ff,
      fontFamily: "Courier New, monospace",
      fontSize: 18,
      fontWeight: "700",
      stroke: { color: 0x10203e, width: 4 },
    },
  });
  const newGameOption = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontFamily: "Courier New, monospace",
      fontSize: 28,
      fontWeight: "900",
      stroke: { color: 0x221141, width: 4 },
    },
  });
  const continueOption = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontFamily: "Courier New, monospace",
      fontSize: 28,
      fontWeight: "900",
      stroke: { color: 0x221141, width: 4 },
    },
  });
  const continueDetail = new Text({
    text: "",
    style: {
      fill: 0xc3d9ff,
      fontFamily: "Courier New, monospace",
      fontSize: 17,
      fontWeight: "700",
      stroke: { color: 0x10203e, width: 3 },
    },
  });

  heading.anchor.set(0.5);
  hint.anchor.set(0.5);
  newGameOption.anchor.set(0.5);
  continueOption.anchor.set(0.5);
  continueDetail.anchor.set(0.5);
  selector.anchor.set(0.5);
  titleImage.anchor.set(0.5);

  let canContinue = false;
  let selectedAction: "new" | "continue" = "new";

  function syncSelectorPosition(): void {
    const target = selectedAction === "new" ? newGameOption : continueOption;
    selector.position.set(target.x - 220, target.y);
  }

  function refreshOptionStyles(): void {
    newGameOption.style.fill = selectedAction === "new" ? 0xfff48a : 0xe7f0ff;
    continueOption.style.fill =
      selectedAction === "continue"
        ? 0xfff48a
        : canContinue
          ? 0xe7f0ff
          : 0x6d7591;
    continueDetail.style.fill = canContinue ? 0xc3d9ff : 0x6d7591;
    selector.visible = true;
    syncSelectorPosition();
  }

  overlay.visible = false;
  overlay.addChild(backdrop);
  overlay.addChild(titleImage);
  overlay.addChild(panel);
  overlay.addChild(selector);
  overlay.addChild(heading);
  overlay.addChild(newGameOption);
  overlay.addChild(continueOption);
  overlay.addChild(continueDetail);
  overlay.addChild(hint);
  app.stage.addChild(overlay);

  function layout(): void {
    const screenWidth = app.screen.width;
    const screenHeight = app.screen.height;

    backdrop.clear();
    backdrop.rect(0, 0, screenWidth, screenHeight).fill({ color: 0x120826 });
    backdrop
      .rect(0, 0, screenWidth, screenHeight * 0.22)
      .fill({ color: 0x2a1050 });
    backdrop
      .rect(0, screenHeight * 0.22, screenWidth, screenHeight * 0.26)
      .fill({ color: 0x1a2d74 });
    backdrop
      .rect(0, screenHeight * 0.48, screenWidth, screenHeight * 0.52)
      .fill({ color: 0x0e1737 });

    for (let y = 0; y < screenHeight; y += 8) {
      backdrop
        .rect(0, y, screenWidth, 2)
        .fill({ color: 0xffffff, alpha: 0.035 });
    }

    const imageScale = Math.min(
      (screenWidth * 0.48) / titleImage.texture.width,
      (screenHeight * 0.38) / titleImage.texture.height,
      1,
    );
    titleImage.scale.set(imageScale);
    titleImage.position.set(screenWidth / 2, screenHeight * 0.21);

    const panelWidth = Math.min(screenWidth * 0.72, 760);
    const panelHeight = Math.min(screenHeight * 0.42, 320);
    const panelX = (screenWidth - panelWidth) / 2;
    const panelY = screenHeight * 0.42;

    panel.clear();
    panel
      .rect(panelX + 10, panelY + 10, panelWidth, panelHeight)
      .fill({ color: 0x090612, alpha: 0.65 });
    panel
      .rect(panelX, panelY, panelWidth, panelHeight)
      .fill({ color: 0x26134c });
    panel
      .rect(panelX + 6, panelY + 6, panelWidth - 12, panelHeight - 12)
      .fill({ color: 0x162e72 });
    panel
      .rect(panelX + 18, panelY + 18, panelWidth - 36, panelHeight - 36)
      .fill({ color: 0x0d1737 });
    panel
      .rect(panelX + 18, panelY + 18, panelWidth - 36, 34)
      .fill({ color: 0x6c39c3 });
    panel
      .rect(panelX + 18, panelY + panelHeight - 52, panelWidth - 36, 18)
      .fill({ color: 0x203c8b });

    heading.position.set(screenWidth / 2, panelY + 54);
    newGameOption.position.set(screenWidth / 2, panelY + 132);
    continueOption.position.set(screenWidth / 2, panelY + 192);
    continueDetail.position.set(screenWidth / 2, panelY + 226);
    hint.position.set(screenWidth / 2, panelY + panelHeight - 42);
    syncSelectorPosition();
  }

  return {
    show(hasContinueValue: boolean, continueLabel: string): void {
      canContinue = hasContinueValue;
      selectedAction = canContinue ? "continue" : "new";
      newGameOption.text = "Neues Spiel";
      continueOption.text = canContinue
        ? "Fortsetzen"
        : "Fortsetzen nicht verfugbar";
      continueDetail.text = canContinue
        ? continueLabel
        : "Kein gespeicherter Fortschritt";
      refreshOptionStyles();
      overlay.visible = true;
      layout();
    },
    hide(): void {
      overlay.visible = false;
    },
    layout(): void {
      if (!overlay.visible) {
        return;
      }

      layout();
    },
    selectPrevious(): void {
      selectedAction = "new";
      refreshOptionStyles();
    },
    selectNext(): void {
      selectedAction = canContinue ? "continue" : "new";
      refreshOptionStyles();
    },
    getSelectedAction(): "new" | "continue" {
      return selectedAction;
    },
  };
}
