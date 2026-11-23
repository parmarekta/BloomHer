import { Badge } from '@/components/ui/badge'
import type { SupportStatus } from '@/types'

type ReferralStatus = 'open' | 'in_review' | 'family_contacted' | 'closed'

type BadgeStatus = SupportStatus | ReferralStatus

const labels: Record<
  BadgeStatus,
  { text: string; tone: 'lavender' | 'blush' | 'sage' | 'neutral' }
> = {
  // Mother support statuses
  check_in_recorded: {
    text: 'Check-in recorded',
    tone: 'lavender',
  },
  follow_up_planned: {
    text: 'Follow-up planned',
    tone: 'blush',
  },
  community_support: {
    text: 'Community support',
    tone: 'sage',
  },
  referred: {
    text: 'Referred for conversation',
    tone: 'blush',
  },
  specialist_review: {
    text: 'Clinician reviewing',
    tone: 'lavender',
  },
  support_complete: {
    text: 'Support complete',
    tone: 'neutral',
  },

  // Referral statuses
  open: {
    text: 'Referral open',
    tone: 'blush',
  },
  in_review: {
    text: 'Under review',
    tone: 'lavender',
  },
  family_contacted: {
    text: 'Family contacted',
    tone: 'sage',
  },
  closed: {
    text: 'Referral closed',
    tone: 'neutral',
  },
}

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const item = labels[status]

  return <Badge tone={item.tone}>{item.text}</Badge>
}