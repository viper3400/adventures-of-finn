# Implementation Plan: Playwright E2E Tests for Adventures of Finn

## Goal and scope

In addition to Vitest, Playwright should launch a real browser and verify app startup and a short, reproducible gameplay flow. These tests should run in CI and also be available as an optional local check on macOS. They must remain completely independent of deployment.

The first implementation should reliably verify that:

1. The app loads in a browser.
2. The loading screen becomes interactive after assets finish loading.
3. A PixiJS canvas is created after the initial interaction.
4. Keyboard input proceeds through the title screen, startup menu, and level intro into gameplay.
5. The active game state can be checked reliably without inspecting PixiJS pixels or screenshots.

The first step is not intended to automate complete playthroughs of every level, perform pixel-perfect comparisons, test audio quality, or change actual gameplay mechanics.

## Project context

- PixiJS version: v8 (`pixi.js`), with asynchronous `Application.init()`.
- Bundler/dev server: Vite.
- Existing tests: Vitest (`npm test` / `vitest run`).
- CI: `.github/workflows/ci.yml` currently runs tests and `npm run build`.
- App entry point: `src/main.ts`.
- Game bootstrap and state orchestration: `src/game/game.ts`.
- Game flow states: `src/game/runtime/state-flow.ts`.
- The game UI is rendered in PixiJS; screen text is therefore not automatically available as DOM text.
- `src/main.ts` initially displays a DOM loading screen. A pointer or keyboard interaction after loading completes starts the game and removes the loading screen.
- The PixiJS canvas is then attached under `#pixi-container`.
- Menu and transition input is handled by `src/game/runtime/input.ts`. The menu defaults to “New Game”; selection and confirmation are available by keyboard.
- According to `AGENTS.md`, `S` is a debug shortcut that skips a stage. E2E tests must not rely on it as normal gameplay functionality.

## Implementation guidelines

1. **Tests must be deterministic.** Do not depend on saved progress, real-time delays, random timing, or manual intervention.
2. **Do not assert against PixiJS internals or rendered pixels**, unless the app already provides a stable, supported interface for doing so.
3. **Expose only the state needed.** Do not infer test state from rendered PixiJS text, arbitrary DOM classes, or scene implementation details.
4. **Preserve production behavior.** Test hooks must not be active in a normal production build.
5. **Keep E2E tests separate.** `npm test` should continue to run Vitest only; Playwright should have its own script.
6. **Avoid unnecessary gameplay changes.** Testability must not require changes to physics, level data, or progression rules.
7. **Inspect existing files and the working tree before editing.** Do not overwrite existing user changes.

## Implementation steps

### 1. Install Playwright and add scripts

1. Add `@playwright/test` as a development dependency.
2. Create or manually add the Playwright configuration.
3. Add a script to `package.json`, for example:

   ```json
   "test:e2e": "playwright test"
   ```

4. Do not replace the existing `test` script or change it to run Playwright.
5. Update the Playwright version and lockfile consistently with the package manager used by the project.
6. Make Chromium installation straightforward both locally on macOS and in CI. CI should install browser binaries through Playwright.
7. Local E2E execution must be opt-in: developers should be able to run it explicitly with `npm run test:e2e`, without requiring a browser installation merely to run `npm test`, `npm run build`, or the normal development server.

### 2. Create the Playwright configuration

Recommended file: `playwright.config.ts` in the repository root.

At a minimum, configure the following:

- Set `testDir` to `e2e` (or another dedicated E2E test directory).
- Use Chromium as the first and initially only project.
- Set `baseURL`, for example `http://127.0.0.1:4173` for Preview or `http://127.0.0.1:5173` for the Vite dev server.
- Configure `webServer` so Playwright starts the local server and waits for it to become ready.
- Allow `reuseExistingServer` outside CI; force a dedicated server in CI.
- In CI, enable `forbidOnly: true` and sensible retry/trace settings.
- Consider using a single worker in CI if resource constraints or PixiJS initialization cause parallelism issues.

