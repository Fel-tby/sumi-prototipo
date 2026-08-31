import React, { useState } from 'react';
import { Button, Field, FormEnd, Icon, Modal } from './ui.jsx';
import { createPlan, historyEntry, normalize, uid, years } from './domain.js';

export function PlanForm({ templates, initialTemplate = 'pdi', onClose, onSave }) {
  const [templateId, setTemplateId] = useState(initialTemplate);
  const [error, setError] = useState('');
  const template = templates.find((t) => t.id === templateId);
  function submit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try { onSave(createPlan(template, { name: fields.name, shortName: fields.shortName, start: Number(fields.start), end: Number(fields.end) })); }
    catch (e) { setError(e.message); }
  }
  return <Modal title="Novo planejamento" subtitle="Comece com um modelo e preencha o seu plano." onClose={onClose}>
    <form onSubmit={submit}>
      <div className="form-body">
        <Field label="Modelo"><select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>{templates.map((t) => <option key={t.id} value={t.id}>{t.type} · {t.name}</option>)}</select></Field>
        <div className="structure-preview">{[template.labels.axis, template.labels.objective, template.labels.item, 'Ação', 'Tarefa'].map((name, i) => <React.Fragment key={i}>{i > 0 && <Icon name="chevron" size={12} />}<span>{name}</span></React.Fragment>)}</div>
        <Field label="Nome do planejamento"><input autoFocus name="name" required maxLength={120} placeholder="Ex.: Planejamento do Centro de Tecnologia" /></Field>
        <div className="form-grid three"><Field label="Sigla"><input name="shortName" maxLength={12} required placeholder="Ex.: PCT" /></Field><Field label="Ano inicial"><input name="start" type="number" min="2020" max="2100" defaultValue="2026" required /></Field><Field label="Ano final"><input name="end" type="number" min="2020" max="2100" defaultValue="2030" required /></Field></div>
        <p className="hint">O planejamento será criado sem conteúdo. Os campos do modelo estarão disponíveis em cada {template.labels.item.toLowerCase()}.</p>
      </div><FormEnd onClose={onClose} submit="Criar planejamento" error={error} />
    </form>
  </Modal>;
}

export function TemplateForm({ template, onClose, onSave }) {
  const [fields, setFields] = useState(structuredClone(template.fields));
  const [error, setError] = useState('');
  const updateField = (id, key, value) => setFields(fields.map((f) => f.id === id ? { ...f, [key]: value } : f));
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const labels = { axis: values.axis.trim(), objective: values.objective.trim(), item: values.item.trim() };
    if (Object.values(labels).some((v) => !v)) return setError('Preencha os nomes dos níveis.');
    const prepared = fields.map((f) => ({ ...f, label: f.label.trim(), options: f.type === 'select' ? [...new Set(f.options.split(',').map((v) => v.trim()).filter(Boolean))].join(', ') : '' }));
    const names = prepared.map((f) => normalize(f.label));
    if (names.some((name) => !name) || new Set(names).size !== names.length) return setError('Use nomes preenchidos e diferentes para os campos adicionais.');
    if (prepared.some((f) => f.type === 'select' && f.options.split(',').filter((v) => v.trim()).length < 2)) return setError('Informe pelo menos duas opções diferentes para cada campo de seleção.');
    onSave({ ...template, labels, fields: prepared, version: template.version + 1 });
  }
  return <Modal title={`Personalizar modelo ${template.type}`} subtitle="As alterações valem para novos planejamentos." onClose={onClose} wide>
    <form onSubmit={submit}><div className="form-body">
      <h3>Nomes apresentados na navegação</h3><div className="form-grid three">
        <Field label="Primeiro nível"><input name="axis" required defaultValue={template.labels.axis} maxLength={32} /></Field>
        <Field label="Segundo nível"><input name="objective" required defaultValue={template.labels.objective} maxLength={32} /></Field>
        <Field label="Item acompanhado"><input name="item" required defaultValue={template.labels.item} maxLength={32} /></Field>
      </div>
      <div className="section-heading"><h3>Campos adicionais</h3><Button icon="plus" onClick={() => setFields([...fields, { id: uid(), label: '', type: 'text', options: '' }])}>Adicionar campo</Button></div>
      {!fields.length && <p className="hint">Os campos de identificação, responsáveis e indicadores já fazem parte do modelo.</p>}
      {fields.map((f, i) => <div className="custom-field" key={f.id}>
        <div className="form-grid"><Field label={`Nome do campo ${i + 1}`}><input value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)} maxLength={50} required /></Field><Field label={`Tipo do campo ${i + 1}`}><select value={f.type} onChange={(e) => updateField(f.id, 'type', e.target.value)}><option value="text">Texto</option><option value="number">Número</option><option value="date">Data</option><option value="select">Seleção</option></select></Field></div>
        {f.type === 'select' && <Field label={`Opções do campo ${i + 1}`} help="Separe as opções por vírgulas."><input value={f.options} onChange={(e) => updateField(f.id, 'options', e.target.value)} placeholder="Campina Grande, Cajazeiras, Patos" required /></Field>}
        <button type="button" className="text-button danger" onClick={() => setFields(fields.filter((field) => field.id !== f.id))}>Remover campo {i + 1}</button>
      </div>)}
    </div><FormEnd onClose={onClose} submit="Salvar modelo" error={error} /></form>
  </Modal>;
}

