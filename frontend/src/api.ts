import type { Card, Status } from './types'

// Same-origin by default: Vercel routes /api/* to the backend service.
// Set VITE_API_URL (e.g. http://localhost:8000/api) to run the frontend against a standalone backend.
const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.detail ?? `Request failed (${res.status})`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const api = {
  list: () => request<Card[]>('/cards'),
  create: (title: string, status: Status = 'todo') =>
    request<Card>('/cards', { method: 'POST', body: JSON.stringify({ title, status }) }),
  move: (id: number, status: Status) =>
    request<Card>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: (id: number) => request<void>(`/cards/${id}`, { method: 'DELETE' }),
}
