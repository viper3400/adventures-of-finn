import { Container, Graphics, Sprite, Text, type Application } from "pixi.js";

import type { StageMode } from "../types";

export interface HudState {
  levelIndex: number;
  levelName: string;
  stageName: string;
  stageMode: StageMode;
  progressCount: number;
  totalCollectibles: number;
  hasCarriedCollectible: boolean;
  goalOpen: boolean;
}

export interface HudController {
  update(state: HudState): void;
}

export interface TransitionController {
  isVisible(): boolean;
  show(
    title: string,
    subtitle: string,
    speech: string,
    onComplete?: (() => void) | null,
  ): void;
  close(): void;
  layout(): void;
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
        state.stageMode === "transport"
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
  let onTransitionComplete: (() => void) | null = null;

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
    isVisible: () => overlay.visible,
    show(
      nextTitle: string,
      nextSubtitle: string,
      nextSpeech: string,
      nextOnComplete: (() => void) | null = null,
    ): void {
      title.text = nextTitle;
      subtitle.text = nextSubtitle;
      speech.text = nextSpeech;
      onTransitionComplete = nextOnComplete;
      overlay.visible = true;
      layout();
    },
    close(): void {
      if (!overlay.visible) {
        return;
      }

      overlay.visible = false;
      const pendingCallback = onTransitionComplete;
      onTransitionComplete = null;
      pendingCallback?.();
    },
    layout,
  };
}
