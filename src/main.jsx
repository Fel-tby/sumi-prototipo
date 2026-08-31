import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initialState } from './data.js';
import { executionStatus, formatDate, formatNumber, historyEntry, latestMeasurement, metricStatus, normalize, restoreState, STORAGE_KEY, taskProgress, uid, years } from './domain.js';
import { Badge, Button, Empty, Field, Icon, Modal } from './ui.jsx';
import { ActionForm, ItemForm, MeasurementForm, PlanForm, TargetsForm, TemplateForm } from './forms.jsx';
import './styles.css';

const planUrl = (id, item, tab = 'acoes', year) => `/plano/${id}${item ? `?item=${item}&tab=${tab}${year ? `&year=${year}` : ''}` : ''}`;
const navigate = (path) => { window.location.hash = path; };
function readRoute() {
  const [path, query] = (window.location.hash.slice(1) || '/planejamentos').split('?');
  return { path, query: new URLSearchParams(query) };
}
const statusTone = (status) => status === 'Concluída' || status === 'Meta atingida' ? 'green' : status === 'Em andamento' ? 'blue' : 'neutral';
function Progress({ done, total, compact = false }) {
  return <div className={`progress-block ${compact ? 'compact' : ''}`}><div className="progress-track" role="progressbar" aria-label="Execução das tarefas" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={done}><span style={{ width: `${total ? done / total * 100 : 0}%` }} /></div><span>{done}/{total} tarefas</span></div>;
}

