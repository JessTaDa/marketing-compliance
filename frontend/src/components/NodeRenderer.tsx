import React, { useState, useMemo, useEffect } from 'react'
import { Node } from '../types'
import { darkTheme, bgColors } from '../utils/styles'

interface NodeRendererProps {
  node: Node
  onOverride: (id: number, status: string) => void
  depth?: number
}

// This component is essential for rendering each node and handling local state for status updates.
export function NodeRenderer({ 
  node, 
  onOverride, 
  depth = 0
}: NodeRendererProps) {
  // Local state for status and last_updated_by_user for minimal re-rendering
  const [status, setStatus] = useState(node.status)
  const [lastUpdated, setLastUpdated] = useState(node.last_updated_by_user)
  const [showCelebration, setShowCelebration] = useState(false)
  // Local expansion state
  const [isExpanded, setIsExpanded] = useState(false)

  // Sync local state with props if node.id changes (e.g., on reload)
  useEffect(() => {
    setStatus(node.status)
    setLastUpdated(node.last_updated_by_user)
  }, [node.id, node.status, node.last_updated_by_user])

  // Memoize expensive calculations to prevent recalculation on every render
  const { statusColor, icon, passCount, totalCount, hasChildren, arrow, containerStyle } = useMemo(() => {
    const statusColor = status === 'PASS' ? darkTheme.pass : status === 'FAIL' ? darkTheme.fail : darkTheme.na
    const icon = status === 'PASS' ? '✔️' : status === 'FAIL' ? '❌' : '⬤'
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
    const arrow = hasChildren ? (isExpanded ? '▼' : '▶') : null
    const containerStyle = {
      marginLeft: depth * 24,
      marginBottom: 16,
      padding: 16,
      borderRadius: 10,
      background: status === 'PASS'
        ? 'rgba(76, 220, 128, 0.18)'
        : status === 'FAIL'
          ? 'rgba(248, 113, 113, 0.18)'
          : darkTheme.card,
      boxShadow: '0 1px 4px #101014',
      border: `1px solid ${darkTheme.border}`,
      color: darkTheme.text,
      transition: 'background 0.2s, box-shadow 0.2s',
    } as React.CSSProperties
    return { statusColor, icon, passCount, totalCount, hasChildren, arrow, containerStyle }
  }, [status, node, isExpanded, depth])

  console.log(`rerender ${node.id}`)

  // Minimal handler for status override: call backend and let response drive updates
  const handleLocalOverride = (newStatus: string) => {
    onOverride(node.id, newStatus)
  }

  return (
    <div key={node.id} style={{ ...containerStyle, position: 'relative' }}>
      {showCelebration && (
        <span style={{
          position: 'absolute',
          right: 24,
          top: 8,
          fontSize: '2.2em',
          opacity: 1,
          animation: 'celebrate-fade 1s ease',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          🎉
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          {hasChildren && (
            <span style={{ cursor: 'pointer', marginRight: 8, color: darkTheme.subtitle, fontSize: '1.1em' }} onClick={() => setIsExpanded(e => !e)}>{arrow}</span>
          )}
          <span style={{ fontSize: '1.3em', marginRight: 10 }}>
            {status === 'PASS' ? (
              <svg width="1.45em" height="1.45em" viewBox="0 0 20 20" style={{ display: 'inline', verticalAlign: 'middle' }}>
                <path d="M6 10.8l3 3.2 5-6.2" stroke={darkTheme.pass} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : status === 'FAIL' ? (
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
          <span style={{ fontWeight: 800, fontSize: '1.25em', color: statusColor, userSelect: 'none', cursor: 'default', display: 'inline-block' }}>{/* status || 'N/A' */}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {status === null && (
            <>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => {
                    setShowCelebration(true);
                    setTimeout(() => {
                      setShowCelebration(false);
                      handleLocalOverride('PASS');
                    }, 1000);
                  }}
                  style={{
                    marginLeft: 8,
                    padding: '6px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#17824c', // muted green
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
                onClick={() => handleLocalOverride('FAIL')}
                style={{
                  marginLeft: 4,
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#a13a3a', // muted red
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
          {status === 'PASS' && (
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => handleLocalOverride('FAIL')}
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
          {status === 'FAIL' && (
            <button
              onClick={() => handleLocalOverride('PASS')}
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
        {lastUpdated && (
          <span style={{ marginRight: 24 }}>Manually updated: {new Date(lastUpdated).toLocaleString()}</span>
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

// Add animation keyframes for the celebration
if (typeof window !== 'undefined' && !document.getElementById('celebrate-fade-style')) {
  const style = document.createElement('style');
  style.id = 'celebrate-fade-style';
  style.innerHTML = `
    @keyframes celebrate-fade {
      0% { opacity: 0; transform: translateX(-50%) scale(0.7) translateY(10px); }
      20% { opacity: 1; transform: translateX(-50%) scale(1.1) translateY(-6px); }
      60% { opacity: 1; transform: translateX(-50%) scale(1) translateY(-10px); }
      100% { opacity: 0; transform: translateX(-50%) scale(0.7) translateY(-30px); }
    }
  `;
  document.head.appendChild(style);
}

// Memoized version to prevent unnecessary re-renders
function areEqual(prevProps: NodeRendererProps, nextProps: NodeRendererProps) {
  // Only re-render if the node object or expanded/toggleExpand/onOverride/props actually change
  return (
    prevProps.node === nextProps.node &&
    prevProps.depth === nextProps.depth &&
    prevProps.onOverride === nextProps.onOverride
  );
}

export const MemoizedNodeRenderer = React.memo(NodeRenderer, areEqual);

// For compatibility with existing imports
export default MemoizedNodeRenderer; 