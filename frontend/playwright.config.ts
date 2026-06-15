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
// Python tool directory: the local venv by default, or PATH in CI (E2E_PYBIN='').
const PYBIN = process.env.E2E_PYBIN ?? '.venv/bin/'
const DB = 'DATABASE_URL=sqlite:///./e2e.db'
const BACKEND_CMD = [
  'rm -f e2e.db',
  `${DB} ${PYBIN}alembic upgrade head`,
  `${DB} ${PYBIN}python -m app.utils.seed`,
  `${DB} DEBUG=false ${PYBIN}uvicorn app.main:app --port 8000`,
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
    },
    {
      command: 'npm run dev -- --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
