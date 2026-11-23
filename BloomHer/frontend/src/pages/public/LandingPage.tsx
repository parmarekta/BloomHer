import { Link } from 'react-router-dom'
import {
  BookOpen,
  ClipboardCheck,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const pillars = [
  {
    icon: ClipboardCheck,
    title: 'Screening',
    text: 'Gentle wellbeing check-ins that help mothers share how they are feeling over time.',
  },
  {
    icon: HeartHandshake,
    title: 'Monitoring',
    text: 'A shared view for mothers, ASHA workers, and clinicians so support does not fall through the cracks.',
  },
  {
    icon: BookOpen,
    title: 'Education',
    text: 'Clear, mother-friendly resources about rest, recovery, and asking for help.',
  },
  {
    icon: Stethoscope,
    title: 'Referral support',
    text: 'When a family wants a clinician conversation, BloomHer helps coordinate the next step.',
  },
]

const audiences = [
  {
    title: 'Mothers',
    text: 'Check in on your wellbeing, review past conversations, and see follow-up or referral status.',
  },
  {
    title: 'ASHA workers',
    text: 'See the mothers you support, plan home visits, and send referrals when a family asks for more help.',
  },
  {
    title: 'Healthcare professionals',
    text: 'Review referred conversations with context — never as a substitute for clinical judgement.',
  },
]

export function LandingPage() {
  return (
    <div>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/bloomher-hero.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/10" />


        {/* Soft gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-2xl text-white">

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              BloomHer
            </p>

            <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Supporting mothers
              <span className="block text-white/90">
                through every stage.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              BloomHer is an AI-assisted platform for maternal wellbeing,
              screening, monitoring, and early support during pregnancy and
              after childbirth. It helps mothers and care teams stay connected
              without replacing human care.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-ink hover:bg-white/90"
                >
                  Get started
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  Sign in
                </Button>
              </Link>
            </div>

            <p className="mt-5 max-w-lg text-xs leading-relaxed text-white/70">
              Screening support, continuous monitoring, and human follow-up —
              never a replacement for professional care.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="font-display text-3xl text-ink">What BloomHer provides</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Four connected supports for pregnancy and the months after birth.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((item) => (
            <Card key={item.title} className="p-5">
              <item.icon className="h-5 w-5 text-lavender" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {audiences.map((item) => (
            <Card key={item.title} className="p-6">
              <Users className="h-5 w-5 text-sage" aria-hidden="true" />
              <h3 className="mt-4 font-display text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Card className="flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 text-sage" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl">Built to support people, not to replace them</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                BloomHer can help organise check-ins and referrals. Clinical decisions stay with
                trained professionals and community health workers.
              </p>
            </div>
          </div>
          <Link to="/login">
            <Button>Try a role</Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}
