import React, { useState } from 'react'
import { useTreeData } from './hooks/useTreeData'
import { StatusFilter } from './components/StatusFilter'
import { NodeRenderer } from './components/NodeRenderer'
import { filterWithFading } from './utils/treeUtils'
import { darkTheme } from './utils/styles'

export default function App() {
  const [cardView, setCardView] = useState(false)
  const [statusFilter, setStatusFilter] = useState(['FAIL'])
  
  const { trees, showAll, setShowAll, expanded, toggleExpand, loadTree, loadAllTrees, handleOverride } = useTreeData(statusFilter)

  // Minimal global dark theme styles
  React.useEffect(() => {
    document.body.style.background = darkTheme.background
    document.body.style.color = darkTheme.text
    document.body.style.fontFamily = 'Inter, Segoe UI, Arial, sans-serif'
    document.body.style.margin = '0'
  }, [])

  if (!trees) return <div>Loading...</div>

  // Filter for selected statuses
  const displayTrees = trees
    .map(tree => filterWithFading(tree, statusFilter, new Set()))
    .filter(Boolean)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => { setShowAll(false); loadTree(); }}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid #A0A4AE',
            background: '#fff',
            color: '#23272F',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s',
          }}
        >
          Show Random Tree
        </button>
        <button
          onClick={() => { setShowAll(true); loadAllTrees(); }}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid #A0A4AE',
            background: '#fff',
            color: '#23272F',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s',
          }}
        >
          Show All Trees
        </button>
      </div>
      <StatusFilter 
        trees={trees} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
      />
      <div style={{ marginTop: 16 }} className="tree-container">
        {displayTrees.length === 0 ? (
          <div>No nodes found for selected filter.</div>
        ) : (
          displayTrees.map(tree => (
            <NodeRenderer 
              key={tree.id}
              node={tree} 
              onOverride={handleOverride} 
              depth={0} 
              expanded={expanded}
              toggleExpand={toggleExpand}
              cardView={cardView}
            />
          ))
        )}
      </div>
    </div>
  )
} 