**Choosing the server:** Prefer `vite preview` against the production build if the app behaves correctly in that environment. In that case, `webServer.command` should first run `npm run build`, then run `vite preview --host 127.0.0.1 --port 4173 --strictPort`. Check that this does not run the existing TypeScript/lint/build pipeline redundantly in CI. Alternatively, use the Vite dev server and run the build separately in the existing CI job. Do not start the server twice or configure conflicting approaches in the config and CI.

### 3. Ensure deterministic starting conditions

For each test run, both in CI and when explicitly run locally on macOS:

- Use a fresh browser context/page.
- Clear or initialize `localStorage` before app code runs.
- Explicitly remove at least the `first-p:progression` key so the test follows the New Game path rather than Continue.
- Set a fixed viewport, for example 1280×720.
- Monitor JavaScript errors (`pageerror`) and failed app requests, and fail the test on unexpected errors.
- Wait only for explicit states; do not use fixed `waitForTimeout` pauses.

Audio may be blocked or unavailable in headless browsers. Tests must not depend on audible output. If audio errors actually prevent app initialization, consider a narrowly scoped test-only substitute; do not preemptively remove audio from the game globally.

### 4. Choose a minimal status hook for browser assertions

Because PixiJS screen text is rendered into a canvas, Playwright needs a reliable way to observe the current state. Before implementing anything, check whether an appropriate accessible DOM status already exists. If not, choose one of the following approaches:

#### Preferred option: accessible DOM status

- Add a small status node to the DOM, preferably with `role="status"` and `aria-live="polite"`.
- Update it from the existing game flow states; do not duplicate input handling logic.
- Define stable state values such as `title`, `menu`, `levelIntro`, `playing`, `levelComplete`, `gameComplete`, and `levelFailed`.
- Use a stable attribute such as `data-game-state` for machine-readable state; keep the accessible text meaningful to people.
- Do not unnecessarily expose existing content in the accessibility tree. Keep the status node usable by assistive technology and tests; do not remove it from the accessibility tree with `display: none` or `visibility: hidden`.
- Set state values where game flow changes are actually applied (`applyGameFlowEffects` or an equivalent central point in `src/game/game.ts`). The boot/loading state can be set in `src/main.ts`.

#### Alternative: test-only hook

If a status node would be inappropriate for accessibility, provide a minimal hook that is enabled only in E2E mode, such as a clearly named global test API or a `data-*` attribute. It must not trigger game actions or expose mutable game logic. Ensure the hook is not included in a normal production build.

**Decision criterion:** For this game, an accessible status is generally more valuable than a hook invented only for tests. Keep it small so it does not become a second UI system.

### 5. Implement the first E2E test

Recommended path: `e2e/game-start.spec.ts`.

The first test should cover this short flow:

1. Open the page.
2. Wait until the loading screen signals that it is ready (using existing text/class or a new stable loading status).
3. Verify that no JavaScript error occurred during initialization.
4. Send one keyboard input to dismiss the loading screen. Do not send it immediately on page load, because `main.ts` ignores it while `interactionArmed` is false.
5. Wait for `#pixi-container canvas` to exist and be visible.
6. Verify the title state using the status hook.
7. Press `Space` and verify the menu state.
8. Confirm “New Game” in the menu. If the implemented selection differs, inspect the actual UI behavior and send only the input needed.
9. Verify the intro state.
10. Dismiss the intro with `Space`. While a transition is animating, the first keypress may only finish the animation. Wait for a stable state and, if needed, send a second deliberate input instead of using an arbitrary delay.
11. Verify the `playing` state.

> **Note:** `src/main.ts` uses the initial interaction to unlock audio and show the title screen. The input that dismisses this step must not accidentally also be interpreted as a title/menu action. The implementation calls `input.resetState()` and `input.suppressNextTransitionClose()`; the test should cover this expected behavior.

Use Playwright's `page.keyboard.press("Space")` for input. For readiness and state checks, use `expect(locator).toHaveAttribute(...)`, `toHaveText(...)`, or other Web-First assertions that wait for the state themselves.

### 6. Improve failure signals and diagnostics

- Do not blanket-ignore failed requests. Asset and app resource failures must remain visible.
- Save Playwright traces in CI on failure, for example with `trace: "on-first-retry"`.
- Capture screenshots only as failure artifacts, not as primary correctness assertions.
- Do not swallow audio, network, or browser errors with broad `catch` blocks.

