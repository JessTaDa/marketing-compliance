import React, { useState } from 'react'
import { useTreeData } from './hooks/useTreeData'
import { StatusFilter } from './components/StatusFilter'
import { NodeRenderer } from './components/NodeRenderer'
import { filterWithFading } from './utils/treeUtils'

export default function App() {
  const [cardView, setCardView] = useState(false)
  const [statusFilter, setStatusFilter] = useState(['FAIL'])
  
  const { trees, showAll, setShowAll, fadingIds, expanded, toggleExpand, loadTree, loadAllTrees, handleOverride } = useTreeData(statusFilter)

  if (!trees) return <div>Loading...</div>

  // Filter for selected statuses, but always include nodes that are fading out
  const displayTrees = trees
    .map(tree => filterWithFading(tree, statusFilter, fadingIds))
    .filter(Boolean)

  return (
    <div>
      <h1>Compliance Analysis</h1>
      <button onClick={() => { setShowAll(false); loadTree(); }}>Show Random Tree</button>
      <button onClick={() => { setShowAll(true); loadAllTrees(); }} style={{ marginLeft: 8 }}>Show All Trees</button>
      <button onClick={() => setCardView(v => !v)} style={{ marginLeft: 8 }}>
        Switch to {cardView ? 'Tabbed' : 'Card'} View
      </button>
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
              fadingIds={fadingIds}
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