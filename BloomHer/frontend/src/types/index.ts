export const USER_ROLES = {
  mother: 'mother',
  asha: 'asha',
  professional: 'professional',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export type SupportStatus =
  | 'check_in_recorded'
  | 'follow_up_planned'
  | 'community_support'
  | 'referred'
  | 'specialist_review'
  | 'support_complete'

export type PregnancyStage = 'pregnancy' | 'postpartum'

export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'

export interface DemoUser {
  id: string
  name: string
  email: string
  role: UserRole
  motherId?: number
  title?: string
  phone?: string
  location?: string

  // Identity / account verification
  phoneVerified?: boolean
  verificationStatus?: VerificationStatus

  // ASHA worker identification
  ashaWorkerId?: string

  // Healthcare professional details
  qualification?: string
  expertise?: string
  workplace?: string
  registrationNumber?: string
}

export interface MotherRecord {
  id: string
  name: string
  age: number

  stage: PregnancyStage
  stageLabel: string

  village: string
  phone: string

  // Assigned ASHA worker
  ashaId: string
  ashaName: string

  // Assigned healthcare professional, if referred
  professionalId?: string
  professionalName?: string

  lastCheckIn: string
  supportStatus: SupportStatus
  notes: string
}

export interface AshaWorkerRecord {
  id: string
  name: string

  ashaWorkerId: string

  phone: string
  email: string
  location: string

  verificationStatus: VerificationStatus

  assignedMotherIds: string[]
}

export interface HealthcareProfessionalRecord {
  id: string
  name: string

  qualification: string
  expertise: string

  phone: string
  email: string

  workplace: string
  location: string

  registrationNumber?: string

  verificationStatus: VerificationStatus

  assignedMotherIds: string[]
}

export interface CheckInRecord {
  id: string
  motherId: string
  date: string

  sleepNote: string
  moodNote: string
  supportNote: string

  sharedWithCareTeam: boolean
}

export interface FollowUpRecord {
  id: string
  motherId: string
  motherName: string

  scheduledFor: string
  owner: string

  reason: string

  status: 'upcoming' | 'completed' | 'rescheduled'
}

export interface ReferralRecord {
  id: string
  motherId: string
  motherName: string

  referredBy: string
  assignedTo: string

  createdOn: string
  reason: string

  status: 'open' | 'in_review' | 'family_contacted' | 'closed'
}

export interface ResourceItem {
  id: string
  title: string
  topic: string
  summary: string
  minutes: number
}