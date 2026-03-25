# Fluxo Comercial, Subscrição, Plano Free e Plano Paid

## Visão geral

A implementação atual foi desenhada para trabalhar com dois níveis comerciais principais: um plano gratuito associado à conta do utilizador e um plano pago recorrente processado pela Stripe. A lógica comercial não depende de valores fixos escritos na interface. Os planos, preços, períodos de cobrança e identificadores necessários para o checkout ficam centralizados no banco de dados, e a aplicação carrega essas informações dinamicamente para mostrar os valores corretos ao utilizador.

Na prática, o sistema trata o utilizador autenticado como um cliente local da plataforma. A partir desse cliente local, a aplicação controla o acesso gratuito, a passagem para o plano pago, a sincronização da assinatura com a Stripe e a apresentação do estado comercial dentro da conta.

## Conceito do plano free

O plano free não depende de um checkout externo. Quando o utilizador cria conta, entra na aplicação ou passa pelo processo de bootstrap da conta, o sistema garante que exista um cliente local no banco de dados e também uma subscrição local do tipo free. Isso significa que o plano gratuito é tratado como um estado comercial válido dentro da base de dados, e não apenas como uma condição temporária na interface.

A escolha do plano free na página comercial funciona mais como uma confirmação da modalidade gratuita do que como uma ativação complexa, porque a base do modelo já é criada automaticamente para o utilizador autenticado.

O acesso gratuito está ligado à conta do utilizador. Na implementação atual, o uso free não é realmente anónimo no fluxo principal do produto. Para usar o extrator dentro da regra comercial atual, o utilizador precisa estar autenticado. Se não estiver autenticado, a aplicação bloqueia o uso e pede login ou criação de conta.

## Limite de uso no plano free

O plano gratuito possui um limite de utilizações concluídas por conta. Esse limite é controlado no backend e, no estado atual da implementação, parte de uma configuração de servidor com valor base de 3 utilizações gratuitas por utilizador.

O que fica persistido no banco de dados não é apenas a regra do limite, mas principalmente o consumo real do utilizador. Cada cliente possui um contador de uso gratuito acumulado. Sempre que uma extração é concluída com sucesso dentro do modelo free, esse contador é incrementado e fica salvo na base de dados.

Antes de permitir uma nova utilização, o sistema consulta o contador atual do utilizador e compara com o limite configurado. Se o limite já tiver sido atingido, o acesso gratuito é bloqueado e a aplicação orienta o utilizador para fazer upgrade para o plano pago.

## Como a aplicação decide entre free e paid

A decisão de acesso acontece em duas camadas.

Na experiência da interface, a aplicação consulta o estado comercial do utilizador para mostrar se ele ainda tem utilizações gratuitas disponíveis ou se já possui uma subscrição ativa. Isso melhora a experiência e evita cliques desnecessários.

No backend, essa validação é feita novamente antes da execução real da análise. Essa segunda validação é a que protege de facto a regra comercial. Assim, mesmo que a interface esteja desatualizada ou que haja alguma tentativa de contornar o limite, o servidor volta a verificar:

- se o utilizador está autenticado
- se existe uma subscrição paga ativa
- se o utilizador ainda está dentro do limite gratuito

Se existir uma subscrição paga ativa, o utilizador recebe acesso ilimitado dentro da lógica atual do produto. Se não existir subscrição paga ativa, o sistema aplica a regra do plano free.

## Conceito do plano paid

O plano pago é recorrente e é tratado como uma assinatura gerida pela Stripe. A aplicação não grava o valor comercial de forma fixa no frontend. Em vez disso, ela lê do banco de dados os planos ativos disponíveis para venda, incluindo o plano pago mensal e o plano pago anual.

Quando o utilizador escolhe um plano pago, a aplicação identifica no banco de dados qual é o plano selecionado, confirma que ele está ativo e obtém dele as informações comerciais necessárias para abrir o checkout. A partir daí, o sistema cria ou reutiliza o cliente correspondente na Stripe e abre uma sessão de checkout no modo de subscrição.

