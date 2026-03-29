Excelente questão — e tens razão, é um problema real de design.

O que os Cards já fazem:
Cada card explica um conceito isolado — o que é, como funciona, o que fazer.

O que o Knowledge Map deve fazer de forma ÚNICA:
Mostrar o sistema — como os conceitos se relacionam entre si, não o que cada um significa.

O Map deve responder a uma única pergunta:

"Como é que estas ideias se conectam para formar um sistema de pensamento?"

O que cada nó do mapa deve conter (diferente dos cards):

Campo	O que mostrar
Label	Nome curto do conceito (1-3 palavras)
Posição no sistema	"É o ponto de entrada", "É o resultado final", "É o bloqueador"
Relação com os vizinhos	"Activa X", "Requer Y", "Produz Z", "Contradiz W"
A pergunta central	A única pergunta que este conceito responde no contexto do sistema
O que as arestas (ligações) devem mostrar:
Não apenas linhas — devem ter labels de relação precisos:

"activa" → este conceito desbloqueia o próximo
"requer" → sem isto, aquilo não funciona
"produz" → o resultado directo
"contradiz" → tensão entre os dois
"mede" → como sabes que o outro está a funcionar
Conclusão prática:

O Map deve ser uma vista estratégica do sistema de conhecimento — não um resumo dos cards. O utilizador olha para o mapa e percebe a arquitectura do conteúdo. Depois vai aos cards para aprofundar cada peça.

Map = visão de helicóptero do sistema
Cards = mergulho em cada peça do sistema

Queres que actualize o prompt da Claude para gerar mapConcepts com este foco — relações, posição no sistema, pergunta central — em vez de duplicar o conteúdo dos cards?


Boa questão. A minha opinião com base no design:

O problema real: os nomes dos cards seguem o padrão "Conceito Principal — Subtítulo" ou "Termo: Descrição". O subtítulo é redundante no nó gráfico — é informação de detalhe.

A melhor solução: extrair apenas a parte antes do separador (—, :, ·). Isto preserva o nome significativo e elimina o subtítulo verbose sem cortar palavras a meio.

Exemplos:


O problema real não é só no texto — é que o nó não tem maxWidth definido, então labels longas expandem o nó infinitamente ou ficam cortadas. A solução profissional não é truncar mais agressivamente (perde-se significado), é deixar o texto fazer wrap até 2 linhas dentro de um nó com largura máxima controlada. É o que fazem Figma, Miro, e todas as ferramentas de grafos profissionais.



Zero erros. O novo Smart Vocabulary:

Cada termo num card expandível com borda roxa
Clica + → abre com definição completa + pontos práticos
Clica − → fecha
Funciona igual em desktop e mobile
Mostra o total de termos no header (8 termos)
Os pills antigos e o KnowledgeLens tooltip foram substituídos — mais limpo, mais consistente com o design geral dos cards