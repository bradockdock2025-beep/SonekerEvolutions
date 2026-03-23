import type { KnowledgeCard, VocabEntry, LibraryEntry, NodeData, AnalysisResult } from '@/types'

export const MOCK_CARDS: KnowledgeCard[] = [
  {
    id: 'resumo',
    section: 'resumo',
    category: 'concept',
    badge: 'Resumo Executivo',
    name: 'Tese Central',
    body: 'Um playbook detalhado de como <mark>David Park</mark> construiu um app de IA de $10 milhões anuais usando uma estratégia sistemática de vídeos curtos no TikTok e Instagram, focando em distribuição, conversão e retenção.',
    tags: ['Negócios / Finanças', 'Educação / Tutorial', 'Confiança 95%'],
    deepPanel: {
      title: 'Resumo Executivo',
      rows: [
        { label: 'Principal Conclusão', value: 'O marketing de influenciadores e conteúdo de formato curto podem gerar crescimento exponencial quando aplicados sistematicamente com pesquisa adequada, parcerias estratégicas e maximização de conteúdo viral.' },
        { label: 'Tipo de Conteúdo', value: 'Entrevista educativa/tutorial de negócios' },
        { label: 'Público-Alvo', value: 'Empreendedores, fundadores de startups, profissionais de marketing digital' },
        { label: 'Nível de Dificuldade', value: 'Intermediário a Avançado' },
        { label: 'Valor Estimado', value: 'Framework prático comprovado que gerou $10 milhões em receita anual' },
      ]
    }
  },
  {
    id: 'conceitual',
    section: 'conceitual',
    category: 'framework',
    badge: 'Conhecimento Conceitual',
    name: 'Fórmula de Crescimento — 3 Pilares',
    body: 'O crescimento de startup deve ser pensado em três pilares: <mark>Distribuição</mark> + <mark class="mt">Conversão</mark> + <mark class="ma">Retenção</mark> = crescimento sustentável. Mesmo dominando apenas um pilar, é possível construir um negócio lucrativo.',
    tags: ['Distribuição', 'Conversão', 'Retenção', 'Growth'],
    deepPanel: {
      title: 'Conhecimento Conceitual',
      rows: [
        { label: 'Ideia 1 — Fórmula de crescimento', value: 'Distribuição + Conversão + Retenção = crescimento sustentável. Mesmo dominando apenas um pilar é possível construir um negócio lucrativo.' },
        { label: 'Ideia 2 — Pesquisa de ingredientes', value: 'Entender profundamente quem são os utilizadores, o que assistem e porquê assistem. Economiza meses de iteração e aumenta significativamente as chances de viralização.' },
        { label: 'Ideia 3 — Viralidade verdadeira vs métricas superficiais', value: 'Viralidade real é infectar o público certo, não apenas obter views. 10.000 views do público certo vale mais que 1 milhão de views genéricas.' },
        { label: 'Princípios Subjacentes', value: 'Alinhamento de incentivos · Experimentação sistemática · Maximização de conteúdo que funciona · Pesquisa profunda de audiência' },
        { label: 'Frameworks Mentais', tags: ['Framework de 3 pilares de crescimento', 'Método ingredientes→exploração→maximização'] },
      ]
    }
  },
  {
    id: 'citacoes',
    section: 'citacoes',
    category: 'insight',
    badge: 'Citações e Frases-Chave',
    name: '3 Citações-Chave de David Park',
    body: '<mark class="ma">"Viralidade verdadeira é infectar as pessoas que você realmente queria que vissem seu conteúdo."</mark>',
    tags: ['Viral Marketing', 'Influenciadores', 'Maximização'],
    deepPanel: {
      title: 'Citações e Frases-Chave',
      rows: [
        { label: 'Citação 1', value: '"Viralidade verdadeira é infectar as pessoas que você realmente queria que vissem seu conteúdo." — Contexto: definindo o que realmente importa em viral marketing.' },
        { label: 'Citação 2', value: '"Você só precisa de um influenciador incrível para compensar todas as perdas dos 10 partnerships anteriores." — Contexto: encorajamento para persistir através das falhas iniciais.' },
        { label: 'Citação 3', value: '"Uma vez que você encontra um vídeo viral, pode basicamente extrair 10x ou até 100x as views iniciais." — Contexto: a importância de maximizar conteúdo que funciona.' },
        { label: 'Frases Memoráveis', tags: ['Framework dos 3 pilares', 'Pesquisa de ingredientes', 'Teto vs piso de performance', 'Criaturas de hábito'] },
      ]
    }
  },
  {
    id: 'analitico',
    section: 'analitico',
    category: 'vocab',
    badge: 'Conhecimento Analítico',
    name: 'Sequência: Pesquisa → Exploração → Maximização',
    body: 'O conteúdo segue uma lógica progressiva de 4 blocos. Começa nos fundamentos do framework, avança para pesquisa de audiência, estratégias de contacto com influenciadores e termina na maximização do conteúdo viral.',
    tags: ['4 Blocos', 'Progressivo', 'Accionável'],
    deepPanel: {
      title: 'Estrutura Narrativa',
      rows: [
        { label: 'Bloco 1 — Fundamentos do Framework', value: 'Introdução aos 3 pilares de crescimento com foco exclusivo em distribuição neste conteúdo.' },
        { label: 'Bloco 2 — Pesquisa de Ingredientes', value: 'Como pesquisar handles dos utilizadores, usar o algoritmo para encontrar influenciadores similares, e focar no potencial de teto vs consistência.' },
        { label: 'Bloco 3 — Estratégias de Contacto', value: 'Como abordar e negociar com influenciadores via DMs + emails, a necessidade de follow-ups e como demonstrar conhecimento genuíno do conteúdo deles.' },
        { label: 'Bloco 4 — Maximização de Conteúdo Viral', value: 'Como transformar sucesso em receita sustentável: criar séries de vídeos, múltiplas contas e tradução para outros idiomas.' },
        { label: 'Argumento 1', value: 'Pesquisa prévia economiza tempo. David enfatiza que entender a audiência evita meses de iteração — investir tempo em pesquisa inicial é crucial.' },
        { label: 'Argumento 2', value: 'Incentivos alinhados funcionam melhor. Pagamento baseado em performance vs antecipado — estruturar deals com incentivos de performance é mais eficaz.' },
      ]
    }
  },
  {
    id: 'derivado',
    section: 'derivado',
    category: 'concept',
    badge: 'Conhecimento Derivado',
    name: 'Conclusões, Recomendações e Tendências',
    body: 'Marketing de influenciador funciona melhor com <mark>relacionamentos de longo prazo</mark>. Autenticidade e personalização são cruciais para o sucesso. Consistência e persistência vencem talento natural.',
    tags: ['Conclusões', 'Tendências', 'Insights Ocultos'],
    deepPanel: {
      title: 'Conhecimento Derivado',
      rows: [
        { label: 'Conclusões Implícitas', value: 'Marketing de influenciador funciona melhor com relacionamentos de longo prazo · Autenticidade e personalização são cruciais · Consistência e persistência vencem talento natural.' },
        { label: 'Recomendações', value: 'Comece pequeno e teste sistematicamente · Invista mais tempo em pesquisa inicial · Construa relacionamentos genuínos com criadores de conteúdo.' },
        { label: 'Tendências Previstas', value: 'Crescimento de micro-influenciadores · Importância crescente de conteúdo autêntico · Algoritmos favorecendo engagement genuíno.' },
        { label: 'Insights Ocultos', tags: ['Contas pequenas podem superar contas grandes', 'Tradução de conteúdo multiplica alcance', 'Séries de vídeo são mais valiosas que vídeos únicos'] },
      ]
    }
  },
  {
    id: 'validacao',
    section: 'validacao',
    category: 'framework',
    badge: 'Validação e Evidências',
    name: 'Evidências Reais e Mensuráveis',
    body: 'Jenny AI: <mark>$10M anuais</mark>, 5M utilizadores. Série \'Point of View\': centenas de milhões de views, milhares de utilizadores pagos. Conta com <mark class="mt">48 seguidores superou conta com 55k</mark> em conversão real.',
    tags: ['Jenny AI', 'Point of View', 'Conversão real'],
    deepPanel: {
      title: 'Validação e Evidências',
      rows: [
        { label: 'Evidências Mencionadas', value: 'Jenny AI: $10M anuais, 5M utilizadores · Série \'Point of View\': centenas de milhões de views, milhares de utilizadores pagos · Conta com 48 seguidores superando conta com 55k em conversão real.' },
        { label: 'Como Verificar', value: 'Rastrear via códigos de cupom · Usar links UTM · Medir conversões reais vs métricas de vaidade.' },
        { label: 'Limitações e Alertas', value: 'Resultados podem variar por nicho · Requer investimento significativo de tempo · Taxa de rejeição alta no início.' },
        { label: 'Força das Afirmações', value: 'Forte — baseado em resultados reais mensuráveis e experiência prática comprovada de David Park com Jenny AI.' },
      ]
    }
  },
  {
    id: 'reflexivo',
    section: 'reflexivo',
    category: 'insight',
    badge: 'Conhecimento Reflexivo',
    name: '3 Perguntas Profundas para Reflexão',
    body: 'Como posso entender melhor a minha audiência além de métricas básicas? Que tipo de conteúdo realmente ressoa com o meu público específico? Como criar incentivos genuinamente alinhados com criadores?',
    tags: ['Reflexão', 'Perspectivas Alternativas', 'Conexões'],
    deepPanel: {
      title: 'Conhecimento Reflexivo',
      rows: [
        { label: 'Pergunta 1', value: 'Como posso entender melhor a minha audiência além de métricas básicas?' },
        { label: 'Pergunta 2', value: 'Que tipo de conteúdo realmente ressoa com o meu público específico?' },
        { label: 'Pergunta 3', value: 'Como posso criar incentivos genuinamente alinhados com criadores de conteúdo?' },
        { label: 'Conexões Não Exploradas', value: 'Relação entre cultura local e viralidade de conteúdo · Impacto de timing de postagem vs qualidade de conteúdo · Correlação entre autenticidade e performance de conversão.' },
        { label: 'Perspectivas Alternativas', tags: ['Visão do influenciador: como criar parcerias genuinamente valiosas', 'Visão da audiência: que conteúdo sponsored agrega valor real'] },
      ]
    }
  },
  {
    id: 'perguntas',
    section: 'perguntas',
    category: 'vocab',
    badge: 'Perguntas e Respostas',
    name: '5 Perguntas-Chave com Respostas Completas',
    body: 'Qual é o framework principal? Como fazer pesquisa inicial? Como estruturar deals? Como maximizar um viral? Quais os erros mais comuns com influenciadores?',
    tags: ['5 Q&A', 'Framework', 'Influenciadores', 'Erros'],
    deepPanel: {
      title: 'Perguntas e Respostas',
      rows: [
        { label: 'Q1 — Qual é o framework principal de crescimento de David Park?', value: 'O framework de 3 pilares: Distribuição (como utilizadores conhecem o produto), Conversão (como transformar interesse em vendas) e Retenção (como manter utilizadores pagando).' },
        { label: 'Q2 — Como fazer a pesquisa inicial de audiência e influenciadores?', value: 'Perguntar explicitamente aos utilizadores os seus handles do Instagram, ver quem eles seguem, criar uma conta nova seguindo esses influenciadores para o algoritmo entregar similares.' },
        { label: 'Q3 — Qual a melhor forma de estruturar deals com influenciadores?', value: 'Evitar pagar 100% antecipado, estruturar incentivos alinhados com performance (coupon codes, UTM links), negociar pacotes de múltiplos vídeos para reduzir custo por vídeo.' },
        { label: 'Q4 — Como maximizar um vídeo que viralizou?', value: 'Transformar em série com pequenas variações, postar 2x por semana por meses, criar múltiplas contas postando versões similares, traduzir para outros idiomas.' },
        { label: 'Q5 — Quais os erros mais comuns ao trabalhar com influenciadores?', value: 'Desistir após poucos emails sem resposta (normal ter 50%+ de não-resposta), pagar baseado em número de seguidores vs potencial de conversão, pagar 100% antecipado sem incentivos de performance.' },
      ]
    }
  },
  {
    id: 'contextos',
    section: 'contextos',
    category: 'idea',
    badge: 'Contextos Importantes',
    name: 'Quando Aplicar e Quando NÃO Aplicar',
    body: 'Aplicar quando: produto com <mark>audiência definida nas redes sociais</mark>, orçamentos limitados de marketing, produtos que podem ser demonstrados visualmente.',
    tags: ['Aplicabilidade', 'Pré-requisitos', 'Limitações'],
    deepPanel: {
      title: 'Contextos Importantes',
      rows: [
        { label: '✅ Quando Aplicar', value: 'Produtos com audiência definida nas redes sociais · Orçamentos limitados de marketing · Produtos que podem ser demonstrados visualmente.' },
        { label: '❌ Quando NÃO Aplicar', value: 'Produtos B2B muito técnicos · Audiências que não usam redes sociais · Quando não há recursos para experimentação constante.' },
        { label: 'Pré-requisitos', tags: ['Produto funcional', 'Entendimento básico de redes sociais', 'Capacidade de medir conversões'] },
      ]
    }
  },
  {
    id: 'vocabulario',
    section: 'vocabulario',
    category: 'vocab',
    badge: 'Vocabulário',
    name: '4 Termos Especializados',
    body: '<mark>UGC</mark> · <mark>UTM links</mark> · <mark>Shadowban</mark> · <mark class="mt">Teto vs Piso</mark> — os termos técnicos essenciais para dominar a estratégia de distribuição via influenciadores.',
    tags: ['UGC', 'UTM', 'Shadowban', 'Teto vs Piso'],
    deepPanel: {
      title: 'Vocabulário',
      rows: [
        { label: 'UGC — User Generated Content', value: 'Conteúdo criado por utilizadores ou criadores contratados para contas da marca. Contexto: usado para criar conteúdo consistente em contas próprias.' },
        { label: 'UTM Links', value: 'Links de rastreamento para medir conversões de influenciadores. Contexto: usado para alinhar incentivos e medir performance real de cada parceria.' },
        { label: 'Shadowban', value: 'Quando o algoritmo limita o alcance de uma conta sem avisar. Contexto: problema comum que pode exigir criação de novas contas para contornar.' },
        { label: 'Teto vs Piso', value: 'Potencial máximo (teto) vs performance mínima consistente (piso). Contexto: critério para avaliar influenciadores — David recomenda focar no potencial de teto.' },
      ]
    }
  },
  {
    id: 'conceitos',
    section: 'conceitos',
    category: 'concept',
    badge: 'Conceitos-Chave',
    name: '3 Conceitos Fundamentais',
    body: '<mark>Framework dos 3 Pilares</mark> — estrutura base do crescimento. <mark class="mt">Pesquisa de Ingredientes</mark> — evita meses de iteração. <mark class="ma">Maximização de Viral</mark> — multiplica ROI do que já funciona.',
    tags: ['3 Pilares', 'Pesquisa de Ingredientes', 'Maximização Viral'],
    deepPanel: {
      title: 'Conceitos-Chave',
      rows: [
        { label: 'Conceito 1 — Framework dos 3 Pilares', value: 'Distribuição, Conversão e Retenção como base do crescimento. Importância: estrutura fundamental para pensar growth de forma sistemática e não aleatória.' },
        { label: 'Conceito 2 — Pesquisa de Ingredientes', value: 'Pesquisa profunda da audiência antes de criar qualquer conteúdo. Importância: evita meses de iteração desnecessária e aumenta significativamente as chances de viralização.' },
        { label: 'Conceito 3 — Maximização de Viral', value: 'Transformar um sucesso em múltiplos sucessos através de séries. Importância: multiplica o ROI do conteúdo que já provou funcionar, sem custo de experimentação.' },
      ]
    }
  },
  {
    id: 'playbook',
    section: 'playbook',
    category: 'idea',
    badge: 'Playbook de Lições',
    name: 'Top Lições + Ordem de Implementação + Erros Comuns',
    body: '1. Pesquise a audiência antes de criar qualquer conteúdo. 2. Estruture deals com <mark class="mt">incentivos alinhados</mark>. 3. Transforme sucessos em séries replicáveis.',
    tags: ['Top Lições', 'Implementação', 'Erros Comuns', 'Ganhos Rápidos'],
    deepPanel: {
      title: 'Playbook de Lições',
      rows: [
        { label: 'Top 3 Lições', value: '1. Pesquise a sua audiência antes de criar qualquer conteúdo · 2. Estruture deals com incentivos alinhados · 3. Transforme sucessos em séries replicáveis.' },
        { label: 'Ordem de Implementação', value: 'Primeiro: pesquisar e entender a audiência · Segundo: testar sistematicamente diferentes abordagens · Terceiro: maximizar e escalar o que funciona.' },
        { label: 'Erro 1 — Pagar antecipado', value: 'Consequência: receber conteúdo de baixa qualidade e perder leverage. Prevenção: estruturar pagamentos baseados em performance.' },
        { label: 'Erro 2 — Focar em número de seguidores', value: 'Consequência: pagar caro por influenciadores que não convertem. Prevenção: avaliar potencial de teto e alinhamento com a audiência.' },
        { label: 'Erro 3 — Desistir após primeiras rejeições', value: 'Consequência: perder oportunidades de parcerias valiosas. Prevenção: preparar-se mentalmente para 50%+ de não-resposta — é normal.' },
        { label: 'Ganhos Rápidos', tags: ['Repostar mesmo conteúdo em todas as plataformas', 'Seguir influenciadores que a audiência segue', 'Oferecer parcerias em pacote para reduzir custo'] },
      ]
    }
  },
]

