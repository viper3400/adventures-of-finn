export interface InputController {
  isLeftPressed(): boolean;
  isRightPressed(): boolean;
  isJumpPressed(): boolean;
  canStartJump(): boolean;
  markJumpUsed(): void;
  setTouchMoveDirection(direction: -1 | 0 | 1): void;
  setTouchJumpPressed(pressed: boolean): void;
  requestTransitionClose(): void;
  requestMenuAction(action: "new" | "continue"): void;
  consumeMenuAction(): "new" | "continue" | null;
  consumeMenuUp(): boolean;
  consumeMenuDown(): boolean;
  consumeMenuLeft(): boolean;
  consumeMenuRight(): boolean;
  consumeDebugToggle(): boolean;
  consumeStageSkip(): boolean;
  consumeTransitionClose(): boolean;
  destroy(): void;
}

export function createInputController(): InputController {
  const keys: Record<string, boolean> = {};
  let touchMoveDirection: -1 | 0 | 1 = 0;
  let touchJumpPressed = false;
  let jumpReady = true;
  let menuUpRequested = false;
  let menuDownRequested = false;
  let menuLeftRequested = false;
  let menuRightRequested = false;
  let menuActionRequested: "new" | "continue" | null = null;
  let debugToggleRequested = false;
  let stageSkipRequested = false;
  let transitionCloseRequested = false;

  function isJumpKeyHeld(): boolean {
    return Boolean(keys[" "] || keys["w"] || keys["arrowup"] || touchJumpPressed);
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

    if ((key === "arrowleft" || key === "a") && !event.repeat) {
      menuLeftRequested = true;
    }

    if ((key === "arrowright" || key === "d") && !event.repeat) {
      menuRightRequested = true;
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
    touchMoveDirection = 0;
    touchJumpPressed = false;
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
    isLeftPressed: () =>
      Boolean((keys["arrowleft"] || keys["a"]) && touchMoveDirection !== 1) ||
      touchMoveDirection === -1,
    isRightPressed: () =>
      Boolean((keys["arrowright"] || keys["d"]) && touchMoveDirection !== -1) ||
      touchMoveDirection === 1,
    isJumpPressed: isJumpKeyHeld,
    canStartJump: () => jumpReady && isJumpKeyHeld(),
    markJumpUsed(): void {
      jumpReady = false;
    },
    setTouchMoveDirection(direction: -1 | 0 | 1): void {
      touchMoveDirection = direction;
    },
    setTouchJumpPressed(pressed: boolean): void {
      touchJumpPressed = pressed;
      if (!pressed && !Boolean(keys[" "] || keys["w"] || keys["arrowup"])) {
        jumpReady = true;
      }
    },
    requestTransitionClose(): void {
      transitionCloseRequested = true;
    },
    requestMenuAction(action: "new" | "continue"): void {
      menuActionRequested = action;
    },
    consumeMenuAction(): "new" | "continue" | null {
      const requested = menuActionRequested;
      menuActionRequested = null;
      return requested;
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
    consumeMenuLeft(): boolean {
      const requested = menuLeftRequested;
      menuLeftRequested = false;
      return requested;
    },
    consumeMenuRight(): boolean {
      const requested = menuRightRequested;
      menuRightRequested = false;
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
