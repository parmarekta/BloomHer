import { useEffect, useState, type FormEvent } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { API_BASE_URL, feedbackHeaders } from '@/lib/api'

type Feedback = { id: number; mother_name: string; rating: number; message: string; created_at: string }

function FeedbackList({ items }: { items: Feedback[] }) {
  return <div className="grid gap-4">{items.length === 0 ? <p className="text-ink-muted">No feedback submitted yet.</p> : items.map(item =>
    <Card key={item.id}><CardContent className="pt-5">
      <div className="flex flex-wrap justify-between gap-2"><strong>{item.mother_name}</strong><span aria-label={`${item.rating} out of 5 stars`}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span></div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm">{item.message}</p>
      <p className="mt-2 text-xs text-ink-muted">{new Date(item.created_at).toLocaleString()}</p>
    </CardContent></Card>)}
  </div>
}

function useFeedback() {
  const [items, setItems] = useState<Feedback[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, { headers: feedbackHeaders() })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || 'Unable to load feedback.')
      setItems(body)
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load feedback.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [])
  return { items, error, loading, refresh }
}

export function MotherFeedbackPage() {
  const { items, error, loading, refresh } = useFeedback()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true); setNotice('')
    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, { method: 'POST', headers: { ...feedbackHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ rating, message: message.trim() }) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || 'Unable to submit feedback.')
      setMessage(''); setRating(5); setNotice('Feedback submitted successfully.'); await refresh()
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Submission failed.') }
    finally { setSubmitting(false) }
  }
  return <div className="grid gap-6">
    <PageHeader eyebrow="Your voice" title="Share feedback" description="Your feedback is visible to ASHA workers and healthcare professionals in this demo. Please do not enter private medical details." />
    <Card><CardHeader><CardTitle>New feedback</CardTitle></CardHeader><CardContent>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-3" role="group" aria-label="Rate your experience with BloomHer">
          <div>
            <p className="text-base font-semibold">How was your experience with BloomHer?</p>
            <p className="mt-1 text-sm text-ink-muted">Tap on a star to give your rating.</p>
          </div>
          <div className="flex justify-center gap-1" onMouseLeave={() => setHoverRating(null)}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onFocus={() => setHoverRating(n)}
                onBlur={() => setHoverRating(null)}
                className={`rounded-md px-1 text-3xl transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${(hoverRating ?? rating) >= n ? 'text-amber-500' : 'text-gray-300'}`}
              >★</button>
            ))}
          </div>
          <div className="text-center" aria-live="polite">
            <div className="text-3xl" aria-hidden="true">{['😞', '😕', '😐', '😊', '🤩'][(hoverRating ?? rating) - 1]}</div>
            <p className="mt-2 font-semibold">{['Very poor', 'Poor', 'Average', 'Good', 'Excellent'][(hoverRating ?? rating) - 1]}</p>
          </div>
        </div>
        <label className="grid gap-2 text-sm font-medium">Your feedback
          <Textarea value={message} onChange={event => setMessage(event.target.value)} minLength={3} maxLength={1000} required placeholder="Tell us about your experience with BloomHer..." />
        </label>
        <Button type="submit" disabled={submitting || message.trim().length < 3}>{submitting ? 'Submitting…' : 'Submit feedback'}</Button>
        {notice && <p role="status" className="text-sm">{notice}</p>}
      </form>
    </CardContent></Card>
    <h2 className="text-xl font-semibold">My feedback</h2>
    {loading ? <p>Loading feedback…</p> : error ? <p role="alert">{error}</p> : <FeedbackList items={items} />}
  </div>
}

export function StaffFeedbackPage() {
  const { items, error, loading, refresh } = useFeedback()
  return <div className="grid gap-5">
    <PageHeader eyebrow="Community feedback" title="Mother feedback" description="Feedback shared by mothers using BloomHer. This is a demonstration inbox, visible to all ASHA and professional accounts." />
    <div><Button variant="secondary" onClick={() => void refresh()} disabled={loading}>Refresh feedback</Button></div>
    {loading ? <p>Loading feedback…</p> : error ? <p role="alert">{error}</p> : <FeedbackList items={items} />}
  </div>
}
