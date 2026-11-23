import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { roleHomePath } from '@/data/mock'
import type { UserRole } from '@/types'

import { API_BASE_URL } from '@/lib/api'

export function RegisterPage() {
  const { setUserFromBackend } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('mother')

  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)

  const [age, setAge] = useState('')
  const [careStage, setCareStage] = useState('Pregnant')
  const [village, setVillage] = useState('')
  const [week, setWeek] = useState('')

  const [ashaId, setAshaId] = useState('')
  const [serviceArea, setServiceArea] = useState('')

  const [registrationNumber, setRegistrationNumber] = useState('')
  const [qualification, setQualification] = useState('')
  const [specialization, setSpecialization] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function sendOtp() {
    if (phone.length < 10) {
      return
    }

    setOtpSent(true)
    setPhoneVerified(false)
    setOtp('')
  }

  function verifyOtp() {
    if (otp === '123456') {
      setPhoneVerified(true)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    setError(null)

    if (!phoneVerified) {
      setError('Please verify your mobile number first.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (role === 'mother') {
      if (!age || !village || !week) {
        setError(
          'Please complete your age, village, and pregnancy/postpartum week.',
        )
        return
      }
    }

    try {
      setSubmitting(true)

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          
          body: JSON.stringify({
            name,
            email,
            password,
            role,

            age: role === 'mother' ? Number(age) : null,

            phone: phone || null,

            village:
              role === 'mother'
                ? village
                : role === 'asha'
                  ? serviceArea
                  : null,

            care_stage:
              role === 'mother'
                ? careStage
                : null,

            gestation_or_postpartum_week:
              role === 'mother'
                ? Number(week)
                : null,

            asha_id:
              role === 'asha'
                ? ashaId
                : null,

            registration_number:
              role === 'professional'
                ? registrationNumber
                : null,

            qualification:
              role === 'professional'
                ? qualification
                : null,

            specialization:
              role === 'professional'
                ? specialization
                : null,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Unable to create your account.',
        )
      }

      /*
       * The backend has now created the real account.
       *
       * Store the returned user in AuthContext so the dashboard
       * uses the actual registered person's name and IDs.
       */
      setUserFromBackend(data.user)

      navigate(roleHomePath[role])
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your account. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Registration"
        title="Create your BloomHer profile"
        description="Tell us a little about yourself so BloomHer can provide the right experience for your role."
      />

      <Card className="p-6">
        <form
          className="grid gap-5"
          onSubmit={onSubmit}
        >
          {/* Basic information */}

          <div>
            <Label htmlFor="name">
              Full name
            </Label>

            <Input
              id="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">
              Email address
            </Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}

          <div>
            <Label htmlFor="password">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={6}
              placeholder="Create a password"
            />

            <p className="mt-1 text-xs text-ink-muted">
              Use at least 6 characters.
            </p>
          </div>

          {/* Mobile verification */}

          <div>
            <Label htmlFor="phone">
              Mobile number
            </Label>

            <div className="mt-1 flex gap-2">
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value)
                  setPhoneVerified(false)
                }}
                required
                placeholder="10-digit mobile number"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={sendOtp}
                disabled={phone.length < 10}
              >
                Send code
              </Button>
            </div>

            {otpSent && !phoneVerified && (
              <div className="mt-3 rounded-2xl bg-lavender-soft p-4">
                <p className="text-sm text-ink-muted">
                  Enter the verification code sent to
                  your mobile number.
                </p>

                <div className="mt-3 flex gap-2">
                  <Input
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value)
                    }
                    placeholder="Enter verification code"
                    inputMode="numeric"
                  />

                  <Button
                    type="button"
                    onClick={verifyOtp}
                    disabled={otp.length === 0}
                  >
                    Verify
                  </Button>
                </div>

                <p className="mt-2 text-xs text-ink-muted">
                  Demo verification code: 123456
                </p>
              </div>
            )}

            {phoneVerified && (
              <p className="mt-2 text-sm font-medium text-sage">
                ✓ Mobile number verified
              </p>
            )}
          </div>

          {/* Role */}

          <div>
            <Label htmlFor="role">
              I am registering as
            </Label>

            <Select
              id="role"
              value={role}
              onChange={(event) => {
                setRole(
                  event.target.value as UserRole,
                )
                setPhoneVerified(false)
                setError(null)
              }}
            >
              <option value="mother">
                Mother
              </option>

              <option value="asha">
                ASHA worker
              </option>

              <option value="professional">
                Healthcare professional
              </option>
            </Select>
          </div>

          {/* Mother fields */}

          {role === 'mother' && (
            <div className="rounded-2xl border border-border bg-surface-soft p-5">
              <h3 className="font-display text-xl">
                About your motherhood journey
              </h3>

              <p className="mt-1 text-sm text-ink-muted">
                This helps BloomHer show information
                relevant to your current stage.
              </p>

              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="age">
                    Age
                  </Label>

                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(event) =>
                      setAge(event.target.value)
                    }
                    required
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <Label htmlFor="village">
                    Village / location
                  </Label>

                  <Input
                    id="village"
                    value={village}
                    onChange={(event) =>
                      setVillage(event.target.value)
                    }
                    required
                    placeholder="Enter your village"
                  />
                </div>

                <div>
                  <Label htmlFor="careStage">
                    Current stage
                  </Label>

                  <Select
                    id="careStage"
                    value={careStage}
                    onChange={(event) =>
                      setCareStage(event.target.value)
                    }
                  >
                    <option value="Pregnant">
                      Pregnant
                    </option>

                    <option value="Postpartum">
                      After childbirth
                    </option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="week">
                    Pregnancy / postpartum week
                  </Label>

                  <Input
                    id="week"
                    type="number"
                    min="0"
                    max="52"
                    value={week}
                    onChange={(event) =>
                      setWeek(event.target.value)
                    }
                    required
                    placeholder="Enter week"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ASHA fields */}

          {role === 'asha' && (
            <div className="rounded-2xl border border-border bg-surface-soft p-5">
              <h3 className="font-display text-xl">
                ASHA worker information
              </h3>

              <p className="mt-1 text-sm text-ink-muted">
                These details can later be verified
                through the BloomHer backend.
              </p>

              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="ashaId">
                    ASHA Worker ID
                  </Label>

                  <Input
                    id="ashaId"
                    value={ashaId}
                    onChange={(event) =>
                      setAshaId(event.target.value)
                    }
                    required
                    placeholder="Enter your ASHA worker ID"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceArea">
                    Village / service area
                  </Label>

                  <Input
                    id="serviceArea"
                    value={serviceArea}
                    onChange={(event) =>
                      setServiceArea(event.target.value)
                    }
                    required
                    placeholder="Enter your service area"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Healthcare professional fields */}

          {role === 'professional' && (
            <div className="rounded-2xl border border-border bg-surface-soft p-5">
              <h3 className="font-display text-xl">
                Professional information
              </h3>

              <p className="mt-1 text-sm text-ink-muted">
                These credentials can later be verified
                before access to referred cases.
              </p>

              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="registrationNumber">
                    Professional registration number
                  </Label>

                  <Input
                    id="registrationNumber"
                    value={registrationNumber}
                    onChange={(event) =>
                      setRegistrationNumber(
                        event.target.value,
                      )
                    }
                    required
                    placeholder="Registration / license number"
                  />
                </div>

                <div>
                  <Label htmlFor="qualification">
                    Qualification
                  </Label>

                  <Input
                    id="qualification"
                    value={qualification}
                    onChange={(event) =>
                      setQualification(
                        event.target.value,
                      )
                    }
                    required
                    placeholder="e.g. MBBS, MD, MSc Psychology"
                  />
                </div>

                <div>
                  <Label htmlFor="specialization">
                    Area of expertise
                  </Label>

                  <Input
                    id="specialization"
                    value={specialization}
                    onChange={(event) =>
                      setSpecialization(
                        event.target.value,
                      )
                    }
                    required
                    placeholder="e.g. Psychiatry, Obstetrics, Psychology"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}

          <Button
            type="submit"
            className="mt-2"
            disabled={
              !phoneVerified ||
              submitting
            }
          >
            {submitting
              ? 'Creating account...'
              : 'Create profile'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-ink-muted">
          Already have a BloomHer profile?{' '}

          <Link
            to="/login"
            className="text-lavender underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>

      <div className="mt-6">
        <SafetyNotice compact />
      </div>
    </div>
  )
}