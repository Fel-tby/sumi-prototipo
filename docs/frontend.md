# Frontend do SUMI

## Objetivo

O frontend oferece uma interface única para planos institucionais com estruturas e formas de medição diferentes. O modelo atual contempla o PDI e o PLS sem fixar o produto a esses dois tipos.

## Estrutura funcional

Cada planejamento contém eixos e objetivos configuráveis. O item acompanhado recebe o nome definido pelo modelo, como **Iniciativa** no PDI e **Meta** no PLS. Cada item pode conter ações, etapas, indicador, metas, resultados, riscos e histórico.

As formas de acompanhamento disponíveis são:

1. **Valor informado:** número ou percentual registrado por período.
2. **Entrega acompanhada:** situação descritiva da entrega, como “Em elaboração” ou “Concluída”.
3. **Calculado pelas etapas:** percentual derivado da conclusão das etapas ativas.

As metas podem ser anuais ou associadas ao ciclo completo. Essa separação permite representar indicadores quantitativos do PDI, metas descritivas do PLS e outros planejamentos sem alterar a hierarquia da interface.

## Autorização

A autorização usa concessões explícitas e escopos `global`, `plan`, `axis` e `item`. O papel é exibido para contexto, mas não concede acesso por si só.

Perfis funcionais atendidos:

- **Consulta pública:** consulta somente planejamentos publicados; não acessa histórico, riscos ou situação de validação.
- **Administrador Estratégico:** configura modelos, estrutura e conteúdo dos planos e possui visão institucional.
- **Gestor do Eixo:** atualiza etapas, resultados e informações operacionais dentro dos eixos atribuídos e envia o acompanhamento para validação.
- **Responsável pelo Eixo:** consulta o escopo atribuído e valida ou devolve informações para correção.

O frontend esconde ações sem concessão para reduzir erro operacional. O backend continua responsável por autorizar toda leitura protegida e toda mutação.

Além das permissões do contrato de sessão v1, os fluxos de trabalho desta versão usam quatro capacidades que precisam ser acrescentadas ao contrato antes da integração:

- `item.submit`: enviar um item para validação;
- `item.review`: validar ou solicitar correção;
- `work_queue.read`: consultar a área de pendências de execução;
- `review_queue.read`: consultar a fila de validação.

Essas capacidades permanecem explícitas para não deduzir autorização a partir do nome do papel.

## Ciclo de acompanhamento

O item começa em elaboração. O gestor atualiza etapas e resultados, registra justificativas e envia o conjunto para validação. O responsável pelo eixo pode validar ou solicitar correção. Qualquer alteração posterior em informação aguardando validação ou já validada devolve o item ao estado de elaboração e cria um evento no histórico.

Estados do ciclo:

```text
Em elaboração → Aguardando validação → Validado
      ↑                  ↓
      └──── Correção solicitada
```

## Dados e integração

Os componentes recebem um modelo de tela estável. O adaptador em `src/planning-client.js` concentra carregamento e persistência para que a conexão com a API não altere formulários, navegação ou verificações de permissão.

No desenvolvimento, dados locais permitem validar os fluxos. A compilação de produção usa o adaptador HTTP por padrão e não apresenta controles de demonstração. O contrato definitivo do domínio pode substituir os endpoints agregados e mapear DTOs dentro do adaptador.

## Decisões ainda dependentes da SEPLAN

1. Quem pode publicar ou despublicar um planejamento após a validação?
2. Uma pessoa pode executar em um eixo e validar outro?
3. O responsável pelo eixo pode validar alterações feitas por ele próprio em outro papel?
4. A devolução para correção ocorre por item completo, ação, etapa ou resultado isolado?
5. Quais informações operacionais devem aparecer na consulta pública e em qual momento?
6. Quais situações de entrega são obrigatórias ou configuráveis por modelo?
7. O fechamento anual de indicadores calculados pelas etapas será automático ou confirmado por um responsável?
