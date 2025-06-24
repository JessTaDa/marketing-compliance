import React, { useState, useEffect } from 'react'

interface Node {
  id: number
  type: string
  name: string
  status: string | null
  children: Node[]
}

const bgColors = ['#f9f9f9', '#e6f7ff', '#fffbe6', '#f6ffed']
const STATUS_OPTIONS = [
  { label: 'PASS', value: 'PASS' },
  { label: 'FAIL', value: 'FAIL' },
  { label: 'N/A', value: 'N/A' },
]

function renderNodeTabbed(node: Node, onOverride: (id: number, status: string) => void, depth = 0) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  return (
    <div key={node.id} style={{ marginLeft: depth * 20 }}>
      {node.type}: {node.name} (id: {node.id}) | <span style={{ color: statusColor }}>{node.status || 'N/A'}</span>
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
      {node.children.map(child => renderNodeTabbed(child, onOverride, depth + 1))}
    </div>
  )
}

function renderNodeCard(node: Node, onOverride: (id: number, status: string) => void, depth = 0) {
  const statusColor = node.status === 'PASS' ? 'green' : node.status === 'FAIL' ? 'red' : 'gray'
  const cardStyle = {
    marginLeft: depth * 10,
    marginBottom: 10,
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    background: bgColors[depth % bgColors.length],
    boxShadow: depth === 0 ? '0 2px 8px #eee' : undefined,
  } as React.CSSProperties
  return (
    <div key={node.id} style={cardStyle}>
      <div>
        <strong>{node.type}</strong>: {node.name} (id: {node.id}) |{' '}
        <span style={{ color: statusColor }}>{node.status || 'N/A'}</span>
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
      {node.children.map(child => renderNodeCard(child, onOverride, depth + 1))}
    </div>
  )
}

// Recursively filter tree to only include nodes with selected statuses and their parent context
function filterByStatus(node: Node, statuses: string[]): Node | null {
  const status = node.status || 'N/A'
  if (statuses.includes(status)) {
    return {
      ...node,
      children: node.children.map(child => filterByStatus(child, statuses)).filter(Boolean) as Node[],
    }
  }
  // If any child matches, include this node for context
  const filteredChildren = node.children.map(child => filterByStatus(child, statuses)).filter(Boolean) as Node[]
  if (filteredChildren.length > 0) {
    return { ...node, children: filteredChildren }
  }
  return null
}

// Count all nodes in a tree
function countNodes(node: Node): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0)
}
// Count all failing nodes in a tree
function countFailingNodes(node: Node): number {
  const failHere = node.status === 'FAIL' ? 1 : 0
  return failHere + node.children.reduce((sum, child) => sum + countFailingNodes(child), 0)
}

export default function App() {
  const [trees, setTrees] = useState<Node[] | null>(null)
  const [cardView, setCardView] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [statusFilter, setStatusFilter] = useState(['PASS', 'FAIL', 'N/A'])
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
    // Find the tree containing the node
    const findTree = (trees: Node[]) => trees.find(t => {
      const search = (n: Node): boolean => n.id === nodeId || n.children.some(search)
      return search(t)
    })
    const tree = findTree(trees)
    if (!tree) return
    const hasChildren = (node: Node): boolean => {
      if (node.id === nodeId) return node.children.length > 0
      return node.children.some(hasChildren)
    }
    const endpoint = hasChildren(tree) ? 'cascade_override' : 'override'
    const updatedTree = await fetch(`http://localhost:8001/${endpoint}/${nodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(r => r.json())
    // If showing all, reload all; else reload one
    showAll ? loadAllTrees() : setTrees([updatedTree])
  }

  useEffect(() => {
    showAll ? loadAllTrees() : loadTree()
    // eslint-disable-next-line
  }, [showAll])

  if (!trees) return <div>Loading...</div>

  // Filter for selected statuses
  const displayTrees = trees
    .map(tree => filterByStatus(tree, statusFilter))
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
      <div style={{ marginTop: 16 }}>
        {displayTrees.length === 0 ? (
          <div>No nodes found for selected filter.</div>
        ) : (
          displayTrees.map(tree => (
            cardView
              ? renderNodeCard(tree, handleOverride)
              : renderNodeTabbed(tree, handleOverride)
          ))
        )}
      </div>
    </div>
  )
} 