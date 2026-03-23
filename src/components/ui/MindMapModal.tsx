'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import type { MapConceptRaw } from '@/types'

// ── Category colors ──────────────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  central:   '#6c5fff',
  concept:   '#a398ff',
  framework: '#2dd4a0',
  insight:   '#f5a623',
  vocab:     '#e879b8',
  idea:      '#e86060',
}

const CAT_BG: Record<string, string> = {
  central:   '#1d1832',
  concept:   '#141428',
  framework: '#0e1e1a',
  insight:   '#1c1508',
  vocab:     '#26102a',
  idea:      '#1e0f0f',
}

// ── D3 radial mind map builder ───────────────────────────────────────────────

interface D3Node {
  id: string
  label: string
  category: string
  isRoot: boolean
  children?: D3Node[]
}

function buildTree(concepts: MapConceptRaw[]): D3Node {
  const root = concepts.find(c => c.isRoot) ?? concepts[0]
  const used = new Set<string>([root.id])

  const makeNode = (c: MapConceptRaw, depth: number): D3Node => {
    const children: D3Node[] = []
    if (depth < 2 && c.connections?.length) {
      for (const cid of c.connections) {
        if (used.has(cid)) continue
        const child = concepts.find(x => x.id === cid)
        if (!child) continue
        used.add(cid)
        children.push(makeNode(child, depth + 1))
        if (children.length >= (depth === 0 ? 7 : 3)) break
      }
    }
    return { id: c.id, label: c.label, category: c.category ?? 'concept', isRoot: !!c.isRoot, children }
  }

  return makeNode(root, 0)
}


// ── Component ────────────────────────────────────────────────────────────────

