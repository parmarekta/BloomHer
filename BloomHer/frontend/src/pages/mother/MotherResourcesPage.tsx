import { useState, type FormEvent } from 'react'
import { Clock, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resources } from '@/data/mock'
import { API_BASE_URL } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Recommendation = {
  matched: boolean
  topic?: string
  confidence?: number
  resource?: { resource_id: string; title: string; topic: string }
  message?: string
  disclaimer: string
}

export function MotherResourcesPage() {
  const [requestText, setRequestText] = useState('')
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function getRecommendation(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setRecommendation(null)
    try {
      const response = await fetch(`${API_BASE_URL}/ai/support-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: requestText }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.detail || 'Unable to get a resource suggestion.')
      setRecommendation(data as Recommendation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to get a resource suggestion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Education for pregnancy and after birth"
        description="These notes are for learning and conversation. They are not treatment, and they cannot tell you whether you have a mental-health condition."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" aria-hidden="true" /> AI resource finder</CardTitle>
          <CardDescription>Describe the kind of practical support or information you are looking for. The model matches your words to an educational resource topic only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={getRecommendation} className="grid gap-3">
            <textarea
              value={requestText}
              onChange={(event) => setRequestText(event.target.value)}
              minLength={8}
              maxLength={1000}
              required
              rows={3}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm"
              placeholder="For example: I need advice about getting more rest while caring for my newborn."
              aria-label="Describe the support information you need"
            />
            <Button type="submit" disabled={loading || requestText.trim().length < 8}>
              {loading ? 'Finding a resource…' : 'Find a resource'}
            </Button>
          </form>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          {recommendation && (
            <div className="mt-4 rounded-xl border border-border bg-surface-soft p-4" aria-live="polite">
              {recommendation.matched ? (
                <>
                  <p className="font-semibold">Suggested topic: {recommendation.resource?.topic}</p>
                  <p className="mt-1 text-sm">{recommendation.resource?.title}</p>
                  <p className="mt-2 text-xs text-ink-muted">Model confidence: {Math.round((recommendation.confidence || 0) * 100)}% (not a measure of health or risk).</p>
                </>
              ) : <p className="text-sm">{recommendation.message}</p>}
              <p className="mt-2 text-xs text-ink-muted">{recommendation.disclaimer}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lavender">
                {item.topic}
              </p>
              <CardTitle className="mt-2">{item.title}</CardTitle>
              <CardDescription>{item.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-ink-muted">
              <Clock className="h-4 w-4" aria-hidden="true" />
              About {item.minutes} minutes to read
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