export const MOCK_VOCABULARY: VocabEntry[] = [
  { term: 'MVP', definition: 'Minimum Viable Product — versão mínima para testar a hipótese principal.', points: ['Reduz o tempo até validação', 'Foca no valor central do produto', 'Evita desperdício de recursos'] },
  { term: 'Product Market Fit', definition: 'Momento em que o produto encaixa tão bem que os clientes puxam.', points: ['Indicador de crescimento sustentável', 'Ponto de virada para escalar', 'Mede-se por retenção e recomendação'] },
  { term: 'Pivot', definition: 'Mudança estratégica baseada em dados reais, não em opinião.', points: ['Baseado em validated learning', 'Não é desistir — é ajustar', 'Requer coragem e dados'] },
  { term: 'Traction', definition: 'Evidência quantitativa de crescimento sustentável no mercado.', points: ['Valida o product-market fit', 'Atrai investidores e parceiros', 'Define o ritmo de escalabilidade'] },
  { term: 'Validated Learning', definition: 'Aprendizagem baseada em dados reais do mercado.', points: ['Substitui opiniões por evidências', 'Ciclos de Build-Measure-Learn', 'Base do método Lean Startup'] },
  { term: 'Churn', definition: 'Taxa de abandono de clientes num determinado período.', points: ['Métrica crítica de retenção', 'Churn alto = problema de produto', 'Mede a saúde do negócio'] },
  { term: 'Innovation Accounting', definition: 'Sistema de medição de progresso em startups em fase inicial.', points: ['Define métricas de crescimento', 'Baseado em milestones de aprendizagem', 'Alternativa a métricas de vaidade'] },
  { term: 'Customer Discovery', definition: 'Processo de validar que um problema real existe antes de construir.', points: ['Primeiro passo do Lean Startup', 'Entrevistas com potenciais clientes', 'Valida hipóteses de problema'] },
]

