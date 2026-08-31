# Protótipo de planejamento

O protótipo apresenta o acompanhamento de iniciativas do PDI, compromissos do PLS e a criação de planejamentos a partir de modelos ajustáveis. A navegação utiliza menu lateral, árvore do plano e detalhe do item, com referência visual no ForPDI.

## Conteúdo

O PDI contém as iniciativas 8.1.3, 8.1.9 e 8.2.3 do Eixo 8. O PLS contém os objetivos de redução do consumo de papel e de água. Títulos e descrições foram abreviados para a navegação. As tarefas representam um recorte operacional, e não a transcrição integral da planilha da SEPLAN.

As fontes são o PDI 2026–2030, aprovado pela Resolução 09/2025; o PLS 2025–2030, aprovado pela Resolução 01/2026; e a planilha de monitoramento do Eixo 8. Os nomes dos níveis e as regras operacionais adotadas na demonstração permanecem sujeitos à validação de domínio.

No PDI, as metas numéricas dos exemplos seguem o documento. No PLS, a redução de 10% segue o plano, enquanto as linhas de base de 1.000 resmas e 12 m³ por pessoa são valores ilustrativos. As metas absolutas exibidas decorrem dessas referências ilustrativas. Conclusões de tarefas, medições, datas operacionais e observações iniciais são dados de demonstração.

## Acompanhamento

A execução representa a proporção simples de tarefas concluídas no recorte cadastrado. Todas as tarefas têm o mesmo peso. Uma ação sem tarefas não participa desse percentual. Essa regra não reproduz os pesos ou as fórmulas da planilha recebida.

Os resultados dos indicadores são registrados separadamente, por ano. O último registro de cada ano aparece como resultado atual; os anteriores permanecem consultáveis. A comparação respeita o sentido de melhoria do indicador. Campo vazio representa ausência de meta, enquanto zero permanece um valor válido.

A demonstração utiliza consolidação anual. Medições mensais, fórmulas configuráveis e agregações entre planos não estão implementadas. O vínculo da iniciativa 8.2.3 com o PLS permite navegar entre os planejamentos, sem calcular automaticamente a execução do PLS.

Mudanças em tarefas, ações, informações, metas e resultados geram registros no histórico local. Esse histórico demonstra a experiência de acompanhamento e não constitui um mecanismo institucional de auditoria.

## Modelos

Cada modelo define os nomes de três níveis da navegação e os campos adicionais do item acompanhado. Campos de texto, número, data e seleção são suportados. Ações, tarefas e indicadores mantêm sua função. Não há construtor livre de regras ou de hierarquias.

Um planejamento novo recebe uma cópia da versão atual do modelo, sem dados dos planos de exemplo. Alterações posteriores no modelo não modificam os planejamentos existentes. Os campos adicionais podem ser preenchidos e editados no formulário do item.

## Roteiro de demonstração

### PDI

Abrir o PDI, selecionar a iniciativa 8.1.3 e concluir uma tarefa. Consultar a execução e abrir a aba de indicador para observar que o resultado não foi alterado. Registrar um resultado com justificativa e verificar o histórico. Reabrir a tarefa para demonstrar a reversibilidade da atualização.

### PLS

Abrir o compromisso de consumo de papel. Consultar a referência de 1.000 resmas e a meta ilustrativa de até 900. Registrar um resultado de 880 resmas e observar a comparação de redução. Navegar até o compromisso de água e identificar a unidade de medição diferente, mantendo a mesma organização das telas.

### Adaptação

Abrir os modelos e adicionar um campo de seleção chamado Campus. Criar um planejamento a partir desse modelo, cadastrar o primeiro item e preencher o campo. Adicionar uma ação, definir prazo e cadastrar uma tarefa. Retornar ao PDI original para observar que sua estrutura permaneceu inalterada.

## Validação

A avaliação observa se o participante consegue localizar o item sob sua responsabilidade, identificar a meta, atualizar uma tarefa, registrar um resultado e criar um plano a partir de um modelo. A conclusão de cada tarefa, as dúvidas de vocabulário e a necessidade de ajuda são os principais registros da sessão.

Os testes automatizados verificam navegação, formulários, cancelamentos, campos personalizados, atualização de resultados, histórico, persistência, restauração, teclado e layout estreito. Todas as rotas executadas são verificadas quanto a erros JavaScript e requisições externas. A inspeção visual complementa esses testes.

## Operação local

Não há login, contas, banco de dados, upload, publicação ou integração institucional. Um link de evidência armazena somente o endereço; abri-lo é uma navegação externa explícita. Cada navegador mantém sua própria cópia da demonstração. A restauração afeta somente os dados locais do protótipo.
