export interface Node {
  id: number
  type: string
  name: string
  status: string | null
  children: Node[]
} 