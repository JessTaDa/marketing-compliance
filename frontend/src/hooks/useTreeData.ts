import { useState, useEffect } from 'react'
import { Node } from '../types'

export function useTreeData(statusFilter: string[]) {
  const [trees, setTrees] = useState<Node[] | null>(null)
  const [showAll, setShowAll] = useState(true)
  const [fadingIds, setFadingIds] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const loadTree = async () => {
    try {
      const data = await fetch('http://localhost:8001/').then(r => r.json())
      setTrees([data])
    } catch (error) {
      console.error('Error loading tree:', error)
    }
  }

  const loadAllTrees = async () => {
    try {
      const data = await fetch('http://localhost:8001/all').then(r => r.json())
      setTrees(data)
    } catch (error) {
      console.error('Error loading all trees:', error)
    }
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleOverride = async (nodeId: number, newStatus: string) => {
    if (!trees || trees.length === 0) return
    
    // Find which tree contains this node
    const tree = trees.find(t => {
      const search = (n: Node): boolean => n.id === nodeId || n.children.some(search)
      return search(t)
    })
    if (!tree) return
    
    try {
      // Get updated tree from backend
      const updatedTree = await fetch(`http://localhost:8001/override/${nodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).then(r => r.json())
      
      // Update trees immediately to show new status
      const newTrees = showAll ? await fetch('http://localhost:8001/all').then(r => r.json()) : [updatedTree]
      setTrees(newTrees)
      
      // Check if the affected node will be filtered out
      const findNode = (nodes: Node[], id: number): Node | null => {
        for (const node of nodes) {
          if (node.id === id) return node
          const found = findNode(node.children, id)
          if (found) return found
        }
        return null
      }
      
      const node = findNode(newTrees, nodeId)
      if (node) {
        const nodeStatus = node.status || 'N/A'
        if (!statusFilter.includes(nodeStatus)) {
          // Add to fading state
          setFadingIds(prev => new Set([...prev, nodeId]))
          
          // Remove from fading state after animation completes
          setTimeout(() => {
            setFadingIds(prev => {
              const next = new Set(prev)
              next.delete(nodeId)
              return next
            })
          }, 1500)
        }
      }
    } catch (error) {
      console.error('Error overriding node:', error)
    }
  }

  useEffect(() => {
    showAll ? loadAllTrees() : loadTree()
    // eslint-disable-next-line
  }, [showAll])

  return {
    trees,
    showAll,
    setShowAll,
    fadingIds,
    expanded,
    toggleExpand,
    loadTree,
    loadAllTrees,
    handleOverride
  }
} 