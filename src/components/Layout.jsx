import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Droplet, Menu, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const navClass = ({ isActive }) => `whitespace-nowrap rounded-xl px-2.5 py-2 text-[13px] font-semibold transition ${isActive ? 'bg-rose-50 text-brand' : 'text-slate-700 hover:bg-slate-50 hover:text-brand'}`

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { session, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const sections = [
    ['/', 'Dashboard'],
    ['/inventory', 'Inventory'],
    ['/dispatch', 'Dispatch'],
    ['/transit', 'Transit'],
    ['/notifications', 'Notification'],
    ['/about', 'About'],
  ]

  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  const accountControl = session
    ? <button type="button" onClick={logout} className="btn-secondary !py-2">Log out</button>
    : <Link to="/login" className="btn-secondary !py-2">Log in</Link>

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-slate-900">
            <Droplet className="h-5 w-5 fill-brand text-brand" aria-hidden /> BloodBridge
          </Link>
          <nav aria-label="Main sections" className="hidden items-center gap-0.5 xl:flex">
            {sections.map(([to, label]) => <NavLink key={label} to={to} end={to === '/'} className={navClass}>{label}</NavLink>)}
          </nav>
          <div className="hidden items-center xl:flex">{!isAuthPage && accountControl}</div>
          <button className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 xl:hidden" aria-label="Menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Main sections" className="grid grid-cols-2 gap-1 border-t border-slate-200 bg-white px-4 py-3 sm:grid-cols-3 xl:hidden">
            {sections.map(([to, label]) => <NavLink key={label} to={to} end={to === '/'} className={({ isActive }) => `rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-rose-50 text-brand' : 'text-slate-700'}`}>{label}</NavLink>)}
            {!isAuthPage && <div className="col-span-2 mt-2 border-t border-slate-100 pt-2 sm:col-span-3">{session ? <button type="button" onClick={logout} className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700">Log out</button> : <Link to="/login" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700">Log in</Link>}</div>}
          </nav>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 text-sm text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
          <p>© 2026 BloodBridge</p>
          <p>Confirm availability with the blood bank. In an emergency, contact local emergency services.</p>
        </div>
      </footer>
    </div>
  )
}