Durante esse processo, a aplicação envia para a Stripe o contexto da assinatura, como o utilizador local, o plano selecionado, o intervalo de cobrança e os metadados comerciais da operação. Isso garante rastreabilidade entre o que foi escolhido na app e o que foi efetivamente criado na plataforma de cobrança.

## Preços dinâmicos vindos do banco de dados

Os preços mostrados na aplicação são dinâmicos. A app faz uma leitura dos planos ativos guardados no banco de dados e usa esses registos para montar a secção comercial na landing page e na página de subscrição.

Cada plano possui a sua própria configuração comercial, incluindo:

- nome do plano
- identificação interna do plano
- descrição
- lista de benefícios
- intervalo de cobrança, quando aplicável
- valor monetário
- moeda
- ordem de exibição
- indicador de ativação
- identificador do preço correspondente na Stripe

No caso do plano anual, existe também um campo de desconto para exibição comercial. Esse valor serve para comunicar economia na interface, mas não é o que define a cobrança final. A cobrança real continua vinculada ao preço configurado na Stripe e associado ao plano salvo no banco.

Em resumo, a app mostra ao utilizador o preço que vem do banco de dados e usa o identificador de preço da Stripe também guardado no banco para abrir o checkout correto. Isso evita hardcode de preços na interface e permite alterar a estratégia comercial pela base de dados.

## O que fica guardado no banco de dados

O banco de dados guarda o estado comercial do utilizador e também a configuração dos planos.

No registo do cliente ficam concentrados os dados principais do utilizador no modelo comercial, como:

- identificação do utilizador
- email
- nome de cobrança
- email de cobrança
- identificador do cliente na Stripe
- contador de utilizações gratuitas

Na parte de subscrições fica guardado o histórico e o estado comercial local da conta, incluindo:

- qual cliente pertence à subscrição
- qual plano foi associado
- estado atual da subscrição
- identificador da subscrição na Stripe, quando existir
- indicação de cancelamento no fim do período
- datas do período atual de cobrança

Na configuração de planos ficam guardados os dados comerciais usados pela app e pelo checkout, como:

- planos free e paid
- variações mensal e anual
- valor e moeda
- benefícios mostrados ao utilizador
- estado ativo ou inativo
- identificador do preço na Stripe
- percentagem de desconto de exibição

Além disso, o sistema guarda um log operacional de uso. Esse log registra as tentativas e execuções de análise, o modo em que o utilizador estava a operar, o estado da operação, a contagem de uso antes e depois, e eventuais erros comerciais. Isso ajuda a auditar consumo, bloqueios e comportamento do limite gratuito.

## Como a Stripe entra no fluxo

A Stripe é usada como motor de cobrança do plano pago. A aplicação usa a Stripe para três pontos principais:

- criação e manutenção do cliente de cobrança
- abertura do checkout de subscrição
- gestão posterior da assinatura através do portal de billing

Quando o utilizador escolhe um plano pago, a aplicação garante primeiro que o cliente local existe e depois garante que existe também um cliente correspondente na Stripe. Se o cliente Stripe já existir, ele é reutilizado. Se não existir, é criado e o identificador volta a ser salvo no banco de dados local.

Depois disso, o checkout é criado com base no identificador de preço da Stripe associado ao plano escolhido no banco. Assim, a relação entre plano local e preço Stripe fica centralizada e controlada.

## Sincronização da assinatura paga

Depois que a compra é concluída na Stripe, a assinatura não fica apenas no sistema de cobrança externo. A aplicação sincroniza o resultado de volta para o banco de dados local por meio dos eventos da Stripe.

Quando chegam eventos relevantes da subscrição, o sistema atualiza ou cria o registo local da assinatura paga com:

- plano associado
- estado da assinatura
- data de início e fim do período atual
- informação de cancelamento no fim do período
- vínculo entre cliente local e cliente Stripe

Isso é importante porque a aplicação não depende apenas de consultar a Stripe em tempo real para decidir o acesso. Ela mantém um espelho local do estado comercial, o que torna a experiência mais rápida e deixa o controlo de acesso concentrado no próprio sistema.

