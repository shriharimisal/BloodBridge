import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Droplet, Menu, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const links = [
  ['/find-blood', 'Find Blood'],
  ['/requests', 'Requests'],
  ['/donate', 'Donate'],
  ['/blood-banks', 'Blood Banks'],
  ['/about', 'About'],
]
const navClass = ({ isActive }) => `rounded px-2 py-1.5 text-sm ${isActive ? 'font-semibold text-brand' : 'text-slate-700 hover:text-brand'}`

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { session, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  const accountControl = session
    ? <button type="button" onClick={logout} className="btn-secondary !py-1.5">Log out</button>
    : <Link to="/login" className="btn-secondary !py-1.5">Log in</Link>

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Droplet className="h-5 w-5 fill-brand text-brand" aria-hidden /> BloodBridge
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-3 lg:flex">
            {links.map(([to, label]) => <NavLink key={to} to={to} className={navClass}>{label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/notifications" aria-label="Notifications" className="rounded p-1.5 text-slate-600 hover:text-brand"><Bell className="h-5 w-5" /></Link>
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            {!isAuthPage && accountControl}
          </div>
          <button className="rounded p-2 lg:hidden" aria-label="Menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 lg:hidden">
            {[...links, ['/dashboard', 'Dashboard'], ['/notifications', 'Notifications']].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded px-2 py-2.5 text-sm ${isActive ? 'font-semibold text-brand' : 'text-slate-700'}`}>{label}</NavLink>
            ))}
            {!isAuthPage && (
              session
                ? <button type="button" onClick={logout} className="rounded px-2 py-2.5 text-left text-sm text-slate-700">Log out</button>
                : <NavLink to="/login" className="rounded px-2 py-2.5 text-sm text-slate-700">Log in</NavLink>
            )}
          </nav>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 text-sm text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
          <p>© 2026 BloodBridge</p>
          <p>Sample information only. Confirm availability with the blood bank. In an emergency, contact local emergency services.</p>
        </div>
      </footer>
    </div>
  )
}
