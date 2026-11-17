import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DISH_IDS, TREASURES, resetProgress, useProgress } from './progress'
import { dishInfo } from './dishInfo'
import { burstAt } from './sparkle'
import './game.css'

/*
  The game layer: a title + score bar (tap it to open the Wonderland journal) and a toast
  whenever something is discovered. Progress lives in progress.ts and is saved in localStorage.
*/

export default function GameHud({ scene }: { scene: 'professional' | 'personal' }) {
  const progress = useProgress()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(0)
  const [hint, setHint] = useState<string | null>(null)
  const navigate = useNavigate()

  const toast = progress.event && progress.event.id !== dismissed ? progress.event : null
  const toastId = toast?.id ?? 0
  const big = Boolean(toast && toast.icon === '👑')

  useEffect(() => {
    if (!toastId) return
    burstAt(window.innerWidth / 2, 70, { count: big ? 40 : 20, spread: big ? 260 : 150 })
    const timer = window.setTimeout(() => setDismissed(toastId), 3600)
    return () => window.clearTimeout(timer)
  }, [toastId, big])

  return (
    <>
      <aside className={`gh gh--${scene}`} aria-label="Wonderland progress">
        <button type="button" className="gh__badge" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <span className="gh__crown" aria-hidden="true">
            {progress.complete ? '👑' : '✦'}
          </span>
          <span className="gh__title">{progress.levelTitle}</span>
          <span className="gh__score">
            {progress.score} / {progress.maxScore}
          </span>
          <span className="gh__bar" aria-hidden="true">
            <i style={{ width: `${Math.round(progress.levelProgress * 100)}%` }} />
          </span>
        </button>

        {open ? (
          <div className="gh__journal">
            <h2>Wonderland journal</h2>
            <p className="gh__next">{progress.nextTitle ? `Next title: ${progress.nextTitle}` : 'You found everything. Curiouser and curiouser!'}</p>

            <p className="gh__section">
              Dishes tasted · {progress.dishes.length} / {DISH_IDS.length}
            </p>
            <ul className="gh__grid">
              {DISH_IDS.map((id) => {
                const info = dishInfo[id]
                const found = progress.dishes.includes(id)
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`gh__item ${found ? 'is-found' : ''}`}
                      title={found ? `Open ${info.title}` : 'Taste this dish'}
                      onClick={() => {
                        setOpen(false)
                        setHint(null)
                        navigate({ pathname: '/', hash: `#${id}` })
                      }}
                    >
                      <img src={info.image} alt="" />
                      <span>{found ? info.name : '???'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className="gh__section">
              Treasures caught · {progress.treasures.length} / {TREASURES.length}
            </p>
            <ul className="gh__grid">
              {TREASURES.map((treasure) => {
                const found = progress.treasures.includes(treasure.id)
                return (
                  <li key={treasure.id}>
                    <button
                      type="button"
                      className={`gh__item ${found ? 'is-found' : ''}`}
                      onClick={() => setHint(found ? `${treasure.name}: ${treasure.note}` : 'Still hidden… flip the egg and catch it while you fall down the rabbit hole!')}
                    >
                      <img src={treasure.image} alt="" />
                      <span>{found ? treasure.name : '???'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {hint ? <p className="gh__hint">{hint}</p> : null}

            <div className="gh__actions">
              <button
                type="button"
                className="gh__reset"
                onClick={() => {
                  setOpen(false)
                  window.dispatchEvent(new Event('guide:replay'))
                }}
              >
                talk to Rainy again
              </button>
              <button type="button" className="gh__reset" onClick={resetProgress}>
                start over
              </button>
            </div>
          </div>
        ) : null}
      </aside>

      {toast ? (
        <div className="gh-toast" key={toast.id} role="status">
          <span className="gh-toast__icon" aria-hidden="true">
            {toast.icon}
          </span>
          <div>
            <strong>{toast.title}</strong>
            <span>{toast.detail}</span>
          </div>
        </div>
      ) : null}
    </>
  )
}
