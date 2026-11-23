import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { followUps } from '@/data/mock'

const tone = {
  upcoming: 'blush',
  completed: 'sage',
  rescheduled: 'neutral',
} as const

export function AshaFollowUpsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Follow-ups"
        title="Home visits and check-ins you own"
        description="Plan conversations and keep families informed. Completing a visit does not mean a condition was ruled in or out."
      />
      <div className="grid gap-3">
        {followUps.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{item.motherName}</CardTitle>
                <CardDescription>{item.scheduledFor}</CardDescription>
              </div>
              <Badge tone={tone[item.status]}>{item.status}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-ink-muted">{item.reason}</p>
              <Link to={`/asha/mothers/${item.motherId}`} className="text-sm text-lavender hover:underline">
                Open details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
