import { test, expect } from '@playwright/test'

/**
 * End-to-end smoke of the two core user journeys against the real backend:
 * a citizen submitting an SOS report, and an operator viewing live data and
 * running the optimizer.
 */

test('citizen submits an SOS report and gets confirmation', async ({ page }) => {
  await page.goto('/citizen')

  await page
    .getByPlaceholder(/Describe the flooding/i)
    .fill('Family trapped on rooftop in Whitefield, water rising fast')
  await page.getByPlaceholder('Latitude').fill('12.9698')
  await page.getByPlaceholder('Longitude').fill('77.7500')

  await page.getByRole('button', { name: /Submit report/i }).click()

  await expect(page.getByRole('heading', { name: /Report received/i })).toBeVisible()
})

test('operations desk shows seeded data and runs optimization', async ({ page }) => {
  await page.goto('/operations')

  // Seeded entities are reflected in the status bar and panels.
  await expect(page.getByText(/Incidents:/)).toBeVisible()
  await expect(page.getByText(/Rescue Units \(/)).toBeVisible()
  await expect(page.getByText(/Shelters \(/)).toBeVisible()
  // At least one incident severity badge (P0–P3) is rendered.
  await expect(page.getByText(/^P[0-3]$/).first()).toBeVisible()

  // Running the optimizer reports an assignment summary.
  await page.getByRole('button', { name: /Run optimization/i }).click()
  await expect(page.getByText(/Optimization complete/i)).toBeVisible({
    timeout: 15_000,
  })
})

test('command panel answers an operational question', async ({ page }) => {
  await page.goto('/operations')

  await page.getByRole('button', { name: 'Which shelter will overflow?' }).click()

  await expect(page.getByText(/Reasoning:/i)).toBeVisible({ timeout: 15_000 })
})
