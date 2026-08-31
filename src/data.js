const task = (id, title, done = false) => ({ id, title, done });
const action = (id, title, tasks, owner = 'SEPLAN', deadline = '2026-12-15') => ({ id, title, tasks, owner, deadline });
const historical = (text) => [{ id: 'initial', at: '2026-08-27T14:30:00-03:00', text, actor: 'Dados demonstrativos' }];
const measurement = (value) => [{ id: 'initial', value, year: 2026, note: 'Medição ilustrativa para demonstração do fluxo.', at: '2026-08-27T14:30:00-03:00', evidence: '' }];
const targets = (value) => Object.fromEntries([2026, 2027, 2028, 2029, 2030].map((y) => [y, value]));

export const templates = [
  { id: 'pdi', type: 'PDI', name: 'Desenvolvimento institucional', version: 1, description: 'Objetivos, iniciativas e metas anuais para acompanhar a estratégia institucional.', labels: { axis: 'Eixo', objective: 'Objetivo', item: 'Iniciativa' }, fields: [] },
  { id: 'pls', type: 'PLS', name: 'Logística sustentável', version: 1, description: 'Compromissos de sustentabilidade, indicadores e ações com prazos.', labels: { axis: 'Eixo', objective: 'Objetivo', item: 'Compromisso' }, fields: [] },
];

const pdiItems = [
  {
    id: 'riscos', code: '8.1.3', axis: '8 · Governança e Gestão Institucional', objective: '8.1 · Aperfeiçoar Práticas de Governança Pública',
    title: 'Elaborar o Plano de Gestão de Riscos da UFCG', owner: 'SEPLAN', partners: 'Setores da UFCG',
    description: 'Estruturar a gestão de riscos da instituição, com participação dos setores e capacitação dos gestores.',
    source: 'PDI 2026–2030 · Eixo 8 · Iniciativa 8.1.3. Recorte demonstrativo das ações e tarefas.',
    metric: { name: 'Etapas concluídas da elaboração', unit: '%', baseline: 0, reference: 'Linha de base do PDI', direction: 'up', targets: { 2026: 80, 2027: 100, 2028: null, 2029: null, 2030: null }, formula: 'Etapas concluídas ÷ total de etapas × 100' },
    measurements: measurement(20), extras: {},
    actions: [
      action('comissao', 'Constituir a comissão de gestão de riscos', [task('setores', 'Definir os setores participantes', true), task('membros', 'Solicitar a indicação dos membros', true), task('minuta', 'Elaborar a minuta da portaria'), task('aprovacao', 'Encaminhar para aprovação'), task('publicacao', 'Publicar o ato de constituição')], 'SEPLAN', '2026-09-30'),
      action('estrutura', 'Estabelecer a estrutura de gestão de riscos', [task('normas', 'Levantar normas e referências'), task('modelo', 'Propor o modelo de acompanhamento')]),
      action('capacitacao', 'Capacitar gestores e lideranças', [task('publico', 'Definir o público e o conteúdo'), task('realizar', 'Realizar a capacitação')]),
      action('politica', 'Divulgar a política de gestão de riscos', [task('comunicacao', 'Preparar a comunicação para os setores')]),
    ],
    history: historical('Exemplo de acompanhamento iniciado com duas tarefas concluídas e medição independente de 20%.'),
  },
  {
    id: 'rankings', code: '8.1.9', axis: '8 · Governança e Gestão Institucional', objective: '8.1 · Aperfeiçoar Práticas de Governança Pública',
    title: 'Ampliar a participação em rankings universitários', owner: 'SEPLAN', partners: 'SPE',
    description: 'Aumentar a participação da UFCG em rankings universitários nacionais e internacionais.',
    source: 'PDI 2026–2030 · Eixo 8 · Iniciativa 8.1.9. Título abreviado na navegação.',
    metric: { name: 'Rankings com participação da UFCG', unit: 'rankings', baseline: 2, reference: 'Linha de base do PDI', direction: 'up', targets: targets(4), formula: 'Número de rankings com participação no período' },
    measurements: measurement(3), extras: {},
    actions: [action('mapear', 'Mapear rankings nacionais e internacionais', [task('lista', 'Consolidar a lista de rankings', true), task('criterios', 'Verificar os critérios de participação')]), action('inscrever', 'Realizar inscrições nos rankings selecionados', [task('dados', 'Reunir os dados institucionais'), task('envio', 'Enviar as inscrições')])],
    history: historical('Registrada medição ilustrativa de três rankings em 2026.'),
  },
  {
    id: 'sustentabilidade', code: '8.2.3', axis: '8 · Governança e Gestão Institucional', objective: '8.2 · Aperfeiçoar Práticas de Gestão Institucional',
    title: 'Estabelecer práticas sustentáveis na UFCG', owner: 'SEPLAN', partners: 'PRGAF · Reitoria',
    description: 'Estabelecer práticas sustentáveis e racionalizar gastos e processos administrativos, acompanhando a execução do PLS.',
    source: 'PDI 2026–2030 · Eixo 8 · Iniciativa 8.2.3. O vínculo ao PLS é consultivo neste protótipo.',
    metric: { name: 'Ações realizadas do PLS', unit: '%', baseline: 0, reference: 'Linha de base do PDI', direction: 'up', targets: { 2026: 20, 2027: 40, 2028: 60, 2029: 80, 2030: 100 }, formula: 'Ações realizadas no PLS ÷ total de ações previstas no PLS × 100' },
    measurements: [], extras: {}, linkedPlan: 'pls',
    actions: [action('monitorar', 'Monitorar a execução do PLS', [task('solicitar', 'Solicitar a atualização dos setores'), task('consolidar', 'Consolidar o acompanhamento')]), action('comite', 'Instituir um Comitê de Gestão Ambiental', [task('propor', 'Propor a composição do comitê')])],
    history: historical('Criado vínculo de consulta com o PLS. Não há cálculo automático entre os planos.'),
  },
];

