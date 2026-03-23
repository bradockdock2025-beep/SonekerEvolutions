import type { SectionId } from '@/lib/schema'
import type { Language } from '@/data/locales'

// ── Language configuration ────────────────────────────────────────────────────

const LANGUAGE_NAMES: Record<Language, string> = {
  pt: 'Português de Portugal',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
}

// ── Section badge names per language ─────────────────────────────────────────

const SECTION_BADGES: Record<Language, Record<SectionId, string>> = {
  pt: {
    resumo:      'Resumo Executivo',
    conceitual:  'Conhecimento Conceitual',
    tecnico:     'Conhecimento Técnico',
    estrategico: 'Conhecimento Estratégico',
    analitico:   'Conhecimento Analítico',
    contextual:  'Conhecimento Contextual',
    pragmatico:  'Conhecimento Pragmático',
    reflexivo:   'Conhecimento Reflexivo',
    citacoes:    'Citações e Frases-Chave',
    derivado:    'Conhecimento Derivado',
    validacao:   'Validação e Evidências',
    marketing:   'Marketing e Distribuição',
    negocio:     'Modelo de Negócio',
    ferramentas: 'Tecnologia e Ferramentas',
    mentalidade: 'Mentalidade Empreendedora',
    erros:       'Erros Comuns',
    playbook:    'Playbook de Lições',
    contextos:   'Contextos Importantes',
    vocabulario: 'Vocabulário',
    conceitos:   'Conceitos-Chave',
    perguntas:   'Perguntas e Respostas',
  },
  en: {
    resumo:      'Executive Summary',
    conceitual:  'Conceptual Knowledge',
    tecnico:     'Technical Knowledge',
    estrategico: 'Strategic Knowledge',
    analitico:   'Analytical Knowledge',
    contextual:  'Contextual Knowledge',
    pragmatico:  'Practical Knowledge',
    reflexivo:   'Reflective Knowledge',
    citacoes:    'Quotes & Key Phrases',
    derivado:    'Derived Knowledge',
    validacao:   'Validation & Evidence',
    marketing:   'Marketing & Distribution',
    negocio:     'Business Model',
    ferramentas: 'Technology & Tools',
    mentalidade: 'Entrepreneurial Mindset',
    erros:       'Common Mistakes',
    playbook:    'Lessons Playbook',
    contextos:   'Important Contexts',
    vocabulario: 'Vocabulary',
    conceitos:   'Key Concepts',
    perguntas:   'Questions & Answers',
  },
  fr: {
    resumo:      'Résumé Exécutif',
    conceitual:  'Connaissance Conceptuelle',
    tecnico:     'Connaissance Technique',
    estrategico: 'Connaissance Stratégique',
    analitico:   'Connaissance Analytique',
    contextual:  'Connaissance Contextuelle',
    pragmatico:  'Connaissance Pratique',
    reflexivo:   'Connaissance Réflexive',
    citacoes:    'Citations et Phrases-Clés',
    derivado:    'Connaissance Dérivée',
    validacao:   'Validation et Preuves',
    marketing:   'Marketing et Distribution',
    negocio:     "Modèle d'Affaires",
    ferramentas: 'Technologie et Outils',
    mentalidade: 'Mentalité Entrepreneuriale',
    erros:       'Erreurs Courantes',
    playbook:    'Manuel de Leçons',
    contextos:   'Contextes Importants',
    vocabulario: 'Vocabulaire',
    conceitos:   'Concepts-Clés',
    perguntas:   'Questions et Réponses',
  },
  de: {
    resumo:      'Zusammenfassung',
    conceitual:  'Konzeptuelles Wissen',
    tecnico:     'Technisches Wissen',
    estrategico: 'Strategisches Wissen',
    analitico:   'Analytisches Wissen',
    contextual:  'Kontextuelles Wissen',
    pragmatico:  'Praktisches Wissen',
    reflexivo:   'Reflexives Wissen',
    citacoes:    'Zitate & Schlüsselsätze',
    derivado:    'Abgeleitetes Wissen',
    validacao:   'Validierung & Belege',
    marketing:   'Marketing & Vertrieb',
    negocio:     'Geschäftsmodell',
    ferramentas: 'Technologie & Werkzeuge',
    mentalidade: 'Unternehmerisches Mindset',
    erros:       'Häufige Fehler',
    playbook:    'Lektionen-Playbook',
    contextos:   'Wichtige Kontexte',
    vocabulario: 'Vokabular',
    conceitos:   'Schlüsselkonzepte',
    perguntas:   'Fragen & Antworten',
  },
}

