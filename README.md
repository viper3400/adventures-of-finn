# Adventures of Finn

A side-view platformer built with PixiJS v8.

## Development

### Running the game
```bash
npm run dev
```

### Testing

#### Unit Tests
Run Vitest to run unit tests:
```bash
npm test
```

#### End-to-End (E2E) Tests
Run Playwright E2E tests:
```bash
npm run test:e2e
```

To install the necessary browsers for Playwright:
```bash
npx playwright install chromium
```
*Note: On macOS, you may not need the `--with-deps` flag.*

To view the Playwright test report:
```bash
npx playwright show-report
```
