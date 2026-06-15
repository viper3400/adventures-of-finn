import { sound } from "@pixi/sound";
import type { IMediaInstance } from "@pixi/sound";

import { withBaseUrl } from "./asset-url";

const JUMP_START_OFFSET_SECONDS = 0.04;
const MUSIC_VOLUME = 0.55;
const MUSIC_ALIASES = [
  "title",
  "end-title",
  "level-intro",
  "level-outro",
  "level-1",
  "level-2",
  "level-3",
  "level-4",
  "level-5",
] as const satisfies readonly SoundAlias[];
const SOUND_DEFINITIONS = [
  ["jump", "/assets/audio/sfx/retro-jump.mp3"],
  ["door-open", "/assets/audio/sfx/door-open.mp3"],
  ["collect", "/assets/audio/sfx/collect.mp3"],
  ["item-delivered", "/assets/audio/sfx/item-delivered.mp3"],
  ["crow", "/assets/audio/sfx/crow.mp3"],
  ["level-complete", "/assets/audio/sfx/level-complete.mp3"],
  ["title", "/assets/audio/music/title.mp3"],
  ["end-title", "/assets/audio/music/end-title.mp3"],
  ["level-intro", "/assets/audio/music/level-intro.mp3"],
  ["level-outro", "/assets/audio/music/level-outro.mp3"],
  ["level-1", "/assets/audio/music/level-1.mp3"],
  ["level-2", "/assets/audio/music/level-2.mp3"],
  ["level-3", "/assets/audio/music/level-3.mp3"],
  ["level-4", "/assets/audio/music/level-4.mp3"],
  ["level-5", "/assets/audio/music/level-5.mp3"],
] as const satisfies readonly [SoundAlias, string][];

type SoundAlias =
  | "jump"
  | "door-open"
  | "collect"
  | "item-delivered"
  | "crow"
  | "level-complete"
  | "title"
  | "end-title"
  | "level-intro"
  | "level-outro"
  | `level-${1 | 2 | 3 | 4 | 5}`;

export interface AudioController {
  preload(onProgress?: (progress: number) => void): Promise<void>;
  unlock(): void;
  stopMusic(): void;
  playTitleMusic(): void;
  playEndTitleMusic(): void;
  playLevelIntroMusic(): void;
  playLevelMusic(levelIndex: number): void;
  playLevelCompleteTransition(): void;
  playJump(): void;
  playDoorOpen(): void;
  playCollect(): void;
  playDelivered(): void;
  playCrow(): void;
}

