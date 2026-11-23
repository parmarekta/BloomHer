import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mothers, referrals } from '@/data/mock'

const labels = {
  open: 'Open',
  in_review: 'In review',
  family_contacted: 'Family contacted',
  closed: 'Closed',
} as const

export function ProfessionalCaseDetailsPage() {
  const { caseId } = useParams()
  const referral = referrals.find((item) => item.id === caseId)
  const mother = mothers.find((item) => item.id === referral?.motherId)

  if (!referral || !mother) {
    return (
      <div>
        <PageHeader title="Case not found" description="This demo referral is not in the current list." />
        <Link to="/professional/cases">
          <Button variant="secondary">Back to referred cases</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Case details"
        title={referral.motherName}
        description={`${mother.stageLabel} · ${mother.village}`}
        actions={<Badge>{labels[referral.status]}</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral context</CardTitle>
            <CardDescription>
              Shared so you can prepare a conversation. This is not a diagnostic summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-ink-muted">
            <p>{referral.reason}</p>
            <p>Referred by {referral.referredBy} on {referral.createdOn}.</p>
            <p>Assigned to {referral.assignedTo}.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mother snapshot</CardTitle>
            <CardDescription>Demo details only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Phone: {mother.phone}</p>
            <p>ASHA: {mother.ashaName}</p>
            <p>Last check-in: {mother.lastCheckIn}</p>
            <p className="text-ink-muted">{mother.notes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <SafetyNotice />
      </div>
    </div>
  )
}
