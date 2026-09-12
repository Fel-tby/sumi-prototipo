# SUMI Frontend

Frontend do Sistema Unificado de Monitoramento Institucional da UFCG. A aplicação organiza planos institucionais, execução, indicadores, metas, riscos, histórico e validação por escopo de acesso.

## Requisitos

- Node.js 22.12 ou superior
- pnpm

## Execução local

```sh
pnpm install --frozen-lockfile
pnpm dev
```

A aplicação fica disponível em `http://127.0.0.1:4317`. No modo de desenvolvimento, a camada de dados usa registros locais isolados da compilação de produção.

Sessões disponíveis para validação local:

- administrador: `http://127.0.0.1:4317/__dev/session/administrator`
- consulta pública: `http://127.0.0.1:4317/__dev/session/public`
- gestor de eixo: `http://127.0.0.1:4317/__dev/session/axis_contributor`
- responsável pelo eixo: `http://127.0.0.1:4317/__dev/session/axis_reviewer`

Esses endereços existem somente no servidor de desenvolvimento. A interface não contém seletor de perfil nem controles de restauração de dados.

## Integração

A interface consome identidade e autorizações exclusivamente por concessões retornadas em `GET /api/v1/auth/session`. Os componentes não autorizam ações pelo nome do papel.

O acesso aos planejamentos fica concentrado em `src/planning-client.js`. Em produção, o adaptador HTTP utiliza por padrão:

- `GET /api/v1/planning/workspace`
- `PUT /api/v1/planning/workspace`

Variáveis disponíveis:

- `VITE_API_BASE_URL`: origem da API, vazia para mesma origem;
- `VITE_AUTH_SESSION_PATH`: caminho do endpoint de sessão;
- `VITE_PLANNING_WORKSPACE_PATH`: caminho do endpoint agregado de planejamento;
- `VITE_DATA_SOURCE`: `local` para dados de desenvolvimento ou `http` para a API.

Quando o contrato definitivo do domínio for conectado, a tradução entre respostas HTTP e o modelo de tela deve permanecer no adaptador, sem espalhar chamadas de rede pelos componentes.

## Verificação

```sh
pnpm test
pnpm test:e2e
pnpm build
```

## Organização

```text
dev/                  Sessões locais de desenvolvimento
src/auth/             Sessão, concessões e escopos
src/data.js           Dados locais de desenvolvimento
src/domain.js         Regras de apresentação e cálculo
src/forms.jsx         Formulários de domínio
src/planning-client.js Adaptador da fonte de planejamentos
src/main.jsx          Navegação e fluxos de tela
src/styles.css        Sistema visual responsivo
tests/                Testes de regras e fluxos no navegador
docs/                 Documentação funcional e técnica
```
