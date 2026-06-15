import { startGame } from "./game/game";

const appRoot = document.getElementById("app");

if (!appRoot) {
  throw new Error("Missing #app root element");
}

const loadingScreen = document.createElement("div");
loadingScreen.className = "loading-screen";

const loadingTitle = document.createElement("div");
loadingTitle.className = "loading-title";
loadingTitle.textContent = "Loading Dog Game";

const loadingStatus = document.createElement("div");
loadingStatus.className = "loading-status";
loadingStatus.textContent = "Preparing assets... 0%";

const loadingHint = document.createElement("div");
loadingHint.className = "loading-hint";
loadingHint.textContent = "Loading audio and graphics into your browser cache.";

const loadingBar = document.createElement("div");
loadingBar.className = "loading-bar";

const loadingBarFill = document.createElement("div");
loadingBarFill.className = "loading-bar-fill";
loadingBar.appendChild(loadingBarFill);

loadingScreen.append(loadingTitle, loadingStatus, loadingHint, loadingBar);
appRoot.appendChild(loadingScreen);

function updateLoadingProgress(progress: number): void {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percent = Math.round(clampedProgress * 100);
  loadingBarFill.style.width = `${percent}%`;
  loadingStatus.textContent = `Preparing assets... ${percent}%`;
}

updateLoadingProgress(0);

let resolveInteraction!: () => void;
const waitForInteraction = new Promise<void>((resolve) => {
  resolveInteraction = resolve;
});

let interactionArmed = false;

function beginGameFromLoadingScreen(): void {
  if (!interactionArmed) {
    return;
  }

  interactionArmed = false;
  resolveInteraction();
}

function armInteractionPrompt(): void {
  interactionArmed = true;
  loadingScreen.classList.add("loading-screen-ready");
  loadingStatus.textContent = "Assets ready.";
  loadingHint.textContent =
    "Click, tap, or press any key to open the title screen with audio enabled.";
}

window.addEventListener("pointerdown", beginGameFromLoadingScreen);
window.addEventListener("keydown", beginGameFromLoadingScreen);
window.addEventListener("touchstart", beginGameFromLoadingScreen);

void startGame({
  onLoadProgress: (progress) => {
    updateLoadingProgress(progress);
    if (progress >= 1 && !interactionArmed) {
      armInteractionPrompt();
    }
  },
  waitForInteraction,
}).then(() => {
  loadingScreen.remove();
  window.removeEventListener("pointerdown", beginGameFromLoadingScreen);
  window.removeEventListener("keydown", beginGameFromLoadingScreen);
  window.removeEventListener("touchstart", beginGameFromLoadingScreen);
});
