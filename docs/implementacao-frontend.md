# Registro de implementação do frontend

## Escopo

Este documento consolida a evolução do frontend do SUMI até 13 de setembro de 2026. O trabalho transforma o protótipo navegável em uma interface preparada para uma aplicação real, preservando dados locais somente para desenvolvimento e validação enquanto o backend definitivo não está conectado.

O escopo desta entrega é exclusivamente o frontend. Autenticação, autorização efetiva, persistência institucional, notificações e demais regras de servidor continuam sob responsabilidade do backend.

## Adequações do produto

### Estrutura flexível de planejamentos

- A interface deixou de depender de uma única estrutura fixa de plano.
- Cada modelo define a terminologia apresentada para eixo, objetivo e item acompanhado.
- O PDI é representado por eixos, objetivos, iniciativas, ações e etapas.
- O PLS usa seus próprios eixos, objetivos e metas sem ser forçado a reproduzir a nomenclatura do PDI.
- Novos planos são criados vazios e em rascunho, sem copiar os dados do modelo escolhido.
- O administrador pode configurar a estrutura, os campos adicionais e as cores dos eixos.
- As cores pertencem aos eixos e são reutilizadas na árvore, nos detalhes, nas ações, nos indicadores e nos gráficos. Elas não pertencem a itens isolados.

### Indicadores e metas

Foram implementadas três formas de acompanhamento para contemplar PDI, PLS e futuros tipos de planejamento:

1. **Valor informado:** aceita números ou percentuais, unidade, linha de base, sentido de melhoria e resultados por período.
2. **Entrega acompanhada:** usa situações descritivas, como “Em elaboração”, “Aguardando validação” e “Concluída”, sem inventar percentuais.
3. **Calculado pelas etapas:** calcula o resultado a partir das etapas ativas concluídas e desconsidera etapas canceladas.

As metas podem ser anuais ou únicas para o ciclo completo. Indicadores quantitativos preservam unidade, sentido de melhoria e atingimento; indicadores descritivos apresentam situação e critério de conclusão.

A leitura dos indicadores foi reorganizada para apresentar:

- resultado, meta e atingimento em um resumo único;
- linha de base, referência e regra de cálculo ou critério;
- tabela de metas e resultados por período;
- visualização de evolução para séries quantitativas;
- seleção sincronizada do período entre resumo, tabela e evolução;
- registros do período e acesso às evidências;
- distinção explícita entre “Sem resultado” e “Sem meta definida”.

### Execução, ações e etapas

- A execução apresenta o total de etapas ativas concluídas e o percentual correspondente.
- Cada ação pode ser expandida ou recolhida e informa responsável, prazo e progresso.
- As etapas foram organizadas em colunas de etapa, prazo e situação para reduzir repetição e melhorar a leitura.
- Gestores autorizados podem alterar a situação das etapas.
- Etapas atrasadas são destacadas sem substituir sua situação real.
- Cancelamentos e atrasos aceitam justificativa, que também é registrada no histórico.
- Novas etapas aceitam título, prazo e parceiros.
- Riscos podem ser vinculados às ações.

### Riscos e histórico

- Foi mantida a matriz de probabilidade e impacto, com níveis baixo, moderado, alto e crítico.
- A lista de riscos pode ser filtrada a partir da matriz e apresenta responsável, ação vinculada e tratamento.
- Usuários autorizados podem cadastrar e editar riscos.
- O histórico registra alterações operacionais, resultados, justificativas, submissões e decisões de validação.
- Perfis autorizados podem adicionar observações ao histórico.

## Usuários, permissões e fluxo de validação

A interface usa concessões explícitas retornadas na sessão. O nome do papel serve para identificação, mas não concede acesso por si só. Os escopos reconhecidos são `global`, `plan`, `axis` e `item`.

Perfis contemplados:

- **Consulta pública:** visualiza somente planos e informações publicadas; não acessa riscos, histórico, situação interna de validação ou controles de alteração.
- **Administrador Estratégico:** configura modelos, estrutura, conteúdo e parâmetros dos planos e possui visão institucional.
- **Gestor do Eixo:** acessa suas pendências, atualiza etapas e resultados dentro do escopo atribuído e envia o item para validação.
- **Responsável pelo Eixo:** acessa a fila de validação, valida informações ou solicita correções dentro do escopo atribuído, sem receber controles de execução.

O ciclo implementado é:

```text
Em elaboração → Aguardando validação → Validado
      ↑                  ↓
      └──── Correção solicitada
```

Quando um item aguardando validação ou já validado sofre uma alteração operacional, ele retorna ao estado de elaboração e a mudança é registrada no histórico.

O menu lateral é montado conforme as permissões:

- todos recebem **Visão geral** e **Planejamentos**;
- gestores autorizados recebem **Minhas pendências**;
- responsáveis autorizados recebem **Validações**;
- administradores autorizados recebem **Modelos de plano**.

O menu pode ser recolhido em telas de computador. A preferência é preservada no navegador, os itens recolhidos mantêm nome acessível e o comportamento é adaptado para telas estreitas.

## Preparação para integração com o backend

- A origem dos dados foi isolada em `src/planning-client.js`.
- No desenvolvimento, os dados locais são carregados por uma rota exclusiva do Vite e as alterações ficam no armazenamento do navegador.
- Na compilação de produção, a fonte padrão é HTTP e os dados locais não são usados como fonte da aplicação.
- O cliente HTTP valida a estrutura recebida antes de entregá-la aos componentes.
- As gravações HTTP são serializadas para evitar que respostas fora de ordem sobrescrevam alterações mais recentes.
- URL da API, endpoint de sessão, endpoint de planejamento e fonte de dados podem ser configurados por variáveis de ambiente.
- A sessão é carregada com credenciais e respostas `401` são tratadas como consulta pública.
- Sessões autenticadas inválidas são recusadas em vez de liberar acesso por suposição.
- A autorização nega permissões sem escopo válido e não aceita curinga implícito.
- Chamadas de rede e tradução de DTOs devem permanecer nos adaptadores, evitando acoplamento do contrato HTTP aos componentes de tela.

