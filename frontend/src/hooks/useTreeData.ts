import { useState, useEffect, useCallback } from 'react'
import { Node } from '../types'

export function useTreeData(statusFilter: string[]) {
  const [trees, setTrees] = useState<Node[] | null>(null)
  const [showAll, setShowAll] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const loadTree = useCallback(async () => {
    try {
      const data = await fetch('http://localhost:8001/').then(r => r.json())
      setTrees([data])
    } catch (error) {
      console.error('Error loading tree:', error)
    }
  }, [])

  const loadAllTrees = useCallback(async () => {
    try {
      const data = await fetch('http://localhost:8001/all').then(r => r.json())
      setTrees(data)
    } catch (error) {
      console.error('Error loading all trees:', error)
    }
  }, [])

  const toggleExpand = useCallback((id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleOverride = useCallback(async (nodeId: number, newStatus: string) => {
    try {
      await fetch(`http://localhost:8001/override/${nodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      showAll ? loadAllTrees() : loadTree()
    } catch (error) {
      console.error('Error overriding node:', error)
    }
  }, [showAll, loadAllTrees, loadTree])

  useEffect(() => {
    showAll ? loadAllTrees() : loadTree()
    // eslint-disable-next-line
  }, [showAll, loadAllTrees, loadTree])

  return {
    trees,
    showAll,
    setShowAll,
    expanded,
    toggleExpand,
    loadTree,
    loadAllTrees,
    handleOverride
  }
} 