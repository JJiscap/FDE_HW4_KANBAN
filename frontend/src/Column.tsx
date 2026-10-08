import { useState, type FormEvent } from 'react'
import type { Card, Status } from './types'

interface Props {
  status: Status
  label: string
  cards: Card[]
  onAdd: (title: string, status: Status) => void
  onDelete: (id: number) => void
  onDrop: (id: number, status: Status) => void
}

export function Column({ status, label, cards, onAdd, onDelete, onDrop }: Props) {
  const [title, setTitle] = useState('')
  const [over, setOver] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, status)
    setTitle('')
  }

  return (
    <section
      className={`column${over ? ' column--over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = Number(e.dataTransfer.getData('text/plain'))
        if (id) onDrop(id, status)
      }}
    >
      <h2>
        {label} <span className="count">{cards.length}</span>
      </h2>

      <ul>
        {cards.map((card) => (
          <li
            key={card.id}
            className="card"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(card.id))}
          >
            <span>{card.title}</span>
            <button aria-label={`Delete ${card.title}`} onClick={() => onDelete(card.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a card…"
          maxLength={200}
        />
      </form>
    </section>
  )
}
