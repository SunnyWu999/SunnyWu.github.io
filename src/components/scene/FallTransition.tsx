import { useEffect, useRef, useState } from 'react'
import bookData from '../../data/recipe-book.json'
import { TREASURES, collectTreasure, useProgress } from '../../game/progress'
import { burstAt } from '../../game/sparkle'
import './fall-transition.css'

/*
  The rabbit-hole transition, built from layers (no video):
  1. the scene you are leaving zooms toward the hole,
  2. a tall Tenniel-style tunnel scrolls past while objects float by at different speeds,
  3. the destination scene settles in and the overlay melts away.
  "fall" = professional → personal (down into the night); "rise" = personal → professional (up into daylight).
  Treasures are clickable — catch them all for the game.
*/

export type Direction = 'fall' | 'rise'

const TOTAL_MS = 4000
const SWAP_MS = 1500 // route changes here, hidden behind the tunnel

const scenes = {
  professional: '/images/scene/scene-professional.webp',
  personal: '/images/scene/scene-personal.webp',
}

// Photos come from the data file: a real photo if one has been added, otherwise the dish illustration.
const photoSources = (bookData as { chapters: { image: string; entries: { photo?: string }[] }[] }).chapters
  .slice(0, 4)
  .map((chapter) => {
    const real = chapter.entries.map((entry) => entry.photo).find((photo) => photo && !photo.includes('[PLACEHOLDER]'))
    return real || `/images/scene/optimized/${chapter.image}.webp`
  })

type Floater = { key: string; x: number; size: number; delay: number; dur: number; spin: number; depth: 0 | 1 | 2; treasure?: (typeof TREASURES)[number]; photo?: string }

// depth 0 = far (slow, small, soft), 2 = near (fast, big, soft-focus) — gives the parallax.
const floaters: Floater[] = [
  { key: 'pocket-watch', x: 12, size: 17, delay: 900, dur: 2300, spin: -40, depth: 2, treasure: TREASURES[0] },
  { key: 'teacup', x: 74, size: 15, delay: 1250, dur: 2400, spin: 55, depth: 1, treasure: TREASURES[1] },
  { key: 'golden-key', x: 38, size: 13, delay: 1650, dur: 2000, spin: 120, depth: 2, treasure: TREASURES[2] },
  { key: 'playing-card', x: 86, size: 12, delay: 1100, dur: 2700, spin: -75, depth: 0, treasure: TREASURES[3] },
  { key: 'drink-me-bottle', x: 55, size: 14, delay: 1850, dur: 2100, spin: 30, depth: 1, treasure: TREASURES[4] },
  { key: 'photo-0', x: 24, size: 15, delay: 1000, dur: 2800, spin: 8, depth: 0, photo: photoSources[0] },
  { key: 'photo-1', x: 66, size: 16, delay: 1500, dur: 2500, spin: -6, depth: 1, photo: photoSources[1] },
  { key: 'photo-2', x: 5, size: 13, delay: 1900, dur: 2200, spin: 10, depth: 0, photo: photoSources[2] },
  { key: 'photo-3', x: 47, size: 12, delay: 2050, dur: 2000, spin: -9, depth: 2, photo: photoSources[3] },
]

type Props = { direction: Direction; onSwap: () => void; onDone: () => void }

function FallTransition({ direction, onSwap, onDone }: Props) {
  const progress = useProgress()
  const [skipping, setSkipping] = useState(false)
  const timers = useRef<number[]>([])
  const swapped = useRef(false)

  const swap = () => {
    if (swapped.current) return
    swapped.current = true
    onSwap()
  }

  useEffect(() => {
    timers.current = [window.setTimeout(swap, SWAP_MS), window.setTimeout(onDone, TOTAL_MS)]
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const skip = () => {
    if (skipping) return
    setSkipping(true)
    timers.current.forEach((id) => window.clearTimeout(id))
    swap()
    timers.current = [window.setTimeout(onDone, 320)]
  }

  const from = direction === 'fall' ? scenes.professional : scenes.personal
  const to = direction === 'fall' ? scenes.personal : scenes.professional
  // Floating objects travel up the screen while we fall, and down while we float up.
  const travel = direction === 'fall' ? { from: '115vh', to: '-45vh' } : { from: '-45vh', to: '115vh' }

  return (
    <div
      className={`ft ft--${direction} ${skipping ? 'ft--skip' : ''}`}
      style={{ ['--ft-total' as string]: `${TOTAL_MS}ms` }}
      aria-live="polite"
      role="status"
      aria-label={direction === 'fall' ? 'Falling down the rabbit hole' : 'Floating back up'}
    >
      <div className="ft__scene ft__scene--start" style={{ backgroundImage: `url(${from})` }} />

      <div className="ft__tunnel" aria-hidden="true">
        <img className="ft__tunnel-img" src="/images/scene/transition/rabbit-hole.webp" alt="" />
      </div>
      <div className="ft__tint" aria-hidden="true" />

      <div className="ft__floaters">
        {floaters.map((item) => {
          const style = {
            left: `${item.x}%`,
            width: `${item.size}vmin`,
            animationDelay: `${item.delay}ms`,
            animationDuration: `${item.dur}ms`,
            ['--from' as string]: travel.from,
            ['--to' as string]: travel.to,
            ['--spin' as string]: `${item.spin}deg`,
            ['--blur' as string]: item.depth === 2 ? '2.5px' : item.depth === 0 ? '1.5px' : '0px',
            opacity: item.depth === 0 ? 0.75 : 1,
          }
          if (item.treasure) {
            const caught = progress.treasures.includes(item.treasure.id)
            return (
              <button
                key={item.key}
                type="button"
                className={`ft__floater ft__floater--treasure ${caught ? 'is-caught' : ''}`}
                style={style}
                aria-label={`Catch the ${item.treasure.name}`}
                onClick={(event) => {
                  const treasure = item.treasure
                  if (!treasure) return
                  burstAt(event.clientX, event.clientY, { count: 18, spread: 110 })
                  collectTreasure(treasure.id)
                }}
              >
                <img src={item.treasure.image} alt="" draggable={false} />
              </button>
            )
          }
          return (
            <span key={item.key} className="ft__floater ft__floater--photo" style={style} aria-hidden="true">
              <img src={item.photo} alt="" draggable={false} />
            </span>
          )
        })}
      </div>

      <p className="ft__line" aria-hidden="true">
        {direction === 'fall' ? 'Down, down, down…' : 'Up, up, up…'}
      </p>
      <p className="ft__catch">
        ✦ catch the treasures · {progress.treasures.length} / {TREASURES.length}
      </p>

      <div className="ft__glow" aria-hidden="true" />
      <div className="ft__scene ft__scene--land" style={{ backgroundImage: `url(${to})` }} />
      <div className="ft__vignette" aria-hidden="true" />

      <button type="button" className="ft__skip" onClick={skip}>
        skip
      </button>
    </div>
  )
}

export default FallTransition
