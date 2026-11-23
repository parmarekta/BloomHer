import { API_BASE_URL } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  HeartPulse,
  Lightbulb,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  demoUsers,
  followUps,
  referrals,
  resources,
  checkIns,
} from '@/data/mock'

type MotherProfile = {
  id: number
  name: string
  age: number
  phone: string
  village: string
  careStage: string
  gestationOrPostpartumWeek: number
}

export function MotherDashboardPage() {
  const { user: authUser } = useAuth()
  const [screeningCount, setScreeningCount] = useState(0)
  const [motherProfile, setMotherProfile] =
    useState<MotherProfile | null>(null)

  // ------------------------------------------------------------
  // GET MOTHER PROFILE FROM BACKEND
  // ------------------------------------------------------------

  useEffect(() => {
    async function fetchMotherProfile() {
      const motherId = authUser?.motherId

      if (!motherId) {
        console.error(
          'No mother ID found for the logged-in user.',
        )
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/mother/${motherId}/profile`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch mother profile.')
        }

        const data = await response.json()

        setMotherProfile({
          id: data.mother_id,
          name: data.name,
          age: data.age,
          phone: data.phone,
          village: data.village,
          careStage: data.care_stage,
          gestationOrPostpartumWeek:
            data.gestation_or_postpartum_week,
        })
      } catch (error) {
        console.error(
          'Failed to load mother profile:',
          error,
        )
      }
    }

    fetchMotherProfile()
  }, [authUser?.motherId])

  // ------------------------------------------------------------
  // GET SCREENING HISTORY
  // ------------------------------------------------------------

  useEffect(() => {
    async function fetchScreeningHistory() {
      const motherId = authUser?.motherId

      if (!motherId) {
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/screening/mother/${motherId}/history`,
        )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch screening history.',
          )
        }

        const data = await response.json()

        setScreeningCount(data.length)
      } catch (error) {
        console.error(
          'Failed to load screening history:',
          error,
        )
      }
    }

    fetchScreeningHistory()
  }, [authUser?.motherId])

  // ------------------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------------------

  if (!motherProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink-muted">
          Loading your profile...
        </p>
      </div>
    )
  }

  // ------------------------------------------------------------
  // DISPLAY VALUES
  // ------------------------------------------------------------

  const stageLabel =
    motherProfile.careStage === 'postpartum'
      ? `${motherProfile.gestationOrPostpartumWeek} weeks after birth`
      : motherProfile.careStage === 'pregnancy'
        ? `${motherProfile.gestationOrPostpartumWeek} weeks pregnant`
        : motherProfile.careStage

  /*
   * The backend currently stores the actual mother profile.
   * Follow-ups/referrals/check-ins are still demo/mock data,
   * so only use those when they belong to the demo mother.
   */
  const isDemoMother = motherProfile.id === 1

  const mockMotherId = 'mother-1'

  const nextFollowUp = isDemoMother
    ? followUps.find(
        (item) =>
          item.motherId === mockMotherId &&
          item.status === 'upcoming',
      )
    : undefined

  const motherReferral = isDemoMother
    ? referrals.find(
        (item) => item.motherId === mockMotherId,
      )
    : undefined

  const motherCheckIns = isDemoMother
    ? checkIns.filter(
        (item) => item.motherId === mockMotherId,
      )
    : []

  const asha = demoUsers.asha
  const professional = demoUsers.professional

  return (
    <div className="space-y-6">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageHeader
        eyebrow="Mother dashboard"
        title={`Welcome back, ${motherProfile.name.split(' ')[0]}`}
        description="A private space to check in, understand your support plan, and stay connected with the people supporting you."
        actions={
          <Link to="/mother/check-in">
            <Button>
              Start a check-in
            </Button>
          </Link>
        }
      />

      {/* ======================================================
          PERSONAL OVERVIEW
      ====================================================== */}

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lavender-mist text-lavender">
                <UserRound
                  className="h-7 w-7"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm text-ink-muted">
                  Your wellbeing profile
                </p>

                <h2 className="mt-1 font-display text-2xl text-ink">
                  {motherProfile.name}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                  <span>
                    {motherProfile.age} years
                  </span>

                  <span>•</span>

                  <span>{stageLabel}</span>

                  <span>•</span>

                  <span className="inline-flex items-center gap-1">
                    <MapPin
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    {motherProfile.village}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status="check_in_recorded" />

              <div className="flex items-center gap-2 rounded-full bg-canvas px-4 py-2 text-sm text-ink-muted">
                <Activity
                  className="h-4 w-4 text-lavender"
                  aria-hidden="true"
                />
                Screening history: {screeningCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          QUICK STATS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-lavender-mist p-2.5 text-lavender">
                <HeartPulse
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-muted">
              Last check-in
            </p>

            <p className="mt-1 font-display text-xl">
              {motherCheckIns.length > 0
                ? motherCheckIns[0].date
                : 'No check-ins yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-sage-mist p-2.5 text-sage">
                <CalendarDays
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-muted">
              Next follow-up
            </p>

            <p className="mt-1 font-display text-xl">
              {nextFollowUp
                ? nextFollowUp.scheduledFor
                : 'None scheduled'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-lavender-mist p-2.5 text-lavender">
                <ClipboardIcon />
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-muted">
              Check-ins recorded
            </p>

            <p className="mt-1 font-display text-xl">
              {screeningCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-sage-mist p-2.5 text-sage">
                <BookOpen
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-muted">
              Resources available
            </p>

            <p className="mt-1 font-display text-xl">
              {resources.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          SUPPORT TEAM
      ====================================================== */}

      <div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender">
            Your support team
          </p>

          <h2 className="mt-1 font-display text-3xl">
            People supporting you
          </h2>

          <p className="mt-1 text-sm text-ink-muted">
            You can contact your support team directly when
            you need help.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* ASHA worker */}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-mist text-sage">
                    <HeartHandshake
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <CardTitle className="text-xl">
                      Your ASHA worker
                    </CardTitle>

                    <CardDescription>
                      Community support
                    </CardDescription>
                  </div>
                </div>

                <StatusBadge status="community_support" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-ink">
                  {asha.name}
                </p>

                <p className="text-sm text-ink-muted">
                  {asha.title}
                </p>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                  <MapPin
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  {asha.location}
                </p>
              </div>

              <div className="rounded-2xl bg-canvas p-4">
                <p className="text-sm leading-relaxed text-ink-muted">
                  Your ASHA worker can support you with
                  follow-ups, wellbeing conversations, and
                  connecting you with further care when needed.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <a href={`tel:${asha.phone}`}>
                  <Button
                    variant="secondary"
                    className="w-full"
                  >
                    <Phone
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                    Call ASHA
                  </Button>
                </a>

                <a href={`sms:${asha.phone}`}>
                  <Button
                    variant="secondary"
                    className="w-full"
                  >
                    <MessageCircle
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                    Message
                  </Button>
                </a>
              </div>

              <Link to="/mother/follow-up">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                >
                  View follow-up details
                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Healthcare professional */}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-mist text-lavender">
                    <Stethoscope
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <CardTitle className="text-xl">
                      Healthcare professional
                    </CardTitle>

                    <CardDescription>
                      {motherReferral
                        ? 'Referral currently in progress'
                        : 'No referral currently assigned'}
                    </CardDescription>
                  </div>
                </div>

                {motherReferral && (
                  <StatusBadge
                    status={motherReferral.status}
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              {motherReferral ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-ink">
                      {professional.name}
                    </p>

                    <p className="text-sm text-ink-muted">
                      {professional.title}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-ink-muted">
                      <p>
                        <span className="font-medium text-ink">
                          Qualification:
                        </span>{' '}
                        MBBS, MD Obstetrics & Gynaecology
                      </p>

                      <p>
                        <span className="font-medium text-ink">
                          Expertise:
                        </span>{' '}
                        Maternal wellbeing, pregnancy and
                        postpartum care
                      </p>

                      <p>
                        <span className="font-medium text-ink">
                          Location:
                        </span>{' '}
                        {professional.location}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-lavender-mist/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-lavender">
                      Why you were referred
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {motherReferral.reason}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <a href={`tel:${professional.phone}`}>
                      <Button
                        variant="secondary"
                        className="w-full"
                      >
                        <Phone
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Call
                      </Button>
                    </a>

                    <a href={`sms:${professional.phone}`}>
                      <Button
                        variant="secondary"
                        className="w-full"
                      >
                        <MessageCircle
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Message
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-canvas p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 text-sage"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="font-medium">
                        No healthcare referral currently
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        Your current support plan is being
                        managed through community care. If
                        you would like to speak with a
                        healthcare professional, you can
                        discuss this with your ASHA worker.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ======================================================
          FOLLOW-UP
      ====================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays
                  className="h-5 w-5 text-lavender"
                  aria-hidden="true"
                />
                Your next follow-up
              </CardTitle>

              <CardDescription>
                Keep track of the next conversation or visit.
              </CardDescription>
            </div>

            {nextFollowUp && (
              <Clock3
                className="h-5 w-5 text-ink-muted"
                aria-hidden="true"
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          {nextFollowUp ? (
            <div className="flex flex-col gap-4 rounded-2xl bg-canvas p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">
                  {nextFollowUp.scheduledFor}
                </p>

                <p className="mt-1 text-sm text-ink-muted">
                  With {nextFollowUp.owner}
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                  {nextFollowUp.reason}
                </p>
              </div>

              <Link to="/mother/follow-up">
                <Button variant="secondary">
                  View details
                  <ArrowRight
                    className="ml-2 h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              You don't currently have a follow-up scheduled.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ======================================================
          CHECK-IN HISTORY
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity
              className="h-5 w-5 text-lavender"
              aria-hidden="true"
            />
            Your wellbeing history
          </CardTitle>

          <CardDescription>
            A record of the check-ins you have shared with
            BloomHer.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {motherCheckIns.length > 0 ? (
            <div className="space-y-3">
              {motherCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="rounded-2xl border border-line bg-white p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">
                        {checkIn.date}
                      </p>

                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {checkIn.moodNote}
                      </p>
                    </div>

                    {checkIn.sharedWithCareTeam && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sage">
                        <ShieldCheck
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Shared with care team
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-ink-muted md:grid-cols-2">
                    <p>
                      <span className="font-medium text-ink">
                        Sleep:
                      </span>{' '}
                      {checkIn.sleepNote}
                    </p>

                    <p>
                      <span className="font-medium text-ink">
                        Support:
                      </span>{' '}
                      {checkIn.supportNote}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-canvas p-5">
              <p className="font-medium">
                No check-ins yet
              </p>

              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                Your completed mental-health screenings
                will appear in your wellbeing history.
              </p>
            </div>
          )}

          <Link to="/mother/check-in">
            <Button className="mt-4">
              Add a new check-in
              <ArrowRight
                className="ml-2 h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* ======================================================
          SUGGESTIONS
      ====================================================== */}

      <Card className="border-0 bg-lavender-mist/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb
              className="h-5 w-5 text-lavender"
              aria-hidden="true"
            />
            Gentle ideas for you
          </CardTitle>

          <CardDescription>
            Simple wellbeing ideas based on the information
            you have shared.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4">
              <Sparkles
                className="h-5 w-5 text-lavender"
                aria-hidden="true"
              />

              <h3 className="mt-3 font-medium">
                Make space for rest
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                If possible, ask someone you trust to share
                baby-care responsibilities so you can get a
                little uninterrupted rest.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-4">
              <HeartHandshake
                className="h-5 w-5 text-sage"
                aria-hidden="true"
              />

              <h3 className="mt-3 font-medium">
                Stay connected
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                Talking openly with a partner, family member,
                friend, or ASHA worker can make difficult days
                feel less isolating.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-4">
              <BookOpen
                className="h-5 w-5 text-lavender"
                aria-hidden="true"
              />

              <h3 className="mt-3 font-medium">
                Explore your resources
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                Browse BloomHer's wellbeing resources for
                practical ideas around rest, recovery, support,
                and asking for help.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          SAFETY
      ====================================================== */}

      <SafetyNotice />
    </div>
  )
}

function ClipboardIcon() {
  return (
    <div className="flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect
          width="8"
          height="4"
          x="8"
          y="2"
          rx="1"
        />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M9 14h6" />
        <path d="M9 18h6" />
      </svg>
    </div>
  )
}
