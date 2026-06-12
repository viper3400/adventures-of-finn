import { Container, Graphics, Sprite, Text, type Application } from "pixi.js";

import type { StageObjectiveType } from "../types";
import { DIFFICULTY_OPTIONS, type GameDifficulty } from "./difficulty";

export interface HudState {
  levelIndex: number;
  levelName: string;
  stageName: string;
  objectiveType: StageObjectiveType;
  progressCount: number;
  totalCollectibles: number;
  timeRemainingSeconds: number;
  livesRemaining: number;
  hurry: boolean;
}

export interface HudController {
  update(state: HudState): void;
}

export interface HurryOverlayController {
  show(): void;
  update(deltaMs: number): void;
  layout(): void;
}

export interface TransitionController {
  show(
    title: string,
    subtitle: string,
    speech: string,
    variant?: "intro" | "complete" | "failure",
  ): void;
  hide(): void;
  layout(): void;
  update(deltaMs: number): void;
  isAnimating(): boolean;
  revealAll(): void;
}

export interface TitleScreenController {
  show(): void;
  hide(): void;
  layout(): void;
}

export interface EndScreenController {
  show(): void;
  hide(): void;
  layout(): void;
}

export interface StartupMenuController {
  show(
    hasContinue: boolean,
    continueLabel: string,
    difficulty: GameDifficulty,
  ): void;
  hide(): void;
  layout(): void;
  selectPrevious(): void;
  selectNext(): void;
  selectLeft(): void;
  selectRight(): void;
  getSelectedAction(): "new" | "continue";
  getSelectedDifficulty(): GameDifficulty;
}

export function createHud(
  app: Application,
  dogFaceTexture: Sprite["texture"],
): HudController {
  const hudTextStyle = {
    fill: 0xfff7b1,
    fontFamily: "Courier New, monospace",
    fontSize: 22,
    fontWeight: "800",
    stroke: { color: 0x221141, width: 4 },
  } as const;
  const infoChrome = new Graphics();
  const infoLabel = new Text({
    text: "",
    style: hudTextStyle,
  });
  const timeChrome = new Graphics();
  const timeLabel = new Text({
    text: "",
    style: hudTextStyle,
  });
  const livesChrome = new Graphics();
  const livesLabel = new Text({
    text: "Lives",
    style: hudTextStyle,
  });
  const livesIcons = new Container();
  const lifeFaces = Array.from({ length: 3 }, () => {
    const sprite = new Sprite(dogFaceTexture);
    sprite.anchor.set(0.5);
    sprite.width = 34;
    sprite.height = 28;
    livesIcons.addChild(sprite);
    return sprite;
  });

  infoChrome.position.set(16, 16);
  infoLabel.position.set(36, 32);
  timeChrome.position.set(0, 16);
  timeLabel.position.set(0, 32);
  livesChrome.position.set(0, 16);
  livesLabel.position.set(0, 32);
  livesIcons.position.set(0, 34);

  const reservedTimeWidth = new Text({
    text: "Time 999s",
    style: hudTextStyle,
  }).width;
  const reservedLivesWidth = livesLabel.width + 18 + lifeFaces.length * 34;

  app.stage.addChild(infoChrome);
  app.stage.addChild(infoLabel);
  app.stage.addChild(timeChrome);
  app.stage.addChild(timeLabel);
  app.stage.addChild(livesChrome);
  app.stage.addChild(livesLabel);
  app.stage.addChild(livesIcons);

  function drawBox(
    chrome: Graphics,
    width: number,
    height: number,
    frameColor: number,
    bodyColor: number,
    stripeColor: number,
  ): void {
    chrome
      .clear()
      .rect(0, 0, width + 40, height + 24)
      .fill({ color: frameColor, alpha: 0.92 })
      .rect(6, 6, width + 28, height + 12)
      .fill({ color: bodyColor, alpha: 0.96 })
      .rect(14, 14, width + 12, height - 4)
      .fill({ color: 0x0d1737, alpha: 1 })
      .rect(14, 14, width + 12, 12)
      .fill({ color: stripeColor, alpha: 1 });
  }

  return {
    update(state: HudState): void {
      const timerLabel = `Time ${state.timeRemainingSeconds}s`;
      const modeStatus =
        state.objectiveType === "transport"
          ? `Delivered ${state.progressCount}/${state.totalCollectibles}`
          : state.objectiveType === "chase"
            ? `Crows ${state.progressCount}/${state.totalCollectibles}`
            : `Treats ${state.progressCount}/${state.totalCollectibles}`;

      infoLabel.text = `Level ${state.levelIndex + 1}: ${state.levelName} - ${state.stageName}  ${modeStatus}`;
      timeLabel.text = timerLabel;
      lifeFaces.forEach((face, index) => {
        face.visible = index < state.livesRemaining;
        face.position.set(17 + index * 34, 14);
      });

      drawBox(
        infoChrome,
        infoLabel.width,
        infoLabel.height,
        0x26134c,
        0x162e72,
        0x6c39c3,
      );
      drawBox(
        timeChrome,
        reservedTimeWidth,
        timeLabel.height,
        state.hurry ? 0x7e1212 : 0x26134c,
        state.hurry ? 0x5a1111 : 0x162e72,
        state.hurry ? 0xd44747 : 0x6c39c3,
      );
      drawBox(
        livesChrome,
        reservedLivesWidth,
        livesLabel.height,
        0x26134c,
        0x162e72,
        0x6c39c3,
      );

      const infoBoxWidth = infoLabel.width + 40;
      const timeBoxWidth = reservedTimeWidth + 40;
      timeChrome.position.set(32 + infoBoxWidth, 16);
      timeLabel.position.set(52 + infoBoxWidth, 32);
      livesChrome.position.set(48 + infoBoxWidth + timeBoxWidth, 16);
      livesLabel.position.set(68 + infoBoxWidth + timeBoxWidth, 32);
      livesIcons.position.set(
        68 + infoBoxWidth + timeBoxWidth + livesLabel.width + 18,
        34,
      );
    },
  };
}

