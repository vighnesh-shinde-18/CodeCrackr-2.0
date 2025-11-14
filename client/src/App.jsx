import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Hero from './Pages/Hero.jsx'
import ThemeToggleButton from './components/ThemeButton/ThemeToggleButton.jsx'
import LogIn from './Pages/LogIn.jsx'
import Register from './Pages/Register.jsx'
import { Toaster } from 'sonner'

function App() {
  
  return (
    <>
  <Routes>
    <Route path='/' element={<Hero/>} />
    <Route path='/login' element={<LogIn/>} />
    <Route path='/register' element={<Register/>} />
  </Routes>
  <Toaster richColors position='top-right'/>
  <ThemeToggleButton/>
    </>
  )
}

export default App