export const MOCK_LIBRARY: LibraryEntry[] = [
  {
    id: 'lean-startup',
    title: 'Lean Startup — Como validar ideias antes de construir',
    channel: 'Y Combinator',
    count: 7,
    tags: ['Concept', 'Framework', 'Insight'],
    thumbGradient: 'linear-gradient(135deg,#181426,#090912)',
  },
  {
    id: 'produtos-amados',
    title: 'Como construir produtos que as pessoas amam',
    channel: 'First Round Capital',
    count: 9,
    tags: ['Concept', 'Vocabulary', 'Idea'],
    thumbGradient: 'linear-gradient(135deg,#0d1a14,#080d0a)',
  },
  {
    id: 'growth-hacking',
    title: 'Growth hacking — estratégias que realmente funcionam',
    channel: 'Reforge',
    count: 11,
    tags: ['Framework', 'Insight', 'Idea'],
    thumbGradient: 'linear-gradient(135deg,#12100a,#1a1506)',
  },
]

export const MOCK_RESULT: AnalysisResult = {
  videoTitle: 'Lean Startup — Como validar ideias antes de construir',
  channel: 'Y Combinator',
  cards: MOCK_CARDS,
  vocabulary: MOCK_VOCABULARY,
  mapConcepts: [],
  mapNodes: [],
  mapEdges: [],
}

