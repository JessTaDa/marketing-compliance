import React, { useState, useEffect, useRef } from 'react'

interface Node {
  id: number
  type: string
  name: string
  status: string | null
  children: Node[]
}

const bgColors = ['#f9f9f9', '#e6f7ff', '#fffbe6', '#f6ffed']

// Fade-out CSS (inject once)
const fadeStyleId = 'fade-style'
if (!document.getElementById(fadeStyleId)) {
  const style = document.createElement('style')
  style.id = fadeStyleId
  style.innerHTML = `
    .fade-out {
      opacity: 0 !important;
      transition: opacity 1.5s ease-out !important;
    }
    .fade-out * {
      opacity: 0 !important;
      transition: opacity 1.5s ease-out !important;
    }
    .tree-container > div {
      transition: transform 1s ease-out;
    }
  `;
  document.head.appendChild(style)
}

function renderNodeTabbed(node: Node, onOverride: (id: number, status: string) => void, depth = 0, fadingIds: Set<number> = new Set(), expanded: Set<number>, toggleExpand: (id: number) => void) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  const icon = node.status === 'PASS' ? '✔️' : node.status === 'FAIL' ? '❌' : '⬤'
  const fadeClass = fadingIds.has(node.id) ? 'fade-out' : ''
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const arrow = hasChildren ? (isExpanded ? '▼' : '▶') : null
  console.log("rerunning renderNodeTabbed ", node.id)
  return (
    <div key={node.id} style={{ marginLeft: depth * 20 }} className={fadeClass}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {hasChildren && (
          <span style={{ cursor: 'pointer', marginRight: 4 }} onClick={() => toggleExpand(node.id)}>{arrow}</span>
        )}
        <span style={{ fontSize: '1.3em', color: statusColor, marginRight: 8 }}>{icon}</span>
        <span>{node.type}: {node.name}</span>
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
      {isExpanded && node.children.map(child => renderNodeTabbed(child, onOverride, depth + 1, fadingIds, expanded, toggleExpand))}
    </div>
  )
}

function renderNodeCard(node: Node, onOverride: (id: number, status: string) => void, depth = 0, fadingIds: Set<number> = new Set(), expanded: Set<number>, toggleExpand: (id: number) => void) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  const icon = node.status === 'PASS' ? '✔️' : node.status === 'FAIL' ? '❌' : '⬤'
  const cardStyle = {
    marginLeft: depth * 10,
    marginBottom: 10,
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    background: bgColors[depth % bgColors.length],
    boxShadow: depth === 0 ? '0 2px 8px #eee' : undefined,
  } as React.CSSProperties
  const fadeClass = fadingIds.has(node.id) ? 'fade-out' : ''
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const arrow = hasChildren ? (isExpanded ? '▼' : '▶') : null
  console.log("rerunning renderNodeCard ", node.id)
  return (
    <div key={node.id} style={cardStyle} className={fadeClass}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {hasChildren && (
          <span style={{ cursor: 'pointer', marginRight: 4 }} onClick={() => toggleExpand(node.id)}>{arrow}</span>
        )}
        <span style={{ fontSize: '1.3em', color: statusColor, marginRight: 8 }}>{icon}</span>
        <span><strong>{node.type}</strong>: {node.name}</span>
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
      {isExpanded && node.children.map(child => renderNodeCard(child, onOverride, depth + 1, fadingIds, expanded, toggleExpand))}
    </div>
  )
}

