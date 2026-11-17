import { useEffect, type ReactNode } from 'react'
import './game-modal.css'

/* One ornate frame shared by the puzzle, the comment wall and the story book. */

type Props = { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }

export default function GameModal({ title, subtitle, onClose, children, wide = false }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="gm" onClick={onClose} role="presentation">
      <section className={`gm__panel ${wide ? 'gm__panel--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="gm__close" onClick={onClose} aria-label={`Close ${title}`}>
          ×
        </button>
        <header className="gm__head">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
        <div className="gm__body">{children}</div>
      </section>
    </div>
  )
}