export const MAP_NODE_DATA: Record<string, NodeData> = {
  lean: {
    id: 'lean',
    title: 'Lean Startup',
    category: 'concept',
    definition: 'Metodologia para construir e lançar produtos com ciclos rápidos de validação, minimizando desperdício e maximizando aprendizagem.',
    points: ['Baseado no ciclo Build-Measure-Learn', 'Foca em hipóteses testáveis', 'Prioriza aprendizagem validada'],
    relatedTags: ['Eric Ries', 'Startup', 'Agile', 'MVP'],
  },
  mvp: {
    id: 'mvp',
    title: 'MVP',
    category: 'vocab',
    definition: 'Minimum Viable Product — a versão mais simples do produto que permite testar a hipótese central com utilizadores reais.',
    points: ['Reduz tempo até validação', 'Foca no valor essencial', 'Evita construir o que não é necessário'],
    relatedTags: ['Validação', 'Lean', 'Produto'],
  },
  bml: {
    id: 'bml',
    title: 'Build-Measure-Learn',
    category: 'framework',
    definition: 'O ciclo central do Lean Startup: construir um MVP, medir com dados reais, aprender e repetir.',
    points: ['Ciclo iterativo e contínuo', 'Minimiza o desperdício de recursos', 'Orienta decisões com dados'],
    relatedTags: ['Iteração', 'Métricas', 'Aprendizagem'],
  },
  pmf: {
    id: 'pmf',
    title: 'Product Market Fit',
    category: 'concept',
    definition: 'O momento em que o produto satisfaz as necessidades do mercado tão bem que o crescimento se torna orgânico.',
    points: ['Indicador de crescimento sustentável', 'Mede-se por retenção e recomendação', 'Ponto de viragem para escalar'],
    relatedTags: ['Crescimento', 'Retenção', 'Mercado'],
  },
  validation: {
    id: 'validation',
    title: 'Product Validation',
    category: 'framework',
    definition: 'Processo sistemático de confirmar que o produto resolve um problema real para um mercado real.',
    points: ['Baseado em dados, não opiniões', 'Inclui entrevistas e testes', 'Precede a construção completa'],
    relatedTags: ['Hipótese', 'Dados', 'Utilizadores'],
  },
  pivot: {
    id: 'pivot',
    title: 'Pivot',
    category: 'insight',
    definition: 'Mudança estratégica de direcção baseada em aprendizagem validada, preservando o que funciona.',
    points: ['Baseado em evidências reais', 'Não é desistir — é ajustar', 'Requer coragem e clareza'],
    relatedTags: ['Estratégia', 'Adaptação', 'Dados'],
  },
  growth: {
    id: 'growth',
    title: 'Growth',
    category: 'framework',
    definition: 'Crescimento sustentável e escalável alcançado após validar o product-market fit.',
    points: ['Requer PMF estabelecido', 'Combina os 3 pilares: D+C+R', 'Mede-se por métricas de negócio'],
    relatedTags: ['Escalar', 'PMF', 'Sustentável'],
  },
  traction: {
    id: 'traction',
    title: 'Traction',
    category: 'insight',
    definition: 'Evidência quantitativa de que o produto está a crescer de forma sustentável no mercado.',
    points: ['Valida o product-market fit', 'Atrai investidores', 'Define o ritmo de escala'],
    relatedTags: ['Métricas', 'Crescimento', 'Investimento'],
  },
}
