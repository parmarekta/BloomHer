import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { referrals } from '@/data/mock'

const labels = {
  open: 'Open',
  in_review: 'In review',
  family_contacted: 'Family contacted',
  closed: 'Closed',
} as const

export function AshaReferralsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Referrals"
        title="Conversations you have invited a clinician into"
        description="A referral is a request for a professional conversation. It is not a statement that a mother has a mental-health condition."
      />
      <div className="grid gap-3">
        {referrals.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{item.motherName}</CardTitle>
                <CardDescription>
                  To {item.assignedTo} · {item.createdOn}
                </CardDescription>
              </div>
              <Badge>{labels[item.status]}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-ink-muted">{item.reason}</p>
              <Link to={`/asha/mothers/${item.motherId}`} className="text-sm text-lavender hover:underline">
                Mother details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <SafetyNotice compact />
      </div>
    </div>
  )
}
