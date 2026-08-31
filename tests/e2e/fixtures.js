import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    const remote = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => { if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:4317/')) remote.push(request.url()); });
    await use(page);
    expect(errors, 'Erros JavaScript no navegador').toEqual([]);
    expect(remote, 'A aplicação deve funcionar sem requisições externas').toEqual([]);
  },
});
export { expect };
export const openPdi = async (page) => { await page.goto('/'); await page.getByRole('link', { name: 'Abrir PDI 2026–2030', exact: true }).click(); };
export const openPls = async (page) => { await page.goto('/'); await page.getByRole('link', { name: 'Abrir PLS 2025–2030', exact: true }).click(); };
export const detail = (page) => page.getByRole('region', { name: 'Detalhe do item' });
export async function record(page, value, note, year) {
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await page.getByRole('button', { name: 'Registrar resultado', exact: true }).click();
  const dialog = page.getByRole('dialog');
  if (year) await dialog.getByLabel('Ano do resultado', { exact: true }).selectOption(String(year));
  await dialog.getByLabel(/^Valor \(/).fill(String(value));
  await dialog.getByLabel('Justificativa / observação', { exact: true }).fill(note);
  await dialog.getByRole('button', { name: 'Salvar resultado', exact: true }).click();
  await expect(dialog).not.toBeVisible();
}
export async function newPlan(page, type = 'pdi', name = 'Plano do Centro', shortName = 'PCT') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Novo planejamento', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Modelo', { exact: true }).selectOption(type);
  await dialog.getByLabel('Nome do planejamento', { exact: true }).fill(name);
  await dialog.getByLabel('Sigla', { exact: true }).fill(shortName);
  await dialog.getByRole('button', { name: 'Criar planejamento', exact: true }).click();
  await expect(page.getByRole('heading', { name: `Adicione o primeiro item do ${shortName}` })).toBeVisible();
}
export async function fillItem(page, overrides = {}) {
  const dialog = page.getByRole('dialog');
  const values = { axis: '1 · Desenvolvimento', objective: '1.1 · Qualificar o acompanhamento', code: '1.1.1', title: 'Consolidar os relatórios do setor', owner: 'SEPLAN', metric: 'Relatórios entregues', unit: 'relatórios', ...overrides };
  await dialog.locator('[name="axis"]').fill(values.axis);
  await dialog.locator('[name="objective"]').fill(values.objective);
  await dialog.getByLabel('Código', { exact: true }).fill(values.code);
  await dialog.getByLabel('Título', { exact: true }).fill(values.title);
  await dialog.getByLabel('Descrição', { exact: true }).fill('Acompanhamento demonstrativo do setor.');
  await dialog.getByLabel('Unidade responsável', { exact: true }).fill(values.owner);
  await dialog.getByLabel('Nome do indicador', { exact: true }).fill(values.metric);
  await dialog.getByLabel('Unidade', { exact: true }).fill(values.unit);
  await dialog.getByLabel('Linha de base', { exact: true }).fill('0');
  await dialog.getByLabel('Valor da meta', { exact: false }).fill('4');
}
