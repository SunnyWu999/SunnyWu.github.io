import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom'
import PersonalScene from './components/scene/PersonalScene'
import './personal.css'
import './professional.css'

function PersonalRoute() {
  return <PersonalScene />
}

function ProfessionalRoute() {
  return <h1>Sunny Side Up — Professional</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PersonalRoute />} />
        <Route path="/professional" element={<ProfessionalRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
