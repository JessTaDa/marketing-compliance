import { Node } from '../types'

// Count nodes by status for filter labels
export function countNodesByStatus(node: Node, statuses: string[]): number {
  const status = node.status || 'N/A'
  const match = statuses.includes(status) ? 1 : 0
  return match + node.children.reduce((sum, child) => sum + countNodesByStatus(child, statuses), 0)
}

// Simple filter that only shows nodes matching the selected statuses
export function filterNodes(node: Node, statuses: string[]): Node | null {
  const status = node.status || 'N/A'
  
  // Only include nodes that directly match the filter
  if (statuses.includes(status)) {
    return {
      ...node,
      children: node.children.map(child => filterNodes(child, statuses)).filter(Boolean) as Node[],
    }
  }
  
  // If this node doesn't match, check if any children do
  const filteredChildren = node.children.map(child => filterNodes(child, statuses)).filter(Boolean) as Node[]
  if (filteredChildren.length > 0) {
    return { ...node, children: filteredChildren }
  }
  
  return null
}

// Backward compatibility alias - now uses simple filtering without fading effects
export function filterTreeByStatus(node: Node, statuses: string[], fadingIds?: Set<number>): Node | null {
  return filterNodes(node, statuses)
}

// Immutably update a node by id in a tree
export function updateNodeInTree(tree: Node, updatedNode: Node): Node {
  if (tree.id === updatedNode.id) {
    return { ...updatedNode };
  }
  return {
    ...tree,
    children: tree.children.map(child => updateNodeInTree(child, updatedNode)),
  };
}

// For multiple root nodes
export function updateNodeInForest(forest: Node[], updatedNode: Node): Node[] {
  return forest.map(tree => updateNodeInTree(tree, updatedNode));
} 