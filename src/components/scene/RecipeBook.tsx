import { useCallback, useEffect, useState, type FormEvent, type ReactNode, type TouchEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import bookData from '../../data/recipe-book.json'
import { commentsService, type CommentRecord } from '../../services/commentsService'
import type { StoryBlock } from '../../types'
import { StoryPage } from './StoryBlocks'
import { FlipLeaf } from './PageFlip'
import { useBookTilt } from './useBookTilt'
import { FLIP_MS, flipBase, type Flip } from './pageFlipState'
import { paginateStory, usableBlocks, type StoryPageSlots } from './storyPagination'
import './menu-book.css'
import './recipe-book.css'

/*
  The enchanted recipe book (night side).
  All text lives in src/data/recipe-book.json — one chapter per dish, one spread per entry.
*/

type Entry = {
  name?: string
  served?: string
  tag?: string
  ingredients?: string[]
  method?: string
  notes?: string
  photo?: string
  video?: string
  story?: StoryBlock[]
}

type Spread = { entryIndex: number; blocks: StoryPageSlots | null; page: number; pages: number }

/** Every entry is a recipe spread, followed by one extra spread per page of its story. */
function buildSpreads(chapter: Chapter): Spread[] {
  return chapter.entries.flatMap((entry, entryIndex) => {
    const recipe: Spread = { entryIndex, blocks: null, page: 0, pages: 0 }
    const pages = paginateStory(usableBlocks(entry.story))
    return [recipe, ...pages.map((blocks, page) => ({ entryIndex, blocks, page, pages: pages.length }))]
  })
}

type Chapter = {
  id: string
  ribbon: string
  title: string
  subtitle?: string
  image: string
  kind?: 'fortune' | 'guestbook'
  entries: Entry[]
}

const chapters = (bookData as unknown as { chapters: Chapter[] }).chapters
const ribbonColors = ['#8e2b2b', '#b07a2a', '#3f6b5a', '#5a4a86', '#a24d6e', '#2f5d7c', '#6d5a3a']

const spreadsByChapter = chapters.map(buildSpreads)
const indexOfChapter = (id: string) => Math.max(0, chapters.findIndex((chapter) => chapter.id === id))

/** Where the book is open: a chapter and one of its spreads. */
type Pos = { c: number; s: number }

const clean = (value?: string) => (value && !value.includes('[PLACEHOLDER]') ? value.trim() : '')

function Media({ entry, onOpen }: { entry: Entry; onOpen: (media: { type: 'photo' | 'video'; src: string }) => void }) {
  const photo = clean(entry.photo)
  const video = clean(entry.video)
  if (!photo && !video) return null
  return (
    <div className="rb-media">
      {photo ? (
        <button type="button" className="rb-media__frame" onClick={() => onOpen({ type: 'photo', src: photo })} aria-label="Open photo">
          <img src={photo} alt="" />
        </button>
      ) : null}
      {video ? (
        <button type="button" className="rb-media__frame rb-media__frame--video" onClick={() => onOpen({ type: 'video', src: video })} aria-label="Play video">
          <video src={video} muted playsInline preload="metadata" />
          <span className="rb-media__play">▶</span>
        </button>
      ) : null}
    </div>
  )
}

function GuestBook() {
  const [notes, setNotes] = useState<CommentRecord[]>(() => commentsService.getComments())
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [trap, setTrap] = useState('')
  const [signed, setSigned] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (trap || !message.trim()) return
    commentsService.addComment({ name, message: message.slice(0, 500) })
    setNotes(commentsService.getComments())
    setName('')
    setMessage('')
    setSigned(true)
    window.setTimeout(() => setSigned(false), 2400)
  }

  const recent = notes.slice(-2).reverse()

  return (
    <>
      <form className="rb-slot rb-slot--form" onSubmit={submit}>
        <p className="mb-section">Leave a note</p>
        <input className="rb-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="your name (optional)" maxLength={60} />
        <textarea className="rb-input rb-input--area" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="a note, a dare, a recipe…" maxLength={500} required />
        <input className="rb-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(event) => setTrap(event.target.value)} aria-hidden="true" />
        <button type="submit" className="mb-seal rb-seal">{signed ? 'Signed ✦' : 'Seal it'}</button>
      </form>
      <div className="mb-slot mb-slot--3">
        <div className="mb-slot__content">
          {recent.length === 0 ? <p className="mb-line">Be the first to sign the book.</p> : null}
          {recent.map((note) => (
            <p key={note.id} className="rb-note">
              “{note.message}” <span>— {note.name}</span>
            </p>
          ))}
        </div>
      </div>
    </>
  )
}

