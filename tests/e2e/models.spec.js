import { test, expect, openPdi, detail, fillItem } from './fixtures.js';

test('modelo: personalizar nomes e quatro tipos de campo, criar plano e preencher', async ({ page }) => {
  await page.goto('/#/modelos');
  await page.getByRole('button', { name: 'Personalizar PDI', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Primeiro nível', { exact: true }).fill('Dimensão');
  await dialog.getByLabel('Segundo nível', { exact: true }).fill('Resultado esperado');
  await dialog.getByLabel('Item acompanhado', { exact: true }).fill('Entrega');
  const fields = [['Campus', 'select', 'Campina Grande, Patos'], ['Observação do setor', 'text'], ['Orçamento estimado', 'number'], ['Data de revisão', 'date']];
  for (let i = 0; i < fields.length; i++) {
    await dialog.getByRole('button', { name: 'Adicionar campo', exact: true }).click();
    await dialog.getByLabel(`Nome do campo ${i + 1}`, { exact: true }).fill(fields[i][0]);
    await dialog.getByLabel(`Tipo do campo ${i + 1}`, { exact: true }).selectOption(fields[i][1]);
    if (fields[i][2]) await dialog.getByLabel(`Opções do campo ${i + 1}`, { exact: true }).fill(fields[i][2]);
  }
  await dialog.getByRole('button', { name: 'Salvar modelo', exact: true }).click();
  await expect(page.locator('.model-card').first()).toContainText('Versão 2');
  await expect(page.locator('.model-card').first()).toContainText('Dimensão');
  await page.getByRole('button', { name: 'Usar modelo PDI', exact: true }).click();
  await page.getByLabel('Nome do planejamento', { exact: true }).fill('Plano de Entregas');
  await page.getByLabel('Sigla', { exact: true }).fill('PE');
  await page.getByRole('button', { name: 'Criar planejamento', exact: true }).click();
  await page.getByRole('button', { name: 'Adicionar entrega', exact: true }).click();
  await fillItem(page);
  await page.getByLabel('Campus', { exact: true }).selectOption('Patos');
  await page.getByLabel('Observação do setor', { exact: true }).fill('Integração entre setores.');
  await page.getByLabel('Orçamento estimado', { exact: true }).fill('1500.50');
  await page.getByLabel('Data de revisão', { exact: true }).fill('2026-10-15');
  await page.getByRole('button', { name: 'Adicionar ao plano', exact: true }).click();
  await expect(page.locator('.item-code')).toContainText('ENTREGA');
  await expect(page.locator('.extra-values')).toContainText('Campus: Patos');
  await expect(page.locator('.extra-values')).toContainText('15/10/2026');
  await page.getByRole('button', { name: 'Editar informações', exact: true }).click();
  await expect(page.getByLabel('Campus', { exact: true })).toHaveValue('Patos');
  await page.getByLabel('Campus', { exact: true }).selectOption('Campina Grande');
  await page.getByLabel('Orçamento estimado', { exact: true }).fill('0');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.reload();
  await expect(page.locator('.extra-values')).toContainText('Campus: Campina Grande');
  await expect(page.locator('.extra-values')).toContainText('Orçamento estimado: 0');
  await openPdi(page);
  await expect(page.locator('.tree-foot')).toHaveText('Modelo PDI · versão 1');
  await expect(page.getByRole('button', { name: 'Adicionar iniciativa', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar informações', exact: true }).click();
  await expect(page.getByLabel('Campus', { exact: true })).toHaveCount(0);
});

test('modelo: opções inválidas, nomes repetidos, remoção de campo e cancelamento', async ({ page }) => {
  await page.goto('/#/modelos');
  await page.getByRole('button', { name: 'Personalizar PLS', exact: true }).click();
  await page.getByRole('button', { name: 'Adicionar campo', exact: true }).click();
  await page.getByLabel('Nome do campo 1', { exact: true }).fill('Campus');
  await page.getByLabel('Tipo do campo 1', { exact: true }).selectOption('select');
  await page.getByLabel('Opções do campo 1', { exact: true }).fill('Patos, Patos');
  await page.getByRole('button', { name: 'Salvar modelo', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('duas opções diferentes');
  await page.getByLabel('Opções do campo 1', { exact: true }).fill('Patos, Cajazeiras');
  await page.getByRole('button', { name: 'Adicionar campo', exact: true }).click();
  await page.getByLabel('Nome do campo 2', { exact: true }).fill('campus');
  await page.getByRole('button', { name: 'Salvar modelo', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('nomes preenchidos e diferentes');
  await page.getByRole('button', { name: 'Remover campo 2', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar modelo', exact: true }).click();
  await expect(page.locator('.model-card').last()).toContainText('Campus');
  await page.getByRole('button', { name: 'Personalizar PLS', exact: true }).click();
  await page.getByRole('button', { name: 'Remover campo 1', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.locator('.model-card').last()).toContainText('Campus');
  await page.getByRole('button', { name: 'Personalizar PLS', exact: true }).click();
  await page.getByRole('button', { name: 'Remover campo 1', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar modelo', exact: true }).click();
  await expect(page.locator('.model-card').last()).toContainText('Nenhum campo adicional');
  await page.getByRole('button', { name: 'Usar modelo PLS', exact: true }).click();
  await expect(page.getByLabel('Modelo', { exact: true })).toHaveValue('pls');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
});

test('restauração: cancelar preserva mudanças, confirmar repõe os dois exemplos', async ({ page }) => {
  await openPdi(page);
  await page.getByRole('checkbox', { name: 'Elaborar a minuta da portaria', exact: true }).check();
  await page.getByRole('button', { name: 'Restaurar demonstração', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.locator('.execution-summary strong')).toHaveText('30%');
  await page.getByRole('button', { name: 'Restaurar demonstração', exact: true }).click();
  await page.getByRole('button', { name: 'Restaurar exemplos', exact: true }).click();
  await expect(page.locator('.plan-card')).toHaveCount(2);
  await page.reload();
  await page.getByRole('link', { name: 'Abrir PDI 2026–2030', exact: true }).click();
  await expect(page.locator('.execution-summary strong')).toHaveText('20%');
});

test('rota inválida e dados locais corrompidos têm recuperação', async ({ page }) => {
  await page.goto('/#/plano/inexistente');
  await expect(page.getByRole('heading', { name: 'Planejamento não encontrado' })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar aos planejamentos', exact: true }).click();
  await expect(page.locator('.plan-card')).toHaveCount(2);
  await page.evaluate(() => localStorage.setItem('sumi.prototipo.v1', '{invalido'));
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Os exemplos foram restaurados');
  await page.getByRole('button', { name: 'Dispensar', exact: true }).click();
  await expect(page.locator('.warning-strip')).toHaveCount(0);
  await page.goto('/#/plano/pdi?item=inexistente&tab=invalida&year=9999');
  await expect(detail(page).getByRole('heading', { level: 2 })).toContainText('Gestão de Riscos');
  await expect(page.getByRole('tab', { name: 'Ações e etapas' })).toHaveAttribute('aria-selected', 'true');
});

test('armazenamento indisponível mantém a sessão funcional com aviso', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Indisponível', 'QuotaExceededError'); }; });
  await openPdi(page);
  await expect(page.getByRole('alert')).toContainText('não permitiu salvar');
  await page.getByRole('checkbox', { name: 'Elaborar a minuta da portaria', exact: true }).check();
  await expect(page.locator('.execution-summary strong')).toHaveText('30%');
});

test('teclado: foco do modal, Escape, retorno de foco e setas nas abas', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Novo planejamento', exact: true });
  await trigger.click();
  await expect(page.getByLabel('Nome do planejamento', { exact: true })).toBeFocused();
  const last = page.getByRole('button', { name: 'Criar planejamento', exact: true });
  await last.focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement.closest('dialog')))).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await openPdi(page);
  await page.getByRole('tab', { name: 'Ações e etapas' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Indicador e metas' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Histórico' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Indicador e metas' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Ações e etapas' })).toHaveAttribute('aria-selected', 'true');
});

test('cancelamentos de resultado e metas não alteram valores', async ({ page }) => {
  await openPdi(page);
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await page.getByRole('button', { name: 'Editar metas', exact: true }).click();
  await page.getByLabel('Meta de 2026', { exact: true }).fill('10');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Registrar resultado', exact: true }).click();
  await page.getByLabel('Valor (%)', { exact: true }).fill('100');
  await page.keyboard.press('Escape');
  await expect(page.locator('.current-result strong')).toHaveText('20 %');
  await expect(page.locator('.annual-table tbody tr').first()).toContainText('80');
  await expect(page.locator('.measurement')).toHaveCount(1);
});
