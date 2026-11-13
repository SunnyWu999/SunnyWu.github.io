import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import hotspotData from '../../data/hotspots.json'
import MenuBook from './MenuBook'

const professionalHotspots = (hotspotData as { professional: Record<string, { x: number; y: number; w: number; h: number }> }).professional

function ProfessionalScene({ onToggleScene }: { onToggleScene: () => void }) {
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [isDebug, setIsDebug] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsDebug(params.get('debug') === '1')
  }, [])

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) {
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    setPointer({ x: x * 1.2, y: y * 1.2 })
  }

  // Hotspot x/y are the CENTER of the object, in % of the 16:9 painting, which covers the scene.
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
          aria-label={id === 'egg' ? 'Flip the egg' : 'Open the tasting menu'}
          onClick={() => {
            if (id === 'egg') {
              onToggleScene()
              return
            }
            setOpen(true)
          }}
        >
          <span className="scene-hotspot__label">{id === 'egg' ? 'flip the egg' : 'tasting menu'}</span>
        </button>
      ))}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="resume-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={() => setOpen(false)}
          >
            <MenuBook onClose={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default ProfessionalScene
