import level1 from "./level-1";
import level2 from "./level-2";
import { validateLevels } from "./validation";

export const LEVELS = validateLevels([level1, level2]);
