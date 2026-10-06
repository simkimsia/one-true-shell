import { test, expect, Page } from '@playwright/test';
import { Entity, Field, id, loadShellData, title } from './shell-data';

// One True Shell conformance suite, spec v0.3.0.
// Test titles start with the behavior ID from SPEC.md section 5.
// Records come from the implementation's own schema/ (SPEC.md section 2): A is the first entity, B the second.

const { A, B } = loadShellData();

const S = (name: string) => `[data-shell="${name}"]`;
const REGIONS = ['rail', 'sidebar', 'tabs', 'main', 'aside', 'statusbar'];

const listUrl = (e: Entity) => new RegExp(`/${e.key}/?$`);
const recordUrl = (e: Entity, i: number) => new RegExp(`/${e.key}/${id(e, i)}/?$`);
const tabId = (e: Entity, i: number) => `${e.key}/${id(e, i)}`;

const row = (page: Page, rid: string) => page.locator(`[data-shell-row][data-id="${rid}"]`);
const selectedRow = (page: Page) => page.locator('[data-shell-row][aria-selected="true"]');
const tabs = (page: Page) => page.locator('[data-shell-tab]');
const tab = (page: Page, tid: string) => page.locator(`[data-shell-tab][data-id="${tid}"]`);
const h1 = (page: Page) => page.locator(`${S('main')} h1`);

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

// Fill a create-form control by field name: selects get selectOption, everything else fill.
async function fillField(form: ReturnType<Page['locator']>, name: string, field: Field, value: string) {
  const control = form.locator(`[name="${name}"]`);
  if (field.type === 'enum' || field.type === 'ref') await control.selectOption(value);
  else await control.fill(value);
}

