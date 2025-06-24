import React from 'react'
import { Node } from '../types'
import { darkTheme, bgColors } from '../utils/styles'

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
  const statusColor = node.status === 'PASS' ? darkTheme.pass : node.status === 'FAIL' ? darkTheme.fail : darkTheme.na
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

  const containerStyle = {
    marginLeft: depth * 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    background: darkTheme.card,
    boxShadow: darkTheme.shadow,
    border: `1px solid ${darkTheme.border}`,
    color: darkTheme.text,
    transition: 'background 0.2s, box-shadow 0.2s',
  } as React.CSSProperties

  return (
    <div key={node.id} style={containerStyle} className={fadeClass}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        {hasChildren && (
          <span style={{ cursor: 'pointer', marginRight: 8, color: darkTheme.subtitle, fontSize: '1.1em' }} onClick={() => toggleExpand(node.id)}>{arrow}</span>
        )}
        <span style={{ fontSize: '1.3em', color: statusColor, marginRight: 10 }}>{icon}</span>
        <span style={{ fontWeight: 600, marginRight: 8 }}>{node.type}</span>
        <span style={{ marginRight: 8 }}>{node.name}</span>
        <span style={{ color: statusColor, fontWeight: 500, marginLeft: 'auto', marginRight: 8 }}>{node.status || 'N/A'}</span>
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
      <div style={{ fontSize: '0.95em', color: darkTheme.subtitle, marginLeft: 32, marginTop: 2, marginBottom: 2 }}>
        ID: {node.id} | Reason: {'reason' in node ? (node as any).reason || 'N/A' : 'N/A'}
        {node.last_updated_by_user && (
          <span> | User manually updated: {new Date(node.last_updated_by_user).toLocaleString()}</span>
        )}
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