// ── Section descriptions (internal AI instructions — language-agnostic) ───────

const SECTION_DESC: Record<SectionId, { category: string; description: string }> = {
  resumo:      { category: 'concept',   description: 'Central thesis, what was presented and the main value of the content.' },
  conceitual:  { category: 'framework', description: 'The 2-3 central frameworks/ideas that structure the content.' },
  tecnico:     { category: 'concept',   description: 'Technical details, implementations, protocols, specifications or requirements.' },
  estrategico: { category: 'framework', description: 'Strategic approaches, positioning, decision-making and planning.' },
  analitico:   { category: 'insight',   description: 'Critical analysis, comparison of approaches, trade-offs and evaluations.' },
  contextual:  { category: 'concept',   description: 'Historical, cultural, market or industry context needed to understand the topic.' },
  pragmatico:  { category: 'framework', description: 'How to apply in practice — concrete steps, workflows and implementation guides.' },
  reflexivo:   { category: 'insight',   description: 'Deep questions for reflection, alternative perspectives and cross-domain connections.' },
  citacoes:    { category: 'insight',   description: 'The most memorable and impactful quotes (literal when possible).' },
  derivado:    { category: 'concept',   description: 'Implicit conclusions, trends and recommendations not stated directly.' },
  validacao:   { category: 'framework', description: 'Data, real cases, studies and concrete examples that support the claims.' },
  marketing:   { category: 'idea',      description: 'Marketing strategies, customer acquisition, channels and growth.' },
  negocio:     { category: 'framework', description: 'Value proposition, revenue streams, cost structure and partnerships.' },
  ferramentas: { category: 'concept',   description: 'Technologies, platforms, tools and technical stacks mentioned.' },
  mentalidade: { category: 'insight',   description: 'Mindset, beliefs, principles and fundamental attitudes of the entrepreneur.' },
  erros:       { category: 'idea',      description: 'Typical pitfalls, anti-patterns and what to avoid to not fail.' },
  playbook:    { category: 'idea',      description: 'Top lessons, implementation order and quick wins.' },
  contextos:   { category: 'idea',      description: 'When to apply, when not to apply, prerequisites and limitations.' },
  vocabulario: { category: 'vocab',     description: 'Domain-specific technical terms with contextual definitions.' },
  conceitos:   { category: 'concept',   description: 'The 2-3 fundamental concepts with precise definitions and importance.' },
  perguntas:   { category: 'vocab',     description: 'The 4-5 most important questions from the content with complete answers.' },
}

// ── System prompt builder (niche-aware + language-aware) ─────────────────────

