import React, { useState, useMemo } from 'react'
import { Node } from '../types'
import { darkTheme } from '../utils/styles'

interface NodeRendererProps {
  node: Node
  onOverride: (id: number, status: string) => void
  depth?: number
}

export function NodeRenderer({ node, onOverride, depth = 0 }: NodeRendererProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const { statusColor, passCount, totalCount, hasChildren, arrow, containerStyle } = useMemo(() => {
    const statusColor = node.status === 'PASS' ? darkTheme.pass : node.status === 'FAIL' ? darkTheme.fail : darkTheme.na
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
    const arrow = hasChildren ? (isExpanded ? '▼' : '▶') : null
    const containerStyle = {
      marginLeft: depth * 24,
      marginBottom: 16,
      padding: 16,
      borderRadius: 10,
      background: node.status === 'PASS'
        ? 'rgba(76, 220, 128, 0.18)'
        : node.status === 'FAIL'
          ? 'rgba(248, 113, 113, 0.18)'
          : darkTheme.card,
      boxShadow: '0 1px 4px #101014',
      border: `1px solid ${darkTheme.border}`,
      color: darkTheme.text,
      transition: 'background 0.2s, box-shadow 0.2s',
    } as React.CSSProperties
    return { statusColor, passCount, totalCount, hasChildren, arrow, containerStyle }
  }, [node, isExpanded, depth])

  const handleOverride = (newStatus: string) => {
    onOverride(node.id, newStatus)
  }

  return (
    <div key={node.id} style={{ ...containerStyle, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          {hasChildren && (
            <span style={{ cursor: 'pointer', marginRight: 8, color: darkTheme.subtitle, fontSize: '1.1em' }} onClick={() => setIsExpanded(e => !e)}>{arrow}</span>
          )}
          <span style={{ fontSize: '1.3em', marginRight: 10 }}>
            {node.status === 'PASS' ? (
              <svg width="1.45em" height="1.45em" viewBox="0 0 20 20" style={{ display: 'inline', verticalAlign: 'middle' }}>
                <path d="M6 10.8l3 3.2 5-6.2" stroke={darkTheme.pass} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : node.status === 'FAIL' ? (
              <svg width="1.45em" height="1.45em" viewBox="0 0 20 20" style={{ display: 'inline', verticalAlign: 'middle' }}>
                <line x1="6" y1="6" x2="14" y2="14" stroke={darkTheme.fail} strokeWidth="2.8" strokeLinecap="round" />
                <line x1="14" y1="6" x2="6" y2="14" stroke={darkTheme.fail} strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            ) : (
              '⬤'
            )}
            <span style={{ fontSize: '0.9em', color: darkTheme.subtitle, marginLeft: 4 }}>
              (<span style={{ color: darkTheme.pass, fontWeight: 700 }}>{passCount}</span>/{totalCount})
            </span>
          </span>
          <span style={{ fontWeight: 600, marginRight: 8 }}>ID: {node.id}</span>
          <span style={{ fontWeight: 600, marginRight: 14 }}>{node.type}</span>
          <span style={{ marginRight: 14, color: node.name === 'Root Node' ? darkTheme.shadow : undefined }}>{node.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {node.status === null && (
            <>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => handleOverride('PASS')}
                  style={{
                    marginLeft: 8,
                    padding: '6px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#17824c',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#116639')}
                  onMouseOut={e => (e.currentTarget.style.background = '#17824c')}
                >
                  Set PASS
                </button>
              </span>
              <button
                onClick={() => handleOverride('FAIL')}
                style={{
                  marginLeft: 4,
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#a13a3a',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#7a2929')}
                onMouseOut={e => (e.currentTarget.style.background = '#a13a3a')}
              >
                Set FAIL
              </button>
            </>
          )}
          {node.status === 'PASS' && (
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => handleOverride('FAIL')}
                style={{
                  marginLeft: 8,
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#a13a3a',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#7a2929')}
                onMouseOut={e => (e.currentTarget.style.background = '#a13a3a')}
              >
                Set FAIL
              </button>
            </span>
          )}
          {node.status === 'FAIL' && (
            <button
              onClick={() => handleOverride('PASS')}
              style={{
                marginLeft: 8,
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                background: '#17824c',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#116639')}
              onMouseOut={e => (e.currentTarget.style.background = '#17824c')}
            >
              Set PASS
            </button>
          )}
        </div>
      </div>
      <div style={{ fontSize: '0.95em', color: darkTheme.subtitle, marginLeft: 32, marginTop: 2, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
        {node.last_updated_by_user && (
          <span style={{ marginRight: 24 }}>Manually updated: {new Date(node.last_updated_by_user).toLocaleString()}</span>
        )}
        <span>Reason: {'reason' in node ? (node as any).reason || 'N/A' : 'N/A'}</span>
      </div>
      {isExpanded && node.children.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {node.children.map(child => (
            <NodeRenderer 
              key={child.id}
              node={child} 
              onOverride={onOverride} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default React.memo(NodeRenderer); 