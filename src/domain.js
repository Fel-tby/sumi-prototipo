export const STORAGE_KEY = 'sumi.prototipo.v1';
export const uid = () => crypto.randomUUID();
export const years = (plan) => Array.from({ length: plan.end - plan.start + 1 }, (_, i) => plan.start + i);
export const normalize = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const formatNumber = (value) => value == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
export const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value));
export const taskProgress = (item) => {
  const tasks = item.actions.flatMap((action) => action.tasks);
  const done = tasks.filter((task) => task.done).length;
  return { total: tasks.length, done, percent: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
};
export const executionStatus = (item) => {
  const { total, done } = taskProgress(item);
  return !total || !done ? 'Não iniciada' : done === total ? 'Concluída' : 'Em andamento';
};
export const latestMeasurement = (item, year) => item.measurements.filter((entry) => entry.year === Number(year)).at(-1);
export const metricStatus = (item, year) => {
  const target = item.metric.targets[year];
  const measurement = latestMeasurement(item, year);
  if (target == null) return 'Sem meta definida';
  if (!measurement) return 'Sem medição';
  const reached = item.metric.direction === 'down' ? measurement.value <= target : measurement.value >= target;
  return reached ? 'Meta atingida' : 'Meta não atingida';
};
export const metricAchievement = (item, year) => {
  const target = item.metric.targets[year];
  const measurement = latestMeasurement(item, year);
  if (target == null || !measurement || (target === 0 && item.metric.direction === 'down')) return null;
  const percent = item.metric.direction === 'down' ? target / measurement.value * 100 : measurement.value / target * 100;
  return percent == null ? null : Math.round(Math.min(percent, 100));
};
export const metricTone = (item, year) => {
  const achievement = metricAchievement(item, year);
  if (achievement == null) return 'neutral';
  return achievement >= 75 ? 'green' : achievement > 25 ? 'attention' : 'critical';
};
export const riskScore = (probability, impact) => probability * impact;
export const riskLevelFromScore = (score) => {
  return score <= 3 ? 'low' : score <= 6 ? 'moderate' : score <= 12 ? 'high' : 'critical';
};
export const riskLevel = (probability, impact) => riskLevelFromScore(riskScore(probability, impact));
export const riskLevelLabel = (level) => ({ low: 'Baixo', moderate: 'Moderado', high: 'Alto', critical: 'Crítico' })[level];
export const controlFactor = (maturity) => ({ Inexistente: 1, Fraco: 0.8, Mediano: 0.6, Satisfatório: 0.4, Forte: 0.2 })[maturity] ?? 1;
export const residualRisk = (probability, impact, maturity) => riskScore(probability, impact) * controlFactor(maturity);
export function validateRange(start, end) {
  return Number.isInteger(start) && Number.isInteger(end) && start >= 2020 && end <= 2100 && end >= start && end - start <= 10;
}
export function createPlan(template, values) {
  if (!values.name.trim() || !values.shortName.trim() || !validateRange(values.start, values.end)) throw new Error('Informe nome, sigla e uma vigência válida de até 11 anos.');
  return { ...values, id: uid(), name: values.name.trim(), shortName: values.shortName.trim(), template: structuredClone(template), type: template.type, items: [], created: true };
}
export const historyEntry = (text) => ({ id: uid(), at: new Date().toISOString(), text, actor: 'Participante da demonstração' });
export function restoreState(raw, fallback) {
  if (!raw) return { data: fallback(), recovered: false };
  try {
    const value = JSON.parse(raw);
    const validTemplate = (t) => t && ['PDI', 'PLS'].includes(t.type) && t.labels?.item && Array.isArray(t.fields);
    if (value.version !== 1 || !Array.isArray(value.plans) || !value.plans.every((p) => p.id && validateRange(p.start, p.end) && validTemplate(p.template) && Array.isArray(p.items) && p.items.every((i) => i.metric?.targets && Array.isArray(i.actions) && i.actions.every((a) => Array.isArray(a.tasks)) && Array.isArray(i.measurements) && Array.isArray(i.history))) || !Array.isArray(value.templates) || !value.templates.every(validTemplate)) throw new Error();
    return { data: value, recovered: false };
  } catch { return { data: fallback(), recovered: true }; }
}
