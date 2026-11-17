import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import introData from '../data/intro.json'
import './guide.css'

/*
  Rainy, the guide.
  1) First visit: an RPG-style dialogue (portrait above a starry dialogue box).
  2) Afterwards she lives in the painting: walks between spots, sits at the table, nibbles the
     dishes, plays on the grass. Click her for a tip.
  Lines and spots live in src/data/intro.json. Pose images: public/images/guide/<pose>.webp.
*/

type Line = { pose: string; text: string; goto?: string; choices?: { label: string; goto: string }[] }
type Spot = { x: number; y: number; action: string; say?: string }
type Scene = 'personal' | 'professional'
const data = introData as unknown as {
  name: string
  dialogue: Record<string, Line[]>
  tips: Line[]
  spots: Record<Scene, Spot[]>
}
const SEEN_KEY = 'ssu-guide-seen'

// If an action pose image doesn't exist yet, fall back to one of the six original poses.
const FALLBACK: Record<string, string> = {
  'walk-2': 'walk',
  walk: 'wave',
  eat: 'surprised',
  sit: 'thinking',
  play: 'dance',
  sleep: 'thinking',
  idle: 'curtsy',
}
const ACTION_POSE: Record<string, string> = { eat: 'eat', sit: 'sit', play: 'play', sleep: 'sleep', wave: 'wave', idle: 'curtsy', walk: 'walk' }
const ACTION_SAY: Record<string, string> = { eat: 'nom nom', play: '♪ ♫', sit: 'sip…', sleep: 'zzz', idle: '', wave: 'hi!' }
// Sitting / lying poses are shorter than standing ones, so draw them a bit smaller.
const POSE_HEIGHT: Record<string, number> = { sleep: 68, eat: 92, sit: 94, play: 96 }

/* ---------- Pose image with graceful fallback ---------- */
function Pose({ pose, className }: { pose: string; className: string }) {
  const [src, setSrc] = useState(pose)
  useEffect(() => setSrc(pose), [pose])
  return (
    <img
      className={className}
      src={`/images/guide/${src}.webp`}
      alt=""
      draggable={false}
      onError={() => {
        const next = FALLBACK[src]
        if (next && next !== src) setSrc(next)
      }}
    />
  )
}

/* ---------- Big dialogue portrait (hides itself if the image doesn't exist yet) ---------- */
function Portrait({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  if (failed) return null
  return <img className="gd-portrait__img" src={src} alt="" draggable={false} onError={() => setFailed(true)} />
}

/* ---------- Typewriter ---------- */
function Typewriter({ text, onDone, skip }: { text: string; onDone: () => void; skip: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (skip) {
      setCount(text.length)
      onDone()
      return
    }
    if (count >= text.length) {
      onDone()
      return
    }
    const timer = window.setTimeout(() => setCount((value) => value + 1), text[count] === ' ' ? 12 : 28)
    return () => window.clearTimeout(timer)
  }, [count, text, skip, onDone])

  return (
    <>
      {text.slice(0, count)}
      <span className="gd-ghost">{text.slice(count)}</span>
    </>
  )
}

/* ---------- Map painting % to screen px (the painting is 16:9 and covers the window) ---------- */
const useViewport = () => {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const boxW = Math.max(size.w, (size.h * 16) / 9)
  const boxH = Math.max(size.h, (size.w * 9) / 16)
  const toPx = (x: number, y: number) => ({ left: (size.w - boxW) / 2 + (boxW * x) / 100, top: (size.h - boxH) / 2 + (boxH * y) / 100 })
  // Farther back (higher up) = smaller. On the tabletop she's tiny, on the grass in front she's bigger.
  const heightAt = (y: number) => (boxH * Math.min(18, Math.max(7, 7 + ((y - 45) * 11) / 50))) / 100
  return { toPx, heightAt }
}