function App() {
  const [initial] = useState(() => { try { return restoreState(localStorage.getItem(STORAGE_KEY), initialState); } catch { return { data: initialState(), unavailable: true }; } });
  const [data, setData] = useState(initial.data);
  const [storageError, setStorageError] = useState(initial.unavailable || false);
  const [route, setRoute] = useState(readRoute);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [notice, setNotice] = useState(initial.recovered ? 'Os dados locais não puderam ser lidos. Os exemplos foram restaurados.' : '');
  useEffect(() => { const changed = () => { setRoute(readRoute()); setModal(null); }; window.addEventListener('hashchange', changed); return () => window.removeEventListener('hashchange', changed); }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setStorageError(false); } catch { setStorageError(true); } }, [data]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); }, [toast]);
  const update = (mutate, message) => { setData((current) => { const next = structuredClone(current); mutate(next); return next; }); if (message) setToast(message); };
  const changeItem = (planId, itemId, change, message) => update((draft) => { const plan = draft.plans.find((p) => p.id === planId); const index = plan.items.findIndex((i) => i.id === itemId); plan.items[index] = change(plan.items[index]); }, message);
  const close = () => setModal(null);
  const id = route.path.startsWith('/plano/') ? route.path.split('/')[2] : null;
  const plan = data.plans.find((p) => p.id === id);
  useEffect(() => { document.title = `SUMI · ${plan?.shortName || (route.path === '/modelos' ? 'Modelos' : 'Planejamentos')}`; }, [plan?.shortName, route.path]);
  function created(newPlan) { update((draft) => draft.plans.push(newPlan), 'Planejamento criado.'); close(); navigate(planUrl(newPlan.id)); }
  function savedItem(nextItem, planId) {
    update((draft) => { const p = draft.plans.find((p) => p.id === planId); const index = p.items.findIndex((i) => i.id === nextItem.id); if (index < 0) p.items.push(nextItem); else p.items[index] = nextItem; }, 'Informações salvas.');
    close(); navigate(planUrl(planId, nextItem.id));
  }
  return <div className="app-shell">
    <a href="#main-content" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main-content').focus(); }}>Pular para o conteúdo</a>
    <aside className="sidebar">
      <a className="brand" href="#/planejamentos" aria-label="SUMI início"><span className="brand-mark"><i /><i /><i /></span><span>sumi<span className="brand-dot">.</span><small>UFCG</small></span></a>
      <div className="workspace-label">PLANEJAMENTO INSTITUCIONAL</div>
      <nav aria-label="Navegação principal"><a className={route.path !== '/modelos' ? 'active' : ''} href="#/planejamentos"><Icon name="grid" />Planejamentos</a><a className={route.path === '/modelos' ? 'active' : ''} href="#/modelos"><Icon name="layers" />Modelos de plano</a></nav>
      <div className="sidebar-bottom"><div className="local-status"><span />Ambiente local</div><button className="reset-button" onClick={() => setModal({ type: 'reset' })}><Icon name="history" size={15} />Restaurar demonstração</button><div className="institution">Universidade Federal<br />de Campina Grande</div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumb"><span>SUMI</span><Icon name="chevron" size={13} /><a href="#/planejamentos">Planejamentos</a>{plan && <><Icon name="chevron" size={13} /><strong>{plan.shortName}</strong></>}{route.path === '/modelos' && <><Icon name="chevron" size={13} /><strong>Modelos</strong></>}</div><span className="prototype-tag">PROTÓTIPO LOCAL</span></header>
      <div className="demo-strip"><Icon name="info" size={14} /><span>Dados demonstrativos · Conteúdo adaptado do PDI e do PLS da UFCG</span><span className="save-status">{storageError ? 'Somente nesta sessão' : 'Alterações salvas neste navegador'}</span></div>
      {storageError && <div role="alert" className="warning-strip">O navegador não permitiu salvar os dados. As alterações serão perdidas ao fechar ou recarregar.</div>}
      {notice && <div role="status" className="warning-strip">{notice}<button type="button" onClick={() => setNotice('')}>Dispensar</button></div>}
      <main id="main-content" tabIndex={-1}>
        {route.path === '/planejamentos' ? <PlanList data={data} onCreate={() => setModal({ type: 'plan' })} /> : route.path === '/modelos' ? <Models templates={data.templates} onEdit={(template) => setModal({ type: 'template', template })} onUse={(template) => setModal({ type: 'plan', templateId: template.id })} /> : plan ? <PlanPage key={plan.id} plan={plan} route={route} onModal={setModal} changeItem={changeItem} /> : <Empty title="Planejamento não encontrado" action={<Button onClick={() => navigate('/planejamentos')}>Voltar aos planejamentos</Button>}>Escolha um planejamento disponível para continuar.</Empty>}
      </main>
    </div>
    {toast && <div role="status" className="toast"><Icon name="check" size={17} />{toast}</div>}
    {modal?.type === 'plan' && <PlanForm templates={data.templates} initialTemplate={modal.templateId} onClose={close} onSave={created} />}
    {modal?.type === 'template' && <TemplateForm template={modal.template} onClose={close} onSave={(template) => { update((draft) => { draft.templates = draft.templates.map((t) => t.id === template.id ? template : t); }, 'Modelo salvo para novos planejamentos.'); close(); }} />}
    {modal?.type === 'item' && <ItemForm plan={plan} item={modal.item} onClose={close} onSave={(item) => savedItem(item, plan.id)} />}
    {modal?.type === 'action' && <ActionForm plan={plan} item={modal.item} onClose={close} onSave={(action) => { changeItem(plan.id, modal.item.id, (item) => ({ ...item, actions: [...item.actions, action], history: [...item.history, historyEntry(`Ação adicionada: ${action.title}.`)] }), 'Ação adicionada.'); close(); }} />}
    {modal?.type === 'measurement' && <MeasurementForm plan={plan} item={modal.item} year={modal.year} onClose={close} onSave={(entry) => { changeItem(plan.id, modal.item.id, (item) => ({ ...item, measurements: [...item.measurements, entry], history: [...item.history, historyEntry(`Resultado de ${entry.year}: ${formatNumber(entry.value)} ${item.metric.unit}. ${entry.note}`)] }), 'Resultado registrado.'); close(); navigate(planUrl(plan.id, modal.item.id, 'indicadores', entry.year)); }} />}
    {modal?.type === 'targets' && <TargetsForm plan={plan} item={modal.item} onClose={close} onSave={(targets) => { changeItem(plan.id, modal.item.id, (item) => ({ ...item, metric: { ...item.metric, targets }, history: [...item.history, historyEntry(`Metas anuais atualizadas. Anterior: ${Object.entries(item.metric.targets).map(([y, v]) => `${y}: ${formatNumber(v)}`).join('; ')}. Nova: ${Object.entries(targets).map(([y, v]) => `${y}: ${formatNumber(v)}`).join('; ')}.`)] }), 'Metas salvas.'); close(); }} />}
    {modal?.type === 'reset' && <Modal title="Restaurar demonstração?" onClose={close}><div className="form-body"><p>Os planejamentos e modelos voltarão aos exemplos iniciais. Registros, alterações e planos criados neste navegador serão removidos.</p><p className="hint">Nenhum arquivo ou repositório será alterado.</p></div><div className="form-end"><Button onClick={close}>Cancelar</Button><Button variant="danger-primary" onClick={() => { setData(initialState()); close(); navigate('/planejamentos'); setToast('Exemplos restaurados.'); }}>Restaurar exemplos</Button></div></Modal>}
  </div>;
}

