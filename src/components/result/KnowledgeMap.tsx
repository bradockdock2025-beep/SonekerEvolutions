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
          padding: nodeData.isRoot ? '8px 18px' : '6px 14px',
          minWidth: nodeData.isRoot ? 120 : 90,
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
          fontSize: nodeData.isRoot ? 11.5 : 10.5,
          color: colors.text,
          lineHeight: 1.3,
        }}>
          {nodeData.label}
        </div>
        {nodeData.sublabel && (
          <div style={{ fontSize: 8, color: colors.stroke, opacity: 0.75, marginTop: 2 }}>
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

  const root = concepts.find(c => c.isRoot) ?? concepts[0]
  const level1Ids = new Set(root.connections ?? [])
  const level1 = concepts.filter(c => c.id !== root.id && level1Ids.has(c.id)).slice(0, 5)

  const level2Map = new Map<string, MapConceptRaw[]>()
  level1.forEach(l1 => {
    const children = concepts.filter(c =>
      c.id !== root.id &&
      !level1Ids.has(c.id) &&
      l1.connections?.includes(c.id)
    ).slice(0, 2)
    if (children.length) level2Map.set(l1.id, children)
  })

  const nodes: Node[] = []
  const edges: Edge[] = []

  // Root node — center top
  nodes.push({
    id: root.id,
    type: 'soneker',
    position: { x: 0, y: 0 },
    data: { label: root.label, category: root.category ?? 'central', isRoot: true, sublabel: 'conceito central' },
  })

  // Level 1 — spread horizontally below root
  const l1SpacingX = 200
  const l1StartX = -(l1SpacingX * (level1.length - 1)) / 2

  level1.forEach((c, i) => {
    const x = l1StartX + i * l1SpacingX
    nodes.push({
      id: c.id,
      type: 'soneker',
      position: { x, y: 140 },
      data: { label: c.label, category: c.category, sublabel: c.category },
    })

    const label = root.connectionLabels?.[c.id]
    const colors = CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.concept
    edges.push({
      id: `e-${root.id}-${c.id}`,
      source: root.id,
      target: c.id,
      label,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: colors.stroke, width: 12, height: 12 },
      style: { stroke: colors.stroke, strokeWidth: 1, strokeOpacity: 0.5 },
      labelStyle: { fontSize: 8, fill: '#40405a' },
      labelBgStyle: { fill: 'transparent' },
    })

    // Level 2 — below each l1 node
    const l2Children = level2Map.get(c.id) ?? []
    l2Children.forEach((l2, j) => {
      const l2x = x + (j - (l2Children.length - 1) / 2) * 130
      nodes.push({
        id: l2.id,
        type: 'soneker',
        position: { x: l2x, y: 270 },
        data: { label: l2.label, category: l2.category, sublabel: l2.category },
      })

      const l2Colors = CATEGORY_COLORS[l2.category] ?? CATEGORY_COLORS.concept
      const l2label = c.connectionLabels?.[l2.id]
      edges.push({
        id: `e-${c.id}-${l2.id}`,
        source: c.id,
        target: l2.id,
        label: l2label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: l2Colors.stroke, width: 10, height: 10 },
        style: { stroke: l2Colors.stroke, strokeWidth: 0.9, strokeOpacity: 0.4, strokeDasharray: '4 3' },
        labelStyle: { fontSize: 7.5, fill: '#40405a' },
        labelBgStyle: { fill: 'transparent' },
      })
    })
  })

  return { nodes, edges }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeMap() {
  const { result, triggerDeepSearch } = useApp()
  const [activeNode, setActiveNode] = useState<NodeData | null>(null)

  // Use real mapConcepts; synthesize from cards if absent (should not happen post-analysis)
  const concepts = result?.mapConcepts ?? []

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
      setActiveNode({
        id: concept.id,
        title: concept.label,
        category: concept.category === 'central' ? 'concept' : concept.category,
        definition: concept.definition ?? `Conceito central: ${concept.label}`,
        points: concept.keyPoints ?? ['Conceito extraído pelo Soneker', 'Relacionado com o tema principal'],
        relatedTags: concept.connections?.map(id => concepts.find(c => c.id === id)?.label ?? id) ?? [],
      })
    }
  }, [concepts, activeNode])

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
              {activeNode.category}
            </span>
            <button className="nd-close" onClick={() => setActiveNode(null)}>×</button>
          </div>
          <div className="nd-body">
            <div className="nd-title">{activeNode.title}</div>
            <div className="nd-def">{activeNode.definition}</div>
            <div className="nd-sec">Pontos chave</div>
            <div className="nd-pts">
              {activeNode.points.map((pt, i) => (
                <div className="nd-pt" key={i}>{pt}</div>
              ))}
            </div>
            {activeNode.relatedTags.length > 0 && (
              <>
                <div className="nd-sec">Conceitos relacionados</div>
                <div className="nd-tags">
                  {activeNode.relatedTags.map((tag, i) => (
                    <span className="nd-tag" key={i}>{tag}</span>
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

