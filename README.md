# SUMI · Protótipo

Protótipo visual navegável dos fluxos de PDI e PLS da UFCG. React, Tailwind CSS e Vite. Execução local, sem backend ou autenticação.

## Estrutura

```text
src/
  data.js          Exemplos de planejamento
  domain.js        Estado e regras da demonstração
  forms.jsx        Formulários
  main.jsx         Navegação e telas
  styles.css       Apresentação visual
  ui.jsx           Componentes compartilhados
tests/
  domain.test.js   Verificações das regras
  e2e/             Testes dos fluxos no navegador
scripts/
  capture.mjs      Capturas das telas
docs/
  prototipo.md     Escopo e roteiro de demonstração
```

## Execução

Node.js 22.12 ou superior e pnpm.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

A aplicação abre em [127.0.0.1:4317](http://127.0.0.1:4317). O servidor aceita conexões somente da própria máquina.

## Verificação

```sh
pnpm test
pnpm test:e2e
pnpm build
```

Os testes de navegação utilizam o Microsoft Edge instalado no ambiente. O relatório é gerado em `playwright-report/`. As capturas podem ser geradas com `node scripts/capture.mjs`, com o servidor em execução.

## Deploy na Vercel

Importe o repositório `Fel-tby/sumi-prototipo` na Vercel, mantendo a raiz do projeto em `./`. O arquivo `vercel.json` configura Vite, o comando `pnpm build` e a saída `dist`. Use Node.js 22.12 ou superior. Não são necessárias variáveis de ambiente.

A navegação usa rotas com `#`, sem necessidade de regras de redirecionamento. Os dados continuam locais a cada navegador; o deploy não adiciona backend nem compartilhamento de dados.

## Dados

As alterações ficam no armazenamento deste navegador. A opção **Restaurar demonstração** recupera os exemplos iniciais e remove os registros criados localmente. Os resultados apresentados são demonstrativos; nenhum dado é enviado a serviços externos.