Quando uma assinatura paga entra num estado considerado válido para continuidade comercial, o sistema também evita duplicidade de assinaturas ativas locais concorrentes para o mesmo utilizador.

## O que a app mostra ao utilizador

A aplicação usa o estado local da subscrição para mostrar ao utilizador:

- plano atual
- tipo de cobrança
- preço associado ao plano
- estado da assinatura
- indicação de cancelamento no fim do período
- dados de cobrança

Se o utilizador tiver uma assinatura paga válida, a conta passa a mostrar os elementos de gestão de billing. Se o utilizador estiver apenas no plano free, a conta mostra o estado gratuito e não expõe o fluxo de gestão de cobrança paga como se houvesse uma assinatura ativa.

## Gestão de billing após a compra

Para clientes pagos, existe um portal de billing da Stripe acessível a partir da conta. Esse portal é disponibilizado apenas quando a conta já tem estado comercial pago e um cliente Stripe associado.

Na configuração atual, esse portal permite principalmente:

- ver histórico de faturas
- atualizar método de pagamento
- cancelar a assinatura no fim do período vigente

Isso significa que o cancelamento não interrompe o período já pago. Ele apenas impede a próxima renovação. Enquanto o período atual não termina, a assinatura continua com o estado comercial correspondente.

## Relação entre subscrição paga e acesso ao produto

O acesso ilimitado ao extrator depende de a conta ter uma subscrição paga ativa no estado local. Enquanto esse estado estiver ativo, o sistema deixa de aplicar o limite gratuito.

Se não houver uma assinatura paga ativa, a conta volta a ser tratada pelo modelo free e o contador de uso gratuito passa a ser a referência para permitir ou bloquear novas análises.

Na prática, isso cria uma regra simples:

- conta com assinatura ativa: acesso ilimitado
- conta sem assinatura ativa: acesso dentro do limite gratuito

## Persistência do uso gratuito mesmo após apagar conta

Existe uma proteção adicional para evitar que o utilizador apague a conta e recrie outra apenas para reiniciar o contador gratuito.

Quando a conta é apagada, o sistema guarda uma marca de histórico associada ao email, de forma protegida, com o total de uso gratuito já consumido. Se o mesmo email voltar a criar conta e concluir a verificação, a aplicação tenta restaurar esse consumo anterior para a nova conta.

Com isso, o utilizador não perde o histórico comercial relevante do plano free e também não consegue resetar artificialmente o benefício gratuito apenas recriando a conta.

## Comportamento atual ao apagar conta

Ao apagar a conta, a aplicação remove os registos locais do cliente, das subscrições locais e do log de uso, preservando apenas a informação necessária para possível restauração do consumo gratuito no futuro.

Um ponto importante do comportamento atual é que a remoção da conta local não executa automaticamente o cancelamento da assinatura ativa na Stripe. Ou seja, o estado comercial interno é limpo, mas a assinatura externa não é encerrada por esse fluxo. Comercialmente, isso significa que o cancelamento da subscrição deve acontecer no fluxo de billing apropriado, e não apenas na eliminação da conta local.

## Resumo do conceito aplicado

O conceito implementado é o de um modelo híbrido em que a Stripe cuida da cobrança, mas o banco de dados da aplicação é a fonte de verdade operacional para o estado comercial do utilizador dentro do produto.

O plano free é automático para utilizadores autenticados, possui limite de uso por conta e grava esse consumo no banco de dados. O plano paid é carregado dinamicamente a partir da configuração dos planos no banco, usa os identificadores de preço da Stripe também guardados no banco, abre checkout recorrente e depois sincroniza a assinatura de volta para a base local.

Assim, a app consegue:

- mostrar preços dinâmicos sem hardcode
- diferenciar claramente free e paid
- limitar o uso gratuito por conta
- conceder acesso ilimitado para assinaturas ativas
- guardar no banco os dados comerciais e de billing do utilizador
- manter o estado da subscrição sincronizado entre app e Stripe