function ExtraFields({ fields, item }) {
  return fields.map((f) => <Field key={f.id} label={f.label}>{f.type === 'select' ? <select name={`extra-${f.id}`} defaultValue={item?.extras?.[f.id] || ''}><option value="">Selecione</option>{f.options.split(',').map((o) => <option key={o.trim()} value={o.trim()}>{o.trim()}</option>)}</select> : <input name={`extra-${f.id}`} type={f.type} step={f.type === 'number' ? 'any' : undefined} maxLength={f.type === 'text' ? 200 : undefined} defaultValue={item?.extras?.[f.id] ?? ''} />}</Field>);
}

export function ItemForm({ plan, item, onClose, onSave }) {
  const [error, setError] = useState('');
  const label = plan.template.labels;
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (['title', 'owner', 'axis', 'objective', 'code'].some((key) => !values[key].trim())) return setError('Preencha os campos obrigatórios com conteúdo.');
    if (plan.items.some((i) => i.id !== item?.id && normalize(i.code) === normalize(values.code.trim()))) return setError('Este código já existe neste planejamento.');
    const extras = Object.fromEntries(plan.template.fields.map((f) => [f.id, values[`extra-${f.id}`] || '']));
    const details = { title: values.title.trim(), owner: values.owner.trim(), axis: values.axis.trim(), objective: values.objective.trim(), code: values.code.trim(), description: values.description.trim(), partners: values.partners.trim(), extras };
    if (item) return onSave({ ...item, ...details, history: [...item.history, historyEntry('Informações do item atualizadas.')] });
    if (!values.metric.trim() || !values.unit.trim()) return setError('Informe o indicador e sua unidade.');
    const metricTargets = Object.fromEntries(years(plan).map((y) => [y, null]));
    metricTargets[values.targetYear] = values.target === '' ? null : Number(values.target);
    onSave({ ...details, id: uid(), metric: { name: values.metric.trim(), unit: values.unit.trim(), baseline: values.baseline === '' ? null : Number(values.baseline), reference: 'Referência informada no protótipo', direction: values.direction, targets: metricTargets, formula: 'Valor informado no acompanhamento anual' }, actions: [], measurements: [], history: [historyEntry('Item criado no planejamento.')], source: 'Conteúdo criado localmente na demonstração.' });
  }
  return <Modal title={item ? 'Editar informações' : `Adicionar ${label.item.toLowerCase()}`} onClose={onClose} wide>
    <form onSubmit={submit}><div className="form-body">
      <div className="form-grid"><Field label={label.axis}><input name="axis" list="existing-axes" required maxLength={160} defaultValue={item?.axis || plan.items[0]?.axis || ''} /></Field><Field label={label.objective}><input name="objective" list="existing-objectives" required maxLength={160} defaultValue={item?.objective || ''} /></Field></div>
      <datalist id="existing-axes">{[...new Set(plan.items.map((i) => i.axis))].map((a) => <option key={a} value={a} />)}</datalist><datalist id="existing-objectives">{[...new Set(plan.items.map((i) => i.objective))].map((o) => <option key={o} value={o} />)}</datalist>
      <div className="form-grid code-title"><Field label="Código"><input name="code" required maxLength={24} defaultValue={item?.code || ''} placeholder="Ex.: 1.1.1" /></Field><Field label="Título"><input name="title" required maxLength={180} defaultValue={item?.title || ''} /></Field></div>
      <Field label="Descrição"><textarea name="description" rows="2" maxLength={2000} defaultValue={item?.description || ''} /></Field>
      <div className="form-grid"><Field label="Unidade responsável"><input name="owner" required maxLength={80} defaultValue={item?.owner || ''} placeholder="Ex.: SEPLAN" /></Field><Field label="Parceiros"><input name="partners" maxLength={150} defaultValue={item?.partners || ''} /></Field></div>
      <ExtraFields fields={plan.template.fields} item={item} />
      {!item && <><div className="section-divider" /><h3>Indicador e meta inicial</h3><Field label="Nome do indicador"><input name="metric" required maxLength={160} /></Field>
        <div className="form-grid three"><Field label="Unidade"><input name="unit" required maxLength={24} placeholder="%, relatórios, m³…" /></Field><Field label="Melhor resultado"><select name="direction"><option value="up">Quanto maior, melhor</option><option value="down">Quanto menor, melhor</option></select></Field><Field label="Linha de base"><input name="baseline" type="number" step="any" min="0" /></Field></div>
        <div className="form-grid"><Field label="Ano da meta"><select name="targetYear" defaultValue={Math.max(plan.start, Math.min(2026, plan.end))}>{years(plan).map((y) => <option key={y}>{y}</option>)}</select></Field><Field label="Valor da meta" help="Deixe vazio quando ainda não houver uma meta definida."><input name="target" type="number" step="any" min="0" /></Field></div></>}
    </div><FormEnd onClose={onClose} submit={item ? 'Salvar alterações' : 'Adicionar ao plano'} error={error} /></form>
  </Modal>;
}

