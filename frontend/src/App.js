import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from './firebase'
import Login from './pages/Login'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Dashboard from './pages/Dashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/practice" element={user ? <Practice /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App