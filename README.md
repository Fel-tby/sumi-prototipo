# SUMI-UFCG

Sistema de gestão e acompanhamento de planos institucionais da Universidade Federal de Campina Grande.

## Arquitetura

O projeto é um monólito modular com uma única unidade de implantação:

- React e Tailwind CSS para a interface;
- Node.js e Fastify para a aplicação e a API;
- Supabase/PostgreSQL para persistência e serviços de dados;
- Docker para empacotamento e execução;
- TypeScript em toda a base de código.

O navegador se comunica exclusivamente com a API da aplicação. Credenciais administrativas e regras de autorização permanecem no backend.

## Requisitos

- Node.js 24
- pnpm 11
- Docker com Docker Compose

## Desenvolvimento

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Serviços locais:

- Interface: `http://localhost:5173`
- API: `http://localhost:3333`
- Saúde da aplicação: `http://localhost:3333/api/v1/health`

## Qualidade

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O comando `pnpm check` executa todas as verificações em sequência.

## Execução com Docker

```bash
cp .env.example .env
docker compose up --build
```

A aplicação fica disponível em `http://localhost:3333`.

## Estrutura

```text
src/
├── client/             interface React
├── server/             aplicação Node.js
│   ├── config/         configuração e ambiente
│   └── modules/        módulos do domínio
└── shared/             contratos compartilhados
docs/                   arquitetura e desenvolvimento
```

## Documentação

- [Arquitetura](docs/architecture.md)
- [Desenvolvimento](docs/development.md)
- [Segurança](SECURITY.md)
- [Contribuição](CONTRIBUTING.md)
