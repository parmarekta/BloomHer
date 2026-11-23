import { API_BASE_URL } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getScreeningTrend } from '@/lib/screening'

type BackendScreeningHistoryItem = {
  screening_id: number
  screening_type: 'EPDS' | 'PHQ9'
  score: number
  max_score: number
  severity: string
  needs_follow_up: boolean
  self_harm_signal: boolean
  created_at: string
}

type ScreeningHistoryEntry = {
  id: string
  type: 'EPDS' | 'PHQ-9'
  score: number
  maxScore: number
  severity: string
  needsFollowUp: boolean
  selfHarmSignal: boolean
  date: string
}

export function MotherHistoryPage() {
  const { user } = useAuth()

  const [history, setHistory] = useState<ScreeningHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true)
        setError(null)

        if (!user?.motherId) {
          throw new Error('Mother profile not found for this account.')
        }

        const response = await fetch(
          `${API_BASE_URL}/screening/mother/${user.motherId}/history`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch screening history.')
        }

        const data: BackendScreeningHistoryItem[] =
          await response.json()

        const mappedHistory: ScreeningHistoryEntry[] = data.map(
          (item) => ({
            id: String(item.screening_id),

            type:
              item.screening_type === 'PHQ9'
                ? 'PHQ-9'
                : 'EPDS',

            score: item.score,

            maxScore: item.max_score,

            severity: item.severity,

            needsFollowUp: item.needs_follow_up,

            selfHarmSignal: item.self_harm_signal,

            date: item.created_at,
          }),
        )

        setHistory(mappedHistory)
      } catch (err) {
        console.error(err)

        setError(
          'Unable to load screening history. Please try again.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user?.motherId])

  return (
    <div>
      <PageHeader
        eyebrow="Screening history"
        title="Your screening journey"
        description="Review your previous EPDS and PHQ-9 screening results. These results are screening signals, not diagnoses."
      />

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading your history...</CardTitle>

            <CardDescription>
              Please wait while BloomHer retrieves your previous screenings.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load history</CardTitle>

            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No screening history yet</CardTitle>

            <CardDescription>
              Your completed EPDS and PHQ-9 screenings will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {history.map((item, index) => {
            const previousEntry = history
              .slice(index + 1)
              .find(
                (entry) => entry.type === item.type,
              )

            const trend = previousEntry
              ? getScreeningTrend(
                  item.score,
                  previousEntry.score,
                )
              : null

            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.type}</CardTitle>

                  <CardDescription>
                    {new Date(item.date).toLocaleString()}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-lavender-soft p-4">
                    <div>
                      <p className="text-sm text-ink-muted">
                        Total score
                      </p>

                      <p className="mt-1 font-display text-3xl">
                        {item.score}

                        <span className="text-lg text-ink-muted">
                          /{item.maxScore}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-ink-muted">
                        Result
                      </p>

                      <p className="mt-1 font-medium">
                        {item.severity}
                      </p>
                    </div>
                  </div>

                  {item.selfHarmSignal && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="font-semibold text-red-900">
                        Safety-focused follow-up was indicated
                      </p>

                      <p className="mt-1 text-sm text-red-800">
                        This screening included a response that requires
                        additional safety-focused attention.
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-border bg-surface-soft p-4">
                    <p className="text-sm text-ink-muted">
                      {item.needsFollowUp
                        ? 'Follow-up recommended with an appropriate care team member.'
                        : 'Continue regular check-ins and use BloomHer resources when needed.'}
                    </p>
                  </div>

                  {trend && (
                    <div className="rounded-2xl border border-border bg-surface-soft p-4">
                      <p className="text-sm text-ink-muted">
                        Trend compared with your previous{' '}
                        {item.type} screening
                      </p>

                      <p className="mt-1 font-medium">
                        {trend === 'improving'
                          ? 'Improving'
                          : trend === 'worsening'
                            ? 'Worsening'
                            : 'Stable'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
