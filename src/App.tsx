import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Sidebar } from './components/Sidebar'
import { Login } from './pages/Login'
import { Today } from './pages/Today'
import { Placeholder } from './pages/Placeholder'
import { colors } from './lib/tokens'

function ProtectedLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: colors.bg }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Routes>
          <Route path="/today"    element={<Today />} />
          <Route path="/planning" element={<Placeholder title="Weekly Planning" />} />
          <Route path="/capture"  element={<Placeholder title="Braindump" />} />
          <Route path="/meetings" element={<Placeholder title="Meeting Intelligence" />} />
          <Route path="/insights" element={<Placeholder title="Performance Insights" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="*"         element={<Navigate to="/today" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: colors.bg,
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: `2px solid ${colors.teal}`,
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <AuthGuard>
            <ProtectedLayout />
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  )
}
