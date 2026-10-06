import { test, expect, Page } from '@playwright/test';

// One True Shell conformance suite, spec v0.2.0.
// Test titles start with the behavior ID from SPEC.md section 5.

const S = (name: string) => `[data-shell="${name}"]`;
const REGIONS = ['rail', 'sidebar', 'tabs', 'main', 'aside', 'statusbar'];

const row = (page: Page, id: string) => page.locator(`[data-shell-row][data-id="${id}"]`);
const selectedRow = (page: Page) => page.locator('[data-shell-row][aria-selected="true"]');
const tabs = (page: Page) => page.locator('[data-shell-tab]');
const tab = (page: Page, id: string) => page.locator(`[data-shell-tab][data-id="${id}"]`);

async function openPalette(page: Page) {
  await page.keyboard.press('Control+K');
  await expect(page.locator(S('palette'))).toBeVisible();
}

async function runPalette(page: Page, text: string) {
  await openPalette(page);
  await page.locator('[data-shell-palette-input]').fill(text);
  await page.keyboard.press('Enter');
}

async function delayWrites(page: Page, ms = 2000) {
  await page.route('**/*', async (route) => {
    const method = route.request().method();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      await new Promise((r) => setTimeout(r, ms));
    }
    await route.continue();
  });
}

test('L01 six regions are present', async ({ page }) => {
  for (const url of ['/', '/customers']) {
    await page.goto(url);
    for (const r of REGIONS) {
      await expect(page.locator(S(r)), `${r} on ${url}`).toHaveCount(1);
    }
    for (const r of ['rail', 'sidebar', 'main', 'statusbar']) {
      await expect(page.locator(S(r)), `${r} visible on ${url}`).toBeVisible();
    }
  }
});

test('L02 rail and main are landmarks', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(`nav${S('rail')}, ${S('rail')}[role="navigation"]`)).toHaveCount(1);
  await expect(page.locator(`main${S('main')}, ${S('main')}[role="main"]`)).toHaveCount(1);
});

test('B01 palette opens with Control+K and Meta+K, closes with Escape', async ({ page }) => {
  await page.goto('/customers');
  for (const combo of ['Control+K', 'Meta+K']) {
    await page.keyboard.press(combo);
    await expect(page.locator(S('palette'))).toBeVisible();
    await expect(page.locator(`${S('palette')}[role="dialog"]`)).toHaveCount(1);
    await expect(page.locator('[data-shell-palette-input]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator(S('palette'))).toBeHidden();
  }
});

test('B02 palette navigates to an entity', async ({ page }) => {
  await page.goto('/');
  await openPalette(page);
  await expect(page.locator(S('palette'))).toContainText('Customers');
  await expect(page.locator(S('palette'))).toContainText('Projects');
  await page.locator('[data-shell-palette-input]').fill('Proj');
  await expect(page.locator(S('palette'))).not.toContainText('Customers');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expect(row(page, 'p1')).toBeVisible();
});

test('B03 sidebar navigates to an entity list', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-shell-nav="customers"]').click();
  await expect(page).toHaveURL(/\/customers\/?$/);
  await expect(page.locator('[data-shell-list]')).toBeVisible();
  await expect(row(page, 'c1')).toContainText('Acme Corp');
  await expect(row(page, 'c2')).toContainText('Globex');
});

