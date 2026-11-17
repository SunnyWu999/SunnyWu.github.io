import { useEffect, useRef, useState, type ReactNode } from 'react'
import { burstAt } from '../../game/sparkle'
import { FLIP_MS, type Flip } from './pageFlipState'
import './page-flip.css'

/*
  A real page turn. One leaf hinges on the spine of the book:
    turning forward  — its front is the old right page, its back is the new left page
    turning backward — its front is the new right page, its back is the old left page
  Underneath, the book already shows the pages the leaf is uncovering, so nothing pops.

  Smoothness: the turn is one continuous rotation (a single easing curve), it only starts
  after the leaf's pages have been laid out and painted, and the leaf stays on top until the
  book underneath has swapped to the new pages.
*/

type Props<T> = {
  flip: Flip<T>
  renderPage: (position: T, side: 'left' | 'right') => ReactNode
  onDone: () => void
}

export function FlipLeaf<T>({ flip, renderPage, onDone }: Props<T>) {
  const leaf = useRef<HTMLDivElement>(null)
  const [go, setGo] = useState(false)
  const frontPage = flip.dir > 0 ? flip.from : flip.to
  const backPage = flip.dir > 0 ? flip.to : flip.from

  // wait two frames so the new pages are on screen before the leaf starts to move
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setGo(true))
    })
    const fallback = window.setTimeout(() => setGo(true), 120)
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
      window.clearTimeout(fallback)
    }
  }, [])

  useEffect(() => {
    if (!go || flip.done) return
    const dust = window.setTimeout(() => {
      const book = leaf.current?.closest('.mb-book')?.getBoundingClientRect()
      if (book) burstAt(book.left + book.width / 2, book.top + book.height * 0.5, { count: 9, spread: book.width * 0.07 })
    }, FLIP_MS * 0.45)
    const done = window.setTimeout(onDone, FLIP_MS + 30)
    return () => {
      window.clearTimeout(dust)
      window.clearTimeout(done)
    }
    // onDone is recreated on every render; the turn itself only changes with `go` / `flip`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, flip.done])

  return (
    <div
      ref={leaf}
      className={`pf-leaf pf-leaf--${flip.dir > 0 ? 'next' : 'prev'} ${go ? 'is-go' : ''}`}
      style={{ ['--pf-ms' as string]: `${FLIP_MS}ms` }}
      aria-hidden="true"
    >
      <div className="pf-face pf-face--front">
        <div className="pf-frame pf-frame--front">{renderPage(frontPage, 'right')}</div>
        <span className="pf-shade" />
      </div>
      <div className="pf-face pf-face--back">
        <div className="pf-frame pf-frame--back">{renderPage(backPage, 'left')}</div>
        <span className="pf-shade" />
      </div>
    </div>
  )
}
