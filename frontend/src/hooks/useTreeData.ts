import { useState, useEffect, useCallback } from 'react'
import { Node } from '../types'

export function useTreeData(statusFilter: string[]) {
  const [trees, setTrees] = useState<Node[] | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

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
      loadAllTrees()
    } catch (error) {
      console.error('Error overriding node:', error)
    }
  }, [loadAllTrees])

  useEffect(() => {
    loadAllTrees()
    // eslint-disable-next-line
  }, [loadAllTrees])

  return {
    trees,
    expanded,
    toggleExpand,
    loadAllTrees,
    handleOverride
  }
} 