### 7. Extend the CI workflow

File: `.github/workflows/ci.yml`.

- Keep the existing CI checks for `npm ci`, `npm test`, and `npm run build`.
- Add Playwright browser installation, for example `npx playwright install --with-deps chromium` on Ubuntu.
- Run `npm run test:e2e` in CI.
- Ensure the dev/preview server is started only once.
- Upload the Playwright report and traces as artifacts on failure (for example, with `if: failure()`), with a limited retention period.
- Do not require deployment secrets or deployment steps for E2E tests.
- Leave workflow triggers in place so pushes and pull requests are checked. Do not restrict push triggers without a reason if the project intends to check all branches.

### 8. Add documentation

Document the following in the `package.json` scripts and, optionally, a README section:

- Local browser installation: `npx playwright install chromium` (on Linux, `--with-deps` may be needed the first time).
- On macOS, `npx playwright install chromium` should install the browser without Linux system-dependency flags. Document project-specific prerequisites only if actually needed.
- Run E2E tests: `npm run test:e2e`.
- Run unit tests: `npm test`.
- View the report locally, if configured: `npx playwright show-report`.

The local macOS workflow is optional and explicit: after installing dependencies and the Playwright Chromium browser once, a developer can run `npm run test:e2e` whenever desired. Do not make Playwright browser installation a prerequisite for ordinary unit tests, builds, or starting the app locally.

Do not add a long generic Playwright tutorial to the main README; keep it focused on this project's commands.

## Initial test files

- `playwright.config.ts` — test directory, browser, base URL, and local server.
- `e2e/game-start.spec.ts` — loading screen through to active gameplay.
- Optionally `e2e/helpers/` — only if genuinely reusable, short helper functions emerge.
- Optionally small changes to `src/main.ts` and `src/game/game.ts` — add a status hook if no stable DOM state exists yet.
- `.github/workflows/ci.yml` — browser installation, E2E execution, and failure artifacts.
- `package.json` plus lockfile — dependency and script.

Do not introduce additional test frameworks, global fixtures, or screenshot comparison tools unless they make even this single test simpler.

## Acceptance criteria / definition of done

The implementation is complete when:

1. `npm test` still successfully runs Vitest.
2. `npm run test:e2e` passes locally with Chromium installed.
3. On macOS, a developer can install Chromium with the documented Playwright command and run `npm run test:e2e` without CI-only setup or deployment credentials.
4. The E2E test checks the path from loading to `playing` without fixed sleeps.
5. The test starts with empty progress storage and consistently follows the Level 1 new-game path.
6. The test verifies both the PixiJS canvas and the actual game flow state.
7. Unexpected JavaScript errors fail the test.
8. CI runs unit tests, the build, and E2E separately and provides diagnostic artifacts on failure.
9. No deployment is required and no deployment credentials are used.
10. Test code does not change production behavior or gameplay.
11. After changes, `npm run build`, `npm test`, `npm run lint`, and `npx tsc --noEmit` pass (unless already covered by `npm run build`).

## Follow-up enhancements after the first test

Consider these only after the startup test is stable:

- Test menu options and difficulty selection.
- Test saving progress and the Continue path in a separate test.
- Test stage transitions using a controlled test mode or targeted debug interface.
- Test keyboard movement and jumping using reliable state changes.
- Test collect, transport, and chase objectives.

Gameplay tests should primarily complement the existing pure unit tests for collision, objective logic, and state flow, rather than duplicating the same logic in browser scenarios. Only behavior arising from the integration of browser, input, PixiJS, and game orchestration necessarily belongs in E2E tests.

## Notes for the coding agent implementing this plan

1. Before starting, inspect `git status --short`, `package.json`, the lockfile, and the CI configuration.
2. Respect local changes and modify only files needed for this plan.
3. Check existing conventions and Vite/TypeScript configuration first; do not blindly overwrite configuration.
4. Choose Playwright and its browser installation approach to fit the current Node/CI environment.
5. If test state cannot be observed without a larger refactor, add the smallest maintainable status hook and explain its production impact.
6. Make changes in small steps and run relevant commands after each phase.
7. At the end, briefly summarize changed files, local verification results, and any limits to browser coverage.
