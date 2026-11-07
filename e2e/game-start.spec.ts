import { test, expect } from "@playwright/test";

test.describe("Game Startup Flow", () => {
  test("should transition from loading to playing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (exception) =>
      errors.push(exception.stack ?? exception.message),
    );
    page.on("requestfailed", (request) => {
      errors.push(
        `Request failed: ${request.url()} (${request.failure()?.errorText})`,
      );
    });
    await page.addInitScript(() => {
      localStorage.removeItem("first-p:progression");

      // Audio quality is outside this E2E's scope. Substitute successful silent
      // buffers for browser MP3 decoding, which is unreliable in headless CI.
      const OfflineContext = window.OfflineAudioContext;
      if (OfflineContext) {
        OfflineContext.prototype.decodeAudioData = function (
          _audioData: ArrayBuffer,
          successCallback?: DecodeSuccessCallback,
        ): Promise<AudioBuffer> | void {
          const buffer = this.createBuffer(1, 1, this.sampleRate);
          if (successCallback) {
            queueMicrotask(() => successCallback(buffer));
            return;
          }
          return Promise.resolve(buffer);
        };
      }
    });

    // 1. Open the page
    await page.goto("/");

    // 2. Wait until the loading screen signals that it is ready
    const loadingScreen = page.locator(".loading-screen");
    await expect(loadingScreen).toBeVisible();

    // Wait for the 'loading-screen-ready' class to be added, which indicates assets are loaded and interaction is armed.
    await expect(loadingScreen).toHaveClass(/loading-screen-ready/);

    const loadingStatus = page.locator(".loading-status");
    await expect(loadingStatus).toContainText("Assets ready.");

    // 3. Verify no JavaScript errors occurred during initialization
    // 4. Send one keyboard input to dismiss the loading screen.
    await page.keyboard.press("Space");

    // 5. Wait for #pixi-container canvas to exist and be visible.
    const canvas = page.locator("#pixi-container canvas");
    await expect(canvas).toBeVisible();

    // 6. Verify the title state using the status hook.
    const status = page.locator("#game-status");
    await expect(status).toHaveAttribute("data-game-state", "title");

    // Let the game ticker consume its initial input-suppression frame before
    // sending the next deliberate keypress.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );

    // 7. Press Space and verify the menu state.
    await page.keyboard.press("Space");
    await expect(status).toHaveAttribute("data-game-state", "menu");

    // 8. Confirm “New Game” in the menu.
    await page.keyboard.press("Space");

    // 9. Verify the intro state.
    await expect(status).toHaveAttribute("data-game-state", "levelIntro");

    // 10. Dismiss the intro with Space.
    await expect(status).toHaveAttribute("data-transition-ready", "true");
    await page.keyboard.press("Space");

    // 11. Verify the playing state.
    await expect(status).toHaveAttribute("data-game-state", "playing");
    expect(errors).toHaveLength(0);
  });
});
