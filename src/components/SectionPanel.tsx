import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

interface SharedOrigin {
  x: number
  y: number
  width: number
  height: number
}

interface SectionPanelProps {
  title: string
  isOpen: boolean
  onClose: () => void
  sharedImage?: string
  sharedOrigin?: SharedOrigin | null
  children?: ReactNode
}

export function SectionPanel({ title, isOpen, onClose, sharedImage, sharedOrigin, children }: SectionPanelProps) {
  const reducedMotion = useReducedMotion()
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const sharedStart = sharedOrigin
    ? {
        left: sharedOrigin.x,
        top: sharedOrigin.y,
        width: sharedOrigin.width,
        height: sharedOrigin.height,
      }
    : null

  const sharedEnd = sharedOrigin
    ? {
        left: viewport.width / 2 - (sharedOrigin.width * 1.35) / 2,
        top: viewport.height / 2 - (sharedOrigin.height * 1.35) / 2,
        width: sharedOrigin.width * 1.35,
        height: sharedOrigin.height * 1.35,
      }
    : null

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="section-panel__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.08 : 0.25, ease: 'easeInOut' }}
          onClick={onClose}
        >
          {sharedImage && sharedOrigin && sharedStart && sharedEnd ? (
            <motion.div
              className="section-panel__shared-art"
              aria-hidden="true"
              style={{
                backgroundImage: `url('/images/scene/${sharedImage}.png')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                left: sharedStart.left,
                top: sharedStart.top,
                width: sharedStart.width,
                height: sharedStart.height,
              }}
              initial={{ opacity: 1, scale: 1, rotate: -2 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                left: sharedEnd.left,
                top: sharedEnd.top,
                width: sharedEnd.width,
                height: sharedEnd.height,
              }}
              exit={{ opacity: 0, scale: 0.78, rotate: 2, left: sharedOrigin.x, top: sharedOrigin.y, width: sharedOrigin.width, height: sharedOrigin.height }}
              transition={{ duration: reducedMotion ? 0.08 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : null}

          <motion.aside
            className="section-panel section-panel--storybook"
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-panel-title"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: reducedMotion ? 0.08 : 0.28, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="section-panel__close" onClick={onClose} aria-label="Close section">
              ×
            </button>
            <h2 id="section-panel-title">{title}</h2>
            {children}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
