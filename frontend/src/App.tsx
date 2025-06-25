import React, { useState, useMemo, useCallback } from 'react'
import { useTreeData } from './hooks/useTreeData'
import { StatusFilter } from './components/StatusFilter'
import NodeRenderer from './components/NodeRenderer'
import { filterTreeByStatus } from './utils/treeUtils'
import { darkTheme } from './utils/styles'

export default function App() {
  // Set all statuses selected by default
  const [statusFilter, setStatusFilter] = useState(['PASS', 'FAIL', 'N/A'])
  
  const { trees, expanded, toggleExpand, loadAllTrees, handleOverride } = useTreeData(statusFilter)

  // Memoize the expensive filtered trees calculation to prevent recalculation on every render
  const displayTrees = useMemo(() => {
    if (!trees) return []
    return trees
      .map(tree => filterTreeByStatus(tree, statusFilter))
      .filter(Boolean)
  }, [trees, statusFilter])

  // Minimal global dark theme styles
  React.useEffect(() => {
    document.body.style.background = darkTheme.background
    document.body.style.color = darkTheme.text
    document.body.style.fontFamily = 'Inter, Segoe UI, Arial, sans-serif'
    document.body.style.margin = '0'
  }, [])

  if (!trees) return <div>Loading...</div>

  return (
    <div style={{ padding: '40px 72px 32px 72px' }}>
      <div style={{ fontSize: '2.1em', fontWeight: 900, letterSpacing: 1, margin: '24px 0 32px 0', color: darkTheme.text, textAlign: 'center' }}>
        Marketing Compliance Analyzer
      </div>
      
      <div style={{ marginBottom: 28 }}>
        <StatusFilter 
          trees={trees} 
          statusFilter={statusFilter} 
          setStatusFilter={setStatusFilter} 
        />
      </div>
      <div style={{ marginTop: 24 }} className="tree-container">
        {displayTrees.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: darkTheme.subtitle, 
            fontSize: '16px',
            padding: '40px 20px'
          }}>
            No nodes found for selected filter.
          </div>
        ) : (
          displayTrees.map(tree => (
            <NodeRenderer 
              key={tree.id}
              node={tree} 
              onOverride={handleOverride} 
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  )
} 