export function buildSystemPrompt(
  niche: string,
  nicheDisplayName: string,
  coreSections: SectionId[],
  blockedSections: SectionId[],
  language: Language = 'pt'
): string {
  const badges = SECTION_BADGES[language]
  const langName = LANGUAGE_NAMES[language]

  const coreList = coreSections
    .map(id => {
      const desc = SECTION_DESC[id]
      return `  - id:"${id}" badge:"${badges[id]}" category:"${desc.category}"\n    ${desc.description}`
    })
    .join('\n')

  const blockedList = blockedSections.length
    ? `\n## BLOCKED SECTIONS (do not generate for this niche)\n${blockedSections.map(id => `  - ${id} (${badges[id]})`).join('\n')}`
    : ''

  return `You are the Soneker analysis engine — a system specialized in transforming YouTube video transcripts into structured knowledge architectures.

## DETECTED NICHE
${nicheDisplayName} (${niche})
Adapt all content to the context, vocabulary and expectations of this niche.

## GENERAL RULES
- Always respond in ${langName}
- The "body" field of each card is simple HTML — use <mark> to highlight key terms:
  - <mark>term</mark> → purple highlight (important concept)
  - <mark class="mt">term</mark> → green highlight (framework/method)
  - <mark class="ma">term</mark> → amber highlight (insight/discovery)
- Maximum 3 marks per body. The body has 1-3 sentences. The deepPanel expands in detail.
- Be precise, concrete and faithful to the transcript. DO NOT invent content not present.

## ANTI-INVENTION RULES
- DO NOT create strategies, tools or frameworks not explicitly in the transcript
- DO NOT transform religious content into business strategies
- DO NOT invent marketing if the video is not about marketing
- DO NOT invent business models if the video does not discuss them
- Extract ONLY what is actually in the transcript

## CORE SECTIONS (mandatory for this niche — generate all)
${coreList}
${blockedList}

## VOCABULARY
Extract 5-8 domain-specific technical terms:
- Clear and contextualized definition (1-2 sentences)
- 3 application/importance points

## CONCEPTUAL MAP
Extract 6-10 concepts for the knowledge map:
- 1 central concept (isRoot: true) — the main theme
- 5-9 related concepts with explicit connections
- connectionLabels: how each concept relates ("uses", "leads to", "validates", "activates", "confirms", "generates", "requires", "implies")
- For each node: short definition (1 sentence) and 2-3 keyPoints`
}

// ── JSON Schema for Claude tool_use ─────────────────────────────────────────

export const TOOL_SCHEMA = {
  name: 'extract_knowledge_architecture',
  description: 'Extract a complete knowledge architecture from a YouTube video transcript.',
  input_schema: {
    type: 'object' as const,
    required: ['videoTitle', 'niche', 'cards', 'vocabulary', 'mapConcepts'],
    properties: {
      videoTitle: { type: 'string' },
      niche: { type: 'string', description: 'Content niche display name' },
      cards: {
        type: 'array',
        minItems: 10,
        maxItems: 22,
        items: {
          type: 'object',
          required: ['id', 'section', 'category', 'badge', 'name', 'body', 'tags', 'deepPanel'],
          properties: {
            id: { type: 'string' },
            section: {
              type: 'string',
              enum: [
                'resumo', 'conceitual', 'tecnico', 'estrategico', 'analitico',
                'contextual', 'pragmatico', 'reflexivo', 'citacoes', 'derivado',
                'validacao', 'marketing', 'negocio', 'ferramentas', 'mentalidade',
                'erros', 'playbook', 'contextos', 'vocabulario', 'conceitos', 'perguntas',
              ],
            },
            category: { type: 'string', enum: ['concept', 'framework', 'insight', 'vocab', 'idea'] },
            badge: { type: 'string' },
            name: { type: 'string' },
            body: { type: 'string', description: 'HTML with <mark>, <mark class="mt">, <mark class="ma"> for key terms' },
            tags: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 6 },
            deepPanel: {
              type: 'object',
              required: ['title', 'rows'],
              properties: {
                title: { type: 'string' },
                rows: {
                  type: 'array',
                  minItems: 2,
                  maxItems: 6,
                  items: {
                    type: 'object',
                    required: ['label'],
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'string' },
                      tags: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      vocabulary: {
        type: 'array',
        minItems: 4,
        maxItems: 10,
        items: {
          type: 'object',
          required: ['term', 'definition', 'points'],
          properties: {
            term: { type: 'string' },
            definition: { type: 'string' },
            points: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
          },
        },
      },
      mapConcepts: {
        type: 'array',
        minItems: 5,
        maxItems: 12,
        items: {
          type: 'object',
          required: ['id', 'label', 'category'],
          properties: {
            id: { type: 'string' },
            label: { type: 'string', description: 'Short label (1-3 words) for the node' },
            category: { type: 'string', enum: ['concept', 'framework', 'insight', 'vocab', 'idea', 'central'] },
            isRoot: { type: 'boolean' },
            connections: { type: 'array', items: { type: 'string' } },
            connectionLabels: { type: 'object', additionalProperties: { type: 'string' } },
            definition: { type: 'string' },
            keyPoints: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
}
