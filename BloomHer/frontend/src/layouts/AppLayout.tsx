import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  ClipboardList,
  HeartPulse,
  History,
  MessageSquare,
  Home,
  Menu,
  Stethoscope,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SafetyNotice } from '@/components/SafetyNotice'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

type NavItem = { to: string; label: string; icon: LucideIcon }

const navByRole: Record<UserRole, NavItem[]> = {
  mother: [
    { to: '/mother', label: 'Dashboard', icon: Home },
    { to: '/mother/check-in', label: 'Check-in', icon: HeartPulse },
    { to: '/mother/history', label: 'History', icon: History },
    { to: '/mother/resources', label: 'Resources', icon: BookOpen },
    { to: '/mother/follow-up', label: 'Follow-up', icon: ClipboardList },
    { to: '/mother/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/mother/profile', label: 'Profile', icon: UserRound },
  ],
  asha: [
    { to: '/asha', label: 'Dashboard', icon: Home },
    { to: '/asha/mothers', label: 'My mothers', icon: Users },
    { to: '/asha/follow-ups', label: 'Follow-ups', icon: ClipboardList },
    { to: '/asha/feedback', label: 'Mother feedback', icon: MessageSquare },
    { to: '/asha/referrals', label: 'Referrals', icon: Stethoscope },
  ],
  professional: [
    { to: '/professional', label: 'Dashboard', icon: Home },
    { to: '/professional/feedback', label: 'Mother feedback', icon: MessageSquare },
    { to: '/professional/cases', label: 'Referred cases', icon: ClipboardList },
  ],
}

const roleLabel: Record<UserRole, string> = {
  mother: 'Mother',
  asha: 'ASHA worker',
  professional: 'Healthcare professional',
}

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.split('/').length === 2}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition',
              isActive
                ? 'bg-lavender text-white shadow-sm'
                : 'text-ink-muted hover:bg-lavender-mist/80 hover:text-ink',
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout({ role }: { role: UserRole }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const items = navByRole[role]

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  const chrome: ReactNode = (
    <>
      <BrandMark to={items[0].to} />
      <div className="mt-8 flex-1">
        <SidebarNav items={items} onNavigate={() => setOpen(false)} />
      </div>
      <SafetyNotice compact />
    </>
  )

  return (
    <div className="min-h-svh bg-canvas text-ink">
      <div className="mx-auto flex min-h-svh max-w-[1400px]">
        <aside className="sticky top-0 hidden h-svh w-72 shrink-0 flex-col border-r border-line bg-white/80 p-5 lg:flex">
          {chrome}
        </aside>

        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/30"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            />
            <aside className="relative flex h-full w-72 flex-col bg-white p-5 shadow-xl">
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full p-2 text-ink-muted hover:bg-canvas"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              {chrome}
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line/80 bg-canvas/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <p className="hidden text-sm text-ink-muted sm:block">Demo workspace</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium leading-tight">{user?.name}</p>
                <Badge tone="lavender">{roleLabel[role]}</Badge>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