/* ---------- Rainy wandering in the scene ---------- */
function Roamer({ scene }: { scene: Scene }) {
  const reducedMotion = useReducedMotion()
  const spots = data.spots[scene] ?? []
  const { toPx, heightAt } = useViewport()
  const [spotIndex, setSpotIndex] = useState(0)
  const [phase, setPhase] = useState<'walk' | 'act'>('act')
  const [facing, setFacing] = useState(1)
  const [walkMs, setWalkMs] = useState(0)
  const [tip, setTip] = useState<Line | null>(null)
  const [frame, setFrame] = useState(0)
  const tipIndex = useRef(0)
  const spot = spots[spotIndex] ?? { x: 50, y: 92, action: 'idle' }

  // Behaviour loop: act at a spot for a while, then walk to another spot.
  useEffect(() => {
    if (reducedMotion || spots.length < 2) return undefined
    if (phase === 'act') {
      const timer = window.setTimeout(
        () => {
          let next = Math.floor(Math.random() * spots.length)
          if (next === spotIndex) next = (next + 1) % spots.length
          const from = toPx(spot.x, spot.y)
          const to = toPx(spots[next].x, spots[next].y)
          const distance = Math.hypot(to.left - from.left, to.top - from.top)
          setFacing(to.left >= from.left ? 1 : -1)
          setWalkMs(Math.max(1600, (distance / 85) * 1000))
          setSpotIndex(next)
          setPhase('walk')
        },
        4500 + Math.random() * 4000,
      )
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setPhase('act'), walkMs)
    return () => window.clearTimeout(timer)
    // toPx changes every render; positions only matter at the moment we pick the next spot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, spotIndex, reducedMotion, spots.length, walkMs])

  // Two walking frames, swapped quickly while she walks
  useEffect(() => {
    if (phase !== 'walk') return undefined
    const timer = window.setInterval(() => setFrame((value) => 1 - value), 240)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (!tip) return undefined
    const timer = window.setTimeout(() => setTip(null), 5200)
    return () => window.clearTimeout(timer)
  }, [tip])

  const pos = toPx(spot.x, spot.y)
  const height = heightAt(spot.y)
  const pose = phase === 'walk' ? (frame ? 'walk-2' : 'walk') : ACTION_POSE[spot.action] ?? 'curtsy'
  const shownPose = tip ? tip.pose : pose
  const say = tip ? tip.text : phase === 'act' ? spot.say ?? ACTION_SAY[spot.action] ?? '' : ''

  return (
    <motion.div
      className={`gd-roamer gd-roamer--${phase} gd-roamer--${spot.action}`}
      initial={false}
      animate={{ x: pos.left, y: pos.top - height, height }}
      transition={{ duration: phase === 'walk' ? walkMs / 1000 : 0.6, ease: phase === 'walk' ? 'linear' : 'easeOut' }}
    >
      <AnimatePresence>
        {say ? (
          <motion.p
            key={say}
            className={`gd-say ${tip ? 'gd-say--tip' : ''}`}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {say}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        className="gd-roamer__button"
        aria-label={`Talk to ${data.name}`}
        onClick={() => {
          const next = data.tips[tipIndex.current % data.tips.length]
          tipIndex.current += 1
          setTip(next)
        }}
      >
        <span className="gd-roamer__flip" style={{ transform: `scaleX(${facing})` }}>
          <span className="gd-roamer__body" style={{ height: `${POSE_HEIGHT[shownPose] ?? 100}%` }}>
            <Pose pose={shownPose} className="gd-roamer__img" />
          </span>
        </span>
        <span className="gd-roamer__shadow" aria-hidden="true" />
      </button>
    </motion.div>
  )
}

/* ---------- Main ---------- */
export default function Guide({ scene }: { scene: Scene }) {
  const reducedMotion = useReducedMotion()
  const [script, setScript] = useState<Line[] | null>(null)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState(false)
  const [skipTyping, setSkipTyping] = useState(false)
  const [choice, setChoice] = useState(0)

  const start = useCallback((lines: Line[]) => {
    setScript(lines)
    setIndex(0)
    setTyped(false)
    setSkipTyping(false)
    setChoice(0)
  }, [])

  const finish = useCallback(() => {
    setScript(null)
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // ignore storage problems
    }
  }, [])

  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1'
    } catch {
      seen = false
    }
    if (seen) return undefined
    const timer = window.setTimeout(() => start(data.dialogue.intro), 900)
    return () => window.clearTimeout(timer)
  }, [start])

  useEffect(() => {
    const replay = () => start(data.dialogue.intro)
    window.addEventListener('guide:replay', replay)
    return () => window.removeEventListener('guide:replay', replay)
  }, [start])

  const line = script?.[index] ?? null

  const choose = useCallback(
    (goto: string) => {
      const next = data.dialogue[goto]
      if (goto !== 'end' && next?.length) start(next)
      else finish()
    },
    [finish, start],
  )

  const advance = useCallback(() => {
    if (!script || !line) return
    if (!typed) {
      setSkipTyping(true)
      return
    }
    if (line.choices) {
      choose(line.choices[choice]?.goto ?? 'end')
      return
    }
    if (index + 1 < script.length) {
      setIndex(index + 1)
      setTyped(false)
      setSkipTyping(false)
    } else {
      choose(line.goto ?? 'end')
    }
  }, [choice, choose, finish, index, line, script, typed])

  useEffect(() => {
    if (!script) return undefined
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        advance()
      }
      if (line?.choices && typed && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        const count = line.choices.length
        setChoice((value) => (value + (event.key === 'ArrowDown' ? 1 : count - 1)) % count)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, finish, line, script, typed])

  const onTyped = useCallback(() => setTyped(true), [])

  return (
    <>
      {!script ? <Roamer key={scene} scene={scene} /> : null}

      {/* Rough painted edge for the dialogue box */}
      <svg className="gd-defs" aria-hidden="true" width="0" height="0">
        <filter id="gd-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
      </svg>

      <AnimatePresence>
        {script && line ? (
          <motion.div className="gd-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={advance}>
            <motion.div
              className="gd-portrait gd-portrait--right is-speaking"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${line.pose}-${index}-${line.text.length}`}
                  className="gd-portrait__pose"
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [14, -10, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <Portrait src={`/images/guide/${line.pose}.webp`} />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <motion.div
              className="gd-box"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={(event) => {
                event.stopPropagation()
                advance()
              }}
            >
              <span className="gd-box__frame" aria-hidden="true" />
              <div className="gd-box__inner">
                <p className="gd-box__name">【{data.name}】</p>
                <p className="gd-box__text">
                  <Typewriter key={`${index}-${line.text}`} text={line.text} onDone={onTyped} skip={skipTyping} />
                </p>

                {typed && line.choices ? (
                  <ul className="gd-choices">
                    {line.choices.map((item, itemIndex) => (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={`gd-choice ${itemIndex === choice ? 'is-active' : ''}`}
                          onMouseEnter={() => setChoice(itemIndex)}
                          onClick={(event) => {
                            event.stopPropagation()
                            choose(item.goto)
                          }}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {typed && !line.choices ? <span className="gd-next" aria-hidden="true" /> : null}
            </motion.div>

            <button
              type="button"
              className="gd-skip"
              onClick={(event) => {
                event.stopPropagation()
                finish()
              }}
            >
              skip ▸▸
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
