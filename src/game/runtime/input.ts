export interface InputController {
  isLeftPressed(): boolean;
  isRightPressed(): boolean;
  isJumpPressed(): boolean;
  canStartJump(): boolean;
  markJumpUsed(): void;
  consumeMenuUp(): boolean;
  consumeMenuDown(): boolean;
  consumeDebugToggle(): boolean;
  consumeStageSkip(): boolean;
  consumeTransitionClose(): boolean;
  destroy(): void;
}

export function createInputController(): InputController {
  const keys: Record<string, boolean> = {};
  let jumpReady = true;
  let menuUpRequested = false;
  let menuDownRequested = false;
  let debugToggleRequested = false;
  let stageSkipRequested = false;
  let transitionCloseRequested = false;

  function isJumpKeyHeld(): boolean {
    return Boolean(keys[" "] || keys["w"] || keys["arrowup"]);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    keys[key] = true;

    if (key === "l" && !event.repeat) {
      debugToggleRequested = true;
    }

    if (key === "arrowup" && !event.repeat) {
      menuUpRequested = true;
    }

    if (key === "arrowdown" && !event.repeat) {
      menuDownRequested = true;
    }

    if (key === "s" && !event.repeat) {
      stageSkipRequested = true;
    }

    if (key === " " && !event.repeat) {
      transitionCloseRequested = true;
    }
  }

  function handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    keys[key] = false;

    if (!isJumpKeyHeld()) {
      jumpReady = true;
    }
  }

  function resetInputState(): void {
    Object.keys(keys).forEach((key) => {
      keys[key] = false;
    });
    jumpReady = true;
  }

  function handleWindowBlur(): void {
    resetInputState();
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState !== "visible") {
      resetInputState();
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleWindowBlur);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return {
    isLeftPressed: () => Boolean(keys["arrowleft"] || keys["a"]),
    isRightPressed: () => Boolean(keys["arrowright"] || keys["d"]),
    isJumpPressed: isJumpKeyHeld,
    canStartJump: () => jumpReady && isJumpKeyHeld(),
    markJumpUsed(): void {
      jumpReady = false;
    },
    consumeMenuUp(): boolean {
      const requested = menuUpRequested;
      menuUpRequested = false;
      return requested;
    },
    consumeMenuDown(): boolean {
      const requested = menuDownRequested;
      menuDownRequested = false;
      return requested;
    },
    consumeDebugToggle(): boolean {
      const requested = debugToggleRequested;
      debugToggleRequested = false;
      return requested;
    },
    consumeStageSkip(): boolean {
      const requested = stageSkipRequested;
      stageSkipRequested = false;
      return requested;
    },
    consumeTransitionClose(): boolean {
      const requested = transitionCloseRequested;
      transitionCloseRequested = false;
      return requested;
    },
    destroy(): void {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    },
  };
}
