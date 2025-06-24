import { useState, useEffect, useCallback } from 'react'
import { Node } from '../types'
import { updateNodeInTree, updateNodeInForest } from '../utils/treeUtils'

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
    if (!trees || trees.length === 0) return
    
    // Find which tree contains this node
    const tree = trees.find(t => {
      const search = (n: Node): boolean => n.id === nodeId || n.children.some(search)
      return search(t)
    })
    if (!tree) return
    
    try {
      // Get updated node from backend
      const updatedNode = await fetch(`http://localhost:8001/override/${nodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).then(r => r.json())

      // Only update the affected node in the tree(s)
      if (showAll) {
        setTrees(prev => prev ? updateNodeInForest(prev, updatedNode) : prev)
      } else {
        setTrees(prev => prev ? [updateNodeInTree(prev[0], updatedNode)] : prev)
      }
    } catch (error) {
      console.error('Error overriding node:', error)
    }
  }, [trees, showAll])

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