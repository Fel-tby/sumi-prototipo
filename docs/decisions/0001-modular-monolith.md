# ADR 0001 - Monólito modular

## Situação

Aceita.

## Contexto

O projeto será desenvolvido por uma equipe de três bolsistas e possui frontend, backend e módulos de negócio fortemente relacionados.

## Decisão

O SUMI será mantido em um único repositório e entregue como uma única aplicação Node.js. A interface React será compilada e servida pela aplicação em produção.

O código será separado internamente por módulos de domínio, com contratos explícitos e acesso a dados concentrado no backend.

## Consequências

- uma única rotina de build, teste e implantação;
- alterações de ponta a ponta no mesmo pull request;
- menor custo operacional;
- limites internos precisam ser preservados por revisão e testes;
- módulos poderão ser extraídos somente quando houver necessidade operacional comprovada.
