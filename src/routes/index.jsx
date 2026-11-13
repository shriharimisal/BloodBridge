import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { authService } from '../services/authService'
import Home from '../pages/Home'
import FindBlood from '../pages/FindBlood'
import RequestBlood from '../pages/RequestBlood'
import Requests from '../pages/Requests'
import Donate from '../pages/Donate'
import BloodBanks from '../pages/BloodBanks'
import BloodBankDetail from '../pages/BloodBankDetail'
import Auth from '../pages/Auth'
import Dashboard from '../pages/Dashboard'
import Notifications from '../pages/Notifications'
import History from '../pages/History'
import Settings from '../pages/Settings'
import About from '../pages/About'
import NotFound from '../pages/NotFound'

function RequireAuth({ children }) {
  const location = useLocation()
  return authService.getSession() ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="find-blood" element={<FindBlood />} />
        <Route path="request" element={<RequestBlood />} />
        <Route path="requests" element={<Requests />} />
        <Route path="donate" element={<Donate />} />
        <Route path="blood-banks" element={<BloodBanks />} />
        <Route path="blood-banks/:id" element={<BloodBankDetail />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="register" element={<Auth mode="register" />} />
        <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="history" element={<RequireAuth><History /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
