import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent, type TouchEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import resumeData from '../../data/resume.json'
import hotspotData from '../../data/hotspots.json'

const professionalHotspots = (hotspotData as { professional: Record<string, { x: number; y: number; w: number; h: number }> }).professional

type ResumeCourse = {
  id: string
  section?: string
  title?: string
  company?: string
  date?: string
  description?: string
  details?: string[]
}

function ProfessionalScene({ onToggleScene }: { onToggleScene: () => void }) {
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [isDebug, setIsDebug] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [spreadIndex, setSpreadIndex] = useState(0)
  const [mobilePage, setMobilePage] = useState<'left' | 'right'>('left')
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const courseList = (resumeData.courses ?? []) as ResumeCourse[]

  const spreads = useMemo(() => {
    const filteredCourses = courseList.filter((course) => {
      if (!course) return false
      const hasText = [course.section, course.title, course.company, course.date, course.description, ...(course.details ?? [])]
        .filter(Boolean)
        .some((value) => String(value).trim() && !String(value).includes('[PLACEHOLDER]'))
      return hasText
    })

    const groups: Array<{ left: ResumeCourse | null; right: ResumeCourse | null }> = []
    for (let index = 0; index < filteredCourses.length; index += 2) {
      groups.push({ left: filteredCourses[index] ?? null, right: filteredCourses[index + 1] ?? null })
    }

    return groups.length > 0 ? groups : [{ left: null, right: null }]
  }, [courseList])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsDebug(params.get('debug') === '1')
  }, [])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        handlePageTurn(1)
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePageTurn(-1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, spreadIndex, mobilePage, isMobile])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleMatch = () => setIsMobile(mediaQuery.matches)
    handleMatch()
    mediaQuery.addEventListener('change', handleMatch)
    return () => mediaQuery.removeEventListener('change', handleMatch)
  }, [])

  const currentSpread = spreads[spreadIndex] ?? { left: null, right: null }

  const handlePageTurn = (direction: number) => {
    if (!isMobile) {
      setSpreadIndex((previous) => {
        const next = previous + direction
        return Math.min(Math.max(next, 0), spreads.length - 1)
      })
      return
    }

    if (direction > 0) {
      if (mobilePage === 'left' && currentSpread.right) {
        setMobilePage('right')
        return
      }

      setSpreadIndex((previous) => {
        const next = previous + 1
        return Math.min(next, spreads.length - 1)
      })
      setMobilePage('left')
      return
    }

    if (mobilePage === 'right') {
      setMobilePage('left')
      return
    }

    setSpreadIndex((previous) => {
      const next = previous - 1
      return Math.max(next, 0)
    })
    setMobilePage('right')
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null)
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX
    const delta = endX - touchStartX

    if (Math.abs(delta) > 50) {
      handlePageTurn(delta < 0 ? 1 : -1)
    }

    setTouchStartX(null)
  }

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    setPointer({ x: x * 1.2, y: y * 1.2 })
  }

  const hotspotStyle = (hotspot: { x: number; y: number; w: number; h: number }): CSSProperties => {
    const boxW = 'max(100cqw, 177.78cqh)'
    const boxH = 'max(100cqh, 56.25cqw)'
    return {
      left: `calc((100cqw - ${boxW}) / 2 + ${boxW} * ${(hotspot.x - hotspot.w / 2) / 100})`,
      top: `calc((100cqh - ${boxH}) / 2 + ${boxH} * ${(hotspot.y - hotspot.h / 2) / 100})`,
      width: `calc(${boxW} * ${hotspot.w / 100})`,
      height: `calc(${boxH} * ${hotspot.h / 100})`,
    }
  }

  const renderCourse = (course: ResumeCourse | null, side: 'left' | 'right') => {
    if (!course) {
      return null
    }

    const details = (course.details ?? []).filter((detail) => typeof detail === 'string' && detail.trim() && !detail.includes('[PLACEHOLDER]'))
    const section = course.section?.trim()
    const title = course.title?.trim()
    const company = course.company?.trim()
    const date = course.date?.trim()
    const description = course.description?.trim()

    return (
      <article key={`${course.id}-${side}`} className="menu-book__entry">
        {section ? <p className="menu-book__section">{section.toUpperCase()}</p> : null}
        {side === 'left' && !section ? <div className="menu-book__ornament" aria-hidden="true" /> : null}
        {title ? <h3 className="menu-book__title">{title}</h3> : null}
        {(company || date) ? (
          <p className="menu-book__meta">
            {company ? <span>{company}</span> : null}
            {company && date ? <span className="menu-book__meta-separator">•</span> : null}
            {date ? <span>{date}</span> : null}
          </p>
        ) : null}
        {description ? <p className="menu-book__description">{description}</p> : null}
        {details.length > 0 ? (
          <ul className="menu-book__list">
            {details.map((detail, index) => (
              <li key={`${course.id}-${index}`}>{detail}</li>
            ))}
          </ul>
        ) : null}
        {course.id === 'check' && title ? (
          <div className="menu-book__check-row">
            <a href="/resume.pdf" target="_blank" rel="noreferrer" download className="menu-book__seal">
              Request the check
            </a>
          </div>
        ) : null}
      </article>
    )
  }

  const visiblePages = isMobile
    ? [mobilePage === 'left' ? currentSpread.left : currentSpread.right]
    : [currentSpread.left, currentSpread.right]

  const pageNumber = isMobile ? spreadIndex + 1 : spreadIndex + 1

  return (
    <div className="scene-view scene-view--professional" onMouseMove={handlePointerMove} onMouseLeave={() => setPointer({ x: 0, y: 0 })}>
      <div
        className="scene-painting scene-painting--professional"
        style={{
          ['--pointer-x' as string]: `${pointer.x}%`,
          ['--pointer-y' as string]: `${pointer.y}%`,
        }}
        aria-hidden="true"
      />

      <div className="scene-ambient scene-ambient--professional" aria-hidden="true">
        <span className="ambient-particle ambient-particle--1" />
        <span className="ambient-particle ambient-particle--2" />
        <span className="ambient-particle ambient-particle--3" />
        <span className="ambient-cloud ambient-cloud--1" />
        <span className="ambient-cloud ambient-cloud--2" />
      </div>

      {Object.entries(professionalHotspots).map(([id, hotspot]) => (
        <button
          key={id}
          type="button"
          className={`scene-hotspot ${isDebug ? 'is-debug' : ''}`}
          style={hotspotStyle(hotspot)}
          aria-label={id === 'egg' ? 'Return to the personal scene' : 'Open the tasting menu'}
          onClick={() => {
            if (id === 'egg') {
              onToggleScene()
              return
            }

            setSpreadIndex(0)
            setMobilePage('left')
            setOpen(true)
          }}
        >
          <span className="scene-hotspot__label">{id === 'egg' ? 'egg' : 'menu'}</span>
        </button>
      ))}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="resume-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="menu-book"
              initial={{ opacity: 0, scale: 0.82, y: 36, rotateX: 28, rotateY: -18 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24, rotateX: 24, rotateY: -8 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button type="button" className="menu-book__close" aria-label="Close tasting menu" onClick={() => setOpen(false)}>
                ×
              </button>

              <div className="menu-book__pages" key={`${spreadIndex}-${mobilePage}`}>
                {visiblePages.map((page, index) => {
                  if (!page) {
                    return <div key={`empty-${index}`} className="menu-book__page menu-book__page--empty" aria-hidden="true" />
                  }

                  return (
                    <div key={`${page.id}-${index}`} className={`menu-book__page ${index === 0 ? 'menu-book__page--left' : 'menu-book__page--right'}`}>
                      {index === 0 ? (
                        <div className="menu-book__header">
                          <div className="menu-book__rabbit" aria-hidden="true">🐇</div>
                          <div className="menu-book__page-name">
                            <span>{resumeData.title}</span>
                            <small>{resumeData.subtitle}</small>
                          </div>
                        </div>
                      ) : null}

                      <div className="menu-book__page-inner">
                        {renderCourse(page, index === 0 ? 'left' : 'right')}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="menu-book__nav" aria-label="Menu navigation">
                <button type="button" className="menu-book__nav-button menu-book__nav-button--prev" onClick={() => handlePageTurn(-1)} aria-label="Previous page">
                  ‹
                </button>
                <span className="menu-book__page-number">{pageNumber}</span>
                <button type="button" className="menu-book__nav-button menu-book__nav-button--next" onClick={() => handlePageTurn(1)} aria-label="Next page">
                  ›
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default ProfessionalScene