test('L01 six regions are present', async ({ page }) => {
  for (const url of ['/', `/${A.key}`]) {
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
  await page.goto(`/${A.key}`);
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
  await expect(page.locator(S('palette'))).toContainText(A.plural);
  await expect(page.locator(S('palette'))).toContainText(B.plural);
  await page.locator('[data-shell-palette-input]').fill(B.plural);
  await expect(page.locator(S('palette'))).not.toContainText(A.plural);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(listUrl(B));
  await expect(row(page, id(B, 0))).toBeVisible();
});

test('B03 sidebar navigates to an entity list', async ({ page }) => {
  await page.goto('/');
  await page.locator(`[data-shell-nav="${A.key}"]`).click();
  await expect(page).toHaveURL(listUrl(A));
  await expect(page.locator('[data-shell-list]')).toBeVisible();
  await expect(row(page, id(A, 0))).toContainText(title(A, 0));
  await expect(row(page, id(A, 1))).toContainText(title(A, 1));
});

test('B04 j/k move the selection', async ({ page }) => {
  await page.goto(`/${A.key}`);
  await expect(selectedRow(page)).toHaveCount(1);
  await expect(row(page, id(A, 0))).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('j');
  await expect(row(page, id(A, 1))).toHaveAttribute('aria-selected', 'true');
  await expect(selectedRow(page)).toHaveCount(1);
  await page.keyboard.press('k');
  await expect(row(page, id(A, 0))).toHaveAttribute('aria-selected', 'true');
});

test('B05 Enter opens a record, Escape returns to the list', async ({ page }) => {
  await page.goto(`/${A.key}`);
  await page.keyboard.press('j');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(recordUrl(A, 1));
  await expect(h1(page)).toContainText(title(A, 1));
  await expect(page.locator(S('aside'))).toBeVisible();
  await expect(page.locator(`${S('aside')} [data-shell-field="${A.titleField}"]`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(listUrl(A));
  await expect(row(page, id(A, 1))).toHaveAttribute('aria-selected', 'true');
});

test('B06 tabs open, switch and close', async ({ page }) => {
  await page.goto(`/${A.key}`);
  await page.keyboard.press('Enter'); // first record
  await expect(tab(page, tabId(A, 0))).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await page.keyboard.press('j');
  await page.keyboard.press('Enter'); // second record
  await expect(tabs(page)).toHaveCount(2);
  await expect(tab(page, tabId(A, 1))).toHaveAttribute('aria-selected', 'true');
  await expect(tab(page, tabId(A, 0))).not.toHaveAttribute('aria-selected', 'true');

  await tab(page, tabId(A, 0)).click();
  await expect(page).toHaveURL(recordUrl(A, 0));
  await expect(h1(page)).toContainText(title(A, 0));

  // Re-opening an open record activates it rather than duplicating it.
  await page.goto(`/${A.key}`);
  await page.keyboard.press('Enter');
  await expect(tabs(page)).toHaveCount(2);

  await tab(page, tabId(A, 0)).locator('[data-shell-tab-close]').click();
  await expect(tabs(page)).toHaveCount(1);
  await expect(page).not.toHaveURL(recordUrl(A, 0));
});

test('B07 tabs are restored after reload', async ({ page }) => {
  await page.goto(`/${tabId(A, 0)}`);
  await page.goto(`/${tabId(A, 1)}`);
  await expect(tabs(page)).toHaveCount(2);
  await page.reload();
  await expect(tab(page, tabId(A, 0))).toBeVisible();
  await expect(tab(page, tabId(A, 1))).toHaveAttribute('aria-selected', 'true');
});

test('B08 shortcut sheet, and shortcuts ignored in text fields', async ({ page }) => {
  await page.goto(`/${A.key}`);
  await page.keyboard.press('Shift+Slash'); // "?"
  await expect(page.locator(S('shortcuts'))).toBeVisible();
  await expect(page.locator(`${S('shortcuts')}[role="dialog"]`)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator(S('shortcuts'))).toBeHidden();

  await openPalette(page);
  await page.locator('[data-shell-palette-input]').pressSequentially('jk?[');
  await expect(page.locator('[data-shell-palette-input]')).toHaveValue('jk?[');
  await expect(page.locator(S('shortcuts'))).toBeHidden();
  await expect(row(page, id(A, 0))).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(S('sidebar'))).toBeVisible();
});

test('B09 [ toggles the sidebar', async ({ page }) => {
  await page.goto(`/${A.key}`);
  await expect(page.locator(S('sidebar'))).toBeVisible();
  await page.keyboard.press('BracketLeft');
  await expect(page.locator(S('sidebar'))).toBeHidden();
  await page.keyboard.press('BracketLeft');
  await expect(page.locator(S('sidebar'))).toBeVisible();
});

test('B10 deep links open the record directly', async ({ page }) => {
  await page.goto(`/${tabId(B, 1)}`);
  await expect(h1(page)).toContainText(title(B, 1));
  await expect(page.locator(S('aside'))).toBeVisible();
  await expect(tab(page, tabId(B, 1))).toHaveAttribute('aria-selected', 'true');
});

test('B11 create is optimistic and persists', async ({ page }) => {
  const created = 'Conformance Check Record';
  await page.goto(`/${A.key}`);
  await delayWrites(page);
  await runPalette(page, `Create ${A.label}`);
  const form = page.locator(S('create'));
  await expect(form).toBeVisible();
  // Required fields other than the title take the first seed record's values.
  for (const [name, field] of Object.entries(A.fields)) {
    if (field.required && name !== A.titleField) await fillField(form, name, field, A.seed[0][name]);
  }
  await form.locator(`[name="${A.titleField}"]`).fill(created);
  await form.locator(`[name="${A.titleField}"]`).press('Enter');
  await expect(page.locator(S('main'))).toContainText(created, { timeout: 700 });
  await page.waitForTimeout(3000);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.goto(`/${A.key}`);
  await expect(page.locator('[data-shell-list]')).toContainText(created);
});

test('B12 edit is optimistic and persists', async ({ page }) => {
  const edited = `${title(A, 2)} Edited`;
  await page.goto(`/${tabId(A, 2)}`);
  await delayWrites(page);
  const input = page.locator(`${S('aside')} [data-shell-field="${A.titleField}"] input`);
  await input.fill(edited);
  await input.press('Enter');
  await expect(h1(page)).toContainText(edited, { timeout: 700 });
  await page.waitForTimeout(3000);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.reload();
  await expect(h1(page)).toContainText(edited);
});

test('B13 lists are never tabs', async ({ page }) => {
  await page.goto(`/${tabId(A, 0)}`);
  await page.goto(`/${tabId(B, 0)}`);
  await expect(tabs(page)).toHaveCount(2);

  await page.locator(`[data-shell-nav="${A.key}"]`).click();
  await expect(page).toHaveURL(listUrl(A));
  await expect(tabs(page)).toHaveCount(2);
  await expect(page.locator('[data-shell-tab][aria-selected="true"]')).toHaveCount(0);

  await runPalette(page, B.plural);
  await expect(page).toHaveURL(listUrl(B));
  await expect(tabs(page)).toHaveCount(2);
  await expect(page.locator('[data-shell-tab][aria-selected="true"]')).toHaveCount(0);
});

test('B14 the sidebar marks the shown entity and follows the active tab', async ({ page }) => {
  const nav = (e: Entity) => page.locator(`[data-shell-nav="${e.key}"]`);
  await page.goto(`/${A.key}`);
  await expect(nav(A)).toHaveAttribute('aria-current', 'page');
  await expect(nav(B)).not.toHaveAttribute('aria-current', 'page');

  await page.goto(`/${tabId(A, 0)}`);
  await page.goto(`/${tabId(B, 0)}`);
  await expect(nav(B)).toHaveAttribute('aria-current', 'page');
  await expect(nav(A)).not.toHaveAttribute('aria-current', 'page');

  await tab(page, tabId(A, 0)).click();
  await expect(page).toHaveURL(recordUrl(A, 0));
  await expect(nav(A)).toHaveAttribute('aria-current', 'page');
  await expect(nav(B)).not.toHaveAttribute('aria-current', 'page');
});
