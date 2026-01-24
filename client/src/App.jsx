import './App.css'
import { Suspense, lazy } from "react";
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

// --- EAGER IMPORTS ---
import Hero from './Pages/Hero.jsx'
import LogIn from './Pages/LogIn.jsx'
import Register from './Pages/Register.jsx'
import ForgotPassword from './Pages/ForgotPassword.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'
import Layout from './Pages/Layout.jsx'
import ThemeToggleButton from './components/ThemeButton/ThemeToggleButton.jsx'
import { Spinner } from './components/ui/spinner.jsx';

// 🟢 Import the new ProtectedRoute
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute.jsx'; // Adjust path as needed

// --- LAZY IMPORTS ---
const Dashboard = lazy(() => import('./Pages/Dashboard.jsx'));
const ProblemList = lazy(() => import('./Pages/ProblemsList.jsx'));
const ProblemManager = lazy(() => import('./Pages/ProblemManager.jsx'));
const History = lazy(() => import('./Pages/History.jsx'));
const CodePlayGround = lazy(() => import('./Pages/CodePlayGround.jsx'));
const AIFeature = lazy(() => import('./Pages/AiInteraction.jsx'));
const ProblemSolving = lazy(() => import('./Pages/ProblemSolving.jsx'));

// --- PAGE LOADER ---
const PageLoader = () => (
  <div className="flex h-[80vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Spinner />
      <p className="text-sm text-muted-foreground animate-pulse">Loading content...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path='/' element={<Hero />} />
        <Route path='/login' element={<LogIn />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* --- 🔒 PRIVATE ROUTES WRAPPER --- */}
        <Route element={<ProtectedRoute />}>
            
            {/* GROUP 1: STANDARD LAYOUT (Sidebar Visible) */}
            <Route element={<Layout />}>
                <Route path='/dashboard' element={
                    <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
                } />
                <Route path='/problems' element={
                    <Suspense fallback={<PageLoader />}><ProblemList /></Suspense>
                } />
                <Route path='/problem-manager' element={
                    <Suspense fallback={<PageLoader />}><ProblemManager /></Suspense>
                } />
                <Route path='/history' element={
                    <Suspense fallback={<PageLoader />}><History /></Suspense>
                } />
                <Route path='/code-playground' element={
                    <Suspense fallback={<PageLoader />}><CodePlayGround /></Suspense>
                } />
                <Route path='/ai/:feature' element={
                    <Suspense fallback={<PageLoader />}><AIFeature /></Suspense>
                } />
            </Route>

            {/* GROUP 2: SPECIAL LAYOUT (Hidden Sidebar) */}
            <Route path="/solve-problem/:slug/:id" element={
                <Layout sidebarVisible={false}>
                    <Suspense fallback={<PageLoader />}><ProblemSolving /></Suspense>
                </Layout>
            } />

        </Route>
      </Routes>

      <Toaster richColors position='top-right' />
      <ThemeToggleButton />
    </>
  )
}

export default App