import { useCallback, useEffect, useState, type FormEvent, type TouchEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import bookData from '../../data/recipe-book.json'
import { commentsService, type CommentRecord } from '../../services/commentsService'
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
  const chapterIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === chapterId))
  const chapter = chapters[chapterIndex]
  const [entryIndex, setEntryIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left')
  const [touchX, setTouchX] = useState<number | null>(null)
  const [media, setMedia] = useState<{ type: 'photo' | 'video'; src: string } | null>(null)

  useEffect(() => {
    setEntryIndex(0)
    setMobileSide('left')
  }, [chapterId])

  const entry: Entry = chapter.entries[Math.min(entryIndex, chapter.entries.length - 1)] ?? {}
  const isPhone = () => window.matchMedia('(max-width: 767px)').matches

  const turn = useCallback(
    (step: number) => {
      if (isPhone()) {
        if (step > 0 && mobileSide === 'left') return setMobileSide('right')
        if (step < 0 && mobileSide === 'right') return setMobileSide('left')
      }
      setDirection(step)
      const next = entryIndex + step
      if (next >= 0 && next < chapter.entries.length) {
        setEntryIndex(next)
        if (isPhone()) setMobileSide(step > 0 ? 'left' : 'right')
        return
      }
      const nextChapter = chapters[chapterIndex + step]
      if (nextChapter) {
        onChapter(nextChapter.id)
      }
    },
    [chapter.entries.length, chapterIndex, entryIndex, mobileSide, onChapter],
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

  const ingredients = (entry.ingredients ?? []).map((item) => clean(item)).filter(Boolean)
  const isFirst = chapterIndex === 0 && entryIndex === 0 && mobileSide === 'left'
  const isLast = chapterIndex === chapters.length - 1 && entryIndex === chapter.entries.length - 1 && mobileSide === 'right'

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
    >
      <div className="rb-dust" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <span key={index} style={{ ['--i' as string]: index }} />
        ))}
      </div>

      <div className="mb-clip">
        <div className="mb-book rb-book" role="dialog" aria-label={chapter.title}>
          <div className="rb-ribbons" role="tablist" aria-label="Chapters">
            {chapters.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === chapter.id}
                className={`rb-ribbon ${item.id === chapter.id ? 'is-active' : ''}`}
                style={{ ['--ribbon' as string]: ribbonColors[index % ribbonColors.length], ['--n' as string]: index }}
                onClick={() => onChapter(item.id)}
              >
                <span>{item.ribbon}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${chapter.id}-${entryIndex}`}
              className="mb-spread"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Left page: chapter, illustration, dish name */}
              <div className="mb-page mb-page--left">
                <div className="mb-slot mb-slot--1 rb-chapter">
                  <div className="mb-slot__content">
                    <p className="mb-cover-title__sub">{chapter.title}</p>
                    {clean(chapter.subtitle) ? <p className="rb-subtitle">{chapter.subtitle}</p> : null}
                  </div>
                </div>
                <div className="rb-illustration">
                  <img src={`/images/scene/optimized/${chapter.image}.webp`} alt="" />
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

              {/* Right page: the recipe */}
              <div className="mb-page mb-page--right">
                {chapter.kind === 'fortune' ? <Fortune key={entryIndex} entry={entry} /> : null}
                {chapter.kind === 'guestbook' ? <GuestBook /> : null}
                {!chapter.kind ? (
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
            </motion.div>
          </AnimatePresence>

          <p className="mb-folio mb-folio--left">{chapter.ribbon}</p>
          <p className="mb-folio mb-folio--right">
            {entryIndex + 1} / {chapter.entries.length}
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
