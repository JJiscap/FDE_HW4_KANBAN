import { useEffect, useState } from 'react'
import { api } from './api'
import { Column } from './Column'
import { COLUMNS, type Card, type Status } from './types'
import './App.css'

export default function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .list()
      .then(setCards)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function add(title: string, status: Status) {
    try {
      const card = await api.create(title, status)
      setCards((prev) => [...prev, card])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  // Optimistic: move the card immediately, roll back if the server rejects it.
  async function move(id: number, status: Status) {
    const before = cards
    if (before.find((c) => c.id === id)?.status === status) return
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    try {
      await api.move(id, status)
      setError(null)
    } catch (e) {
      setCards(before)
      setError((e as Error).message)
    }
  }

  async function remove(id: number) {
    const before = cards
    setCards((prev) => prev.filter((c) => c.id !== id))
    try {
      await api.remove(id)
      setError(null)
    } catch (e) {
      setCards(before)
      setError((e as Error).message)
    }
  }

  return (
    <main>
      <header>
        <h1>Kanban</h1>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </header>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="board">
          {COLUMNS.map(({ status, label }) => (
            <Column
              key={status}
              status={status}
              label={label}
              cards={cards.filter((c) => c.status === status)}
              onAdd={add}
              onDelete={remove}
              onDrop={move}
            />
          ))}
        </div>
      )}
    </main>
  )
}
