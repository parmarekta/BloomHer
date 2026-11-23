import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const steps = [
  {
    title: '1. A mother checks in',
    text: 'She shares how she is sleeping, how she is feeling, and whether she wants extra support. BloomHer records the conversation. It does not score or diagnose.',
  },
  {
    title: '2. An ASHA worker follows up',
    text: 'Community health workers see which mothers asked for a visit, share resources, and keep family conversations going.',
  },
  {
    title: '3. A clinician is invited when needed',
    text: 'If a family wants a healthcare professional involved, a referral is created so the next conversation is expected — not a surprise.',
  },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="How BloomHer works"
        title="Screening, monitoring, education, and referral — in one calm workflow."
        description="BloomHer is designed for pregnancy and the months after childbirth. It helps mothers and care teams notice support needs early, without claiming to identify a medical condition."
      />

      <div className="grid gap-4">
        {steps.map((step) => (
          <Card key={step.title} className="p-6">
            <h2 className="font-display text-2xl">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Who uses BloomHer</CardTitle>
          <CardDescription>
            There is no admin dashboard in this MVP. The product is built around three roles only.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {['Mother', 'ASHA worker', 'Healthcare professional'].map((role) => (
            <div key={role} className="rounded-2xl bg-canvas px-4 py-5 text-sm font-medium">
              {role}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-8">
        <SafetyNotice />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/register">
          <Button>Register for the demo</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </div>
    </div>
  )
}