export default function App() {
  const [trees, setTrees] = useState<Node[] | null>(null)
  const [cardView, setCardView] = useState(false)
  const [showAll, setShowAll] = useState(true)
  const [statusFilter, setStatusFilter] = useState(['FAIL'])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [fadingIds, setFadingIds] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const fadeTimeouts = useRef<{[id: number]: number}>({})

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const loadTree = async () => {
    const data = await fetch('http://localhost:8001/').then(r => r.json())
    setTrees([data])
  }

  const loadAllTrees = async () => {
    const data = await fetch('http://localhost:8001/all').then(r => r.json())
    setTrees(data)
  }

  const handleOverride = async (nodeId: number, newStatus: string) => {
    if (!trees || trees.length === 0) return
    
    // Find which tree contains this node
    const findTree = (trees: Node[]) => trees.find(t => {
      const search = (n: Node): boolean => n.id === nodeId || n.children.some(search)
      return search(t)
    })
    const tree = findTree(trees)
    if (!tree) return
    
    // Always use the 'override' endpoint
    const endpoint = 'override'
    
    // Get updated tree from backend
    const updatedTree = await fetch(`http://localhost:8001/${endpoint}/${nodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(r => r.json())
    
    // Update trees immediately to show new status
    const newTrees = showAll ? await fetch('http://localhost:8001/all').then(r => r.json()) : [updatedTree]
    setTrees(newTrees)
    
    // Helper function to collect only the affected node ID
    const collectAffectedIds = (node: Node, targetId: number, affectedIds: Set<number> = new Set()): Set<number> => {
      if (node.id === targetId) {
        affectedIds.add(node.id)
        return affectedIds
      }
      node.children.forEach(child => collectAffectedIds(child, targetId, affectedIds))
      return affectedIds
    }
    
    // Check if the affected node will be filtered out
    const affectedIds = collectAffectedIds(tree, nodeId)
    const nodesToFade = Array.from(affectedIds).filter(id => {
      // Find the node in the updated tree to get its new status
      const findNodeById = (nodes: Node[]): Node | null => {
        for (const node of nodes) {
          if (node.id === id) return node
          const found = findNodeById(node.children)
          if (found) return found
        }
        return null
      }
      const node = findNodeById(newTrees)
      if (!node) return false
      const nodeStatus = node.status || 'N/A'
      return !statusFilter.includes(nodeStatus)
    })
    
    if (nodesToFade.length > 0) {
      // Add the affected node to fading state
      setFadingIds(prev => new Set([...prev, ...nodesToFade]))
      
      // Remove from fading state after animation completes
      nodesToFade.forEach(id => {
        if (fadeTimeouts.current[id]) clearTimeout(fadeTimeouts.current[id])
        fadeTimeouts.current[id] = setTimeout(() => {
          setFadingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }, 1500) // Match the CSS transition duration (1.5 seconds)
      })
    }
  }

  useEffect(() => {
    showAll ? loadAllTrees() : loadTree()
    // eslint-disable-next-line
  }, [showAll])

  if (!trees) return <div>Loading...</div>

  // Filter for selected statuses, but always include nodes that are fading out
  function filterWithFading(node: Node, statuses: string[], fadingIds: Set<number>): Node | null {
    const status = node.status || 'N/A'
    
    // Always include nodes that are fading out
    if (fadingIds.has(node.id)) {
      return {
        ...node,
        children: node.children.map(child => filterWithFading(child, statuses, fadingIds)).filter(Boolean) as Node[],
      }
    }
    
    // Normal filtering logic
    if (statuses.includes(status)) {
      return {
        ...node,
        children: node.children.map(child => filterWithFading(child, statuses, fadingIds)).filter(Boolean) as Node[],
      }
    }
    
    // If any child matches, include this node for context
    const filteredChildren = node.children.map(child => filterWithFading(child, statuses, fadingIds)).filter(Boolean) as Node[]
    if (filteredChildren.length > 0) {
      return { ...node, children: filteredChildren }
    }
    
    return null
  }

  const displayTrees = trees
    .map(tree => filterWithFading(tree, statusFilter, fadingIds))
    .filter(Boolean) as Node[]

  // Count nodes for filter labels
  function countNodesByStatus(node: Node, statuses: string[]): number {
    const status = node.status || 'N/A'
    const match = statuses.includes(status) ? 1 : 0
    return match + node.children.reduce((sum, child) => sum + countNodesByStatus(child, statuses), 0)
  }
  const allNodeCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['PASS', 'FAIL', 'N/A']), 0)
  const passCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['PASS']), 0)
  const failCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['FAIL']), 0)
  const naCount = trees.reduce((sum, t) => sum + countNodesByStatus(t, ['N/A']), 0)

  return (
    <div>
      <h1>Compliance Analysis</h1>
      <button onClick={() => { setShowAll(false); loadTree(); }}>Show Random Tree</button>
      <button onClick={() => { setShowAll(true); loadAllTrees(); }} style={{ marginLeft: 8 }}>Show All Trees</button>
      <button onClick={() => setCardView(v => !v)} style={{ marginLeft: 8 }}>
        Switch to {cardView ? 'Tabbed' : 'Card'} View
      </button>
      <div style={{ display: 'inline-block', position: 'relative', marginLeft: 8 }}>
        <button onClick={() => setDropdownOpen(v => !v)}>
          Filter Status
        </button>
        {dropdownOpen && (
          <div style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 4, minWidth: 160 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={statusFilter.length === 3}
                onChange={e => setStatusFilter(e.target.checked ? ['PASS', 'FAIL', 'N/A'] : [])}
              />{' '}
              All ({allNodeCount})
            </label>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={statusFilter.includes('PASS')}
                onChange={e => {
                  setStatusFilter(f => e.target.checked ? Array.from(new Set([...f, 'PASS'])) : f.filter(s => s !== 'PASS'))
                }}
              />{' '}
              PASS ({passCount})
            </label>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={statusFilter.includes('FAIL')}
                onChange={e => {
                  setStatusFilter(f => e.target.checked ? Array.from(new Set([...f, 'FAIL'])) : f.filter(s => s !== 'FAIL'))
                }}
              />{' '}
              FAIL ({failCount})
            </label>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={statusFilter.includes('N/A')}
                onChange={e => {
                  setStatusFilter(f => e.target.checked ? Array.from(new Set([...f, 'N/A'])) : f.filter(s => s !== 'N/A'))
                }}
              />{' '}
              N/A ({naCount})
            </label>
            <button onClick={() => setDropdownOpen(false)} style={{ marginTop: 4, width: '100%' }}>Close</button>
          </div>
        )}
      </div>
      <div style={{ marginTop: 16 }} className="tree-container">
        {displayTrees.length === 0 ? (
          <div>No nodes found for selected filter.</div>
        ) : (
          displayTrees.map(tree => (
            cardView
              ? renderNodeCard(tree, handleOverride, 0, fadingIds, expanded, toggleExpand)
              : renderNodeTabbed(tree, handleOverride, 0, fadingIds, expanded, toggleExpand)
          ))
        )}
      </div>
    </div>
  )
} 