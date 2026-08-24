# Desenvolvimento

## Preparação

```bash
cp .env.example .env
pnpm install
```

## Execução

```bash
pnpm dev
```

O Vite executa a interface e encaminha chamadas `/api` para a aplicação Node.js.

## Verificações

```bash
pnpm check
```

O comando executa lint, verificação de tipos, testes e build de produção.

## Variáveis de ambiente

| Variável | Finalidade | Exposição ao navegador |
|---|---|---|
| `NODE_ENV` | Ambiente de execução | Não |
| `HOST` | Interface de rede da aplicação | Não |
| `PORT` | Porta HTTP | Não |
| `LOG_LEVEL` | Nível de log | Não |
| `WEB_ORIGIN` | Origem permitida durante o desenvolvimento | Não |
| `SUPABASE_URL` | Endereço da instância Supabase | Não |
| `SUPABASE_ANON_KEY` | Chave pública usada pelo backend quando necessária | Não |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave administrativa do backend | Nunca |

## Novos módulos

Cada módulo deve manter:

- contratos de entrada e saída;
- regras de negócio;
- adaptadores de persistência;
- rotas HTTP;
- testes automatizados.

Dependências entre módulos devem ocorrer por contratos explícitos.
