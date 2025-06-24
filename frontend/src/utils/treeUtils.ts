import { Node } from '../types'

// Count nodes by status for filter labels
export function countNodesByStatus(node: Node, statuses: string[]): number {
  const status = node.status || 'N/A'
  const match = statuses.includes(status) ? 1 : 0
  return match + node.children.reduce((sum, child) => sum + countNodesByStatus(child, statuses), 0)
}

// Filter tree for selected statuses, but always include nodes that are fading out
export function filterWithFading(node: Node, statuses: string[], fadingIds: Set<number>): Node | null {
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