export function ActionForm({ plan, item, onClose, onSave }) {
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!values.title.trim() || !values.owner.trim()) return setError('Informe a ação e a unidade responsável.');
    onSave({ id: uid(), title: values.title.trim(), owner: values.owner.trim(), deadline: values.deadline, tasks: [] });
  }
  return <Modal title="Adicionar ação" onClose={onClose}><form onSubmit={submit}><div className="form-body"><Field label="Nome da ação"><input name="title" required maxLength={180} autoFocus /></Field><Field label="Unidade responsável"><input name="owner" required defaultValue={item.owner} maxLength={80} /></Field><Field label="Prazo"><input name="deadline" type="date" min={`${plan.start}-01-01`} max={`${plan.end}-12-31`} required /></Field></div><FormEnd onClose={onClose} submit="Adicionar ação" error={error} /></form></Modal>;
}

export function MeasurementForm({ plan, item, year, onClose, onSave }) {
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!values.note.trim()) return setError('Descreva o resultado registrado.');
    if (values.evidence) {
      try { if (!['https:', 'http:'].includes(new URL(values.evidence).protocol)) throw new Error(); }
      catch { return setError('Use um endereço de evidência iniciado por https:// ou http://.'); }
    }
    onSave({ id: uid(), year: Number(values.year), value: Number(values.value), note: values.note.trim(), evidence: values.evidence.trim(), at: new Date().toISOString() });
  }
  return <Modal title="Registrar resultado" subtitle={item.metric.name} onClose={onClose}><form onSubmit={submit}><div className="form-body">
    <div className="form-grid"><Field label="Ano do resultado"><select name="year" defaultValue={year}>{years(plan).map((y) => <option key={y}>{y}</option>)}</select></Field><Field label={`Valor (${item.metric.unit})`}><input autoFocus name="value" type="number" min="0" max={item.metric.unit === '%' ? 100 : undefined} step="any" required /></Field></div>
    <Field label="Justificativa / observação"><textarea name="note" rows="3" required maxLength={2000} placeholder="Descreva o resultado e o contexto da medição." /></Field>
    <Field label="Link da evidência (opcional)" help="Somente a referência é salva; nenhum arquivo é enviado."><input name="evidence" type="url" maxLength={2000} placeholder="https://…" /></Field>
    <p className="hint">Consolidado anual. Um novo registro atualiza o valor exibido e preserva as medições anteriores no histórico.</p>
  </div><FormEnd onClose={onClose} submit="Salvar resultado" error={error} /></form></Modal>;
}

export function TargetsForm({ plan, item, onClose, onSave }) {
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    onSave(Object.fromEntries(years(plan).map((year) => [year, values[year] === '' ? null : Number(values[year])])));
  }
  return <Modal title="Editar metas anuais" subtitle={`${item.metric.name} · ${item.metric.unit}`} onClose={onClose}><form onSubmit={submit}><div className="form-body">
    <p className="hint">Campo vazio significa sem meta definida; zero é uma meta de valor zero. Alterações são registradas no histórico local.</p>
    <div className="form-grid three">{years(plan).map((year) => <Field key={year} label={`Meta de ${year}`}><input name={year} type="number" min="0" max={item.metric.unit === '%' ? 100 : undefined} step="any" defaultValue={item.metric.targets[year] ?? ''} /></Field>)}</div>
  </div><FormEnd onClose={onClose} submit="Salvar metas" /></form></Modal>;
}
