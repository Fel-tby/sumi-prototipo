import { test, expect, openPdi, openPls } from './fixtures.js';

const useSession = async (page, name) => page.context().addCookies([{ name: 'sumi_dev_session', value: name, domain: '127.0.0.1', path: '/' }]);

test('consulta pública mantém somente leitura publicada', async ({ page }) => {
  await useSession(page, 'public');
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Novo planejamento' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Modelos de plano' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Abrir PDI 2026–2030', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Editar informações' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Adicionar ação' })).toHaveCount(0);
  await expect(page.getByRole('checkbox').first()).toBeDisabled();
  await expect(page.getByRole('tab', { name: /Riscos/ })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Histórico' })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await expect(page.getByRole('button', { name: 'Registrar resultado' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Editar metas' })).toHaveCount(0);
});

test('concessões de um plano não liberam alterações em outro', async ({ page }) => {
  await useSession(page, 'axis_contributor');
  await openPdi(page);
  await expect(page.getByRole('button', { name: 'Editar informações' })).toBeVisible();
  await expect(page.getByRole('checkbox').first()).toBeEnabled();
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await expect(page.getByRole('button', { name: 'Registrar resultado' })).toBeVisible();

  await openPls(page);
  await expect(page.getByRole('button', { name: 'Editar informações' })).toHaveCount(0);
  await expect(page.getByRole('checkbox').first()).toBeDisabled();
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await expect(page.getByRole('button', { name: 'Registrar resultado' })).toHaveCount(0);
});

test('papel informativo não concede ações sem grants correspondentes', async ({ page }) => {
  await useSession(page, 'axis_reviewer');
  await openPdi(page);
  await expect(page.getByRole('tab', { name: 'Histórico' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Editar informações' })).toHaveCount(0);
  await expect(page.getByRole('checkbox').first()).toBeDisabled();
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await expect(page.getByRole('button', { name: 'Registrar resultado' })).toHaveCount(0);
});

test('infraestrutura de autorização não cria telas ou controles de simulação', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Simular perfil', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Perfis e acessos' })).toHaveCount(0);
  await expect(page.getByText('Sem backend', { exact: true })).toHaveCount(0);
});
