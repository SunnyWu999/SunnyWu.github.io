import { useCallback, useEffect, useMemo, useState, type TouchEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import resumeData from '../../data/resume.json'
import { FlipLeaf } from './PageFlip'
import { useBookTilt } from './useBookTilt'
import { flipBase, type Flip } from './pageFlipState'
import './menu-book.css'

/*
  The tasting menu book.
  All text comes from src/data/resume.json — edit that file to change what is written in the book.
  The first page holds the title (under the printed rabbit) and one course; every other page
  holds two courses, shown in full.
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

// First page: the title under the rabbit + one course. Every other page: two courses.
const buildPages = (courses: Course[]): Slot[][] => {
  const usable = courses.filter((course) => clean(course.section) || clean(course.title))
  const items = usable.map((course) => ({ kind: 'course' as const, course }))
  const pages: Slot[][] = [[{ kind: 'title' }, ...items.slice(0, 1)]]
  for (let index = 1; index < items.length; index += 2) {
    pages.push(items.slice(index, index + 2))
  }
  if (pages.length % 2 === 1) {
    pages.push([])
  }
  return pages
}

function CourseBlock({ course }: { course: Course }) {
  const section = clean(course.section)
  const title = clean(course.title)
  const meta = [clean(course.company), clean(course.date)].filter(Boolean).join('  ·  ')
  const lines = [clean(course.description), ...(course.details ?? []).map((line) => clean(line))].filter(Boolean)

  return (
    <div className="mb-course">
      {section ? <p className="mb-section">{section}</p> : null}
      {title ? <h3 className="mb-title">{title}</h3> : null}
      {meta ? <p className="mb-meta">{meta}</p> : null}
      {lines.map((line, index) => (
        <p key={index} className="mb-line">
          {line}
        </p>
      ))}
      {course.id === 'check' ? (
        <a className="mb-seal" href="/resume.pdf" download="Sunny-Wu-Resume.pdf">
          Request the check
        </a>
      ) : null}
    </div>
  )
}

function Page({ slots, side }: { slots: Slot[]; side: 'left' | 'right' }) {
  const hasTitle = slots.some((slot) => slot.kind === 'title')
  return (
    <div className={`mb-page mb-page--${side} mb-flow ${hasTitle ? 'mb-flow--first' : ''}`}>
      {slots.map((slot, index) => (
        <div key={index} className="mb-flow__item">
          {index > 0 ? (
            <p className="mb-ornament" aria-hidden="true">
              <span />✦<span />
            </p>
          ) : null}
          {slot.kind === 'title' ? (
            <div className="mb-cover-title">
              <img className="mb-rabbit" src="/images/scene/menu-rabbit.png" alt="" draggable={false} />
              <p className="mb-cover-title__main">{clean(resumeData.title) || 'Sunny Side Up'}</p>
              <p className="mb-cover-title__sub">{clean(resumeData.subtitle) || 'Tasting Menu'}</p>
            </div>
          ) : (
            <CourseBlock course={slot.course} />
          )}
        </div>
      ))}
    </div>
  )
}

function MenuBook({ onClose }: { onClose: () => void }) {
  const reducedMotion = useReducedMotion()
  const pages = useMemo(() => buildPages((resumeData.courses ?? []) as Course[]), [])
  const spreadCount = pages.length / 2
  const [spread, setSpread] = useState(0)
  const [flip, setFlip] = useState<Flip | null>(null)
  const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left')
  const [touchX, setTouchX] = useState<number | null>(null)
  const tilt = useBookTilt(!reducedMotion)

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
      if (flip) return
      const next = Math.min(Math.max(spread + step, 0), spreadCount - 1)
      if (next === spread) return
      if (isPhone || reducedMotion) {
        setSpread(next)
        if (isPhone) setMobileSide(step > 0 ? 'left' : 'right')
        return
      }
      setFlip({ dir: step > 0 ? 1 : -1, from: spread, to: next })
    },
    [flip, mobileSide, reducedMotion, spread, spreadCount],
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

  const base = flipBase(flip, spread)
  const renderPage = (index: number, side: 'left' | 'right') => <Page slots={pages[index * 2 + (side === 'right' ? 1 : 0)]} side={side} />
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
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div className="mb-clip">
      <div className="mb-book mb-book--menu" role="dialog" aria-label="Tasting menu">
        <div className="pf-stage">
          <div className="mb-spread">
            <Page key={`l${base.left}`} slots={pages[base.left * 2]} side="left" />
            <Page key={`r${base.right}`} slots={pages[base.right * 2 + 1]} side="right" />
          </div>
          {flip ? (
            <FlipLeaf
              flip={flip}
              renderPage={renderPage}
              onDone={() => {
                // swap the book underneath first, then lift the leaf once that has painted
                setSpread(flip.to)
                setFlip({ ...flip, done: true })
                window.setTimeout(() => setFlip(null), 90)
              }}
            />
          ) : null}
        </div>

        <p className="mb-folio mb-folio--left">{base.left * 2 + 1}</p>
        <p className="mb-folio mb-folio--right">{base.right * 2 + 2}</p>
      </div>
      </div>

        <button type="button" className="mb-turn mb-turn--prev" onClick={() => turn(-1)} disabled={isFirst} aria-label="Previous page">
          ‹ <span>previous</span>
        </button>
        <button type="button" className="mb-turn mb-turn--next" onClick={() => turn(1)} disabled={isLast} aria-label="Next page">
          <span>next</span> ›
        </button>
        <a className="mb-download" href="/resume.pdf" download="Sunny-Wu-Resume.pdf" onClick={(event) => event.stopPropagation()}>
        ↓ Download résumé (PDF)
      </a>
      <button type="button" className="mb-close" onClick={onClose} aria-label="Close the menu">
          ×
        </button>
    </motion.div>
  )
}

export default MenuBook
