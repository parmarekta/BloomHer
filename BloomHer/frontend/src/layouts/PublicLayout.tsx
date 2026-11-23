import { NavLink, Outlet } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'

const links = [
  { to: '/about', label: 'How it works' },
  { to: '/login', label: 'Sign in' },
]

export function PublicLayout() {
  return (
    <div className="min-h-svh bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <BrandMark />
          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `hidden rounded-full px-3 py-2 text-sm sm:inline-flex ${
                    isActive ? 'text-lavender' : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/register">
              <Button size="sm">Get started</Button>
            </NavLink>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-line bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>BloomHer supports screening, monitoring, education, and referral — it does not diagnose.</p>
          <p>Demo MVP for maternal wellbeing coordination.</p>
        </div>
      </footer>
    </div>
  )
}
