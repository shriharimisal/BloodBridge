import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../auth/AuthContext'
import { Loading } from '../components/ui'
import Home from '../pages/Home'
import FindBlood from '../pages/FindBlood'
import RequestBlood from '../pages/RequestBlood'
import Requests from '../pages/Requests'
import Donate from '../pages/Donate'
import BloodBanks from '../pages/BloodBanks'
import BloodBankDetail from '../pages/BloodBankDetail'
import Auth from '../pages/Auth'
import Notifications from '../pages/Notifications'
import History from '../pages/History'
import Settings from '../pages/Settings'
import About from '../pages/About'
import NotFound from '../pages/NotFound'
import Inventory from '../pages/Inventory'
import Dispatch from '../pages/Dispatch'
import Transit from '../pages/Transit'

function RequireAuth({ children }) {
  const location = useLocation()
  const { session, loading } = useAuth()
  if (loading) return <Loading label="Checking your sign-in…" />
  return session ? children : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
}

function GuestOnly({ children }) {
  const location = useLocation()
  const { session, loading } = useAuth()
  if (loading) return <Loading label="Checking your sign-in…" />
  return session
    ? <Navigate to={location.state?.from || '/'} replace />
    : children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="dispatch" element={<Dispatch />} />
        <Route path="transit" element={<Transit />} />
        <Route path="find-blood" element={<FindBlood />} />
        <Route path="request" element={<RequireAuth><RequestBlood /></RequireAuth>} />
        <Route path="requests" element={<Requests />} />
        <Route path="donate" element={<RequireAuth><Donate /></RequireAuth>} />
        <Route path="blood-banks" element={<BloodBanks />} />
        <Route path="blood-banks/:id" element={<BloodBankDetail />} />
        <Route path="login" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Auth mode="register" /></GuestOnly>} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="history" element={<RequireAuth><History /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
