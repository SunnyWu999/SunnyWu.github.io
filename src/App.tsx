import { Navigate, Route, Routes, BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import PersonalScene from './components/scene/PersonalScene'
import ProfessionalScene from './components/scene/ProfessionalScene'
import './personal.css'
import './professional.css'

function PersonalRoute({ onToggleScene }: { onToggleScene: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <PersonalScene
      activeHash={location.hash.slice(1)}
      onOpenDish={(dishId) => navigate({ pathname: '/', hash: `#${dishId}` })}
      onClose={() => navigate('/')}
      onToggleScene={onToggleScene}
    />
  )
}

function ProfessionalRoute({ onToggleScene }: { onToggleScene: () => void }) {
  return <ProfessionalScene onToggleScene={onToggleScene} />
}

function SceneTransitionOverlay({ direction, onSkip, onComplete }: { direction: 'fall' | 'rise'; onSkip: () => void; onComplete: () => void }) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <motion.div
        className="scene-transition scene-transition--reduced"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: 'easeInOut' }}
        aria-live="polite"
      >
        <div className="scene-transition__sparkles" aria-hidden="true" />
        <button type="button" className="scene-transition__skip" onClick={onSkip}>
          skip
        </button>
      </motion.div>
    )
  }

  const isPhone = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  const videoSource = direction === 'fall' ? (isPhone ? '/media/fall-720p.mp4' : '/media/fall.mp4') : (isPhone ? '/media/fall-reverse-720p.mp4' : '/media/fall-reverse.mp4')

  return (
    <motion.div
      className={`scene-transition scene-transition--${direction}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      aria-live="polite"
    >
      <video
        key={direction}
        className="scene-transition__video"
        src={videoSource}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onComplete}
        poster={direction === 'fall' ? '/images/scene/scene-personal.webp' : '/images/scene/scene-professional.webp'}
      />
      <div className="scene-transition__video-fade" aria-hidden="true" />
      <button type="button" className="scene-transition__skip" onClick={onSkip}>
        skip
      </button>
    </motion.div>
  )
}

function SceneLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const isProfessional = location.pathname === '/professional'
  const [transitionDirection, setTransitionDirection] = useState<'fall' | 'rise' | null>(null)

  const handleToggle = () => {
    const nextPath = isProfessional ? '/' : '/professional'
    // professional → personal = fall down the hole; personal → professional = float back up
    const nextDirection = isProfessional ? 'fall' : 'rise'

    if (reducedMotion) {
      navigate(nextPath)
      return
    }

    setTransitionDirection(nextDirection)
  }

  const completeTransition = () => {
    setTransitionDirection(null)
    navigate(isProfessional ? '/' : '/professional')
  }

  const handleSkip = () => {
    setTransitionDirection(null)
    navigate(isProfessional ? '/' : '/professional')
  }

  return (
    <div className="scene-shell">
      {transitionDirection ? <SceneTransitionOverlay direction={transitionDirection} onSkip={handleSkip} onComplete={completeTransition} /> : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="scene-stage"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.8, ease: 'easeInOut' }}
        >
          <Routes>
            <Route path="/" element={<PersonalRoute onToggleScene={handleToggle} />} />
            <Route path="/professional" element={<ProfessionalRoute onToggleScene={handleToggle} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SceneLayout />
    </BrowserRouter>
  )
}

export default App
