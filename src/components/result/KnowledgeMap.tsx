'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useApp } from '@/context/AppContext'
import type { MapConceptRaw, NodeData } from '@/types'

// ── Category styling ────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { stroke: string; bg: string; text: string }> = {
  central:   { stroke: '#6c5fff', bg: '#16122e', text: '#edecf8' },
  concept:   { stroke: '#a89fff', bg: '#141428', text: '#edecf8' },
  framework: { stroke: '#2dd4a0', bg: '#0e1e1a', text: '#edecf8' },
  insight:   { stroke: '#f5a623', bg: '#1c1508', text: '#edecf8' },
  vocab:     { stroke: '#e879b8', bg: '#26102a', text: '#edecf8' },
  idea:      { stroke: '#e86060', bg: '#1e0f0f', text: '#edecf8' },
}

// ── Custom node component ────────────────────────────────────────────────────

function SonekerNode({ data }: NodeProps) {
  const nodeData = data as { label: string; sublabel?: string; category: string; isRoot?: boolean }
  const colors = CATEGORY_COLORS[nodeData.category] ?? CATEGORY_COLORS.concept

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        style={{
          background: colors.bg,
          border: `${nodeData.isRoot ? '1.8' : '1.2'}px solid ${colors.stroke}`,
          borderRadius: 8,
          padding: nodeData.isRoot ? '8px 14px' : '6px 12px',
          minWidth: nodeData.isRoot ? 100 : 80,
          maxWidth: nodeData.isRoot ? 160 : 140,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'filter 0.15s',
          boxShadow: nodeData.isRoot ? `0 0 12px ${colors.stroke}44` : 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.35)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)' }}
      >
        <div style={{
          fontFamily: 'var(--font-syne, Syne, sans-serif)',
          fontWeight: nodeData.isRoot ? 700 : 600,
          fontSize: nodeData.isRoot ? 11 : 10,
          color: colors.text,
          lineHeight: 1.35,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {nodeData.label}
        </div>
        {nodeData.sublabel && (
          <div style={{ fontSize: 7.5, color: colors.stroke, opacity: 0.7, marginTop: 2 }}>
            {nodeData.sublabel}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  )
}

const nodeTypes = { soneker: SonekerNode }

// ── Layout algorithm ─────────────────────────────────────────────────────────

function buildFlowData(concepts: MapConceptRaw[]): { nodes: Node[]; edges: Edge[] } {
  if (!concepts.length) return { nodes: [], edges: [] }

  const conceptMap = new Map(concepts.map(c => [c.id, c]))
  const root = concepts.find(c => c.isRoot) ?? concepts[0]

  // ── Assign levels via BFS from root ──────────────────────────────────────
  const levelMap = new Map<string, number>()
  const queue: string[] = [root.id]
  levelMap.set(root.id, 0)
  while (queue.length) {
    const current = queue.shift()!
    const concept = conceptMap.get(current)
    const currentLevel = levelMap.get(current) ?? 0
    for (const childId of concept?.connections ?? []) {
      if (!levelMap.has(childId) && conceptMap.has(childId)) {
        levelMap.set(childId, currentLevel + 1)
        queue.push(childId)
      }
    }
  }
  // Orphan concepts (not reachable from root) get level 2
  concepts.forEach(c => { if (!levelMap.has(c.id)) levelMap.set(c.id, 2) })

  // ── Group by level ────────────────────────────────────────────────────────
  const byLevel = new Map<number, string[]>()
  levelMap.forEach((level, id) => {
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(id)
  })

  // ── Position nodes ────────────────────────────────────────────────────────
  const SPACING_X = 210
  const SPACING_Y = 150
  const positionMap = new Map<string, { x: number; y: number }>()

  byLevel.forEach((ids, level) => {
    const totalW = (ids.length - 1) * SPACING_X
    ids.forEach((id, i) => {
      positionMap.set(id, { x: i * SPACING_X - totalW / 2, y: level * SPACING_Y })
    })
  })

  // ── Build nodes ───────────────────────────────────────────────────────────
  const nodes: Node[] = concepts.map(c => ({
    id: c.id,
    type: 'soneker',
    position: positionMap.get(c.id) ?? { x: 0, y: 0 },
    data: {
      label: c.label,
      category: c.category ?? 'concept',
      isRoot: c.isRoot ?? false,
      sublabel: c.isRoot ? 'conceito central' : c.category,
    },
  }))

  // ── Build edges (deduplicated) ────────────────────────────────────────────
  const edgeSet = new Set<string>()
  const edges: Edge[] = []
  const isRoot = (id: string) => id === root.id

  concepts.forEach(c => {
    (c.connections ?? []).forEach(targetId => {
      if (!conceptMap.has(targetId)) return
      const edgeKey = `${c.id}→${targetId}`
      if (edgeSet.has(edgeKey)) return
      edgeSet.add(edgeKey)
      const target = conceptMap.get(targetId)!
      const colors = CATEGORY_COLORS[target.category] ?? CATEGORY_COLORS.concept
      const label = c.connectionLabels?.[targetId]
      const isRootEdge = isRoot(c.id)
      edges.push({
        id: `e-${c.id}-${targetId}`,
        source: c.id,
        target: targetId,
        label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: colors.stroke, width: isRootEdge ? 12 : 10, height: isRootEdge ? 12 : 10 },
        style: { stroke: colors.stroke, strokeWidth: isRootEdge ? 1.2 : 0.9, strokeOpacity: isRootEdge ? 0.6 : 0.4, ...(isRootEdge ? {} : { strokeDasharray: '4 3' }) },
        labelStyle: { fontSize: isRootEdge ? 8 : 7.5, fill: '#40405a' },
        labelBgStyle: { fill: 'transparent' },
      })
    })
  })

  return { nodes, edges }
}

// ── Fallback: synthesise map from cards when mapConcepts is empty ─────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function shortLabel(name: string): string {
  // Remove subtitle after separators — keep only the primary concept name
  const primary = name.split(/\s*[—–:·]\s*/)[0].trim()
  // If still long, limit to 4 words
  const words = primary.split(' ')
  return words.length > 4 ? words.slice(0, 4).join(' ') : primary
}

const ROLE_BY_SECTION: Record<string, string> = {
  resumo:      'entry point',
  conceitual:  'core mechanism',
  estrategico: 'core mechanism',
  pragmatico:  'result',
  playbook:    'result',
  validacao:   'measure',
  analitico:   'measure',
  erros:       'blocker',
  contextos:   'blocker',
  derivado:    'catalyst',
  mentalidade: 'catalyst',
  marketing:   'enabler',
  negocio:     'enabler',
}

function synthesiseFromCards(cards: import('@/types').KnowledgeCard[]): MapConceptRaw[] {
  if (!cards.length) return []

  const resumo = cards.find(c => c.section === 'resumo') ?? cards[0]
  const rest = cards.filter(c => c.id !== resumo.id).slice(0, 8)

  const root: MapConceptRaw = {
    id: resumo.id,
    label: shortLabel(resumo.name),
    category: 'central',
    isRoot: true,
    connections: rest.map(c => c.id),
    connectionLabels: Object.fromEntries(rest.map(c => [c.id, 'enables'])),
    role: 'entry point',
    centralQuestion: stripHtml(resumo.body).slice(0, 120),
  }

  const children: MapConceptRaw[] = rest.map(c => ({
    id: c.id,
    label: shortLabel(c.name),
    category: c.category,
    isRoot: false,
    connections: [],
    connectionLabels: {},
    role: ROLE_BY_SECTION[c.section] ?? 'concept',
    centralQuestion: c.action ?? stripHtml(c.body).slice(0, 100),
  }))

  return [root, ...children]
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeMap() {
  const { result, triggerDeepSearch } = useApp()
  const [activeNode, setActiveNode] = useState<NodeData | null>(null)

  // Use real mapConcepts; fallback to cards-based synthesis when absent
  const concepts = useMemo(() => {
    if (result?.mapConcepts?.length) return result.mapConcepts
    if (result?.cards?.length) return synthesiseFromCards(result.cards)
    return []
  }, [result?.mapConcepts, result?.cards])

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowData(concepts),
    [concepts]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Re-sync when a new analysis produces different concepts
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const concept = concepts.find(c => c.id === node.id)
    if (!concept) return
    if (activeNode?.id === node.id) {
      setActiveNode(null)
    } else {
      // Outgoing: connections this node declares
      const outgoing = (concept.connections ?? [])
        .map(id => {
          const target = concepts.find(c => c.id === id)
          return target ? {
            label: target.label,
            relationship: concept.connectionLabels?.[id] ?? '→',
          } : null
        })
        .filter((x): x is { label: string; relationship: string } => x !== null)

      // Incoming: connections from other nodes that point TO this node
      const incoming = concepts
        .filter(c => c.id !== concept.id && (c.connections ?? []).includes(concept.id))
        .map(c => ({
          label: c.label,
          relationship: `← ${c.connectionLabels?.[concept.id] ?? 'connects to'}`,
        }))

      // Merge, deduplicate by label
      const seen = new Set<string>()
      const allConnections = [...outgoing, ...incoming].filter(c => {
        if (seen.has(c.label)) return false
        seen.add(c.label)
        return true
      })

      setActiveNode({
        id: concept.id,
        title: concept.label,
        category: concept.category === 'central' ? 'concept' : concept.category,
        role: concept.role ?? 'concept',
        centralQuestion: concept.centralQuestion ?? '',
        connections: allConnections,
      })
    }
  }, [concepts, activeNode])

  // Ensure centralQuestion is actually a question — fallback if Claude returned a definition
  const QUESTION_WORDS = /^(como|o que|por que|porque|quando|qual|quais|onde|how|what|why|when|which|who)/i
  const sanitiseCentralQuestion = (q: string, role: string): string => {
    if (!q?.trim()) return ''
    if (q.endsWith('?') && QUESTION_WORDS.test(q.trim())) return q
    // Looks like a definition — wrap it as a question or discard
    if (q.endsWith('?')) return q  // has ? even if no question word — keep it
    return ''  // definition without ?, don't show
  }

  const ROLE_LABELS: Record<string, string> = {
    'entry point':    'Ponto de entrada — onde o sistema começa',
    'core mechanism': 'Mecanismo central — como o sistema funciona',
    'enabler':        'Habilitador — o que torna o sistema possível',
    'blocker':        'Bloqueador — o que impede o sistema de funcionar',
    'result':         'Resultado — o que o sistema produz',
    'measure':        'Medida — como se avalia o sistema',
    'catalyst':       'Catalisador — o que acelera o sistema',
  }

  const getCategoryBadgeStyle = (category: string) => {
    const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.concept
    return {
      background: `${colors.stroke}22`,
      color: colors.stroke,
      border: `1px solid ${colors.stroke}44`,
    }
  }

  if (!concepts.length) {
    return (
      <div className="kmap-block">
        <div className="blk-label">
          <div className="blk-label-l"><span className="blk-dot" />Knowledge Map</div>
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
          Mapa disponível após análise.
        </div>
      </div>
    )
  }

  return (
    <div className="kmap-block">
      <div className="blk-label">
        <div className="blk-label-l">
          <span className="blk-dot" />
          Knowledge Map
        </div>
        <span className="kmap-hint">clica em qualquer nó para explorar</span>
      </div>

      <div style={{ width: '100%', height: 320, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          style={{ background: 'var(--bg2)' }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--border)" gap={24} size={1} />
          <Controls
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6 }}
            showInteractive={false}
          />
        </ReactFlow>
      </div>

      {/* Node Detail Panel */}
      {activeNode && (
        <div className="node-detail show">
          <div className="nd-head">
            <span className="nd-badge" style={getCategoryBadgeStyle(activeNode.category)}>
              {activeNode.role}
            </span>
            <button className="nd-close" onClick={() => setActiveNode(null)}>×</button>
          </div>
          <div className="nd-body">
            {(() => {
              const question = sanitiseCentralQuestion(activeNode.centralQuestion, activeNode.role)
              const roleDesc = ROLE_LABELS[activeNode.role]
              return (
                <>
                  {question && (
                    <>
                      <div className="nd-sec">Questão</div>
                      <div className="nd-def">{question}</div>
                    </>
                  )}
                  <div className="nd-sec">Resposta</div>
                  <div className="nd-title">{activeNode.title}</div>
                  {roleDesc && (
                    <>
                      <div className="nd-sec" style={{ marginTop: 10 }}>Papel no sistema</div>
                      <div className="nd-def" style={{ fontSize: 11.5, opacity: 0.8 }}>{roleDesc}</div>
                    </>
                  )}
                </>
              )
            })()}
            {activeNode.connections.length > 0 && (
              <>
                <div className="nd-sec">Relações no sistema</div>
                <div className="nd-pts">
                  {activeNode.connections.map((conn, i) => (
                    <div className="nd-pt" key={i}>
                      <span style={{ color: 'var(--text3)', fontSize: 11 }}>{conn.relationship}</span>
                      {' '}
                      <span style={{ fontWeight: 600 }}>{conn.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="nd-cta-row">
              <button className="nd-cta" onClick={() => setActiveNode(null)}>Fechar</button>
              <button
                className="nd-cta p"
                onClick={() => {
                  triggerDeepSearch(activeNode.title)
                  setActiveNode(null)
                }}
              >
                Explorar em profundidade →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

