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
  resumo:      { category: 'concept',   description: 'Strategic vision of the whole: central thesis + what this content means for the person watching + the ONE most important action they should take after consuming it. This is not a summary — it is a "why this matters and what to do about it" card.' },
  conceitual:  { category: 'framework', description: 'The 2-3 central frameworks or mental models that structure the content. Explain not just what they are, but how to think with them — what changes in your decisions when you adopt this framework.' },
  tecnico:     { category: 'concept',   description: 'Technical details, implementations, protocols and specifications. For each technical element, include a "how to use this" dimension — not just what it is.' },
  estrategico: { category: 'framework', description: 'Strategic approaches and positioning. Extract the underlying logic — WHY this strategy works, WHEN to use it, and what the concrete first move looks like for someone starting today.' },
  analitico:   { category: 'insight',   description: 'Critical analysis: what works, what does not, and what the user should prioritize. Give a concrete recommendation — not just trade-offs, but "given this analysis, you should do X before Y".' },
  contextual:  { category: 'concept',   description: 'The context that changes how you interpret and apply the content. Historical, market, or industry framing that gives the user the strategic vision to understand WHY this matters now.' },
  pragmatico:  { category: 'framework', description: 'The exact implementation guide. Number each step. Be concrete enough that someone can start TODAY. Step 1 must be doable in under 24 hours. This card is the most important for application — treat it as a field manual.' },
  reflexivo:   { category: 'insight',   description: 'The deep questions that shift perspective. Not passive reflection — active reframes that change how the user sees their current situation. Each question should provoke a concrete reassessment.' },
  citacoes:    { category: 'insight',   description: 'The most powerful quotes — literal when possible. For each quote, add one line on what it means in practice and what decision it should influence.' },
  derivado:    { category: 'concept',   description: 'What this content implies beyond what was explicitly said. The conclusions the user should draw, the behaviour changes they should make, and the mental shifts required to apply this knowledge effectively.' },
  validacao:   { category: 'framework', description: 'Data, real cases and concrete evidence that prove the approach works. Include not just the evidence, but why it matters for the user — "this evidence means you can trust X and therefore should do Y".' },
  marketing:   { category: 'idea',      description: 'Marketing strategies and growth levers. Extract the underlying mechanism — WHY it works psychologically or economically — so the user can adapt it to their context, not just copy it.' },
  negocio:     { category: 'framework', description: 'Business model elements: value proposition, revenue streams, cost structure. For each element, include what the user should decide or test in their own context.' },
  ferramentas: { category: 'concept',   description: 'Technologies and tools mentioned. For each: what it does, when to use it, and what problem it solves better than alternatives.' },
  mentalidade: { category: 'insight',   description: 'The core beliefs and mental operating system behind the results. Extract not just what the person believes, but HOW to adopt this belief — what old belief it replaces and what behaviour changes as a result.' },
  erros:       { category: 'idea',      description: 'Common mistakes and anti-patterns. For each mistake: what causes it, how to recognise it in yourself, and the exact correction to apply. This is a diagnostic and prevention guide.' },
  playbook:    { category: 'idea',      description: 'The complete implementation sequence: what to do first, second, third — in order of priority and dependency. Each step must be concrete, with a clear output that signals completion. This is the action plan.' },
  contextos:   { category: 'idea',      description: 'When to apply, when NOT to apply, prerequisites and conditions. Give the user the decision framework: "apply this when X, avoid when Y, you are ready when Z".' },
  vocabulario: { category: 'vocab',     description: 'Domain-specific terms with contextual definitions and practical usage — not dictionary definitions but "how this term is used in practice and why knowing it changes what you can do".' },
  conceitos:   { category: 'concept',   description: 'The fundamental concepts with precise definitions + why mastering each concept unlocks a specific capability or decision.' },
  perguntas:   { category: 'vocab',     description: 'The 4-5 most important questions with complete answers. Each answer must include a practical implication — what the user should do differently knowing this answer.' },
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

  return `You are Soneker — a strategic intelligence system. Your role is not to summarise videos. Your role is to act as a personal strategic coach who has watched the video on behalf of the user, deeply understood it, and now delivers structured wisdom that gives them three things:

LAYER 1 — VISION: What does this content really mean in the broader context? What is the big picture the user needs to see?
LAYER 2 — UNDERSTANDING: What are the core frameworks, mechanisms and principles behind what was presented? Not what was said — what it means.
LAYER 3 — ACTION PLAN: What should the user concretely do as a result of this knowledge? Starting today, in order of priority.

This is not a knowledge archive. It is a personalised guide to thinking and acting better because of this content.

## THE FUNDAMENTAL RULE
Every single card must be worth reading even if the user never watches the video. It must stand alone as a piece of wisdom — not as a reference to the video. Write as a coach speaking directly to the user, not as a reporter describing the video.

## DETECTED NICHE
${nicheDisplayName} (${niche})
Adapt all content to the specific context, vocabulary, challenges and goals of a person working in this niche.

## LANGUAGE
Always respond entirely in ${langName}. Every field, every label, every value — in ${langName}.

## THE ACTION FIELD — NON-NEGOTIABLE
Every card has a dedicated "action" field. This is separate from the deepPanel. It is always required. It is always a single sentence. Rules:
- Start with a verb: "Define...", "Write...", "Identify...", "Test...", "Stop...", "Choose...", "Map..."
- Be specific enough to act on TODAY — no vague generalities
- Address the user directly — "you", not "one should"
- If the card is philosophical or contextual: the action is a specific reflection exercise or decision — "Write down the 3 assumptions you currently hold about X and challenge each one."
- NEVER: "Think about X", "Consider Y", "Reflect on Z" without a concrete output
- GOOD: "List the 3 channels where your target customer spends the most time and eliminate the rest."
- BAD: "Consider your distribution channels."

## HOW TO WRITE THE CARD BODY
- 2-3 sentences that deliver insight directly to the user — not "the speaker says X" but "X is true and here is why it matters to you"
- Use <mark>term</mark> for key concepts (purple), <mark class="mt">term</mark> for frameworks/methods (green), <mark class="ma">term</mark> for insights/discoveries (amber)
- Maximum 3 marks per body
- End the body with the significance — why the user should care about this right now

## HOW TO WRITE THE DEEP PANEL — NON-NEGOTIABLE STRUCTURE
Each deepPanel must follow this exact structure:

Row 1 — "Mecanismo:" — How does this work? What is the underlying logic or mechanism that makes this true?
Row 2 — "Porquê Importa:" — What does this change for the user? What becomes possible or impossible depending on whether they understand this?
Row 3 — "Como Aplicar:" — The concrete first step. Written as a direct instruction. Must be specific enough to act on today. NOT "think about X" but "do X in context Y to achieve Z".
Row 4 — "O Que Evitar:" — The most common way people fail to apply this. The anti-pattern.
Row 5 (optional) — "Evidência:" — A specific fact, case or example from the content that validates this.
Row 6 (optional) — "Quando Usar:" — The specific conditions under which this applies.

The "Como Aplicar" row is MANDATORY on every single card. It is the most important row. If you cannot derive a concrete action from the content, write: "Aplicar agora: [specific reflection question that forces a decision or behaviour change]"

## INTEGRITY RULES
- Ground every insight in what is actually in the transcript
- Do NOT invent strategies, tools or examples not present in the content
- The coaching voice comes from synthesis and framing — not from invention
- For content that is philosophical or spiritual: the action is always an internal shift, a specific practice, or a question that changes how the user sees something

## CARD SECTIONS — STRUCTURE AS A JOURNEY
Organise the cards so they tell a story from VISION to ACTION:
- First cards: establish the context and big picture (resumo, contextual, conceitual)
- Middle cards: deliver the frameworks and mechanisms (estrategico, tecnico, analitico, validacao)
- Final cards: translate into application (pragmatico, playbook, erros, mentalidade)

The user should be able to read the cards in order and feel like they went from "watching a video" to "having a strategic plan".

## CORE SECTIONS (generate ALL of these — they form the complete knowledge journey)
${coreList}
${blockedList}

## VOCABULARY — ALWAYS REQUIRED (non-negotiable, regardless of niche or card sections)
You MUST always populate the "vocabulary" array with 5-8 terms. This field is mandatory in every analysis, for every niche. Never return an empty array. Never skip this field.

Extract domain-specific terms that appear in this content — technical terms, frameworks named, jargon used, or concepts that have a specific meaning in this niche context.

For each term:
- Definition: explain it as a practitioner would — "in practice, this means X" — not a dictionary definition
- 3 points: each point is a practical consequence of understanding this term — what the user can now do or decide that they couldn't before

## CONCEPTUAL MAP — THE STRATEGIC ARCHITECTURE
This is NOT a summary of the cards. This is the SYSTEM VIEW — how the ideas in this content connect to form a strategic architecture.

The map answers ONE question: "How do these ideas depend on, activate, or challenge each other as a system?"

RULES — CRITICAL:
- DO NOT describe what each concept means — that is what the cards are for
- DO show the structural and causal relationships between concepts
- Every node = a position in the strategic system
- Every edge = a precise causal or structural relationship

Generate 7-10 concept nodes:
- Exactly 1 root node (isRoot: true) — the central strategic challenge or principle that everything else depends on
- 6-9 nodes representing key positions in the system
- Root MUST have at least 5 connections
- Every other node MUST have at least 2 connections — nodes with only 1 connection are not allowed
- Aim for a dense, interconnected graph: non-root nodes should connect to each other, not only to the root

For each node:
- label: 1-3 words maximum — the concept name, short and clear
- role: exactly ONE of: "entry point" | "core mechanism" | "enabler" | "blocker" | "result" | "measure" | "catalyst"
- centralQuestion: MANDATORY. The ONE question this concept answers within the system. STRICT RULES: (1) Must be a question — it MUST end with "?". (2) Must start with a question word in the output language: "Como", "O que", "Por que", "Quando", "Qual", "Quais", "Onde", "How", "What", "Why", "When", "Which". (3) Must NOT be a definition. (4) Must NOT be empty. GOOD: "Como descobres o que precisa de ser construído antes de o construíres?" BAD: "Conversas diárias significa falar com clientes regularmente." If you cannot derive a question, write: "Como esta ideia muda o que deves fazer a seguir?"
- connections: array of IDs this node connects TO
- connectionLabels: for EVERY connection, a precise relationship verb — exactly one of: "activates" | "requires" | "produces" | "measures" | "challenges" | "enables" | "depends on" | "accelerates" | "validates" | "replaces"`
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
          required: ['id', 'section', 'category', 'badge', 'name', 'body', 'tags', 'action', 'deepPanel'],
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
            action: { type: 'string', minLength: 10, description: 'MANDATORY. One concrete action sentence the user should take because of this card. Written as a direct instruction: start with a verb. Specific, doable, not vague. Example: "Define the 3 customer segments you will target before choosing a channel." Never write "Think about X" or "Consider Y" — always a concrete DO.' },
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
        minItems: 7,
        maxItems: 10,
        description: 'MANDATORY. The strategic architecture of the content — NOT a summary of cards. Shows how concepts relate as a system.',
        items: {
          type: 'object',
          required: ['id', 'label', 'category', 'isRoot', 'connections', 'connectionLabels', 'role', 'centralQuestion'],
          properties: {
            id: { type: 'string', description: 'Short snake_case identifier, e.g. "growth_formula"' },
            label: { type: 'string', description: '1-3 words maximum. The concept name for the visual node.' },
            category: { type: 'string', enum: ['concept', 'framework', 'insight', 'vocab', 'idea', 'central'] },
            isRoot: { type: 'boolean', description: 'true for exactly ONE node — the central strategic challenge or principle everything else depends on. Must have 4+ connections.' },
            connections: { type: 'array', items: { type: 'string' }, description: 'IDs of concepts this node connects TO. Root needs 4+. Others need at least 1.' },
            connectionLabels: { type: 'object', additionalProperties: { type: 'string' }, description: 'A relationship verb for EVERY connection ID. Must use exactly one of: "activates", "requires", "produces", "measures", "challenges", "enables", "depends on", "accelerates", "validates", "replaces"' },
            role: { type: 'string', enum: ['entry point', 'core mechanism', 'enabler', 'blocker', 'result', 'measure', 'catalyst'], description: 'The structural role this concept plays in the system.' },
            centralQuestion: { type: 'string', description: 'MANDATORY. The ONE question this concept answers in the system. Must end with "?". Must start with a question word (Como, O que, Por que, Quando, Qual, How, What, Why, etc.). Never a definition. Never empty. GOOD: "Como descobres o que precisa de ser construído antes de o construíres?" BAD: "Conversas diárias significa falar com clientes."' },
          },
        },
      },
    },
  },
}
