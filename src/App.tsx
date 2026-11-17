import { Navigate, Route, Routes, BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import PersonalScene from './components/scene/PersonalScene'
import ProfessionalScene from './components/scene/ProfessionalScene'
import FallTransition, { type Direction } from './components/scene/FallTransition'
import GameHud from './game/GameHud'
import Guide from './game/Guide'
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

function SceneLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const isProfessional = location.pathname === '/professional'
  const [transition, setTransition] = useState<{ direction: Direction; to: string } | null>(null)

  const handleToggle = () => {
    const to = isProfessional ? '/' : '/professional'
    // professional → personal = fall down the hole; personal → professional = float back up
    if (reducedMotion) {
      navigate(to)
      return
    }
    setTransition({ direction: isProfessional ? 'fall' : 'rise', to })
  }

  return (
    <div className="scene-shell">
      <GameHud scene={isProfessional ? 'professional' : 'personal'} />
      {transition ? null : <Guide scene={isProfessional ? 'professional' : 'personal'} />}
      {transition ? (
        <FallTransition key={transition.to} direction={transition.direction} onSwap={() => navigate(transition.to)} onDone={() => setTransition(null)} />
      ) : null}

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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SceneLayout />
    </BrowserRouter>
  )
}

export default App
