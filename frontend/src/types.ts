export type Status = 'todo' | 'doing' | 'done'

export interface Card {
  id: number
  title: string
  status: Status
  created_at: string
}

export const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'doing', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]
