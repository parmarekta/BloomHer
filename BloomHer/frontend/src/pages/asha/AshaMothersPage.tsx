import { API_BASE_URL } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MessageCircle, Smartphone } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

type LatestScreening = {
  screening_id: number
  screening_type: 'EPDS' | 'PHQ9'
  score: number
  max_score: number
  severity: string
  needs_follow_up: boolean
  self_harm_signal: boolean
  created_at: string
}

type AshaMother = {
  mother_id: number
  name: string
  age: number
  phone: string
  village: string
  care_stage: string
  gestation_or_postpartum_week: number
  latest_screening: LatestScreening | null
}

export function AshaMothersPage() {
  const { user } = useAuth()

  const [mothers, setMothers] = useState<AshaMother[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMothers() {
      try {
        setLoading(true)
        setError(null)

        if (!user?.id) {
          throw new Error(
            'ASHA account information not available.',
          )
        }

        const response = await fetch(
          `${API_BASE_URL}/asha/${user.id}/mothers`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch mothers.')
        }

        const data: AshaMother[] = await response.json()

        setMothers(data)
      } catch (err) {
        console.error('Failed to load mothers:', err)

        setError(
          'Unable to load the mothers assigned to you.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMothers()
  }, [user?.id])

  return (
    <div>
      <PageHeader
        eyebrow="My mothers"
        title="Families you support"
        description="Review screening signals and support information for the mothers in your care. Final follow-up decisions are made by the ASHA worker."
      />

      {loading && (
        <Card className="p-5">
          <p className="text-sm text-ink-muted">
            Loading mothers...
          </p>
        </Card>
      )}

      {!loading && error && (
        <Card className="p-5">
          <p className="font-medium">
            Unable to load mothers
          </p>

          <p className="mt-1 text-sm text-ink-muted">
            {error}
          </p>
        </Card>
      )}

      {!loading && !error && mothers.length === 0 && (
        <Card className="p-5">
          <p className="font-medium">
            No mothers found
          </p>

          <p className="mt-1 text-sm text-ink-muted">
            Mothers assigned to you will appear here.
          </p>
        </Card>
      )}

      {!loading && !error && mothers.length > 0 && (
        <div className="grid gap-3">
          {mothers.map((mother) => {
            const screening = mother.latest_screening

            return (
              <Card
                key={mother.mother_id}
                className="flex flex-col gap-4 p-5 transition hover:border-lavender/40"
              >
                {/* Mother information */}
                <Link to={`/asha/mothers/${mother.mother_id}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {mother.name}
                      </p>

                      <p className="text-sm text-ink-muted">
                        Age {mother.age} · {mother.care_stage} ·{' '}
                        {mother.village}
                      </p>

                      <p className="mt-1 text-sm text-ink-muted">
                        Week {mother.gestation_or_postpartum_week}
                      </p>
                    </div>

                    {screening && (
                      <StatusBadge
                        status={
                          screening.needs_follow_up
                            ? 'follow_up_planned'
                            : 'check_in_recorded'
                        }
                      />
                    )}
                  </div>

                  {/* Screening information */}
                  {screening ? (
                    <div className="mt-4 rounded-2xl bg-canvas p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-ink-muted">
                          Latest screening
                        </p>

                        <p className="text-sm font-medium">
                          {screening.screening_type === 'PHQ9'
                            ? 'PHQ-9'
                            : 'EPDS'}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm">
                          Score:{' '}
                          <span className="font-semibold">
                            {screening.score}/{screening.max_score}
                          </span>
                        </p>

                        <p className="text-sm font-medium">
                          {screening.severity}
                        </p>
                      </div>

                      {screening.self_harm_signal && (
                        <p className="mt-2 text-sm font-medium text-red-700">
                          Safety-focused follow-up indicated
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-canvas p-4">
                      <p className="text-sm text-ink-muted">
                        No screening completed yet.
                      </p>
                    </div>
                  )}
                </Link>

                {/* Contact actions */}
                <div className="flex flex-wrap gap-2">
                  {/* Call */}
                  <a
                    href={`tel:${mother.phone}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-lavender-soft px-4 py-2 text-sm font-medium transition hover:opacity-80"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/91${mother.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-sage-soft px-4 py-2 text-sm font-medium transition hover:opacity-80"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>

                  {/* SMS */}
                  <a
                    href={`sms:${mother.phone}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-canvas px-4 py-2 text-sm font-medium transition hover:opacity-80"
                  >
                    <Smartphone className="h-4 w-4" />
                    SMS
                  </a>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