export function createAudioController(): AudioController {
  let preloadPromise: Promise<void> | null = null;
  let loadedSoundCount = 0;
  let desiredMusicAlias: SoundAlias | null = null;
  let currentMusicAlias: SoundAlias | null = null;
  let currentMusicInstance: IMediaInstance | null = null;
  let musicToken = 0;
  let preloadProgressListener: ((progress: number) => void) | null = null;
  let soundsRegistered = false;
  let hasUnlockedAudio = false;

  function ensureContext(): void {
    void sound.context.audioContext.resume().catch(() => {
      // Ignore audio startup errors so gameplay input stays responsive.
    });
  }

  function playDesiredMusicAfterUnlock(): void {
    if (!desiredMusicAlias || currentMusicInstance) {
      return;
    }

    if (
      desiredMusicAlias === "title" ||
      desiredMusicAlias === "end-title" ||
      desiredMusicAlias === "level-intro" ||
      desiredMusicAlias === "level-outro" ||
      desiredMusicAlias.startsWith("level-")
    ) {
      playLoopingMusic(desiredMusicAlias);
    }
  }

  function unlockAudio(): void {
    if (hasUnlockedAudio) {
      return;
    }

    hasUnlockedAudio = true;
    ensureContext();
    playDesiredMusicAfterUnlock();
  }

  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
  window.addEventListener("touchstart", unlockAudio, { once: true });

  function registerLoadedSounds(
    soundBuffers: Map<SoundAlias, ArrayBuffer>,
  ): void {
    if (soundsRegistered) {
      return;
    }

    SOUND_DEFINITIONS.forEach(([alias]) => {
      const source = soundBuffers.get(alias);
      if (!source) {
        throw new Error(`Missing preloaded sound "${alias}"`);
      }

      sound.add(alias, {
        source,
        preload: true,
      });
    });

    soundsRegistered = true;
  }

  function playEffect(alias: SoundAlias, start = 0): void {
    ensureContext();
    sound.play(alias, start > 0 ? { start } : undefined);
  }

  function stopCurrentMusicInstance(): void {
    currentMusicInstance?.stop();
    currentMusicInstance = null;
    currentMusicAlias = null;
  }

  function stopAllMusicAliases(): void {
    MUSIC_ALIASES.forEach((alias) => {
      sound.stop(alias);
    });
  }

  function captureMusicInstance(
    alias: SoundAlias,
    token: number,
    result: IMediaInstance | Promise<IMediaInstance>,
  ): void {
    const attachInstance = (instance: IMediaInstance): void => {
      if (token !== musicToken || desiredMusicAlias !== alias) {
        instance.stop();
        return;
      }

      currentMusicInstance = instance;
      currentMusicAlias = alias;
    };

    if (typeof (result as Promise<IMediaInstance>).then === "function") {
      void (result as Promise<IMediaInstance>)
        .then(attachInstance)
        .catch(() => {
          // Ignore playback startup errors so the game can continue silently.
        });
      return;
    }

    attachInstance(result as IMediaInstance);
  }

  function playLoopingMusic(alias: SoundAlias): void {
    if (desiredMusicAlias === alias && currentMusicAlias === alias) {
      return;
    }

    desiredMusicAlias = alias;
    if (!hasUnlockedAudio) {
      return;
    }

    ensureContext();
    const token = ++musicToken;
    stopAllMusicAliases();
    stopCurrentMusicInstance();
    captureMusicInstance(
      alias,
      token,
      sound.play(alias, {
        loop: true,
        singleInstance: true,
        volume: MUSIC_VOLUME,
      }),
    );
  }

  function getLevelMusicAlias(levelIndex: number): SoundAlias {
    const levelNumber = levelIndex + 1;
    if (
      levelNumber !== 1 &&
      levelNumber !== 2 &&
      levelNumber !== 3 &&
      levelNumber !== 4 &&
      levelNumber !== 5
    ) {
      throw new Error(`Missing level music for level ${levelNumber}`);
    }

    return `level-${levelNumber}`;
  }

  return {
    preload(onProgress?: (progress: number) => void): Promise<void> {
      preloadProgressListener = onProgress ?? null;
      preloadProgressListener?.(0);

      if (!preloadPromise) {
        preloadPromise = Promise.all(
          SOUND_DEFINITIONS.map(async ([alias, assetPath]) => {
            const response = await fetch(withBaseUrl(assetPath));
            if (!response.ok) {
              throw new Error(
                `Failed to preload sound "${alias}": ${response.status}`,
              );
            }

            const buffer = await response.arrayBuffer();
            loadedSoundCount += 1;
            preloadProgressListener?.(
              loadedSoundCount / SOUND_DEFINITIONS.length,
            );
            return [alias, buffer] as const;
          }),
        ).then((entries) => {
          registerLoadedSounds(new Map(entries));
        });
      }

      return preloadPromise.then(() => {
        preloadProgressListener?.(1);
        preloadProgressListener = null;
      });
    },
    unlock(): void {
      unlockAudio();
    },
    stopMusic(): void {
      desiredMusicAlias = null;
      musicToken += 1;
      stopAllMusicAliases();
      stopCurrentMusicInstance();
    },
    playTitleMusic(): void {
      playLoopingMusic("title");
    },
    playEndTitleMusic(): void {
      playLoopingMusic("end-title");
    },
    playLevelIntroMusic(): void {
      playLoopingMusic("level-intro");
    },
    playLevelMusic(levelIndex: number): void {
      playLoopingMusic(getLevelMusicAlias(levelIndex));
    },
    playLevelCompleteTransition(): void {
      ensureContext();
      const token = ++musicToken;
      desiredMusicAlias = "level-outro";
      stopAllMusicAliases();
      stopCurrentMusicInstance();
      const completionResult = sound.play("level-complete");

      const startOutroMusic = (): void => {
        if (token !== musicToken || desiredMusicAlias !== "level-outro") {
          return;
        }

        captureMusicInstance(
          "level-outro",
          token,
          sound.play("level-outro", {
            loop: true,
            singleInstance: true,
            volume: MUSIC_VOLUME,
          }),
        );
      };

      if (
        typeof (completionResult as Promise<IMediaInstance>).then === "function"
      ) {
        void (completionResult as Promise<IMediaInstance>)
          .then((instance) => {
            instance.once("end", startOutroMusic);
          })
          .catch(() => {
            // Ignore playback startup errors so the game can continue silently.
          });
        return;
      }

      (completionResult as IMediaInstance).once("end", startOutroMusic);
    },
    playJump(): void {
      playEffect("jump", JUMP_START_OFFSET_SECONDS);
    },
    playDoorOpen(): void {
      playEffect("door-open");
    },
    playCollect(): void {
      playEffect("collect");
    },
    playDelivered(): void {
      playEffect("item-delivered");
    },
    playCrow(): void {
      playEffect("crow");
    },
  };
}
