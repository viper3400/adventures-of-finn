import { Assets, type Texture } from "pixi.js";

import { getStageCollectibleVisual, getStageStore } from "../level-schema";
import { LEVELS } from "../levels";

export interface GameAssets {
  playerTexture: Texture;
  dogFaceTexture: Texture;
  titleTexture: Texture;
  endScreenTexture: Texture;
  speechBubbleTexture: Texture;
  goalClosedTexture: Texture;
  goalOpenTexture: Texture;
  collectibleTextures: Map<string, Texture>;
  storeTextures: Map<string, Texture>;
  decorTextures: Map<string, Texture>;
}

export async function loadGameAssets(): Promise<GameAssets> {
  const playerTexture = await Assets.load("/assets/image_comic.png");
  const dogFaceTexture = await Assets.load("/assets/dog-face.svg");
  const titleTexture = await Assets.load("/assets/title.png");
  const endScreenTexture = await Assets.load("/assets/end-screen.png");
  const speechBubbleTexture = await Assets.load(
    "/assets/chat-speech-bubble.svg",
  );
  const goalClosedTexture = await Assets.load("/assets/door-closed.svg");
  const goalOpenTexture = await Assets.load("/assets/door-open.svg");

  const collectibleTextures = new Map<string, Texture>();
  const collectibleAssetPaths = Array.from(
    new Set(
      LEVELS.flatMap((level) =>
        level.stages.map((stage) => getStageCollectibleVisual(stage).assetPath),
      ),
    ),
  );

  const collectibleTextureEntries = await Promise.all(
    collectibleAssetPaths.map(
      async (assetPath) => [assetPath, await Assets.load(assetPath)] as const,
    ),
  );
  collectibleTextureEntries.forEach(([assetPath, texture]) => {
    collectibleTextures.set(assetPath, texture);
  });

  const storeTextures = new Map<string, Texture>();
  const storeAssetPaths = Array.from(
    new Set(
      LEVELS.flatMap((level) =>
        level.stages
          .map((stage) => getStageStore(stage)?.assetPath)
          .filter((assetPath): assetPath is string => Boolean(assetPath)),
      ),
    ),
  );

  const storeTextureEntries = await Promise.all(
    storeAssetPaths.map(
      async (assetPath) => [assetPath, await Assets.load(assetPath)] as const,
    ),
  );
  storeTextureEntries.forEach(([assetPath, texture]) => {
    storeTextures.set(assetPath, texture);
  });

  const decorTextures = new Map<string, Texture>();
  const decorAssetPaths = Array.from(
    new Set(
      LEVELS.flatMap((level) =>
        level.stages.flatMap((stage) =>
          (stage.decor ?? []).map((decor) => decor.visual.assetPath),
        ),
      ),
    ),
  );
  const decorTextureEntries = await Promise.all(
    decorAssetPaths.map(
      async (assetPath) => [assetPath, await Assets.load(assetPath)] as const,
    ),
  );
  decorTextureEntries.forEach(([assetPath, texture]) => {
    decorTextures.set(assetPath, texture);
  });

  return {
    playerTexture,
    dogFaceTexture,
    titleTexture,
    endScreenTexture,
    speechBubbleTexture,
    goalClosedTexture,
    goalOpenTexture,
    collectibleTextures,
    storeTextures,
    decorTextures,
  };
}
