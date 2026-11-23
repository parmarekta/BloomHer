import { API_BASE_URL } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Stethoscope,
  Users,
} from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

  follow_up_count: number
  referral_count: number

  suggestion: string
}

export function AshaDashboardPage() {
  const { user } = useAuth()

  const [mothers, setMothers] = useState<AshaMother[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMothers() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${API_BASE_URL}/asha/${user.id}/mothers`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch assigned mothers.')
        }

        const data: AshaMother[] = await response.json()

        setMothers(data)
      } catch (err) {
        console.error('Failed to load ASHA mothers:', err)

        setError(
          'Unable to load your assigned mothers.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMothers()
  }, [user?.id])

  const mothersNeedingAttention = mothers.filter(
    (mother) =>
      mother.latest_screening?.needs_follow_up === true ||
      mother.latest_screening?.self_harm_signal === true,
  )

  const totalFollowUps = mothers.reduce(
    (total, mother) => total + mother.follow_up_count,
    0,
  )

  const totalReferrals = mothers.reduce(
    (total, mother) => total + mother.referral_count,
    0,
  )

  return (
    <div>
      <PageHeader
        eyebrow="ASHA dashboard"
        title={`Namaste, ${user?.name?.split(' ')[0] ?? 'ASHA'}`}
        description="Review your assigned mothers, understand their screening signals, and decide what support or follow-up is appropriate."
      />

      {/* =====================================================
          DASHBOARD STATS
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Mothers assigned"
          value={String(mothers.length)}
          icon={Users}
        />

        <StatCard
          label="Need attention"
          value={String(mothersNeedingAttention.length)}
          icon={CalendarDays}
        />

        <StatCard
          label="Referrals"
          value={String(totalReferrals)}
          icon={Stethoscope}
        />
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="text-sm text-ink-muted">
              Loading your assigned mothers...
            </p>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="font-medium">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-sm text-ink-muted">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          NO MOTHERS
      ===================================================== */}

      {!loading && !error && mothers.length === 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>No mothers assigned yet</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-ink-muted">
              Mothers assigned to you will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          MOTHERS WHO NEED ATTENTION
      ===================================================== */}

      {!loading &&
        !error &&
        mothersNeedingAttention.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  Mothers who may need attention
                </CardTitle>

                <p className="mt-1 text-sm text-ink-muted">
                  Review the screening information and decide
                  what action is appropriate.
                </p>
              </div>

              <Link to="/asha/mothers">
                <Button size="sm" variant="secondary">
                  View all
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="grid gap-3">
              {mothersNeedingAttention
                .slice(0, 5)
                .map((mother) => (
                  <Link
                    key={mother.mother_id}
                    to={`/asha/mothers/${mother.mother_id}`}
                    className="rounded-2xl bg-canvas px-4 py-4 transition hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {mother.name}
                        </p>

                        <p className="text-sm text-ink-muted">
                          {mother.care_stage} ·{' '}
                          {mother.village}
                        </p>

                        {mother.latest_screening && (
                          <p className="mt-1 text-sm">
                            {
                              mother.latest_screening
                                .screening_type
                            }{' '}
                            score:{' '}
                            <span className="font-medium">
                              {
                                mother.latest_screening
                                  .score
                              }
                              /
                              {
                                mother.latest_screening
                                  .max_score
                              }
                            </span>
                          </p>
                        )}
                      </div>

                      {mother.latest_screening && (
                        <StatusBadge
                          status={
                            mother.latest_screening.needs_follow_up
                              ? 'follow_up_planned'
                              : 'check_in_recorded'
                          }
                        />
                      )}
                    </div>

                    <div className="mt-3 rounded-xl border border-border bg-surface-soft p-3">
                      <p className="text-xs font-medium text-ink-muted">
                        APP SUGGESTION
                      </p>

                      <p className="mt-1 text-sm">
                        {mother.suggestion}
                      </p>
                    </div>
                  </Link>
                ))}
            </CardContent>
          </Card>
        )}

      {/* =====================================================
          ALL MOTHERS
      ===================================================== */}

      {!loading && !error && mothers.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your mothers</CardTitle>

            <Link to="/asha/mothers">
              <Button size="sm" variant="secondary">
                View all
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="grid gap-3">
            {mothers.slice(0, 5).map((mother) => (
              <Link
                key={mother.mother_id}
                to={`/asha/mothers/${mother.mother_id}`}
                className="flex flex-col gap-2 rounded-2xl bg-canvas px-4 py-4 transition hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {mother.name}
                  </p>

                  <p className="text-sm text-ink-muted">
                    {mother.care_stage} · {mother.village}
                  </p>

                  {mother.latest_screening && (
                    <p className="mt-1 text-sm text-ink-muted">
                      Latest:{' '}
                      {
                        mother.latest_screening
                          .screening_type
                      }{' '}
                      · Score{' '}
                      {
                        mother.latest_screening.score
                      }
                      /
                      {
                        mother.latest_screening
                          .max_score
                      }
                    </p>
                  )}

                  {!mother.latest_screening && (
                    <p className="mt-1 text-sm text-ink-muted">
                      No screening completed yet
                    </p>
                  )}
                </div>

                {mother.latest_screening && (
                  <StatusBadge
                    status={
                      mother.latest_screening.needs_follow_up
                        ? 'follow_up_planned'
                        : 'check_in_recorded'
                    }
                  />
                )}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      {!loading && !error && mothers.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link to="/asha/mothers">
            <Card className="h-full transition hover:shadow-sm">
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <p className="font-medium">
                    View all mothers
                  </p>

                  <p className="mt-1 text-sm text-ink-muted">
                    Open your complete mother list.
                  </p>
                </div>

                <Users className="h-5 w-5" />
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent className="py-6">
              <p className="font-medium">
                Follow-ups recorded
              </p>

              <p className="mt-1 text-3xl font-semibold">
                {totalFollowUps}
              </p>

              <p className="mt-1 text-sm text-ink-muted">
                Review and plan follow-up actions from
                individual mother profiles.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
