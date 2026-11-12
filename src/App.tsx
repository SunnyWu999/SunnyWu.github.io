import { Navigate, Route, Routes, BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import PersonalScene from './components/scene/PersonalScene'
import ProfessionalScene from './components/scene/ProfessionalScene'
import './personal.css'
import './professional.css'

function PersonalRoute() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <PersonalScene
      activeHash={location.hash.slice(1)}
      onOpenDish={(dishId) => navigate({ pathname: '/', hash: `#${dishId}` })}
      onClose={() => navigate('/')}
    />
  )
}

function ProfessionalRoute() {
  return <ProfessionalScene />
}

function SceneLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const isProfessional = location.pathname === '/professional'
  const [showHint, setShowHint] = useState(true)

  const handleToggle = () => {
    setShowHint(false)
    navigate(isProfessional ? '/' : '/professional')
  }

  return (
    <div className="scene-shell">
      <motion.button
        type="button"
        className="scene-toggle"
        onClick={handleToggle}
        aria-label={`Toggle between personal and professional scenes. Currently ${isProfessional ? 'Over easy' : 'Sunny-side up'}.`}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.3 }}
      >
        <span className="scene-toggle__label">{isProfessional ? 'Over easy' : 'Sunny-side up'}</span>
        <motion.span
          className="scene-toggle__egg"
          animate={
            reducedMotion
              ? { opacity: 1 }
              : { rotateY: isProfessional ? 180 : 0, rotateZ: isProfessional ? 10 : -10, y: isProfessional ? -2 : 0 }
          }
          transition={{ duration: reducedMotion ? 0.15 : 0.8, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          🍳
        </motion.span>
        {showHint ? <span className="scene-toggle__hint">flip me</span> : null}
      </motion.button>

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
            <Route path="/" element={<PersonalRoute />} />
            <Route path="/professional" element={<ProfessionalRoute />} />
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
