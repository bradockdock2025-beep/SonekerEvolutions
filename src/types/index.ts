import type { SectionId } from '@/lib/schema'

export type { SectionId }

export type Screen = 'landing' | 'loading' | 'result' | 'library' | 'profile' | 'signin' | 'signup'

export type CardCategory = 'concept' | 'framework' | 'insight' | 'vocab' | 'idea'

export type DeepRow = {
  label: string
  value?: string
  tags?: string[]
}

export type KnowledgeCard = {
  id: string
  section: SectionId
  category: CardCategory
  badge: string
  name: string
  body: string         // HTML string with <mark> tags
  tags: string[]
  deepPanel: {
    title: string
    rows: DeepRow[]
  }
}

export type VocabEntry = {
  term: string
  definition: string
  points?: string[]
}

export type MapNode = {
  id: string
  label: string
  sublabel?: string
  type: CardCategory | 'central'
  x: number
  y: number
  width: number
  height: number
}

export type MapEdge = {
  from: string
  to: string
  label?: string
  color: string
  dashed?: boolean
}

export type MapConceptRaw = {
  id: string
  label: string
  category: CardCategory | 'central'
  isRoot?: boolean
  connections?: string[]
  connectionLabels?: Record<string, string>
  definition?: string
  keyPoints?: string[]
}

export type AnalysisResult = {
  videoId?: string
  videoTitle: string
  channel: string
  niche?: string       // Display name e.g. "Negócios / Finanças"
  nicheId?: string     // Type ID e.g. "business_finance" — for profile lookups
  thumbnailUrl?: string
  cards: KnowledgeCard[]
  vocabulary: VocabEntry[]
  mapConcepts: MapConceptRaw[]
  // legacy — always [] from API, kept only for AppContext spread compatibility
  mapNodes?: MapNode[]
  mapEdges?: MapEdge[]
}

export type LibraryEntry = {
  id: string
  title: string
  channel: string
  count: number
  tags: string[]
  thumbGradient: string
}

export type NodeData = {
  id: string
  title: string
  category: CardCategory | 'central'
  definition: string
  points: string[]
  relatedTags: string[]
}

export type KnowledgeLensData = {
  term: string
  definition: string
  points?: string[]
  x: number
  y: number
}

export type SmartSelectionData = {
  text: string
  title: string
  definition: string
  points: string[]
  x: number
  y: number
  phase: 'loading' | 'done'
}

export type DeepSearchResult = {
  term: string
  title: string
  summary: string
  points: string[]
  examples: string[]
  related: string[]
  phase: 'loading' | 'done' | 'error'
  error?: string
}
