import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, devices } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Browser end-to-end tests.
 *
 * Spins up the real backend (seeded SQLite) and the Vite dev server, then
 * drives the app in a headless browser. Run with `npm run e2e`.
 */
const BACKEND = path.resolve(__dirname, '../backend')
const isWindows = process.platform === 'win32'
const PYBIN = process.env.E2E_PYBIN ?? (isWindows ? '.venv\\Scripts\\' : '.venv/bin/')
const cleanDbCmd = isWindows ? 'if exist e2e.db del /f /q e2e.db' : 'rm -f e2e.db'
const BACKEND_CMD = isWindows
  ? [
      cleanDbCmd,
      `call ${PYBIN}alembic upgrade head`,
      `call ${PYBIN}python -m app.utils.seed`,
      `call ${PYBIN}uvicorn app.main:app --port 8000`,
    ].join(' && ')
  : [
      cleanDbCmd,
      `${PYBIN}alembic upgrade head`,
      `${PYBIN}python -m app.utils.seed`,
      `${PYBIN}uvicorn app.main:app --port 8000`,
    ].join(' && ')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: BACKEND_CMD,
      cwd: BACKEND,
      url: 'http://localhost:8000/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        DATABASE_URL: 'sqlite:///./e2e.db',
        DEBUG: 'false',
      },
    },
    {
      command: 'npm run dev -- --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