function Fortune({ entry }: { entry: Entry }) {
  const [open, setOpen] = useState(false)
  const answer = clean(entry.method)
  return (
    <>
      <div className="mb-slot mb-slot--1">
        <div className="mb-slot__content">
          <p className="mb-section">The question</p>
          <h3 className="mb-title">{clean(entry.name)}</h3>
        </div>
      </div>
      <div className="mb-slot mb-slot--2">
        <div className="mb-slot__content">
          {!open ? (
            <button type="button" className="rb-crack" onClick={() => setOpen(true)}>
              crack it open ✦
            </button>
          ) : (
            <motion.p className="rb-fortune" initial={{ opacity: 0, scaleX: 0.2 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.6 }}>
              {answer}
            </motion.p>
          )}
        </div>
      </div>
    </>
  )
}

type Props = { chapterId: string; onChapter: (id: string) => void; onClose: () => void }

function RecipeBook({ chapterId, onChapter, onClose }: Props) {
  const reducedMotion = useReducedMotion()
  const tilt = useBookTilt(!reducedMotion)
  const [pos, setPos] = useState<Pos>({ c: indexOfChapter(chapterId), s: 0 })
  const [flip, setFlip] = useState<Flip<Pos> | null>(null)
  const [seenId, setSeenId] = useState(chapterId)
  const [landing, setLanding] = useState<number | null>(null) // page to land on after going back a chapter
  const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left')
  const [touchX, setTouchX] = useState<number | null>(null)
  const [media, setMedia] = useState<{ type: 'photo' | 'video'; src: string } | null>(null)

  const isPhone = () => window.matchMedia('(max-width: 767px)').matches

  // The URL asked for another chapter (a ribbon, or next/previous across a chapter edge): turn the page to it.
  if (chapterId !== seenId) {
    setSeenId(chapterId)
    const target: Pos = { c: indexOfChapter(chapterId), s: landing ?? 0 }
    setLanding(null)
    if (target.c !== pos.c) {
      if (reducedMotion || isPhone() || flip) {
        setFlip(null)
        setPos(target)
        setMobileSide('left')
      } else {
        setFlip({ dir: target.c > pos.c ? 1 : -1, from: pos, to: target })
      }
    }
  }

  const turn = useCallback(
    (step: number) => {
      if (isPhone()) {
        if (step > 0 && mobileSide === 'left') return setMobileSide('right')
        if (step < 0 && mobileSide === 'right') return setMobileSide('left')
      }
      if (flip) return
      const next = pos.s + step
      if (next >= 0 && next < spreadsByChapter[pos.c].length) {
        if (isPhone() || reducedMotion) {
          setPos({ c: pos.c, s: next })
          if (isPhone()) setMobileSide(step > 0 ? 'left' : 'right')
          return
        }
        setFlip({ dir: step > 0 ? 1 : -1, from: pos, to: { c: pos.c, s: next } })
        return
      }
      const nextChapter = chapters[pos.c + step]
      if (nextChapter) {
        // going back lands on the last page of the previous chapter
        if (step < 0) setLanding(spreadsByChapter[pos.c + step].length - 1)
        onChapter(nextChapter.id)
      }
    },
    [flip, mobileSide, onChapter, pos, reducedMotion],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (media) setMedia(null)
        else onClose()
      }
      if (!media && event.key === 'ArrowRight') turn(1)
      if (!media && event.key === 'ArrowLeft') turn(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [media, onClose, turn])

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => setTouchX(event.touches[0]?.clientX ?? null)
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchX === null) return
    const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX
    if (Math.abs(delta) > 50) turn(delta < 0 ? 1 : -1)
    setTouchX(null)
  }

  const base = flipBase(flip, pos)
  const shown = chapters[pos.c]

  /** One page of any spread of any chapter — used for the book itself and for both faces of the turning leaf. */
  const pageFor = (position: Pos, side: 'left' | 'right', still = false): ReactNode => {
    const chapter = chapters[position.c]
    const spreads = spreadsByChapter[position.c]
    const spread = spreads[Math.min(position.s, spreads.length - 1)]
    const entryIndex = spread.entryIndex
    const entry: Entry = chapter.entries[entryIndex] ?? {}
    const ingredients = (entry.ingredients ?? []).map((item) => clean(item)).filter(Boolean)
    const key = `${position.c}-${position.s}`

    if (side === 'left') {
      return (
        <div key={`l${key}`} className="mb-page mb-page--left">
          <div className="mb-slot mb-slot--1 rb-chapter">
            <div className="mb-slot__content">
              <p className="mb-cover-title__sub">{chapter.title}</p>
              {clean(chapter.subtitle) ? <p className="rb-subtitle">{chapter.subtitle}</p> : null}
            </div>
          </div>
          <div className="rb-illustration">
            <img src={`images/scene/optimized/${chapter.image}.webp`} alt="" />
          </div>
          <div className="mb-slot mb-slot--3">
            <div className="mb-slot__content">
              {chapter.kind === 'fortune' ? <p className="mb-section">Fortune {entryIndex + 1}</p> : null}
              {chapter.kind !== 'fortune' && clean(entry.name) ? <h3 className="mb-title rb-name">{clean(entry.name)}</h3> : null}
              {chapter.kind !== 'fortune' && clean(entry.served) ? <p className="mb-meta">{clean(entry.served)}</p> : null}
              {clean(entry.tag) ? <p className="rb-tag">{clean(entry.tag)}</p> : null}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={`r${key}`} className="mb-page mb-page--right">
        {chapter.kind === 'fortune' ? <Fortune key={entryIndex} entry={entry} /> : null}
        {chapter.kind === 'guestbook' ? <GuestBook /> : null}
        {!chapter.kind && spread.blocks ? (
          <StoryPage key={key} slots={spread.blocks} onOpen={setMedia} still={still} lead={flip && !flip.done ? FLIP_MS * 0.6 : 0} />
        ) : null}
        {!chapter.kind && !spread.blocks ? (
          <>
            <div className="mb-slot mb-slot--1">
              <div className="mb-slot__content">
                <p className="mb-section">Ingredients</p>
                <ul className="rb-ingredients">
                  {ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mb-slot mb-slot--2">
              <div className="mb-slot__content">
                <p className="mb-section">Method</p>
                <p className="rb-method">{clean(entry.method)}</p>
              </div>
            </div>
            <div className="mb-slot mb-slot--3">
              <div className="mb-slot__content">
                {clean(entry.notes) ? (
                  <>
                    <p className="mb-section">Tasting notes</p>
                    <p className="rb-notes">{clean(entry.notes)}</p>
                  </>
                ) : null}
                <Media entry={entry} onOpen={setMedia} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    )
  }

  const isFirst = pos.c === 0 && pos.s === 0 && mobileSide === 'left'
  const isLast = pos.c === chapters.length - 1 && pos.s === spreadsByChapter[pos.c].length - 1 && mobileSide === 'right'

  return (
    <motion.div
      className={`mb-viewport rb-viewport mb-viewport--${mobileSide}`}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 70, scale: 0.84, rotateX: 24 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9, rotateX: 16 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={(event) => event.stopPropagation()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div className="rb-dust" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <span key={index} style={{ ['--i' as string]: index }} />
        ))}
      </div>

      <div className="mb-clip">
        <div className="mb-book rb-book" role="dialog" aria-label={shown.title}>
          <div className="rb-ribbons" role="tablist" aria-label="Chapters">
            {chapters.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === chapterId}
                className={`rb-ribbon ${item.id === chapterId ? 'is-active' : ''}`}
                style={{ ['--ribbon' as string]: ribbonColors[index % ribbonColors.length], ['--n' as string]: index }}
                onClick={() => onChapter(item.id)}
              >
                <span>{item.ribbon}</span>
              </button>
            ))}
          </div>

          <div className="pf-stage">
            <div className="mb-spread">
              {pageFor(base.left, 'left')}
              {pageFor(base.right, 'right')}
            </div>
            {flip ? (
              <FlipLeaf
                flip={flip}
                renderPage={(position, side) => pageFor(position, side, true)}
                onDone={() => {
                  // swap the book underneath first, then lift the leaf once that has painted
                  setPos(flip.to)
                  setFlip({ ...flip, done: true })
                  window.setTimeout(() => setFlip(null), 90)
                }}
              />
            ) : null}
          </div>

          <p className="mb-folio mb-folio--left">{chapters[base.left.c].ribbon}</p>
          <p className="mb-folio mb-folio--right">
            {base.right.s + 1} / {spreadsByChapter[base.right.c].length}
          </p>
        </div>
      </div>

      <button type="button" className="mb-turn mb-turn--prev" onClick={() => turn(-1)} disabled={isFirst} aria-label="Previous page">
        ‹ <span>previous</span>
      </button>
      <button type="button" className="mb-turn mb-turn--next" onClick={() => turn(1)} disabled={isLast} aria-label="Next page">
        <span>next</span> ›
      </button>
      <button type="button" className="mb-close" onClick={onClose} aria-label="Close the book">
        ×
      </button>

      <AnimatePresence>
        {media ? (
          <motion.div className="rb-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMedia(null)}>
            <motion.div
              className="rb-lightbox__mirror"
              initial={{ scale: 0.85, filter: 'blur(8px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(event) => event.stopPropagation()}
            >
              {media.type === 'photo' ? <img src={media.src} alt="" /> : <video src={media.src} controls autoPlay muted playsInline />}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

export default RecipeBook
