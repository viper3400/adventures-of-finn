import { Assets, type Texture } from "pixi.js";

import { getStageCollectibleVisual, getStageStore } from "../level-schema";
import { LEVELS } from "../levels";
import { withBaseUrl } from "./asset-url";

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

export async function loadGameAssets(
  onProgress?: (progress: number) => void,
): Promise<GameAssets> {
  const baseAssetPaths = [
    "/assets/image_comic.png",
    "/assets/dog-face.svg",
    "/assets/title.png",
    "/assets/end-screen.png",
    "/assets/chat-speech-bubble.svg",
    "/assets/door-closed.svg",
    "/assets/door-open.svg",
  ] as const;
  const collectibleAssetPaths = Array.from(
    new Set(
      LEVELS.flatMap((level) =>
        level.stages.map((stage) => getStageCollectibleVisual(stage).assetPath),
      ),
    ),
  );
  const storeAssetPaths = Array.from(
    new Set(
      LEVELS.flatMap((level) =>
        level.stages
          .map((stage) => getStageStore(stage)?.assetPath)
          .filter((assetPath): assetPath is string => Boolean(assetPath)),
      ),
    ),
  );
  const decorAssetPaths = Array.from(
    new Set(
      LEVELS.flatMap((level) =>
        level.stages.flatMap((stage) =>
          (stage.decor ?? []).map((decor) => decor.visual.assetPath),
        ),
      ),
    ),
  );
  const allAssetPaths = [
    ...baseAssetPaths,
    ...collectibleAssetPaths,
    ...storeAssetPaths,
    ...decorAssetPaths,
  ];
  const allAssetUrls = allAssetPaths.map(withBaseUrl);
  const loadedTextures = await Assets.load(allAssetUrls, {
    onProgress: (progress) => {
      onProgress?.(progress);
    },
  });
  const textureByPath = new Map<string, Texture>();

  allAssetPaths.forEach((assetPath) => {
    const assetUrl = withBaseUrl(assetPath);
    textureByPath.set(assetPath, loadedTextures[assetUrl]);
  });

  function getTexture(assetPath: string): Texture {
    const texture = textureByPath.get(assetPath);
    if (!texture) {
      throw new Error(`Missing texture "${assetPath}"`);
    }

    return texture;
  }

  const collectibleTextures = new Map<string, Texture>();
  collectibleAssetPaths.forEach((assetPath) => {
    collectibleTextures.set(assetPath, getTexture(assetPath));
  });

  const storeTextures = new Map<string, Texture>();
  storeAssetPaths.forEach((assetPath) => {
    storeTextures.set(assetPath, getTexture(assetPath));
  });

  const decorTextures = new Map<string, Texture>();
  decorAssetPaths.forEach((assetPath) => {
    decorTextures.set(assetPath, getTexture(assetPath));
  });

  return {
    playerTexture: getTexture("/assets/image_comic.png"),
    dogFaceTexture: getTexture("/assets/dog-face.svg"),
    titleTexture: getTexture("/assets/title.png"),
    endScreenTexture: getTexture("/assets/end-screen.png"),
    speechBubbleTexture: getTexture("/assets/chat-speech-bubble.svg"),
    goalClosedTexture: getTexture("/assets/door-closed.svg"),
    goalOpenTexture: getTexture("/assets/door-open.svg"),
    collectibleTextures,
    storeTextures,
    decorTextures,
  };
}
