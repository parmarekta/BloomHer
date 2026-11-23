import { API_BASE_URL } from '@/lib/api'
import { Link } from 'react-router-dom'
import { ClipboardList, MessagesSquare, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { StatCard } from '@/components/StatCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

type ProfessionalReferral = {
  referral_id: number
  mother_id: number
  mother_name: string
  mother_age: number
  mother_phone: string
  village: string
  care_stage: string
  reason: string
  status: 'open' | 'in_review' | 'family_contacted' | 'closed'
  created_at: string
  asha_name: string
  screening: {
    screening_id: number
    screening_type: 'EPDS' | 'PHQ9'
    score: number
    max_score: number
    severity: string
    needs_follow_up: boolean
    self_harm_signal: boolean
    created_at: string
  } | null
}

const labels = {
  open: 'Open',
  in_review: 'In review',
  family_contacted: 'Family contacted',
  closed: 'Closed',
} as const

export function ProfessionalDashboardPage() {
  const { user } = useAuth()

  const [referrals, setReferrals] = useState<ProfessionalReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReferrals() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${API_BASE_URL}/professional/${user.id}/referrals`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch referrals.')
        }

        const data: ProfessionalReferral[] =
          await response.json()

        setReferrals(data)
      } catch (err) {
        console.error(
          'Failed to load professional referrals:',
          err,
        )

        setError(
          'Unable to load referred families.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchReferrals()
  }, [user?.id])

  const awaitingReview = referrals.filter(
    (item) => item.status === 'open' || item.status === 'in_review',
  ).length

  const familiesContacted = referrals.filter(
    (item) => item.status === 'family_contacted',
  ).length

  return (
    <div>
      <PageHeader
        eyebrow="Professional dashboard"
        title={`Hello, ${user?.name ?? 'Doctor'}`}
        description="Review referred families, understand their screening context, and use your professional judgement. BloomHer does not diagnose."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Referred cases"
          value={String(referrals.length)}
          icon={ClipboardList}
        />

        <StatCard
          label="Awaiting review"
          value={String(awaitingReview)}
          icon={MessagesSquare}
        />

        <StatCard
          label="Families contacted"
          value={String(familiesContacted)}
          icon={Users}
        />
      </div>

      {loading && (
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="text-sm text-ink-muted">
              Loading referred families...
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="font-medium">
              Unable to load referrals
            </p>

            <p className="mt-1 text-sm text-ink-muted">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading &&
        !error &&
        referrals.length === 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>No referred cases yet</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-ink-muted">
                Mothers referred by ASHA workers will appear here.
              </p>
            </CardContent>
          </Card>
        )}

      {!loading &&
        !error &&
        referrals.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Latest referrals</CardTitle>

              <Link
                to="/professional/cases"
                className="text-sm text-lavender hover:underline"
              >
                View all
              </Link>
            </CardHeader>

            <CardContent className="grid gap-3">
              {referrals.map((item) => (
                <Link
                  key={item.referral_id}
                  to={`/professional/cases/${item.referral_id}`}
                  className="rounded-2xl bg-canvas px-4 py-4 transition hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {item.mother_name}
                      </p>

                      <p className="text-sm text-ink-muted">
                        Referred by {item.asha_name}
                      </p>

                      <p className="mt-1 text-sm text-ink-muted">
                        {item.village} · {item.care_stage}
                      </p>
                    </div>

                    <Badge>
                      {labels[item.status]}
                    </Badge>
                  </div>

                  {item.screening && (
                    <div className="mt-3 rounded-xl border border-border bg-surface-soft p-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-medium text-ink-muted">
                          LATEST SCREENING
                        </p>

                        <p className="text-sm font-medium">
                          {item.screening.screening_type === 'PHQ9'
                            ? 'PHQ-9'
                            : 'EPDS'}
                        </p>
                      </div>

                      <p className="mt-1 text-sm">
                        Score:{' '}
                        <span className="font-semibold">
                          {item.screening.score}/
                          {item.screening.max_score}
                        </span>
                        {' · '}
                        {item.screening.severity}
                      </p>

                      {item.screening.self_harm_signal && (
                        <p className="mt-2 text-sm font-medium text-red-700">
                          Safety-focused attention indicated
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 rounded-xl border border-border bg-surface-soft p-3">
                    <p className="text-xs font-medium text-ink-muted">
                      REFERRAL REASON
                    </p>

                    <p className="mt-1 text-sm">
                      {item.reason}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

      <div className="mt-6">
        <SafetyNotice />
      </div>
    </div>
  )
}
