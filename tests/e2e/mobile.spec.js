import { test, expect, openPls, record } from './fixtures.js';

test('layout e fluxo de acompanhamento funcionam em tela estreita', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await openPls(page);
  await page.getByRole('checkbox', { name: 'Preparar os materiais de divulgação', exact: true }).check();
  await record(page, 880, 'Registro realizado na visualização móvel.');
  await expect(page.locator('.current-result')).toContainText('Meta atingida');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Modelos de plano', exact: true }).click();
  await page.getByRole('button', { name: 'Personalizar PLS', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const box = await page.getByRole('dialog').boundingBox();
  const width = page.viewportSize().width;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width);
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
});
