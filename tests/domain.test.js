import assert from 'node:assert/strict';
import test from 'node:test';
import { initialState } from '../src/data.js';
import { createPlan, executionStatus, latestMeasurement, metricAchievement, metricStatus, metricTone, normalize, restoreState, riskLevel, riskLevelLabel, taskProgress, validateRange, years } from '../src/domain.js';

test('os dois planos possuem estruturas e exemplos distintos', () => {
  const state = initialState();
  assert.equal(state.plans[0].template.labels.item, 'Iniciativa');
  assert.equal(state.plans[1].template.labels.item, 'Compromisso');
  assert.equal(state.plans[0].items.length, 3);
  assert.equal(state.plans[1].items.length, 2);
  assert.equal(state.plans[0].items[2].linkedPlan, 'pls');
});
test('etapas não alteram o resultado do indicador', () => {
  const item = initialState().plans[0].items[0];
  assert.deepEqual(taskProgress(item), { done: 2, total: 10, percent: 20 });
  item.actions[0].tasks[2].done = true;
  assert.equal(taskProgress(item).percent, 30);
  assert.equal(latestMeasurement(item, 2026).value, 20);
});
test('execução cobre os três estados e ação sem etapas', () => {
  const item = { actions: [] };
  assert.equal(executionStatus(item), 'Não iniciada');
  item.actions = [{ tasks: [{ done: false }, { done: false }] }];
  assert.equal(executionStatus(item), 'Não iniciada');
  item.actions[0].tasks[0].done = true;
  assert.equal(executionStatus(item), 'Em andamento');
  item.actions[0].tasks[1].done = true;
  assert.equal(executionStatus(item), 'Concluída');
});
test('meta zero, meta ausente, sem medição e sentido de melhoria', () => {
  const item = initialState().plans[0].items[0];
  assert.equal(metricStatus(item, 2028), 'Sem meta definida');
  assert.equal(metricStatus(item, 2027), 'Sem medição');
  assert.equal(metricStatus(item, 2026), 'Meta não atingida');
  item.metric.targets[2026] = 0;
  item.measurements.push({ year: 2026, value: 0 });
  assert.equal(metricStatus(item, 2026), 'Meta atingida');
  const paper = initialState().plans[1].items[0];
  paper.measurements.push({ year: 2026, value: 900 });
  assert.equal(metricStatus(paper, 2026), 'Meta atingida');
  paper.measurements.push({ year: 2026, value: 901 });
  assert.equal(metricStatus(paper, 2026), 'Meta não atingida');
});
test('metas e matriz produzem classificações visuais', () => {
  const state = initialState();
  const pdi = state.plans[0].items[0];
  assert.equal(metricAchievement(pdi, 2026), 25);
  assert.equal(metricTone(pdi, 2026), 'critical');
  const paper = state.plans[1].items[0];
  assert.equal(metricAchievement(paper, 2026), 94);
  assert.equal(metricTone(paper, 2026), 'attention');
  assert.equal(riskLevel(4, 4), 'critical');
  assert.equal(riskLevel(2, 2), 'moderate');
  assert.equal(riskLevelLabel(riskLevel(3, 5)), 'Crítico');
});
test('vigência limita períodos invertidos, fracionários e excessivos', () => {
  assert.equal(validateRange(2026, 2030), true);
  for (const [start, end] of [[2026, 2025], [2026.5, 2030], [2019, 2026], [2026, 2101], [2026, 2040]]) assert.equal(validateRange(start, end), false);
  assert.deepEqual(years({ start: 2026, end: 2028 }), [2026, 2027, 2028]);
});
test('novos planos copiam os modelos e não os exemplos', () => {
  const template = initialState().templates[1];
  const plan = createPlan(template, { name: ' Plano local ', shortName: ' PLS ', start: 2027, end: 2030 });
  assert.equal(plan.items.length, 0);
  assert.equal(plan.name, 'Plano local');
  template.labels.item = 'Entrega';
  assert.equal(plan.template.labels.item, 'Compromisso');
  assert.throws(() => createPlan(template, { name: ' ', shortName: 'X', start: 2026, end: 2030 }));
});
test('dados locais válidos sobrevivem e inválidos são restaurados', () => {
  const state = initialState();
  assert.equal(restoreState(JSON.stringify(state), initialState).recovered, false);
  for (const raw of ['{', '{}', 'null', '{"version":2}', JSON.stringify({ ...state, plans: [{}] })]) assert.equal(restoreState(raw, initialState).recovered, true);
  assert.equal(restoreState(null, initialState).recovered, false);
});
test('cada restauração é independente e a busca ignora acentos', () => {
  const a = initialState();
  a.plans[0].items.pop();
  assert.equal(initialState().plans[0].items.length, 3);
  assert.equal(normalize('Água e AÇÕES'), 'agua e acoes');
});
