import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import hotspotData from '../../data/hotspots.json'
import RecipeBook from './RecipeBook'

const hotspotLabelMap: Record<string, string> = {
  egg: 'flip the egg',
  cake: 'the cake',
  cocktails: 'the cocktails',
  'travel-board': 'the travel board',
  comfort: 'the noodle bowl',
  macarons: 'the macarons',
  'fortune-cookies': 'the fortune cookies',
  seat: 'the empty chair',
}

const personalHotspots = (hotspotData as { personal: Record<string, { x: number; y: number; w: number; h: number }> }).personal

interface PersonalSceneProps {
  activeHash?: string
  onOpenDish: (dishId: string) => void
  onClose: () => void
  onToggleScene: () => void
}

function PersonalScene({ activeHash, onOpenDish, onClose, onToggleScene }: PersonalSceneProps) {
  const reducedMotion = useReducedMotion()
  const [isDebug, setIsDebug] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  const selectedDish = useMemo(() => {
    if (!activeHash || activeHash === 'egg') return null
    return Object.keys(personalHotspots).includes(activeHash) ? activeHash : null
  }, [activeHash])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsDebug(params.get('debug') === '1')
  }, [])

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return
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
    <div className="scene-view scene-view--personal" onMouseMove={handlePointerMove} onMouseLeave={() => setPointer({ x: 0, y: 0 })}>
      <div
        className="scene-painting scene-painting--personal"
        style={{
          ['--pointer-x' as string]: `${pointer.x}%`,
          ['--pointer-y' as string]: `${pointer.y}%`,
        }}
        aria-hidden="true"
      />

      <div className="scene-ambient scene-ambient--personal" aria-hidden="true">
        <span className="ambient-star ambient-star--1" />
        <span className="ambient-star ambient-star--2" />
        <span className="ambient-star ambient-star--3" />
        <span className="ambient-star ambient-star--4" />
        <span className="ambient-firefly ambient-firefly--1" />
        <span className="ambient-firefly ambient-firefly--2" />
        <span className="ambient-firefly ambient-firefly--3" />
        <span className="ambient-candle ambient-candle--1" />
        <span className="ambient-candle ambient-candle--2" />
      </div>

      {Object.entries(personalHotspots).map(([id, hotspot]) => (
        <button
          key={id}
          type="button"
          className={`scene-hotspot ${selectedDish === id ? 'is-selected' : ''} ${isDebug ? 'is-debug' : ''}`}
          style={hotspotStyle(hotspot)}
          aria-label={id === 'egg' ? 'Flip the egg' : `Open ${hotspotLabelMap[id] ?? id}`}
          onClick={() => {
            if (id === 'egg') {
              onToggleScene()
              return
            }
            onOpenDish(id)
          }}
        >
          <span className="scene-hotspot__label">{hotspotLabelMap[id] ?? id}</span>
        </button>
      ))}

      <AnimatePresence>
        {selectedDish ? (
          <motion.div
            className="resume-overlay rb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onClick={onClose}
          >
            <RecipeBook chapterId={selectedDish} onChapter={onOpenDish} onClose={onClose} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default PersonalScene