export function createHurryOverlay(app: Application): HurryOverlayController {
  const overlay = new Container();
  const backdrop = new Graphics();
  const label = new Text({
    text: " JETZT SCHNELL !!!",
    style: {
      fill: 0xfff7b1,
      fontFamily: "Courier New, monospace",
      fontSize: 96,
      fontWeight: "900",
      stroke: { color: 0x5f0d0d, width: 10 },
      dropShadow: {
        alpha: 1,
        angle: Math.PI / 4,
        blur: 0,
        color: 0x240606,
        distance: 6,
      },
    },
  });
  let remainingMs = 0;

  label.anchor.set(0.5);
  overlay.visible = false;
  overlay.addChild(backdrop);
  overlay.addChild(label);
  app.stage.addChild(overlay);

  function layout(): void {
    label.position.set(app.screen.width / 2, app.screen.height / 2);
  }

  return {
    show(): void {
      remainingMs = 2000;
      overlay.visible = true;
      layout();
    },
    update(deltaMs: number): void {
      if (remainingMs <= 0) {
        return;
      }

      remainingMs = Math.max(0, remainingMs - deltaMs);
      const progress = remainingMs / 2000;

      backdrop
        .clear()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x7e1212, alpha: 0.18 * progress });
      label.alpha = 0.35 + 0.65 * progress;
      label.scale.set(1 + (1 - progress) * 0.08);

      if (remainingMs === 0) {
        overlay.visible = false;
      }
    },
    layout,
  };
}

