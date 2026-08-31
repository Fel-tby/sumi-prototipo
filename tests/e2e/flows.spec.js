import { test, expect, openPdi, openPls, detail, record, newPlan, fillItem } from './fixtures.js';

test('lista: filtros de tipo, busca, vazio, limpeza e navegação', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.plan-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'PDI', exact: true }).click();
  await expect(page.locator('.plan-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'PDI', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'PLS', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'PLS', exact: true })).toBeVisible();
  await page.getByLabel('Buscar planejamento', { exact: true }).fill('inexistente');
  await expect(page.getByRole('heading', { name: 'Nenhum planejamento encontrado' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page.locator('.plan-card')).toHaveCount(2);
  await page.getByLabel('Buscar planejamento', { exact: true }).fill('logistica');
  await expect(page.locator('.plan-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Abrir PLS 2025–2030', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'PLS 2025–2030', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Todos os planejamentos' }).click();
  await page.getByRole('link', { name: 'Conhecer os modelos' }).click();
  await expect(page.getByRole('heading', { name: 'Modelos de plano', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'SUMI início' }).click();
  await expect(page.getByRole('heading', { name: 'Planejamentos', exact: true })).toBeVisible();
});

test('PDI: árvore, objetivos, seleção, filtros combinados e retorno', async ({ page }) => {
  await openPdi(page);
  const nav = page.getByRole('navigation', { name: 'Itens do planejamento' });
  const axis = nav.getByRole('button', { name: '8 · Governança e Gestão Institucional', exact: true });
  await axis.click();
  await expect(nav.getByRole('link')).toHaveCount(0);
  await axis.click();
  await expect(nav.getByRole('link')).toHaveCount(3);
  const objective = nav.getByRole('button', { name: '8.1 · Aperfeiçoar Práticas de Governança Pública', exact: true });
  await objective.click();
  await expect(nav.getByRole('link')).toHaveCount(1);
  await objective.click();
  await nav.getByRole('link', { name: /Iniciativa 8.1.9/ }).click();
  await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Ampliar a participação em rankings universitários');
  await page.getByLabel('Buscar no plano', { exact: true }).fill('8.2.3');
  await expect(nav.getByRole('link')).toHaveCount(1);
  await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Estabelecer práticas sustentáveis na UFCG');
  await page.getByLabel('Filtrar execução', { exact: true }).selectOption('Concluída');
  await expect(page.getByRole('heading', { name: 'Nenhum item encontrado' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros do plano' }).click();
  await page.getByLabel('Filtrar responsável', { exact: true }).selectOption('SEPLAN');
  await expect(nav.getByRole('link')).toHaveCount(3);
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await nav.getByRole('link', { name: /Iniciativa 8.1.3/ }).click();
  await page.goBack();
  await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Ampliar a participação em rankings universitários');
});

test('PDI: concluir e reabrir tarefa, persistir e preservar indicador', async ({ page }) => {
  await openPdi(page);
  const checkbox = page.getByRole('checkbox', { name: 'Elaborar a minuta da portaria', exact: true });
  await checkbox.check();
  await expect(page.locator('.execution-summary strong')).toHaveText('30%');
  await page.reload();
  await expect(checkbox).toBeChecked();
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await expect(page.locator('.current-result strong')).toHaveText('20 %');
  await page.getByRole('tab', { name: 'Histórico' }).click();
  await expect(page.locator('.timeline')).toContainText('Concluída a tarefa: Elaborar a minuta da portaria.');
  await page.getByRole('tab', { name: 'Ações e tarefas' }).click();
  await checkbox.uncheck();
  await expect(page.locator('.execution-summary strong')).toHaveText('20%');
  await page.getByRole('tab', { name: 'Histórico' }).click();
  await expect(page.locator('.timeline')).toContainText('Reaberta a tarefa');
});

test('ações: recolher, expandir, adicionar tarefa, cancelar e rejeitar espaços', async ({ page }) => {
  await openPdi(page);
  const action = page.locator('.action-card').first();
  await action.getByRole('button', { name: /^01 Constituir a comissão/ }).click();
  await expect(action.getByRole('checkbox')).toHaveCount(0);
  await action.getByRole('button', { name: /^01 Constituir a comissão/ }).click();
  await action.getByRole('button', { name: /Adicionar tarefa/ }).click();
  await page.getByLabel('Nome da tarefa', { exact: true }).fill('Rascunho descartado');
  await action.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Rascunho descartado' })).toHaveCount(0);
  await action.getByRole('button', { name: /Adicionar tarefa/ }).click();
  await page.getByLabel('Nome da tarefa', { exact: true }).fill('   ');
  await action.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Informe o nome da tarefa');
  await page.getByLabel('Nome da tarefa', { exact: true }).fill('Verificar o ato publicado');
  await action.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Verificar o ato publicado', exact: true })).toBeVisible();
  await expect(page.locator('.execution-summary')).toContainText('2/11 tarefas');
});

test('PDI: metas futuras, valor zero, vazio e revisão com histórico', async ({ page }) => {
  await openPdi(page);
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await page.getByLabel('Ano de referência', { exact: true }).selectOption('2028');
  await expect(page.locator('.current-result')).toContainText('Sem meta definida');
  await page.getByRole('button', { name: 'Editar metas', exact: true }).click();
  await page.getByLabel('Meta de 2028', { exact: true }).fill('0');
  await page.getByLabel('Meta de 2026', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Salvar metas', exact: true }).click();
  await expect(page.locator('.annual-table tr').filter({ has: page.getByRole('rowheader', { name: '2028', exact: true }) })).toContainText('Sem medição');
  await record(page, 0, 'Ainda não houve execução.', 2028);
  await expect(page.locator('.current-result')).toContainText('Meta atingida');
  await page.getByRole('tab', { name: 'Histórico' }).click();
  await expect(page.locator('.timeline')).toContainText('Metas anuais atualizadas. Anterior: 2026: 80');
  await expect(page.locator('.timeline')).toContainText('Nova: 2026: —');
});

test('medição: validação, evidência segura, período selecionado e histórico preservado', async ({ page }) => {
  await openPdi(page);
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await page.getByRole('button', { name: 'Registrar resultado', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Valor (%)', { exact: true }).fill('101');
  await dialog.getByLabel('Justificativa / observação', { exact: true }).fill('Validar máximo.');
  await dialog.getByRole('button', { name: 'Salvar resultado', exact: true }).click();
  await expect(dialog).toBeVisible();
  expect(await dialog.getByLabel('Valor (%)', { exact: true }).evaluate((el) => el.validity.rangeOverflow)).toBe(true);
  await dialog.getByLabel('Valor (%)', { exact: true }).fill('85');
  await dialog.getByLabel('Link da evidência (opcional)', { exact: false }).fill('javascript:alert(1)');
  await dialog.getByRole('button', { name: 'Salvar resultado', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('https://');
  await dialog.getByLabel('Link da evidência (opcional)', { exact: false }).fill('https://example.org/relatorio');
  await dialog.getByRole('button', { name: 'Salvar resultado', exact: true }).click();
  await expect(page.locator('.current-result')).toContainText('Meta atingida');
  await expect(page.locator('.measurement')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Abrir referência da evidência' })).toHaveAttribute('rel', 'noreferrer');
  await record(page, 100, 'Elaboração concluída.', 2027);
  await expect(page.getByLabel('Ano de referência', { exact: true })).toHaveValue('2027');
  await expect(page.locator('.measurement')).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel('Ano de referência', { exact: true })).toHaveValue('2027');
  await page.getByLabel('Ano de referência', { exact: true }).selectOption('2026');
  await expect(page.locator('.measurement')).toHaveCount(2);
});

test('histórico: observação independente, cancelamento de edição e gravação', async ({ page }) => {
  await openPdi(page);
  await page.getByRole('button', { name: 'Editar informações', exact: true }).click();
  await page.getByLabel('Título', { exact: true }).fill('Título descartado');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(detail(page).getByRole('heading', { level: 2 })).not.toHaveText('Título descartado');
  await page.getByRole('button', { name: 'Editar informações', exact: true }).click();
  await page.getByLabel('Parceiros', { exact: true }).fill('SEPLAN e STI');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.locator('.item-meta')).toContainText('SEPLAN e STI');
  await page.getByRole('tab', { name: 'Histórico' }).click();
  await page.getByLabel('Adicionar observação', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Salvar observação', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Escreva uma observação');
  await page.getByLabel('Adicionar observação', { exact: true }).fill('Validar a composição na próxima reunião.');
  await page.getByRole('button', { name: 'Salvar observação', exact: true }).click();
  await page.reload();
  await expect(page.locator('.timeline')).toContainText('Validar a composição na próxima reunião.');
});

test('PLS: navegação por objetivo, responsáveis e indicador de redução', async ({ page }) => {
  await openPls(page);
  await expect(page.locator('.item-code')).toHaveText('COMPROMISSO 01');
  await record(page, 899, 'Redução obtida com a campanha.');
  await expect(page.locator('.current-result')).toContainText('Meta atingida');
  await expect(page.locator('.current-result strong')).toHaveText('899 resmas');
  await page.getByLabel('Filtrar responsável', { exact: true }).selectOption('Prefeituras');
  await expect(page.getByRole('navigation', { name: 'Itens do planejamento' }).getByRole('link')).toHaveCount(1);
  await expect(detail(page).getByRole('heading', { level: 2 })).toContainText('água');
  await record(page, 10.5, 'Consumo per capita consolidado.');
  await expect(page.locator('.current-result')).toContainText('Meta atingida');
  await expect(page.locator('.current-result strong')).toContainText('10,5');
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await page.getByRole('navigation', { name: 'Itens do planejamento' }).getByRole('link', { name: /Compromisso 01/ }).click();
  await page.getByRole('checkbox', { name: 'Preparar os materiais de divulgação', exact: true }).check();
  await expect(page.locator('.execution-summary')).toContainText('3/5 tarefas');
});

test('PDI e PLS: vínculo navegável sem cálculo implícito', async ({ page }) => {
  await openPdi(page);
  await page.getByRole('navigation', { name: 'Itens do planejamento' }).getByRole('link', { name: /Iniciativa 8.2.3/ }).click();
  await page.getByRole('link', { name: /Planejamento relacionado PLS/ }).click();
  await expect(page.getByRole('heading', { name: 'PLS 2025–2030', exact: true })).toBeVisible();
  await page.goBack();
  await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText('Estabelecer práticas sustentáveis na UFCG');
  await page.getByRole('tab', { name: 'Indicador e metas' }).click();
  await expect(page.locator('.current-result')).toContainText('Sem medição');
});

test('novo PDI: ciclo completo de criação de item, ação, tarefa e medição', async ({ page }) => {
  await newPlan(page);
  await page.getByRole('button', { name: 'Criar primeiro item', exact: true }).click();
  await fillItem(page);
  await page.getByRole('button', { name: 'Adicionar ao plano', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nenhuma ação cadastrada' })).toBeVisible();
  await page.getByRole('button', { name: 'Adicionar ação', exact: true }).click();
  await page.getByLabel('Nome da ação', { exact: true }).fill('Reunir informações dos setores');
  await page.getByLabel('Prazo', { exact: true }).fill('2026-10-30');
  await page.getByRole('button', { name: 'Adicionar ação', exact: true }).last().click();
  await expect(page.getByText('Esta ação ainda não possui tarefas.')).toBeVisible();
  await page.getByRole('button', { name: /Adicionar tarefa em Reunir/ }).click();
  await page.getByLabel('Nome da tarefa', { exact: true }).fill('Solicitar os relatórios');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Solicitar os relatórios', exact: true }).check();
  await expect(page.locator('.execution-summary strong')).toHaveText('100%');
  await expect(page.locator('.item-heading .badge')).toHaveText('Concluída');
  await record(page, 4, 'Quatro relatórios entregues.');
  await expect(page.locator('.current-result')).toContainText('Meta atingida');
  await page.reload();
  await expect(page.locator('.current-result strong')).toContainText('4 relatórios');
});

test('novo PLS: formulário próprio e preenchimento sem copiar conteúdo', async ({ page }) => {
  await newPlan(page, 'pls', 'Sustentabilidade do Centro', 'PLS-CT');
  await page.getByRole('button', { name: 'Adicionar compromisso', exact: true }).click();
  await fillItem(page, { title: 'Reduzir o consumo do centro', metric: 'Consumo anual', unit: 'm³' });
  await page.getByLabel('Melhor resultado', { exact: true }).selectOption('down');
  await page.getByLabel('Valor da meta', { exact: false }).fill('100');
  await page.getByRole('button', { name: 'Adicionar ao plano', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Itens do planejamento' }).getByRole('link')).toHaveCount(1);
  await expect(page.locator('.item-code')).toContainText('COMPROMISSO');
  await record(page, 90, 'Consumo reduzido.');
  await expect(page.locator('.current-result')).toContainText('Meta atingida');
});

test('formulários: vigência inválida, campos obrigatórios e código duplicado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Novo planejamento', exact: true }).click();
  await page.getByLabel('Nome do planejamento', { exact: true }).fill('Plano inválido');
  await page.getByLabel('Sigla', { exact: true }).fill('PI');
  await page.getByLabel('Ano final', { exact: true }).fill('2025');
  await page.getByRole('button', { name: 'Criar planejamento', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('vigência válida');
  await page.getByRole('button', { name: 'Fechar janela', exact: true }).click();
  await openPdi(page);
  await page.getByRole('button', { name: 'Adicionar iniciativa', exact: true }).click();
  await fillItem(page, { code: '8.1.3' });
  await page.getByRole('button', { name: 'Adicionar ao plano', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('código já existe');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Adicionar ação', exact: true }).click();
  await page.getByLabel('Nome da ação', { exact: true }).fill('Ação fora da vigência');
  await page.getByLabel('Prazo', { exact: true }).fill('2031-01-01');
  await page.getByRole('dialog').getByRole('button', { name: 'Adicionar ação', exact: true }).click();
  expect(await page.getByLabel('Prazo', { exact: true }).evaluate((el) => el.validity.rangeOverflow)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
