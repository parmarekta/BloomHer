import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { referrals } from '@/data/mock'

const labels = {
  open: 'Open',
  in_review: 'In review',
  family_contacted: 'Family contacted',
  closed: 'Closed',
} as const

export function ProfessionalCasesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Referred cases"
        title="Families awaiting a professional conversation"
        description="Each case is a request for your time and judgement. The platform has not classified a condition."
      />
      <div className="grid gap-3">
        {referrals.map((item) => (
          <Link key={item.id} to={`/professional/cases/${item.id}`}>
            <Card className="transition hover:border-lavender/40">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{item.motherName}</CardTitle>
                  <CardDescription>
                    {item.createdOn} · from {item.referredBy}
                  </CardDescription>
                </div>
                <Badge>{labels[item.status]}</Badge>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-ink-muted">{item.reason}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
