import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  UPDATE_PRIORITY,
} from "pixi.js";

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Graphics;
}

interface Player {
  sprite: Sprite;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  width: number;
  height: number;
}

const GRAVITY = 0.5;
const JUMP_POWER = -12;
const MOVE_SPEED = 5;
const PLAYER_WIDTH = 52;
const PLAYER_HEIGHT = 40;
const PLAYER_SCALE_X = PLAYER_WIDTH / 128;
const PLAYER_SCALE_Y = PLAYER_HEIGHT / 96;

// Keyboard state
const keys: Record<string, boolean> = {};

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#87CEEB", resizeTo: window, antialias: true });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Setup keyboard tracking
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Create game container
  const gameWorld = new Container();
  app.stage.addChild(gameWorld);

  // Load player texture
  const playerTexture = await Assets.load("/assets/dog.svg");

  // Create player sprite from external dog asset
  const playerSprite = new Sprite(playerTexture);
  playerSprite.anchor.set(0.5);
  playerSprite.position.set(100, 200);
  playerSprite.scale.set(PLAYER_SCALE_X, PLAYER_SCALE_Y);
  gameWorld.addChild(playerSprite);

  const player: Player = {
    sprite: playerSprite,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  };

  // Create platforms
  const platforms: Platform[] = [];

  // Ground platform
  const groundGfx = new Graphics()
    .rect(0, app.screen.height - 40, app.screen.width, 40)
    .fill({ color: 0x8b4513 });
  gameWorld.addChild(groundGfx);
  platforms.push({
    x: 0,
    y: app.screen.height - 40,
    width: app.screen.width,
    height: 40,
    graphics: groundGfx,
  });

  // Additional platforms
  const platformConfigs = [
    { x: 200, y: app.screen.height - 150, w: 150, h: 20 },
    { x: 450, y: app.screen.height - 250, w: 150, h: 20 },
    { x: 700, y: app.screen.height - 180, w: 150, h: 20 },
    { x: 950, y: app.screen.height - 280, w: 150, h: 20 },
    { x: 400, y: app.screen.height - 400, w: 150, h: 20 },
  ];

  platformConfigs.forEach((config) => {
    const gfx = new Graphics()
      .rect(config.x, config.y, config.w, config.h)
      .fill({ color: 0x228b22 });
    gameWorld.addChild(gfx);
    platforms.push({
      x: config.x,
      y: config.y,
      width: config.w,
      height: config.h,
      graphics: gfx,
    });
  });

  // Collision detection helper
  function checkCollision(
    playerX: number,
    playerY: number,
    playerW: number,
    playerH: number,
    platform: Platform,
  ): boolean {
    return (
      playerX + playerW / 2 > platform.x &&
      playerX - playerW / 2 < platform.x + platform.width &&
      playerY + playerH / 2 > platform.y &&
      playerY - playerH / 2 < platform.y + platform.height
    );
  }

  // Game loop
  app.ticker.add(
    () => {
      // Handle input
      player.velocityX = 0;
      if (keys["arrowleft"] || keys["a"]) {
        player.velocityX = -MOVE_SPEED;
        playerSprite.scale.x = -PLAYER_SCALE_X;
      }
      if (keys["arrowright"] || keys["d"]) {
        player.velocityX = MOVE_SPEED;
        playerSprite.scale.x = PLAYER_SCALE_X;
      }

      // Apply gravity
      player.velocityY += GRAVITY;

      // Update position
      player.sprite.x += player.velocityX;
      player.sprite.y += player.velocityY;

      // Reset jumping state
      player.isJumping = true;

      // Check platform collisions
      platforms.forEach((platform) => {
        if (
          checkCollision(
            player.sprite.x,
            player.sprite.y,
            player.width,
            player.height,
            platform,
          )
        ) {
          // Only collide from above
          if (
            player.velocityY >= 0 &&
            player.sprite.y - player.height / 2 < platform.y + 10
          ) {
            player.sprite.y = platform.y - player.height / 2;
            player.velocityY = 0;
            player.isJumping = false;
          }
        }
      });

      // Jump input
      if ((keys[" "] || keys["w"] || keys["arrowup"]) && !player.isJumping) {
        player.velocityY = JUMP_POWER;
      }

      // Wrap horizontally
      if (player.sprite.x < 0) {
        player.sprite.x = app.screen.width;
      }
      if (player.sprite.x > app.screen.width) {
        player.sprite.x = 0;
      }

      // Fall off screen
      if (player.sprite.y > app.screen.height + 100) {
        player.sprite.position.set(100, 200);
        player.velocityY = 0;
        player.velocityX = 0;
      }
    },
    undefined,
    UPDATE_PRIORITY.HIGH,
  );
})();