test('B04 j/k move the selection', async ({ page }) => {
  await page.goto('/customers');
  await expect(selectedRow(page)).toHaveCount(1);
  await expect(row(page, 'c1')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('j');
  await expect(row(page, 'c2')).toHaveAttribute('aria-selected', 'true');
  await expect(selectedRow(page)).toHaveCount(1);
  await page.keyboard.press('k');
  await expect(row(page, 'c1')).toHaveAttribute('aria-selected', 'true');
});

test('B05 Enter opens a record, Escape returns to the list', async ({ page }) => {
  await page.goto('/customers');
  await page.keyboard.press('j');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/customers\/c2\/?$/);
  await expect(page.locator(`${S('main')} h1`)).toContainText('Globex');
  await expect(page.locator(S('aside'))).toBeVisible();
  await expect(page.locator(`${S('aside')} [data-shell-field="name"]`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/customers\/?$/);
  await expect(row(page, 'c2')).toHaveAttribute('aria-selected', 'true');
});

test('B06 tabs open, switch and close', async ({ page }) => {
  await page.goto('/customers');
  await page.keyboard.press('Enter'); // Acme
  await expect(tab(page, 'customers/c1')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await page.keyboard.press('j');
  await page.keyboard.press('Enter'); // Globex
  await expect(tabs(page)).toHaveCount(2);
  await expect(tab(page, 'customers/c2')).toHaveAttribute('aria-selected', 'true');
  await expect(tab(page, 'customers/c1')).not.toHaveAttribute('aria-selected', 'true');

  await tab(page, 'customers/c1').click();
  await expect(page).toHaveURL(/\/customers\/c1\/?$/);
  await expect(page.locator(`${S('main')} h1`)).toContainText('Acme Corp');

  // Re-opening an open record activates it rather than duplicating it.
  await page.goto('/customers');
  await page.keyboard.press('Enter');
  await expect(tabs(page)).toHaveCount(2);

  await tab(page, 'customers/c1').locator('[data-shell-tab-close]').click();
  await expect(tabs(page)).toHaveCount(1);
  await expect(page).not.toHaveURL(/\/customers\/c1\/?$/);
});

test('B07 tabs are restored after reload', async ({ page }) => {
  await page.goto('/customers/c1');
  await page.goto('/customers/c2');
  await expect(tabs(page)).toHaveCount(2);
  await page.reload();
  await expect(tab(page, 'customers/c1')).toBeVisible();
  await expect(tab(page, 'customers/c2')).toHaveAttribute('aria-selected', 'true');
});

test('B08 shortcut sheet, and shortcuts ignored in text fields', async ({ page }) => {
  await page.goto('/customers');
  await page.keyboard.press('Shift+Slash'); // "?"
  await expect(page.locator(S('shortcuts'))).toBeVisible();
  await expect(page.locator(`${S('shortcuts')}[role="dialog"]`)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator(S('shortcuts'))).toBeHidden();

  await openPalette(page);
  await page.locator('[data-shell-palette-input]').pressSequentially('jk?[');
  await expect(page.locator('[data-shell-palette-input]')).toHaveValue('jk?[');
  await expect(page.locator(S('shortcuts'))).toBeHidden();
  await expect(row(page, 'c1')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(S('sidebar'))).toBeVisible();
});

test('B09 [ toggles the sidebar', async ({ page }) => {
  await page.goto('/customers');
  await expect(page.locator(S('sidebar'))).toBeVisible();
  await page.keyboard.press('BracketLeft');
  await expect(page.locator(S('sidebar'))).toBeHidden();
  await page.keyboard.press('BracketLeft');
  await expect(page.locator(S('sidebar'))).toBeVisible();
});

test('B10 deep links open the record directly', async ({ page }) => {
  await page.goto('/projects/p2');
  await expect(page.locator(`${S('main')} h1`)).toContainText('Data Migration');
  await expect(page.locator(S('aside'))).toBeVisible();
  await expect(tab(page, 'projects/p2')).toHaveAttribute('aria-selected', 'true');
});

test('B11 create is optimistic and persists', async ({ page }) => {
  await page.goto('/customers');
  await delayWrites(page);
  await runPalette(page, 'Create Customer');
  const form = page.locator(S('create'));
  await expect(form).toBeVisible();
  await form.locator('[name="name"]').fill('Wayne Enterprises');
  await form.locator('[name="name"]').press('Enter');
  await expect(page.locator(S('main'))).toContainText('Wayne Enterprises', { timeout: 700 });
  await page.waitForTimeout(3000);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.goto('/customers');
  await expect(page.locator('[data-shell-list]')).toContainText('Wayne Enterprises');
});

test('B12 edit is optimistic and persists', async ({ page }) => {
  await page.goto('/customers/c3');
  await delayWrites(page);
  const input = page.locator(`${S('aside')} [data-shell-field="name"] input`);
  await input.fill('Initech Global');
  await input.press('Enter');
  await expect(page.locator(`${S('main')} h1`)).toContainText('Initech Global', { timeout: 700 });
  await page.waitForTimeout(3000);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.reload();
  await expect(page.locator(`${S('main')} h1`)).toContainText('Initech Global');
});

test('B13 lists are never tabs', async ({ page }) => {
  await page.goto('/customers/c1');
  await page.goto('/projects/p1');
  await expect(tabs(page)).toHaveCount(2);

  await page.locator('[data-shell-nav="customers"]').click();
  await expect(page).toHaveURL(/\/customers\/?$/);
  await expect(tabs(page)).toHaveCount(2);
  await expect(page.locator('[data-shell-tab][aria-selected="true"]')).toHaveCount(0);

  await runPalette(page, 'Projects');
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expect(tabs(page)).toHaveCount(2);
  await expect(page.locator('[data-shell-tab][aria-selected="true"]')).toHaveCount(0);
});

test('B14 the sidebar marks the shown entity and follows the active tab', async ({ page }) => {
  const nav = (entity: string) => page.locator(`[data-shell-nav="${entity}"]`);
  await page.goto('/customers');
  await expect(nav('customers')).toHaveAttribute('aria-current', 'page');
  await expect(nav('projects')).not.toHaveAttribute('aria-current', 'page');

  await page.goto('/customers/c1');
  await page.goto('/projects/p1');
  await expect(nav('projects')).toHaveAttribute('aria-current', 'page');
  await expect(nav('customers')).not.toHaveAttribute('aria-current', 'page');

  await tab(page, 'customers/c1').click();
  await expect(page).toHaveURL(/\/customers\/c1\/?$/);
  await expect(nav('customers')).toHaveAttribute('aria-current', 'page');
  await expect(nav('projects')).not.toHaveAttribute('aria-current', 'page');
});
