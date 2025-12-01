
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Hero from './Pages/Hero.jsx'
import ThemeToggleButton from './components/ThemeButton/ThemeToggleButton.jsx'
import LogIn from './Pages/LogIn.jsx'
import Register from './Pages/Register.jsx'
import ForgotPassword from './Pages/ForgotPassword.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'
import Layout from './Pages/Layout.jsx'
import ProblemManager from './Pages/ProblemManager.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import CodePlayGround from './Pages/CodePlayGround.jsx'
import ProblemList from './Pages/ProblemsList.jsx'
import History from './Pages/History.jsx'
import AIFeature from './Pages/AiInteraction.jsx'
import ProblemSolving from './Pages/ProblemSolving.jsx'

import { Toaster } from 'sonner'


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Hero />} />
        <Route path='/login' element={<LogIn />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/problem-manager' element={<Layout><ProblemManager /></Layout>} />
        <Route path='/dashboard' element={<Layout><Dashboard /></Layout>} />
        <Route path='/code-playground' element={<Layout><CodePlayGround /></Layout>} />
        <Route path='/problems' element={<Layout><ProblemList /></Layout>} />
        <Route path='/history' element={<Layout><History /></Layout>} />
        <Route path='/ai/:feature' element={<Layout><AIFeature /></Layout>} />
        <Route path='/problems/:id' element={<ProblemSolving />} />
      </Routes>
      <Toaster richColors position='top-right' />
      <ThemeToggleButton />
    </>
  )
}

export default App
