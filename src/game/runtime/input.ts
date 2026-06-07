export interface InputController {
  isLeftPressed(): boolean;
  isRightPressed(): boolean;
  isJumpPressed(): boolean;
  canStartJump(): boolean;
  markJumpUsed(): void;
  consumeDebugToggle(): boolean;
  consumeStageSkip(): boolean;
  consumeTransitionClose(): boolean;
  destroy(): void;
}

export function createInputController(): InputController {
  const keys: Record<string, boolean> = {};
  let jumpReady = true;
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

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return {
    isLeftPressed: () => Boolean(keys["arrowleft"] || keys["a"]),
    isRightPressed: () => Boolean(keys["arrowright"] || keys["d"]),
    isJumpPressed: isJumpKeyHeld,
    canStartJump: () => jumpReady && isJumpKeyHeld(),
    markJumpUsed(): void {
      jumpReady = false;
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
    },
  };
}