Endpoints provisórios esperados pelo adaptador:

```text
GET /api/v1/auth/session
GET /api/v1/planning/workspace
PUT /api/v1/planning/workspace
```

O endpoint agregado de planejamento é uma fronteira provisória. O backend pode oferecer recursos mais específicos, desde que o adaptador faça a tradução para o modelo consumido pelas telas.

## Remoções do protótipo

- Foram removidos seletor e simulação visual de perfis.
- Foram removidos avisos de “protótipo”, “dados demonstrativos” e “sem backend”.
- Foi removida a ação de restaurar a demonstração.
- Foram removidas explicações internas, hipóteses de validação e perguntas de equipe exibidas como conteúdo do produto.
- Os dados locais permaneceram apenas como fixtures de desenvolvimento, sem controles de demonstração na interface e sem dependência deles no comportamento padrão de produção.

## Bugs e inconsistências corrigidos

- A aplicação deixou de exigir uma sessão autenticada para abrir a consulta pública; `401` resulta em sessão pública controlada.
- Concessões incompletas, sem escopo ou com curinga deixam de liberar ações indevidas.
- O escopo de um gestor não libera mutações em outro plano, eixo ou item.
- Alterações em conteúdo submetido ou validado deixam de preservar incorretamente o estado anterior de validação.
- Etapas canceladas deixam de contar no denominador do progresso.
- Metas com valor zero deixam de ser confundidas com ausência de meta.
- Indicadores cujo melhor resultado é a redução passam a calcular e apresentar o atingimento no sentido correto.
- Entregas descritivas deixam de receber percentuais artificiais.
- Períodos de ciclo deixam de produzir anos intermediários que não pertencem ao modelo.
- A seleção de período do indicador é reinicializada ao trocar de item, impedindo que um ano inválido seja carregado no próximo indicador.
- A tabela e a evolução mantêm o mesmo período selecionado.
- Situação de atraso deixa de apagar a situação operacional da etapa.
- A apresentação da unidade foi uniformizada no resumo e nos cabeçalhos das metas.
- A terminologia do item respeita a capitalização definida pelo modelo, sem conversão forçada para caixa alta.
- A hierarquia visual de ações e etapas deixou de repetir barras, bordas e marcadores que dificultavam a leitura.
- A interface em telas estreitas foi reorganizada para preservar tamanhos legíveis, alvos de toque e formulários utilizáveis.

## Adequações visuais e de acessibilidade

- Tipografia, contraste, espaçamento e densidade de informação foram revisados nas páginas, cartões, formulários, tabelas e modais.
- A visão geral ganhou agrupamento mais simples e destaque condicional para etapas atrasadas.
- A listagem de planos foi simplificada e mantém as informações essenciais sem altura artificial.
- A árvore do plano passou a separar com clareza eixos, objetivos e itens, preservando a cor do eixo selecionado.
- Cabeçalhos e metadados do item foram reorganizados para priorizar título, situação, vínculo e responsável.
- As abas foram simplificadas e continuam navegáveis pelo teclado.
- Tabelas usam cabeçalhos e seleção de período identificáveis por tecnologia assistiva.
- Barras de execução expõem valor, mínimo, máximo e descrição acessível.
- Controles expansíveis informam seu estado por `aria-expanded` ou `aria-pressed`.
- A visualização de evolução pode ser operada por teclado e não depende somente de cor.
- O layout responsivo cobre navegação, árvore, ações, etapas, indicadores, riscos, histórico, modelos e formulários.
- A preferência por redução de movimento é respeitada.

## Validação automatizada

A cobertura atual verifica, entre outros pontos:

- hierarquias e terminologias próprias de PDI e PLS;
- indicadores numéricos, entregas descritivas e cálculo por etapas;
- cálculo de progresso, atraso, metas, resultados e períodos;
- isolamento de estado e validação dos dados;
- contrato de sessão, permissões e escopos;
- consulta pública e restrições dos perfis internos;
- criação de plano, estrutura, item, ação, etapa, risco e resultado;
- submissão, validação, correção e histórico;
- busca e filtros;
- matriz de riscos;
- navegação por teclado;
- recolhimento persistente do menu lateral;
- tabela e evolução de indicadores quantitativos;
- ausência de percentual artificial em indicadores descritivos;
- utilização em telas estreitas;
- ausência de controles e mensagens do protótipo.

Comandos de verificação:

```sh
pnpm test
pnpm test:e2e
pnpm build
```

## Dependências e decisões pendentes

As seguintes capacidades usadas pelo fluxo precisam existir no contrato final do backend:

- `item.submit`;
- `item.review`;
- `work_queue.read`;
- `review_queue.read`.

Também permanecem dependentes de decisão da SEPLAN:

1. Quem publica ou despublica um planejamento após a validação?
2. Uma mesma pessoa pode executar em um eixo e validar outro?
3. Uma pessoa pode validar conteúdo alterado por ela em outro papel?
4. A devolução ocorre no item inteiro ou pode atingir ação, etapa e resultado isoladamente?
5. Quais informações operacionais se tornam públicas e em qual momento?
6. As situações de entrega serão fixas ou configuráveis por modelo?
7. O fechamento de indicadores calculados por etapas será automático ou confirmado por um responsável?
8. O contrato definitivo manterá o workspace agregado ou adotará endpoints por recurso?
