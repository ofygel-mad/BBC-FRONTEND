import { expect, test } from '@playwright/test'

async function login(page) {
  await page.goto('/index.html')
  await page.click('#btn-login-header')
  await page.fill('#login-email', 'admin')
  await page.fill('#login-password', 'admin')
  await page.click('#login-submit')
  await expect(page).toHaveURL(/requests\.html$/)
}

test('creates a request through the real frontend and backend', async ({ page }) => {
  const title = `CI request ${Date.now()}`

  await login(page)
  await expect(page.locator('.ticket-card').first()).toBeVisible()

  await page.click('#btn-create')
  await page.selectOption('#r-client', { index: 1 })
  await page.selectOption('#r-assignee', { index: 1 })
  await page.fill('#r-title', title)
  await page.click('#modal-save-btn')

  await expect(page.locator('#toast')).toBeVisible()
  await expect(page.locator('.ticket-title', { hasText: title })).toBeVisible()
})

test('renders journal entries from the live api', async ({ page }) => {
  await login(page)
  await page.goto('/journal.html')

  await expect(page.locator('#journal-grid .journal-card').first()).toBeVisible()
  await expect(page.locator('#count-label')).not.toHaveText('')
})

test('renders statistics from the live api', async ({ page }) => {
  await login(page)
  await page.goto('/statistics.html')

  await expect(page.locator('#tab-clients .client-stat-item').first()).toBeVisible()
  await expect(page.locator('#cnt-active')).not.toHaveText(/^\s*[—-]\s*$/)
})
