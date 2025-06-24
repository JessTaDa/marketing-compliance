import React from 'react'
import { Node } from '../types'
import { darkTheme, bgColors } from '../utils/styles'

interface NodeRendererProps {
  node: Node
  onOverride: (id: number, status: string) => void
  depth?: number
  expanded?: Set<number>
  toggleExpand?: (id: number) => void
  cardView?: boolean
}

export function NodeRenderer({ 
  node, 
  onOverride, 
  depth = 0, 
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
    <div key={node.id} style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        {hasChildren && (
          <span style={{ cursor: 'pointer', marginRight: 8, color: darkTheme.subtitle, fontSize: '1.1em' }} onClick={() => toggleExpand(node.id)}>{arrow}</span>
        )}
        <span style={{ fontSize: '1.3em', color: statusColor, marginRight: 10 }}>{icon} <span style={{ fontSize: '0.9em', color: darkTheme.subtitle, marginLeft: 4 }}>({passCount}/{totalCount})</span></span>
        <span style={{ fontWeight: 600, marginRight: 8 }}>ID: {node.id}</span>
        <span style={{ fontWeight: 600, marginRight: 8 }}>{node.type}</span>
        <span style={{ marginRight: 8 }}>{node.name}</span>
        <span style={{
          fontWeight: 800,
          fontSize: '1.25em',
          color: statusColor,
          background: 'rgba(76, 220, 128, 0.08)', // subtle green for PASS, will be overridden for FAIL
          borderRadius: 16,
          padding: '2px 18px',
          marginLeft: 'auto',
          marginRight: 8,
          border: `2px solid ${statusColor}`,
          letterSpacing: 1,
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
          ...(node.status === 'FAIL' && { background: 'rgba(248, 113, 113, 0.08)' }),
        }}>{node.status || 'N/A'}</span>
        {node.status === null && (
          <>
            <button onClick={() => onOverride(node.id, 'PASS')} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, border: '1.5px solid #17824c', background: 'transparent', color: '#17824c', fontWeight: 500, cursor: 'pointer', outline: 'none', transition: 'all 0.15s' }}>Set PASS</button>
            <button onClick={() => onOverride(node.id, 'FAIL')} style={{ marginLeft: 4, padding: '6px 16px', borderRadius: 6, border: '1.5px solid #a13a3a', background: 'transparent', color: '#a13a3a', fontWeight: 500, cursor: 'pointer', outline: 'none', transition: 'all 0.15s' }}>Set FAIL</button>
          </>
        )}
        {node.status === 'PASS' && (
          <button onClick={() => onOverride(node.id, 'FAIL')} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, border: '1.5px solid #a13a3a', background: 'transparent', color: '#a13a3a', fontWeight: 500, cursor: 'pointer', outline: 'none', transition: 'all 0.15s' }}>Set FAIL</button>
        )}
        {node.status === 'FAIL' && (
          <button onClick={() => onOverride(node.id, 'PASS')} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, border: '1.5px solid #17824c', background: 'transparent', color: '#17824c', fontWeight: 500, cursor: 'pointer', outline: 'none', transition: 'all 0.15s' }}>Set PASS</button>
        )}
      </div>
      <div style={{ fontSize: '0.95em', color: darkTheme.subtitle, marginLeft: 32, marginTop: 2, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
        {node.last_updated_by_user && (
          <span style={{ marginRight: 24 }}>Manually updated: {new Date(node.last_updated_by_user).toLocaleString()}</span>
        )}
        <span>Reason: {'reason' in node ? (node as any).reason || 'N/A' : 'N/A'}</span>
      </div>
      {isExpanded && node.children.map(child => (
        <NodeRenderer 
          key={child.id}
          node={child} 
          onOverride={onOverride} 
          depth={depth + 1} 
          expanded={expanded}
          toggleExpand={toggleExpand}
          cardView={cardView}
        />
      ))}
    </div>
  )
} 