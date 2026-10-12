import { useState } from 'react'
import { LayoutDashboard, Menu, Route, Search, Sparkles, TreePine, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Search },
  { to: '/complexity-lab', label: 'Complexity Lab', icon: Sparkles },
  { to: '/playground', label: 'Playground', icon: TreePine },
  { to: '/roadmap', label: 'Roadmap', icon: Route },
]

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5 text-lg font-semibold text-white sm:text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/30">
              <Sparkles className="h-4 w-4" />
            </div>
            AlgoSphere
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-slate-800 text-cyan-200' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NavLink to="/explore" className="hidden rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-400 sm:inline-flex">
              Browse library
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 lg:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && <nav id="mobile-navigation" className="border-t border-slate-800 px-3 py-2 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${isActive ? 'bg-slate-800 text-cyan-200' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </div>
        </nav>}
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