const plsItems = [
  {
    id: 'papel', code: '01', axis: '1 · Consumo consciente de bens e serviços', objective: '01 · Reduzir o consumo de papel A4',
    title: 'Reduzir em 10% o consumo médio de papel A4', owner: 'PRGAF', partners: 'ASCOM · SEPLAN · Direções de centros',
    description: 'Reduzir o consumo em relação à média de 2024–2025, com diagnóstico, campanhas e divulgação dos resultados.',
    source: 'PLS 2025–2030 · Objetivo 01. Referência de 1.000 resmas e resultados são ilustrativos; a redução de 10% vem do plano.',
    metric: { name: 'Consumo anual de papel A4', unit: 'resmas', baseline: 1000, reference: 'Média 2024–2025 · exemplo ilustrativo', direction: 'down', targets: targets(900), formula: 'Consumo anual ≤ média de 2024–2025 × 0,90', illustrative: true },
    measurements: measurement(960), extras: {},
    actions: [
      action('estudo', 'Realizar estudo sobre o consumo de papel', [task('levantamento', 'Levantar o consumo dos setores', true), task('diagnostico', 'Consolidar o diagnóstico', true)], 'PRGAF', '2026-06-30'),
      action('campanha', 'Realizar campanha de redução do consumo', [task('material', 'Preparar os materiais de divulgação'), task('divulgar', 'Divulgar a campanha nos centros')], 'PRGAF', '2030-12-31'),
      action('divulgacao', 'Divulgar os dados anuais de consumo', [task('relatorio', 'Preparar o resumo anual de consumo')], 'PRGAF', '2026-12-31'),
    ],
    history: historical('Registrado consumo ilustrativo de 960 resmas. Meta ilustrativa de até 900 resmas.'),
  },
  {
    id: 'agua', code: '04', axis: '1 · Consumo consciente de bens e serviços', objective: '04 · Racionalizar o consumo de água',
    title: 'Reduzir em 10% o consumo médio de água', owner: 'Prefeituras', partners: 'Direções de centros · SEPLAN',
    description: 'Acompanhar o consumo per capita e promover o uso racional de água nos campi.',
    source: 'PLS 2025–2030 · Objetivo 04. Valores absolutos e tarefas são exemplos de demonstração.',
    metric: { name: 'Consumo anual de água per capita', unit: 'm³/pessoa', baseline: 12, reference: 'Média 2024–2025 · exemplo ilustrativo', direction: 'down', targets: targets(10.8), formula: 'Consumo anual per capita ≤ média de 2024–2025 × 0,90', illustrative: true },
    measurements: [], extras: {},
    actions: [action('medidores', 'Ampliar a medição de consumo por edificação', [task('inventario', 'Identificar as edificações sem medição'), task('instalacao', 'Planejar a instalação dos medidores')], 'Prefeituras', '2027-12-31'), action('dadosagua', 'Divulgar os dados de consumo de água', [task('coletaagua', 'Organizar a coleta dos dados'), task('publicaragua', 'Publicar o acompanhamento')], 'Prefeituras', '2026-12-31')],
    history: historical('Compromisso preparado para receber a primeira medição.'),
  },
];

export function initialState() {
  return structuredClone({ version: 1, templates, plans: [
    { id: 'pdi', type: 'PDI', shortName: 'PDI', name: 'Plano de Desenvolvimento Institucional', start: 2026, end: 2030, template: templates[0], items: pdiItems, created: false },
    { id: 'pls', type: 'PLS', shortName: 'PLS', name: 'Plano de Logística Sustentável', start: 2025, end: 2030, template: templates[1], items: plsItems, created: false },
  ] });
}
