import React, { useState, useMemo, useCallback } from 'react'
import { useTreeData } from './hooks/useTreeData'
import { StatusFilter } from './components/StatusFilter'
import { MemoizedNodeRenderer } from './components/NodeRenderer'
import { filterWithFading } from './utils/treeUtils'
import { darkTheme } from './utils/styles'

export default function App() {
  // Set all statuses selected by default
  const [statusFilter, setStatusFilter] = useState(['PASS', 'FAIL', 'N/A'])
  
  const { trees, showAll, setShowAll, expanded, toggleExpand, loadTree, loadAllTrees, handleOverride } = useTreeData(statusFilter)

  // Memoize the expensive filtered trees calculation to prevent recalculation on every render
  const displayTrees = useMemo(() => {
    if (!trees) return []
    return trees
      .map(tree => filterWithFading(tree, statusFilter, new Set()))
      .filter(Boolean)
  }, [trees, statusFilter])

  // Memoize event handlers to prevent child component re-renders
  const handleShowRandomTree = useCallback(() => {
    setShowAll(false)
    loadTree()
  }, [setShowAll, loadTree])

  const handleShowAllTrees = useCallback(() => {
    setShowAll(true)
    loadAllTrees()
  }, [setShowAll, loadAllTrees])

  // On mount, show all trees by default
  React.useEffect(() => {
    setShowAll(true)
    loadAllTrees()
    // eslint-disable-next-line
  }, [])

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
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
        <button
          onClick={handleShowRandomTree}
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
          onClick={handleShowAllTrees}
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
      <div style={{ marginBottom: 28 }}>
        <StatusFilter 
          trees={trees} 
          statusFilter={statusFilter} 
          setStatusFilter={setStatusFilter} 
        />
      </div>
      <div style={{ marginTop: 24 }} className="tree-container">
        {displayTrees.length === 0 ? (
          <div>No nodes found for selected filter.</div>
        ) : (
          displayTrees.map(tree => (
            <MemoizedNodeRenderer 
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