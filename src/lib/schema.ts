import { z } from 'zod'

const CategorySchema = z.enum(['concept', 'framework', 'insight', 'vocab', 'idea'])

// ── All valid section IDs ────────────────────────────────────────────────────
export const SECTION_IDS = [
  'resumo',        // Executive Summary
  'conceitual',    // Conceptual Knowledge
  'tecnico',       // Technical Knowledge
  'estrategico',   // Strategic Knowledge
  'analitico',     // Analytical Knowledge
  'contextual',    // Contextual Knowledge
  'pragmatico',    // Pragmatic Knowledge
  'reflexivo',     // Reflective Knowledge
  'citacoes',      // Quotes and Key Phrases
  'derivado',      // Derived Knowledge
  'validacao',     // Validation and Evidence
  'marketing',     // Marketing and Distribution
  'negocio',       // Business Model
  'ferramentas',   // Technology and Tools
  'mentalidade',   // Entrepreneurial Mindset
  'erros',         // Common Mistakes
  'playbook',      // Lessons Playbook
  'contextos',     // Important Contexts
  'vocabulario',   // Vocabulary
  'conceitos',     // Key Concepts
  'perguntas',     // Questions and Answers
] as const

export type SectionId = typeof SECTION_IDS[number]

export const SectionSchema = z.enum(SECTION_IDS)

// ── Card & vocabulary schemas ────────────────────────────────────────────────

const DeepRowSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const KnowledgeCardSchema = z.object({
  id: z.string(),
  section: SectionSchema,
  category: CategorySchema,
  badge: z.string(),
  name: z.string(),
  body: z.string(),
  tags: z.array(z.string()).min(1).max(6),
  action: z.string().min(10),   // MANDATORY: concrete action step, always present
  deepPanel: z.object({
    title: z.string(),
    rows: z.array(DeepRowSchema).min(2).max(6),
  }),
})

export const VocabEntrySchema = z.object({
  term:       z.string().catch(''),
  definition: z.string().catch(''),
  points:     z.array(z.string()).catch([]),
})

export const MapConceptSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(['concept', 'framework', 'insight', 'vocab', 'idea', 'central']),
  isRoot: z.boolean().default(false),
  connections: z.array(z.string()).default([]),
  connectionLabels: z.record(z.string(), z.string()).optional(),
  role: z.string().default('concept'),
  centralQuestion: z.string().default(''),
  // legacy
  definition: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
})

// ── Full analysis response ────────────────────────────────────────────────────

export const AnalysisResponseSchema = z.object({
  videoTitle: z.string(),
  niche: z.string(),
  cards: z.array(KnowledgeCardSchema).min(4).max(22),
  vocabulary: z.preprocess(
    val => {
      if (!Array.isArray(val) || val.length === 0) {
        console.error('[vocabulary] Claude returned invalid or empty vocabulary:', JSON.stringify(val))
      }
      return val
    },
    z.array(VocabEntrySchema).catch([]).transform(
      items => items.filter(v => v.term.length > 0)
    )
  ),
  mapConcepts: z.array(MapConceptSchema).catch([]),
})

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>
