/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { demoUsers } from '@/data/mock'
import type { DemoUser, UserRole } from '@/types'

const STORAGE_KEY = 'bloomher.demo.user'
const TOKEN_KEY = 'bloomher.feedback.token'

type BackendUser = {
  user_id: number
  name: string
  email: string
  role: UserRole
  phone?: string | null
  mother_id?: number | null
}

type AuthContextValue = {
  user: DemoUser | null
  signIn: (role: UserRole, name?: string, email?: string) => void
  setUserFromBackend: (backendUser: BackendUser, token?: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

function readStoredUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    return JSON.parse(raw) as DemoUser
  } catch {
    return null
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<DemoUser | null>(
    () => readStoredUser(),
  )

  const signIn = useCallback(
    (role: UserRole, name?: string, email?: string) => {
      const base = demoUsers[role]

      const next: DemoUser = {
        ...base,
        name: name?.trim() || base.name,
        email: email?.trim() || base.email,
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next),
      )

      setUser(next)
    },
    [],
  )

  const setUserFromBackend = useCallback(
    (backendUser: BackendUser, token?: string) => {
      if (token) sessionStorage.setItem(TOKEN_KEY, token)
      else sessionStorage.removeItem(TOKEN_KEY)
      const next: DemoUser = {
        id: String(backendUser.user_id),
        name: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        phone: backendUser.phone ?? undefined,
        motherId: backendUser.mother_id ?? undefined,
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next),
      )

      setUser(next)
    },
    [],
  )

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      signIn,
      setUserFromBackend,
      signOut,
    }),
    [user, signIn, setUserFromBackend, signOut],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider',
    )
  }

  return context
}