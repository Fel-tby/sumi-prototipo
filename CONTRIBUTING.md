# Contribuição

## Fluxo de trabalho

1. Atualize a branch `main`.
2. Crie uma branch curta a partir da `main`.
3. Implemente uma alteração com escopo definido.
4. Execute `pnpm check`.
5. Abra um pull request.
6. Solicite a revisão de outro integrante da equipe.

## Nomes de branches

```text
feature/nome-da-entrega
fix/nome-da-correcao
docs/nome-do-documento
chore/nome-da-manutencao
```

## Commits

Utilize mensagens no formato:

```text
tipo(escopo): descrição objetiva
```

Tipos principais: `feat`, `fix`, `docs`, `test`, `refactor`, `chore` e `ci`.

## Pull requests

Todo pull request deve:

- descrever a alteração e o critério de aceite;
- incluir testes proporcionais ao risco;
- atualizar a documentação afetada;
- passar pelas verificações automatizadas;
- receber pelo menos uma revisão.
