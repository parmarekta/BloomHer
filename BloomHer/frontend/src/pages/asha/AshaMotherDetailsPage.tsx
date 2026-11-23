import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { checkIns, followUps, mothers, referrals } from '@/data/mock'

export function AshaMotherDetailsPage() {
  const { motherId } = useParams()
  const mother = mothers.find((item) => item.id === motherId)

  if (!mother) {
    return (
      <div>
        <PageHeader title="Mother not found" description="This demo record is not in the caseload." />
        <Link to="/asha/mothers">
          <Button variant="secondary">Back to my mothers</Button>
        </Link>
      </div>
    )
  }

  const history = checkIns.filter((item) => item.motherId === mother.id)
  const visits = followUps.filter((item) => item.motherId === mother.id)
  const caseReferrals = referrals.filter((item) => item.motherId === mother.id)

  return (
    <div>
      <PageHeader
        eyebrow="Mother details"
        title={mother.name}
        description={`${mother.stageLabel} · ${mother.village}`}
        actions={<StatusBadge status={mother.supportStatus} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Demo contact details for field follow-up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Phone: {mother.phone}</p>
            <p>Age: {mother.age}</p>
            <p>ASHA: {mother.ashaName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What she asked for</CardTitle>
            <CardDescription>Written in support language, not diagnostic language.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-ink-muted">{mother.notes}</CardContent>
        </Card>
      </div>

      <h2 className="mt-8 font-display text-2xl">Recent check-ins</h2>
      <div className="mt-3 grid gap-3">
        {history.length ? (
          history.map((item) => (
            <Card key={item.id} className="p-5 text-sm leading-relaxed text-ink-muted">
              <p className="font-medium text-ink">{item.date}</p>
              <p className="mt-2">{item.moodNote}</p>
              <p>{item.supportNote}</p>
            </Card>
          ))
        ) : (
          <Card className="p-5 text-sm leading-relaxed text-ink-muted">
            No detailed check-in notes are stored for this demo record yet. Field note:{' '}
            {mother.notes}
          </Card>
        )}
      </div>

      <h2 className="mt-8 font-display text-2xl">Follow-ups and referrals</h2>
      <div className="mt-3 grid gap-3">
        {visits.map((item) => (
          <Card key={item.id} className="p-5 text-sm">
            <p className="font-medium">{item.scheduledFor}</p>
            <p className="mt-1 text-ink-muted">{item.reason}</p>
          </Card>
        ))}
        {caseReferrals.map((item) => (
          <Card key={item.id} className="p-5 text-sm">
            <p className="font-medium">Referral to {item.assignedTo}</p>
            <p className="mt-1 text-ink-muted">{item.reason}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <SafetyNotice compact />
      </div>
    </div>
  )
}
