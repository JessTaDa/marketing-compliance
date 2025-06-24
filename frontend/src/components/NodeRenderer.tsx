import React from 'react'
import { Node } from '../types'
import { bgColors } from '../utils/styles'

interface NodeRendererProps {
  node: Node
  onOverride: (id: number, status: string) => void
  depth?: number
  fadingIds?: Set<number>
  expanded?: Set<number>
  toggleExpand?: (id: number) => void
  cardView?: boolean
}

export function NodeRenderer({ 
  node, 
  onOverride, 
  depth = 0, 
  fadingIds = new Set(),
  expanded = new Set(),
  toggleExpand = () => {},
  cardView = false
}: NodeRendererProps) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  const icon = node.status === 'PASS' ? '✔️' : node.status === 'FAIL' ? '❌' : '⬤'
  
  // Count pass and total nodes in this tree
  const countPassAndTotal = (node: Node): [number, number] => {
    let pass = node.status === 'PASS' ? 1 : 0
    let total = 1
    for (const child of node.children) {
      const [cPass, cTotal] = countPassAndTotal(child)
      pass += cPass
      total += cTotal
    }
    return [pass, total]
  }
  const [passCount, totalCount] = countPassAndTotal(node)
  
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const arrow = hasChildren ? (isExpanded ? '▼' : '▶') : null
  const fadeClass = fadingIds.has(node.id) ? 'fade-out' : ''

  const containerStyle = cardView ? {
    marginLeft: depth * 10,
    marginBottom: 10,
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    background: bgColors[depth % bgColors.length],
    boxShadow: depth === 0 ? '0 2px 8px #eee' : undefined,
  } : {
    marginLeft: depth * 20
  }

  return (
    <div key={node.id} style={containerStyle} className={fadeClass}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {hasChildren && (
          <span style={{ cursor: 'pointer', marginRight: 4 }} onClick={() => toggleExpand(node.id)}>{arrow}</span>
        )}
        <span style={{ fontSize: '1.3em', color: statusColor, marginRight: 8 }}>{icon} <span style={{ fontSize: '0.8em', color: '#888' }}>({passCount}/{totalCount})</span></span>
        <span>{cardView ? <strong>{node.type}</strong> : node.type}: {node.name}</span>
        <span style={{ color: statusColor, marginLeft: 8 }}>{node.status || 'N/A'}</span>
        {node.status === null && (
          <>
            <button onClick={() => onOverride(node.id, 'PASS')} style={{ marginLeft: 8 }}>Set PASS</button>
            <button onClick={() => onOverride(node.id, 'FAIL')} style={{ marginLeft: 4 }}>Set FAIL</button>
          </>
        )}
        {node.status === 'PASS' && (
          <button onClick={() => onOverride(node.id, 'FAIL')} style={{ marginLeft: 8 }}>Set FAIL</button>
        )}
        {node.status === 'FAIL' && (
          <button onClick={() => onOverride(node.id, 'PASS')} style={{ marginLeft: 8 }}>Set PASS</button>
        )}
      </div>
      <div style={{ fontSize: '0.85em', color: '#888', marginLeft: 28, marginTop: 2 }}>
        ID: {node.id} | Reason: {'reason' in node ? (node as any).reason || 'N/A' : 'N/A'}
      </div>
      {isExpanded && node.children.map(child => (
        <NodeRenderer 
          key={child.id}
          node={child} 
          onOverride={onOverride} 
          depth={depth + 1} 
          fadingIds={fadingIds}
          expanded={expanded}
          toggleExpand={toggleExpand}
          cardView={cardView}
        />
      ))}
    </div>
  )
} 