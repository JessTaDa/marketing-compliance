export interface Node {
  id: number
  type: string
  name: string
  status: string | null
  children: Node[]
  last_updated_by_user?: string | null  // Timestamp when user last updated this node
} 