import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { roleHomePath } from '@/data/mock'
import { API_BASE_URL } from '@/lib/api'
import type { UserRole } from '@/types'

const roleOptions: {
  role: UserRole
  label: string
}[] = [
  {
    role: 'mother',
    label: 'Mother',
  },
  {
    role: 'asha',
    label: 'ASHA worker',
  },
  {
    role: 'professional',
    label: 'Healthcare professional',
  },
]

export function LoginPage() {
  const { setUserFromBackend } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('mother')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            role,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to sign in.',
        )
      }

      setUserFromBackend(data.user, data.token)

      navigate(roleHomePath[data.user.role as UserRole])
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Sign in"
        title="Welcome back"
        description="Sign in with the account you created on BloomHer."
      />

      <div className="mx-auto max-w-xl">
        <Card className="p-6">
          <form
            className="grid gap-5"
            onSubmit={onSubmit}
          >
            <div>
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <div>
              <Label>
                Sign in as
              </Label>

              <div className="mt-2 grid gap-2">
                {roleOptions.map((option) => (
                  <label
                    key={option.role}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                      role === option.role
                        ? 'border-lavender bg-lavender-mist/60'
                        : 'border-line'
                    }`}
                  >
                    <span className="font-medium">
                      {option.label}
                    </span>

                    <input
                      type="radio"
                      name="role"
                      className="accent-lavender"
                      checked={
                        role === option.role
                      }
                      onChange={() =>
                        setRole(option.role)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-900">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="mt-1"
              disabled={loading}
            >
              {loading
                ? 'Signing in...'
                : 'Sign in'}
            </Button>
          </form>

          <p className="mt-5 text-sm text-ink-muted">
            New here?{' '}
            <Link
              to="/register"
              className="text-lavender underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </Card>

        <div className="mt-4">
          <SafetyNotice compact />
        </div>
      </div>
    </div>
  )
}