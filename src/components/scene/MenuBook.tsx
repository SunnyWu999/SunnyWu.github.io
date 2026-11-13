import { useCallback, useEffect, useMemo, useState, type TouchEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import resumeData from '../../data/resume.json'
import './menu-book.css'

/*
  The tasting menu book.
  All text comes from src/data/resume.json — edit that file to change what is written in the book.
  Each page has three slots that line up with the leaf dividers printed on the book image.
  The very first slot (top of the first page) holds the title under the rabbit.
*/

type Course = {
  id: string
  section?: string
  title?: string
  company?: string
  date?: string
  description?: string
  details?: string[]
}

type Slot = { kind: 'title' } | { kind: 'course'; course: Course }

const clean = (value?: string) => (value && !value.includes('[PLACEHOLDER]') ? value.trim() : '')

const buildPages = (courses: Course[]): Slot[][] => {
  const usable = courses.filter((course) => clean(course.section) || clean(course.title))
  const slots: Slot[] = [{ kind: 'title' }, ...usable.map((course) => ({ kind: 'course' as const, course }))]
  const pages: Slot[][] = []
  for (let index = 0; index < slots.length; index += 3) {
    pages.push(slots.slice(index, index + 3))
  }
  if (pages.length % 2 === 1) {
    pages.push([])
  }
  return pages
}

function CourseSlot({ course }: { course: Course }) {
  const section = clean(course.section)
  const title = clean(course.title)
  const meta = [clean(course.company), clean(course.date)].filter(Boolean).join('  ·  ')
  const lines = [clean(course.description), ...(course.details ?? []).map((line) => clean(line))].filter(Boolean).slice(0, 2)

  return (
    <div className="mb-slot__content">
      {section ? <p className="mb-section">{section}</p> : null}
      {title ? <h3 className="mb-title">{title}</h3> : null}
      {meta ? <p className="mb-meta">{meta}</p> : null}
      {lines.map((line, index) => (
        <p key={index} className="mb-line">
          {line}
        </p>
      ))}
      {course.id === 'check' ? (
        <a className="mb-seal" href="/resume.pdf" download>
          Request the check
        </a>
      ) : null}
    </div>
  )
}

function Page({ slots, side }: { slots: Slot[]; side: 'left' | 'right' }) {
  return (
    <div className={`mb-page mb-page--${side}`}>
      {[0, 1, 2].map((index) => {
        const slot = slots[index]
        return (
          <div key={index} className={`mb-slot mb-slot--${index + 1}`}>
            {slot?.kind === 'title' ? (
              <div className="mb-slot__content mb-cover-title">
                <p className="mb-cover-title__main">{clean(resumeData.title) || 'Sunny Side Up'}</p>
                <p className="mb-cover-title__sub">{clean(resumeData.subtitle) || 'Tasting Menu'}</p>
              </div>
            ) : null}
            {slot?.kind === 'course' ? <CourseSlot course={slot.course} /> : null}
          </div>
        )
      })}
    </div>
  )
}

function MenuBook({ onClose }: { onClose: () => void }) {
  const reducedMotion = useReducedMotion()
  const pages = useMemo(() => buildPages((resumeData.courses ?? []) as Course[]), [])
  const spreadCount = pages.length / 2
  const [spread, setSpread] = useState(0)
  const [direction, setDirection] = useState(1)
  const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left')
  const [touchX, setTouchX] = useState<number | null>(null)

  const turn = useCallback(
    (step: number) => {
      const isPhone = window.matchMedia('(max-width: 767px)').matches
      if (isPhone) {
        if (step > 0 && mobileSide === 'left') {
          setMobileSide('right')
          return
        }
        if (step < 0 && mobileSide === 'right') {
          setMobileSide('left')
          return
        }
      }
      const next = Math.min(Math.max(spread + step, 0), spreadCount - 1)
      if (next === spread) return
      setDirection(step)
      setSpread(next)
      if (isPhone) setMobileSide(step > 0 ? 'left' : 'right')
    },
    [mobileSide, spread, spreadCount],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') turn(1)
      if (event.key === 'ArrowLeft') turn(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, turn])

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => setTouchX(event.touches[0]?.clientX ?? null)
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchX === null) return
    const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX
    if (Math.abs(delta) > 50) turn(delta < 0 ? 1 : -1)
    setTouchX(null)
  }

  const isFirst = spread === 0 && mobileSide === 'left'
  const isLast = spread === spreadCount - 1 && (mobileSide === 'right' || pages[spread * 2 + 1].length === 0)

  return (
    <motion.div
      className={`mb-viewport mb-viewport--${mobileSide}`}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.86, rotateX: 22 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9, rotateX: 16 }}
      transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={(event) => event.stopPropagation()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="mb-clip">
      <div className="mb-book" role="dialog" aria-label="Tasting menu">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={spread}
            className="mb-spread"
            custom={direction}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 18, filter: 'blur(3px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -18, filter: 'blur(3px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Page slots={pages[spread * 2]} side="left" />
            <Page slots={pages[spread * 2 + 1]} side="right" />
          </motion.div>
        </AnimatePresence>

        <p className="mb-folio mb-folio--left">{spread * 2 + 1}</p>
        <p className="mb-folio mb-folio--right">{spread * 2 + 2}</p>
      </div>
      </div>

        <button type="button" className="mb-turn mb-turn--prev" onClick={() => turn(-1)} disabled={isFirst} aria-label="Previous page">
          ‹ <span>previous</span>
        </button>
        <button type="button" className="mb-turn mb-turn--next" onClick={() => turn(1)} disabled={isLast} aria-label="Next page">
          <span>next</span> ›
        </button>
        <button type="button" className="mb-close" onClick={onClose} aria-label="Close the menu">
          ×
        </button>
    </motion.div>
  )
}

export default MenuBook
