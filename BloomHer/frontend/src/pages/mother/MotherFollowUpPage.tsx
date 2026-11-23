import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { followUps, referrals } from '@/data/mock'

const followUpTone = {
  upcoming: 'blush',
  completed: 'sage',
  rescheduled: 'neutral',
} as const

const referralLabel = {
  open: 'Open',
  in_review: 'Clinician reviewing',
  family_contacted: 'Family contacted',
  closed: 'Closed',
} as const

export function MotherFollowUpPage() {
  const mine = followUps.filter((item) => item.motherId === 'mother-1')
  const myReferrals = referrals.filter((item) => item.motherId === 'mother-1')

  return (
    <div>
      <PageHeader
        eyebrow="Follow-up and referral"
        title="What happens next"
        description="Follow-ups are planned conversations. Referrals invite a healthcare professional into that conversation. Neither one is a diagnosis."
      />

      <div className="grid gap-4">
        {mine.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{item.scheduledFor}</CardTitle>
                <CardDescription>With {item.owner}</CardDescription>
              </div>
              <Badge tone={followUpTone[item.status]}>{item.status}</Badge>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-ink-muted">{item.reason}</CardContent>
          </Card>
        ))}

        {myReferrals.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Referral to {item.assignedTo}</CardTitle>
                <CardDescription>Opened {item.createdOn} by {item.referredBy}</CardDescription>
              </div>
              <Badge tone="lavender">{referralLabel[item.status]}</Badge>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-ink-muted">{item.reason}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <SafetyNotice />
      </div>
    </div>
  )
}