export function createTransitionOverlay(
  app: Application,
  playerTexture: Sprite["texture"],
  speechBubbleTexture: Sprite["texture"],
): TransitionController {
  const SPEECH_REVEAL_MS_PER_CHARACTER = 24;
  type TransitionVariant = "intro" | "complete" | "failure";
  const PALETTES: Record<
    TransitionVariant,
    {
      bands: [number, number, number, number];
      lineAlpha: number;
      bubbleTint: number;
      titleFill: number;
      titleStroke: number;
      titleShadow: number;
      subtitleFill: number;
      subtitleStroke: number;
      speechFill: number;
      speechStroke: number;
      promptFill: number;
      promptStroke: number;
    }
  > = {
    intro: {
      bands: [0x120826, 0x2a1050, 0x1a2d74, 0x0e1737],
      lineAlpha: 0.035,
      bubbleTint: 0xdfe8ff,
      titleFill: 0xfff7b1,
      titleStroke: 0x35115b,
      titleShadow: 0x0e0624,
      subtitleFill: 0xb8d8ff,
      subtitleStroke: 0x10203e,
      speechFill: 0xe7f0ff,
      speechStroke: 0x10203e,
      promptFill: 0xfff48a,
      promptStroke: 0x35115b,
    },
    complete: {
      bands: [0x102315, 0x1d5c2f, 0x508a2b, 0x17331d],
      lineAlpha: 0.05,
      bubbleTint: 0xf8f2cf,
      titleFill: 0xfff2a6,
      titleStroke: 0x214f25,
      titleShadow: 0x0b1d0d,
      subtitleFill: 0xe8ffb8,
      subtitleStroke: 0x1d4020,
      speechFill: 0xfffbdf,
      speechStroke: 0x29412b,
      promptFill: 0xffe071,
      promptStroke: 0x214f25,
    },
    failure: {
      bands: [0x240808, 0x5a1111, 0x7a2a14, 0x261010],
      lineAlpha: 0.04,
      bubbleTint: 0xffdfd8,
      titleFill: 0xffd0c0,
      titleStroke: 0x5f0d0d,
      titleShadow: 0x240606,
      subtitleFill: 0xffc38f,
      subtitleStroke: 0x4a130b,
      speechFill: 0xffece7,
      speechStroke: 0x4a130b,
      promptFill: 0xffec8a,
      promptStroke: 0x5f0d0d,
    },
  };
  const overlay = new Container();
  const backdrop = new Graphics();
  const title = new Text({
    text: "",
    style: {
      fill: 0xfff7b1,
      fontFamily: "Courier New, monospace",
      fontSize: 52,
      fontWeight: "800",
      stroke: { color: 0x35115b, width: 7 },
      dropShadow: {
        alpha: 1,
        angle: Math.PI / 4,
        blur: 0,
        color: 0x0e0624,
        distance: 4,
      },
    },
  });
  title.anchor.set(0.5);

  const subtitle = new Text({
    text: "",
    style: {
      fill: 0xb8d8ff,
      fontFamily: "Courier New, monospace",
      fontSize: 26,
      fontWeight: "700",
      stroke: { color: 0x10203e, width: 4 },
    },
  });
  subtitle.anchor.set(0.5);

  const speech = new Text({
    text: "",
    style: {
      fill: 0xe7f0ff,
      fontFamily: "Courier New, monospace",
      fontSize: 22,
      fontWeight: "700",
      stroke: { color: 0x10203e, width: 4 },
      wordWrap: true,
      wordWrapWidth: 360,
    },
  });

  const prompt = new Text({
    text: "SPACE WEITER",
    style: {
      fill: 0xfff48a,
      fontFamily: "Courier New, monospace",
      fontSize: 20,
      fontWeight: "700",
      stroke: { color: 0x35115b, width: 5 },
    },
  });
  prompt.anchor.set(0.5);

  const transitionDog = new Sprite(playerTexture);
  const transitionSpeechBubble = new Sprite(speechBubbleTexture);
  let fullSpeechText = "";
  let visibleCharacterCount = 0;
  let speechRevealAccumulatorMs = 0;
  let variant: TransitionVariant = "intro";
  overlay.visible = false;
  overlay.addChild(backdrop);
  overlay.addChild(transitionDog);
  overlay.addChild(transitionSpeechBubble);
  overlay.addChild(title);
  overlay.addChild(subtitle);
  overlay.addChild(speech);
  overlay.addChild(prompt);
  app.stage.addChild(overlay);

  function applyPalette(): void {
    const palette = PALETTES[variant];
    title.style.fill = palette.titleFill;
    title.style.stroke = { color: palette.titleStroke, width: 7 };
    title.style.dropShadow = {
      alpha: 1,
      angle: Math.PI / 4,
      blur: 0,
      color: palette.titleShadow,
      distance: 4,
    };
    subtitle.style.fill = palette.subtitleFill;
    subtitle.style.stroke = { color: palette.subtitleStroke, width: 4 };
    speech.style.fill = palette.speechFill;
    speech.style.stroke = { color: palette.speechStroke, width: 4 };
    prompt.style.fill = palette.promptFill;
    prompt.style.stroke = { color: palette.promptStroke, width: 5 };
  }

  function layout(): void {
    const bubbleX = Math.max(app.screen.width * 0.37, 300);
    const bubbleY = Math.max(156, app.screen.height * 0.18);
    const bubbleWidth = Math.min(app.screen.width * 0.58, 710);
    const bubbleHeight = Math.min(app.screen.height * 0.4, 310);
    const palette = PALETTES[variant];

    backdrop.clear();
    backdrop
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: palette.bands[0], alpha: 1 })
      .rect(0, 0, app.screen.width, app.screen.height * 0.22)
      .fill({ color: palette.bands[1], alpha: 1 })
      .rect(
        0,
        app.screen.height * 0.22,
        app.screen.width,
        app.screen.height * 0.26,
      )
      .fill({ color: palette.bands[2], alpha: 1 })
      .rect(
        0,
        app.screen.height * 0.48,
        app.screen.width,
        app.screen.height * 0.52,
      )
      .fill({ color: palette.bands[3], alpha: 1 });

    for (let y = 0; y < app.screen.height; y += 8) {
      backdrop
        .rect(0, y, app.screen.width, 2)
        .fill({ color: 0xffffff, alpha: palette.lineAlpha });
    }

    transitionSpeechBubble.position.set(bubbleX, bubbleY);
    transitionSpeechBubble.width = bubbleWidth;
    transitionSpeechBubble.height = bubbleHeight;
    transitionSpeechBubble.tint = palette.bubbleTint;

    title.position.set(app.screen.width / 2, 82);
    subtitle.position.set(app.screen.width / 2, 132);
    speech.position.set(bubbleX + 92, bubbleY + 50);
    speech.style.wordWrapWidth = bubbleWidth - 184;
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

  function syncSpeechText(): void {
    speech.text = fullSpeechText.slice(0, visibleCharacterCount);
  }

  return {
    show(
      nextTitle: string,
      nextSubtitle: string,
      nextSpeech: string,
      nextVariant: TransitionVariant = "intro",
    ): void {
      variant = nextVariant;
      applyPalette();
      title.text = nextTitle;
      subtitle.text = nextSubtitle;
      fullSpeechText = nextSpeech;
      visibleCharacterCount = 0;
      speechRevealAccumulatorMs = 0;
      syncSpeechText();
      overlay.visible = true;
      layout();
    },
    hide(): void {
      overlay.visible = false;
    },
    update(deltaMs: number): void {
      if (!overlay.visible || visibleCharacterCount >= fullSpeechText.length) {
        return;
      }

      speechRevealAccumulatorMs += deltaMs;
      const revealedCharacters = Math.floor(
        speechRevealAccumulatorMs / SPEECH_REVEAL_MS_PER_CHARACTER,
      );
      if (revealedCharacters <= 0) {
        return;
      }

      visibleCharacterCount = Math.min(
        fullSpeechText.length,
        visibleCharacterCount + revealedCharacters,
      );
      speechRevealAccumulatorMs -=
        revealedCharacters * SPEECH_REVEAL_MS_PER_CHARACTER;
      syncSpeechText();
    },
    isAnimating(): boolean {
      return overlay.visible && visibleCharacterCount < fullSpeechText.length;
    },
    revealAll(): void {
      visibleCharacterCount = fullSpeechText.length;
      speechRevealAccumulatorMs = 0;
      syncSpeechText();
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
    text: "SPACE START",
    style: {
      fill: 0xfff48a,
      fontFamily: "Courier New, monospace",
      fontSize: 22,
      fontWeight: "800",
      stroke: { color: 0x35115b, width: 5 },
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
    backdrop.clear();
    backdrop
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x120826, alpha: 1 })
      .rect(0, 0, app.screen.width, app.screen.height * 0.22)
      .fill({ color: 0x2a1050, alpha: 1 })
      .rect(
        0,
        app.screen.height * 0.22,
        app.screen.width,
        app.screen.height * 0.26,
      )
      .fill({ color: 0x1a2d74, alpha: 1 })
      .rect(
        0,
        app.screen.height * 0.48,
        app.screen.width,
        app.screen.height * 0.52,
      )
      .fill({ color: 0x0e1737, alpha: 1 });

    for (let y = 0; y < app.screen.height; y += 8) {
      backdrop
        .rect(0, y, app.screen.width, 2)
        .fill({ color: 0xffffff, alpha: 0.035 });
    }

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

export function createEndScreen(
  app: Application,
  endScreenTexture: Sprite["texture"],
): EndScreenController {
  const overlay = new Container();
  const backdrop = new Graphics();
  const endScreenImage = new Sprite(endScreenTexture);
  const prompt = new Text({
    text: "SPACE ZURUECK ZUM START",
    style: {
      fill: 0xfff48a,
      fontFamily: "Courier New, monospace",
      fontSize: 22,
      fontWeight: "800",
      stroke: { color: 0x35115b, width: 5 },
    },
  });

  endScreenImage.anchor.set(0.5);
  prompt.anchor.set(0.5);

  overlay.visible = false;
  overlay.addChild(backdrop);
  overlay.addChild(endScreenImage);
  overlay.addChild(prompt);
  app.stage.addChild(overlay);

  function layout(): void {
    backdrop.clear();
    backdrop
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x120826, alpha: 1 })
      .rect(0, 0, app.screen.width, app.screen.height * 0.22)
      .fill({ color: 0x2a1050, alpha: 1 })
      .rect(
        0,
        app.screen.height * 0.22,
        app.screen.width,
        app.screen.height * 0.26,
      )
      .fill({ color: 0x1a2d74, alpha: 1 })
      .rect(
        0,
        app.screen.height * 0.48,
        app.screen.width,
        app.screen.height * 0.52,
      )
      .fill({ color: 0x0e1737, alpha: 1 });

    for (let y = 0; y < app.screen.height; y += 8) {
      backdrop
        .rect(0, y, app.screen.width, 2)
        .fill({ color: 0xffffff, alpha: 0.035 });
    }

    const maxWidth = app.screen.width * 0.92;
    const maxHeight = app.screen.height * 0.78;
    const scale = Math.min(
      maxWidth / endScreenImage.texture.width,
      maxHeight / endScreenImage.texture.height,
      1,
    );

    endScreenImage.scale.set(scale);
    endScreenImage.position.set(app.screen.width / 2, app.screen.height * 0.44);
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
    text: "UP/DOWN WAEHLEN  LEFT/RIGHT SCHWIERIGKEIT  SPACE START",
    style: {
      fill: 0xb8d8ff,
      fontFamily: "Courier New, monospace",
      fontSize: 16,
      fontWeight: "700",
      stroke: { color: 0x10203e, width: 4 },
    },
  });
  const difficultyLabel = new Text({
    text: "Schwierigkeit",
    style: {
      fill: 0xc3d9ff,
      fontFamily: "Courier New, monospace",
      fontSize: 20,
      fontWeight: "800",
      stroke: { color: 0x10203e, width: 4 },
    },
  });
  const difficultyValue = new Text({
    text: "",
    style: {
      fill: 0xfff48a,
      fontFamily: "Courier New, monospace",
      fontSize: 28,
      fontWeight: "900",
      stroke: { color: 0x221141, width: 4 },
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
  difficultyLabel.anchor.set(0.5);
  difficultyValue.anchor.set(0.5);
  newGameOption.anchor.set(0.5);
  continueOption.anchor.set(0.5);
  continueDetail.anchor.set(0.5);
  selector.anchor.set(0.5);
  titleImage.anchor.set(0.5);

  let canContinue = false;
  let selectedRow: "difficulty" | "new" | "continue" = "new";
  let selectedDifficulty: GameDifficulty = DIFFICULTY_OPTIONS[1].id;

  function syncSelectorPosition(): void {
    const target =
      selectedRow === "difficulty"
        ? difficultyValue
        : selectedRow === "new"
          ? newGameOption
          : continueOption;
    selector.position.set(target.x - 220, target.y);
  }

  function refreshOptionStyles(): void {
    difficultyValue.text = `< ${DIFFICULTY_OPTIONS.find((option) => option.id === selectedDifficulty)?.label ?? "Normal"} >`;
    difficultyLabel.style.fill =
      selectedRow === "difficulty" ? 0xfff48a : 0xc3d9ff;
    difficultyValue.style.fill =
      selectedRow === "difficulty" ? 0xfff48a : 0xe7f0ff;
    newGameOption.style.fill = selectedRow === "new" ? 0xfff48a : 0xe7f0ff;
    continueOption.style.fill =
      selectedRow === "continue" ? 0xfff48a : canContinue ? 0xe7f0ff : 0x6d7591;
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
  overlay.addChild(difficultyLabel);
  overlay.addChild(difficultyValue);
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
    const panelHeight = Math.min(screenHeight * 0.46, 360);
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
    difficultyLabel.position.set(screenWidth / 2, panelY + 110);
    difficultyValue.position.set(screenWidth / 2, panelY + 144);
    newGameOption.position.set(screenWidth / 2, panelY + 202);
    continueOption.position.set(screenWidth / 2, panelY + 258);
    continueDetail.position.set(screenWidth / 2, panelY + 292);
    hint.position.set(screenWidth / 2, panelY + panelHeight - 42);
    syncSelectorPosition();
  }

  return {
    show(
      hasContinueValue: boolean,
      continueLabel: string,
      difficulty: GameDifficulty,
    ): void {
      canContinue = hasContinueValue;
      selectedRow = "difficulty";
      selectedDifficulty = difficulty;
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
      if (selectedRow === "continue") {
        selectedRow = "new";
      } else if (selectedRow === "new") {
        selectedRow = "difficulty";
      }
      refreshOptionStyles();
    },
    selectNext(): void {
      if (selectedRow === "difficulty") {
        selectedRow = "new";
      } else if (selectedRow === "new" && canContinue) {
        selectedRow = "continue";
      }
      refreshOptionStyles();
    },
    selectLeft(): void {
      if (selectedRow !== "difficulty") {
        return;
      }

      const currentIndex = DIFFICULTY_OPTIONS.findIndex(
        (option) => option.id === selectedDifficulty,
      );
      const nextIndex =
        (currentIndex - 1 + DIFFICULTY_OPTIONS.length) %
        DIFFICULTY_OPTIONS.length;
      selectedDifficulty = DIFFICULTY_OPTIONS[nextIndex].id;
      refreshOptionStyles();
    },
    selectRight(): void {
      if (selectedRow !== "difficulty") {
        return;
      }

      const currentIndex = DIFFICULTY_OPTIONS.findIndex(
        (option) => option.id === selectedDifficulty,
      );
      const nextIndex = (currentIndex + 1) % DIFFICULTY_OPTIONS.length;
      selectedDifficulty = DIFFICULTY_OPTIONS[nextIndex].id;
      refreshOptionStyles();
    },
    getSelectedAction(): "new" | "continue" {
      return selectedRow === "continue" ? "continue" : "new";
    },
    getSelectedDifficulty(): GameDifficulty {
      return selectedDifficulty;
    },
  };
}