export default function MindMapModal() {
  const { mindMapOpen, setMindMapOpen, result } = useApp()
  const { showToast } = useToast()
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement | null>(null)

  const close = useCallback(() => setMindMapOpen(false), [setMindMapOpen])

  const concepts = result?.mapConcepts ?? []
  const treeData = useMemo(() => concepts.length ? buildTree(concepts) : null, [concepts])
  const title = result?.videoTitle ?? 'Mind Map'

  useEffect(() => {
    if (!mindMapOpen || !svgRef.current || !treeData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = svgRef.current.clientWidth || 640
    const H = svgRef.current.clientHeight || 480
    const cx = W / 2
    const cy = H / 2

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`)
    gRef.current = g.node()

    // D3 radial tree layout
    const root = d3.hierarchy<D3Node>(treeData)
    const treeLayout = d3.tree<D3Node>()
      .size([2 * Math.PI, Math.min(cx, cy) * 0.78])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.4) / a.depth)

    treeLayout(root)

    // Radial project helpers
    const radialX = (angle: number, r: number) => r * Math.cos(angle - Math.PI / 2)
    const radialY = (angle: number, r: number) => r * Math.sin(angle - Math.PI / 2)

    // ── Links ────────────────────────────────────────────────────────────────
    g.selectAll<SVGPathElement, d3.HierarchyPointLink<D3Node>>('path.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', d => CAT_COLOR[d.target.data.category] ?? '#a398ff')
      .attr('stroke-width', d => d.source.depth === 0 ? 1.5 : 0.9)
      .attr('stroke-opacity', d => d.source.depth === 0 ? 0.55 : 0.35)
      .attr('stroke-dasharray', d => d.source.depth === 0 ? 'none' : '4 3')
      .attr('d', d => {
        const sx = radialX((d.source as d3.HierarchyPointNode<D3Node>).x, (d.source as d3.HierarchyPointNode<D3Node>).y)
        const sy = radialY((d.source as d3.HierarchyPointNode<D3Node>).x, (d.source as d3.HierarchyPointNode<D3Node>).y)
        const tx = radialX((d.target as d3.HierarchyPointNode<D3Node>).x, (d.target as d3.HierarchyPointNode<D3Node>).y)
        const ty = radialY((d.target as d3.HierarchyPointNode<D3Node>).x, (d.target as d3.HierarchyPointNode<D3Node>).y)
        return `M${sx},${sy}C${sx * 0.5 + tx * 0.5},${sy * 0.5 + ty * 0.5} ${sx * 0.3 + tx * 0.7},${sy * 0.3 + ty * 0.7} ${tx},${ty}`
      })

    // ── Nodes ────────────────────────────────────────────────────────────────
    const nodeGroup = g.selectAll<SVGGElement, d3.HierarchyPointNode<D3Node>>('g.node')
      .data(root.descendants() as d3.HierarchyPointNode<D3Node>[])
      .join('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${radialX(d.x, d.y)},${radialY(d.x, d.y)})`)

    // Node rectangles
    nodeGroup.each(function (d) {
      const node = d3.select(this)
      const isRoot = d.data.isRoot
      const color = CAT_COLOR[d.data.category] ?? '#a398ff'
      const bg = CAT_BG[d.data.category] ?? '#141428'

      // Approximate text width
      const textLen = d.data.label.length
      const rw = isRoot ? Math.max(90, textLen * 6.5 + 24) : Math.max(60, textLen * 5.8 + 20)
      const rh = isRoot ? 30 : 22

      node.append('rect')
        .attr('x', -rw / 2)
        .attr('y', -rh / 2)
        .attr('width', rw)
        .attr('height', rh)
        .attr('rx', isRoot ? 10 : 6)
        .attr('fill', bg)
        .attr('stroke', color)
        .attr('stroke-width', isRoot ? 1.8 : 1.1)
        .attr('filter', isRoot ? 'drop-shadow(0 0 6px ' + color + '55)' : 'none')

      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-family', isRoot ? 'var(--font-syne, Syne, sans-serif)' : 'var(--font-dm-sans, DM Sans, sans-serif)')
        .attr('font-size', isRoot ? 11 : d.depth === 1 ? 9.5 : 8.5)
        .attr('font-weight', isRoot ? 700 : 600)
        .attr('fill', '#edecf8')
        .attr('pointer-events', 'none')
        .text(d.data.label.length > 22 ? d.data.label.slice(0, 20) + '…' : d.data.label)

      // Hover effects
      node.on('mouseenter', function () {
        d3.select(this).select('rect')
          .attr('stroke-width', isRoot ? 2.5 : 1.8)
          .attr('filter', `drop-shadow(0 0 8px ${color}88)`)
      }).on('mouseleave', function () {
        d3.select(this).select('rect')
          .attr('stroke-width', isRoot ? 1.8 : 1.1)
          .attr('filter', isRoot ? `drop-shadow(0 0 6px ${color}55)` : 'none')
      })
    })

    // ── Zoom & pan ───────────────────────────────────────────────────────────
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3])
      .on('zoom', event => {
        g.attr('transform', `translate(${cx + event.transform.x},${cy + event.transform.y}) scale(${event.transform.k})`)
      })

    svg.call(zoom)

    return () => {
      svg.on('.zoom', null)
    }
  }, [mindMapOpen, treeData])

  // Export PNG via canvas
  const handleExportPng = useCallback(() => {
    if (!svgRef.current) return
    const svgEl = svgRef.current
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svgEl.clientWidth * 2
      canvas.height = svgEl.clientHeight * 2
      const ctx = canvas.getContext('2d')!
      ctx.scale(2, 2)
      ctx.fillStyle = '#0f0e1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const a = document.createElement('a')
      a.download = 'soneker-mindmap.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
      showToast('Mind Map exportado!', '✓')
    }
    img.src = url
  }, [showToast])

  if (!mindMapOpen) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ maxWidth: 780, width: '94vw' }}>
        <div className="modal-head">
          <span className="modal-title">
            Mind Map — {title.length > 50 ? title.slice(0, 48) + '…' : title}
          </span>
          <button className="modal-close" onClick={close} aria-label="Fechar">×</button>
        </div>

        <div className="modal-body" style={{ padding: 0, overflow: 'hidden' }}>
          <svg
            ref={svgRef}
            style={{
              width: '100%',
              height: 440,
              display: 'block',
              background: 'var(--bg2)',
              borderRadius: '0 0 0 0',
            }}
          />

          <div style={{ padding: '12px 16px', display: 'flex', gap: 8, borderTop: '1px solid var(--border)' }}>
            <button
              className="exp-btn p"
              style={{ flex: 'none', padding: '0 16px', height: 32, fontSize: 11 }}
              onClick={handleExportPng}
            >
              Exportar PNG
            </button>
            <button
              className="exp-btn"
              style={{ flex: 'none', padding: '0 16px', height: 32, fontSize: 11 }}
              onClick={() => { showToast('A exportar para Notion...', '→'); close() }}
            >
              Exportar para Notion
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--txt3)', alignSelf: 'center' }}>
              scroll para zoom · arrastar para mover
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