function PlanList({ data, onCreate }) {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const filtered = data.plans.filter((p) => (filter === 'Todos' || p.type === filter) && normalize(`${p.shortName} ${p.name}`).includes(normalize(search)));
  const items = data.plans.flatMap((p) => p.items);
  return <div className="page">
    <div className="page-heading"><div><p className="eyebrow">VISÃO GERAL</p><h1>Planejamentos</h1><p>Acompanhe os planos, as ações e os resultados da instituição.</p></div><Button icon="plus" variant="primary" onClick={onCreate}>Novo planejamento</Button></div>
    <div className="summary-row"><div><strong>{data.plans.length.toString().padStart(2, '0')}</strong><span>planejamentos</span></div><div><strong>{items.length.toString().padStart(2, '0')}</strong><span>itens acompanhados</span></div><div><strong>{items.reduce((sum, i) => sum + i.actions.length, 0).toString().padStart(2, '0')}</strong><span>ações no recorte</span></div><div className="summary-note"><Icon name="calendar" /><span>Ciclos institucionais<br /><b>{data.plans.length ? `${Math.min(...data.plans.map((p) => p.start))} — ${Math.max(...data.plans.map((p) => p.end))}` : '—'}</b></span></div></div>
    <div className="list-toolbar"><div className="segmented" aria-label="Filtrar tipo de planejamento">{['Todos', 'PDI', 'PLS'].map((f) => <button key={f} aria-pressed={filter === f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div><label className="search"><Icon name="search" size={17} /><input aria-label="Buscar planejamento" placeholder="Buscar planejamento…" value={search} onChange={(e) => setSearch(e.target.value)} /></label></div>
    {filtered.length ? <div className="plan-grid">{filtered.map((p) => {
      const tasks = p.items.flatMap((i) => i.actions.flatMap((a) => a.tasks));
      return <article className={`plan-card ${p.type.toLowerCase()}`} key={p.id}>
        <div className="plan-card-header">
          <div className="plan-identity"><span className="plan-icon"><Icon name={p.type === 'PDI' ? 'book' : 'leaf'} size={22} /></span><div className="plan-card-title"><h2>{p.shortName}</h2><span>{p.start}–{p.end}</span></div></div>
          <span className="plan-state">{p.created ? 'Rascunho local' : 'Em acompanhamento'}</span>
        </div>
        <p className="plan-full-name">{p.name}</p>
        <div className="plan-card-progress"><Progress done={tasks.filter((t) => t.done).length} total={tasks.length} /></div>
        <div className="plan-card-footer">
          <div className="card-facts"><span>{p.items.length} {p.template.labels.item.toLowerCase()}{p.items.length !== 1 ? 's' : ''}</span><span>{p.items.reduce((s, i) => s + i.actions.length, 0)} ações</span></div>
          <a className="open-plan" href={`#${planUrl(p.id)}`} aria-label={`Abrir ${p.shortName} ${p.start}–${p.end}`}>Abrir planejamento<Icon name="arrow" size={15} /></a>
        </div>
      </article>;
    })}</div> : <Empty title="Nenhum planejamento encontrado" action={<Button onClick={() => { setFilter('Todos'); setSearch(''); }}>Limpar filtros</Button>}>Tente outro nome ou tipo de planejamento.</Empty>}
    <div className="bottom-note"><Icon name="layers" size={17} /><p>Uma estrutura para cada demanda.<br /><span>Modelos prontos para começar, campos ajustáveis para o seu planejamento.</span></p><a href="#/modelos">Conhecer os modelos <Icon name="arrow" size={15} /></a></div>
  </div>;
}

function Models({ templates, onEdit, onUse }) {
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">ESTRUTURA DO PLANEJAMENTO</p><h1>Modelos de plano</h1><p>Comece com uma estrutura pronta. Adapte os nomes e os campos quando precisar.</p></div></div><div className="models-grid">{templates.map((template) => <article className="model-card" key={template.id}><div className="section-heading"><Badge tone={template.type === 'PDI' ? 'blue' : 'green'}>{template.type}</Badge><span className="muted text-sm">Versão {template.version}</span></div><h2>{template.name}</h2><p>{template.description}</p><div className="model-tree">{[template.labels.axis, template.labels.objective, template.labels.item, 'Ação', 'Tarefa'].map((label, i) => <div key={i} style={{ marginLeft: i * 20 }}><Icon name={i === 4 ? 'check' : 'layers'} size={14} />{label}{i === 2 && <span>Indicador + metas</span>}</div>)}</div><div className="model-fields"><small>CAMPOS ADICIONAIS</small>{template.fields.length ? <div className="flex flex-wrap gap-2">{template.fields.map((f) => <Badge key={f.id}>{f.label}</Badge>)}</div> : <p>Nenhum campo adicional</p>}</div><div className="model-buttons"><Button icon="edit" onClick={() => onEdit(template)}>Personalizar {template.type}</Button><Button variant="primary" onClick={() => onUse(template)}>Usar modelo {template.type}<Icon name="arrow" size={15} /></Button></div></article>)}</div><p className="hint mt-6">Cada planejamento mantém a versão do modelo usada na sua criação. Alterar um modelo não modifica os planos existentes.</p></div>;
}

function PlanPage({ plan, route, onModal, changeItem }) {
  const [search, setSearch] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState('');
  const [collapsed, setCollapsed] = useState([]);
  const requestedYear = Number(route.query.get('year'));
  const year = years(plan).includes(requestedYear) ? requestedYear : Math.max(plan.start, Math.min(2026, plan.end));
  const filtered = plan.items.filter((i) => normalize(`${i.code} ${i.title} ${i.objective} ${i.axis}`).includes(normalize(search)) && (!owner || i.owner === owner) && (!status || executionStatus(i) === status));
  const item = filtered.find((i) => i.id === route.query.get('item')) || filtered[0];
  const tab = ['acoes', 'indicadores', 'historico'].includes(route.query.get('tab')) ? route.query.get('tab') : 'acoes';
  const setYear = (nextYear) => navigate(planUrl(plan.id, item.id, tab, nextYear));
  const toggleGroup = (key) => setCollapsed((current) => current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
  const resetFilters = () => { setSearch(''); setOwner(''); setStatus(''); };
  const groups = [...new Set(filtered.map((i) => i.axis))];
  return <div className="plan-page">
    <div className="plan-page-heading"><div><a className="back-link" href="#/planejamentos">← Todos os planejamentos</a><div className="title-line"><h1>{plan.shortName} <span>{plan.start}–{plan.end}</span></h1><Badge tone={plan.type === 'PDI' ? 'blue' : 'green'}>Modelo {plan.type}</Badge></div><p>{plan.name}</p></div><Button variant="primary" icon="plus" onClick={() => onModal({ type: 'item' })}>Adicionar {plan.template.labels.item.toLowerCase()}</Button></div>
    <div className="explorer">
      <aside className="plan-tree" aria-label="Estrutura do plano"><div className="tree-heading"><h2>Estrutura do plano</h2><span>{plan.items.length} itens</span></div><label className="search"><Icon name="search" size={15} /><input aria-label="Buscar no plano" placeholder="Buscar no plano…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <div className="tree-filters"><select aria-label="Filtrar responsável" value={owner} onChange={(e) => setOwner(e.target.value)}><option value="">Todos os responsáveis</option>{[...new Set(plan.items.map((i) => i.owner))].map((o) => <option key={o}>{o}</option>)}</select><select aria-label="Filtrar execução" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Toda a execução</option>{['Não iniciada', 'Em andamento', 'Concluída'].map((s) => <option key={s}>{s}</option>)}</select></div>
        {(search || owner || status) && <button className="text-button clear-filter" onClick={resetFilters}>Limpar filtros</button>}
        <nav aria-label="Itens do planejamento" className="tree-content">{groups.map((axis) => <div key={axis} className="axis-group"><button className="tree-group axis" aria-expanded={!collapsed.includes(axis)} onClick={() => toggleGroup(axis)}><Icon name="chevron" size={13} className={!collapsed.includes(axis) ? 'rotated' : ''} /><span>{axis}</span></button>{!collapsed.includes(axis) && [...new Set(filtered.filter((i) => i.axis === axis).map((i) => i.objective))].map((objective) => { const key = `${axis}|${objective}`; return <div className="objective-group" key={objective}><button className="tree-group objective" aria-expanded={!collapsed.includes(key)} onClick={() => toggleGroup(key)}><Icon name="chevron" size={12} className={!collapsed.includes(key) ? 'rotated' : ''} /><span>{objective}</span></button>{!collapsed.includes(key) && filtered.filter((i) => i.axis === axis && i.objective === objective).map((i) => <a key={i.id} href={`#${planUrl(plan.id, i.id)}`} className={`tree-item ${item?.id === i.id ? 'selected' : ''}`} aria-current={item?.id === i.id ? 'page' : undefined}><span className="node-dot" /><span><small>{plan.template.labels.item} {i.code}</small>{i.title}</span></a>)}</div>; })}</div>)}{!filtered.length && <p className="tree-no-results">{plan.items.length ? 'Nenhum item corresponde aos filtros.' : 'A estrutura aparecerá após adicionar o primeiro item.'}</p>}</nav>
        <div className="tree-foot"><Icon name="layers" size={14} />Modelo {plan.type} · versão {plan.template.version}</div>
      </aside>
      <section className="detail-pane" aria-label="Detalhe do item">{item ? <>
        <div className="item-heading"><div className="section-heading"><div className="flex items-center gap-3"><span className="item-code">{plan.template.labels.item.toUpperCase()} {item.code}</span><Badge tone={statusTone(executionStatus(item))}>{executionStatus(item)}</Badge></div><Button icon="edit" variant="ghost" onClick={() => onModal({ type: 'item', item })}>Editar informações</Button></div><h2>{item.title}</h2><p>{item.description}</p><div className="item-meta"><span><Icon name="user" size={15} /><strong>{item.owner}</strong></span>{item.partners && <span>Parceiros: {item.partners}</span>}</div>{Object.entries(item.extras).some(([, v]) => v !== '') && <div className="extra-values">{plan.template.fields.filter((f) => item.extras[f.id] !== '' && item.extras[f.id] != null).map((f) => <span key={f.id}><b>{f.label}:</b> {f.type === 'date' ? formatDate(item.extras[f.id]) : item.extras[f.id]}</span>)}</div>}
          {item.linkedPlan && <a className="related-plan" href={`#${planUrl(item.linkedPlan)}`}><Icon name="link" size={16} /><span>Planejamento relacionado <strong>PLS 2025–2030</strong></span><Icon name="arrow" size={17} /></a>}
        </div>
        <div className="detail-tabs" role="tablist" aria-label="Seções do item">{[['acoes', 'list', 'Ações e tarefas'], ['indicadores', 'chart', 'Indicador e metas'], ['historico', 'history', 'Histórico']].map(([value, icon, label], index) => <button id={`tab-${value}`} role="tab" key={value} tabIndex={tab === value ? 0 : -1} aria-selected={tab === value} aria-controls="item-panel" className={tab === value ? 'active' : ''} onKeyDown={(e) => { const ids = ['acoes', 'indicadores', 'historico']; const next = e.key === 'ArrowRight' ? (index + 1) % 3 : e.key === 'ArrowLeft' ? (index + 2) % 3 : e.key === 'Home' ? 0 : e.key === 'End' ? 2 : null; if (next !== null) { e.preventDefault(); document.getElementById(`tab-${ids[next]}`).focus(); navigate(planUrl(plan.id, item.id, ids[next], year)); } }} onClick={() => navigate(planUrl(plan.id, item.id, value, year))}><Icon name={icon} size={16} />{label}</button>)}</div>
        <div id="item-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="tab-content">
          {tab === 'acoes' && <Actions key={item.id} item={item} onAdd={() => onModal({ type: 'action', item })} onChange={(change, message) => changeItem(plan.id, item.id, change, message)} />}
          {tab === 'indicadores' && <Indicators item={item} plan={plan} year={year} setYear={setYear} onRecord={() => onModal({ type: 'measurement', item, year })} onTargets={() => onModal({ type: 'targets', item })} />}
          {tab === 'historico' && <History key={item.id} item={item} onComment={(text) => changeItem(plan.id, item.id, (current) => ({ ...current, history: [...current.history, historyEntry(text)] }), 'Observação adicionada.')} />}
        </div><footer className="source-note"><Icon name="info" size={13} />{item.source}</footer>
</> : <Empty title={plan.items.length ? 'Nenhum item encontrado' : `Adicione o primeiro item do ${plan.shortName}`} action={plan.items.length ? <Button onClick={resetFilters}>Limpar filtros do plano</Button> : <Button variant="primary" icon="plus" onClick={() => onModal({ type: 'item' })}>Criar primeiro item</Button>}>{plan.items.length ? 'Ajuste a busca ou os filtros para continuar.' : `O modelo já está pronto. Cadastre o primeiro item para começar o acompanhamento.`}</Empty>}</section>
    </div>
  </div>;
}

function Actions({ item, onAdd, onChange }) {
  const [collapsed, setCollapsed] = useState([]);
  const [adding, setAdding] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [error, setError] = useState('');
  const progress = taskProgress(item);
  function submitTask(event, actionId) {
    event.preventDefault();
    if (!taskName.trim()) return setError('Informe o nome da tarefa.');
    onChange((current) => ({ ...current, actions: current.actions.map((a) => a.id === actionId ? { ...a, tasks: [...a.tasks, { id: uid(), title: taskName.trim(), done: false }] } : a), history: [...current.history, historyEntry(`Tarefa adicionada: ${taskName.trim()}.`)] }), 'Tarefa adicionada.');
    setAdding(null); setTaskName(''); setError('');
  }
  return <><div className="execution-summary"><div><span className="metric-label">EXECUÇÃO DAS TAREFAS</span><strong>{progress.total ? `${progress.percent}%` : '—'}</strong></div><div><Progress {...progress} /><small>Conclusão das tarefas, independente do indicador.</small></div></div>
    <div className="section-heading actions-heading"><h3>Ações estratégicas <span>{item.actions.length}</span></h3><Button icon="plus" onClick={onAdd}>Adicionar ação</Button></div>
    {!item.actions.length && <Empty title="Nenhuma ação cadastrada">Adicione uma ação e organize as tarefas necessárias para realizá-la.</Empty>}
    <div className="actions-list">{item.actions.map((action, index) => { const done = action.tasks.filter((t) => t.done).length; const isClosed = collapsed.includes(action.id); return <article className="action-card" key={action.id}>
      <button className="action-heading" aria-expanded={!isClosed} onClick={() => setCollapsed((current) => current.includes(action.id) ? current.filter((id) => id !== action.id) : [...current, action.id])}><span className="action-number">{String(index + 1).padStart(2, '0')}</span><span className="action-name">{action.title}<small>{action.owner} <span>·</span> Prazo: {formatDate(action.deadline)}</small></span><span className="task-count">{done}/{action.tasks.length}</span><Icon name="chevron" size={14} className={!isClosed ? 'rotated' : ''} /></button>
      {!isClosed && <div className="action-body">{action.tasks.map((task) => <label key={task.id} className={`task-row ${task.done ? 'done' : ''}`}><input type="checkbox" aria-label={task.title} checked={task.done} onChange={() => onChange((current) => ({ ...current, actions: current.actions.map((a) => a.id === action.id ? { ...a, tasks: a.tasks.map((t) => t.id === task.id ? { ...t, done: !t.done } : t) } : a), history: [...current.history, historyEntry(`${task.done ? 'Reaberta' : 'Concluída'} a tarefa: ${task.title}.`)] }), task.done ? 'Tarefa reaberta.' : 'Tarefa concluída.')} /><span>{task.title}</span>{task.done && <small aria-hidden="true">Concluída</small>}</label>)}
        {!action.tasks.length && <p className="hint px-5 pt-3">Esta ação ainda não possui tarefas.</p>}
        {adding === action.id ? <form className="inline-task-form" onSubmit={(e) => submitTask(e, action.id)}><input aria-label="Nome da tarefa" autoFocus required maxLength={180} placeholder="Descreva a tarefa…" value={taskName} onChange={(e) => setTaskName(e.target.value)} /><Button type="submit" variant="primary">Adicionar</Button><Button onClick={() => { setAdding(null); setTaskName(''); setError(''); }}>Cancelar</Button>{error && <p role="alert" className="form-error">{error}</p>}</form> : <button className="add-task" onClick={() => { setAdding(action.id); setTaskName(''); setError(''); }}><Icon name="plus" size={14} />Adicionar tarefa<span className="sr-only"> em {action.title}</span></button>}
      </div>}
    </article>; })}</div>
  </>;
}

function Indicators({ item, plan, year, setYear, onRecord, onTargets }) {
  const entry = latestMeasurement(item, year);
  const target = item.metric.targets[year];
  const status = metricStatus(item, year);
  return <><div className="section-heading indicator-heading"><div><h3>{item.metric.name}</h3><p>{item.metric.direction === 'down' ? 'Quanto menor, melhor' : 'Quanto maior, melhor'} · Consolidado anual</p></div><Field label="Ano de referência" className="year-field"><select value={year} onChange={(e) => setYear(Number(e.target.value))}>{years(plan).map((y) => <option key={y}>{y}</option>)}</select></Field></div>
    <div className="indicator-values"><div><span>Linha de base</span><strong>{formatNumber(item.metric.baseline)} <small>{item.metric.unit}</small></strong><p>{item.metric.reference}</p></div><div><span>Meta de {year}</span><strong>{target == null ? '—' : `${item.metric.direction === 'down' ? '≤ ' : ''}${formatNumber(target)}`} <small>{target == null ? '' : item.metric.unit}</small></strong><p>{target == null ? 'Sem meta definida para este ano' : 'Resultado esperado no período'}</p></div><div className="current-result"><span>Resultado registrado</span><strong>{entry ? formatNumber(entry.value) : '—'} <small>{entry ? item.metric.unit : ''}</small></strong><Badge tone={statusTone(status)}>{status}</Badge></div></div>
    <div className="formula"><Icon name="info" size={16} /><span>{item.metric.formula}</span></div>
    <div className="section-heading annual-heading"><h3>Metas e resultados por ano</h3><Button icon="edit" variant="ghost" onClick={onTargets}>Editar metas</Button></div>
    <div className="table-scroll"><table className="annual-table"><thead><tr><th>Ano</th><th>Meta ({item.metric.unit})</th><th>Resultado ({item.metric.unit})</th><th>Situação do indicador</th></tr></thead><tbody>{years(plan).map((y) => <tr key={y} className={year === y ? 'current-year' : ''}><th scope="row">{y}</th><td>{formatNumber(item.metric.targets[y])}</td><td>{formatNumber(latestMeasurement(item, y)?.value)}</td><td><Badge tone={statusTone(metricStatus(item, y))}>{metricStatus(item, y)}</Badge></td></tr>)}</tbody></table></div>
    <div className="record-footer"><p>{entry ? `Último registro para ${year}: ${formatDate(entry.at)}` : `Nenhum resultado registrado para ${year}.`}</p><Button variant="primary" icon="plus" onClick={onRecord}>Registrar resultado</Button></div>
    <div className="measurements"><h3>Registros de {year}</h3>{item.measurements.filter((m) => m.year === Number(year)).length ? [...item.measurements].reverse().filter((m) => m.year === Number(year)).map((m) => <article className="measurement" key={m.id}><div><strong>{formatNumber(m.value)} {item.metric.unit}</strong><time>{formatDate(m.at)}</time></div><p>{m.note}</p>{m.evidence && <a href={m.evidence} target="_blank" rel="noreferrer">Abrir referência da evidência <Icon name="arrow" size={13} /></a>}</article>) : <p className="hint">As medições e justificativas aparecerão aqui.</p>}</div>
  </>;
}

function History({ item, onComment }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  function submit(event) { event.preventDefault(); if (!comment.trim()) return setError('Escreva uma observação.'); onComment(comment.trim()); setComment(''); setError(''); }
  return <><div className="section-heading"><div><h3>Histórico do acompanhamento</h3><p className="hint">Atualizações, resultados e observações deste item.</p></div><Badge>{item.history.length} registros</Badge></div><form className="comment-form" onSubmit={submit}><Field label="Adicionar observação"><textarea rows="2" required maxLength={2000} placeholder="Registre um contexto ou encaminhamento…" value={comment} onChange={(e) => setComment(e.target.value)} /></Field>{error && <p role="alert" className="form-error">{error}</p>}<Button type="submit">Salvar observação</Button></form><div className="timeline">{[...item.history].reverse().map((h) => <article key={h.id}><span className="timeline-dot" /><div className="timeline-meta"><strong>{h.actor}</strong><time>{formatDate(h.at)}</time></div><p>{h.text}</p></article>)}</div></>;
}

createRoot(document.getElementById('root')).render(<App />);
