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

## Verificação

```sh
pnpm test
pnpm test:e2e
pnpm build
```

## Dados

As alterações ficam no armazenamento deste navegador. A opção **Restaurar demonstração** recupera os exemplos iniciais e remove os registros criados localmente. Os resultados apresentados são demonstrativos; nenhum dado é enviado a serviços externos.
