import type {
  AshaWorkerRecord,
  CheckInRecord,
  DemoUser,
  FollowUpRecord,
  HealthcareProfessionalRecord,
  MotherRecord,
  ReferralRecord,
  ResourceItem,
} from '@/types'

export const demoUsers: Record<DemoUser['role'], DemoUser> = {
  mother: {
    id: 'user-mother',
    name: 'Ananya Sharma',
    email: 'ananya@demo.bloomher',
    role: 'mother',
    phone: '+91 98xxx xx241',
    location: 'Ward 4, Sitapur',
    verificationStatus: 'verified',
  },

  asha: {
    id: 'user-asha',
    name: 'Sunita Devi',
    email: 'sunita@demo.bloomher',
    role: 'asha',
    title: 'ASHA worker',
    phone: '+91 97xxx xx118',
    location: 'PHC Sitapur',
    verificationStatus: 'verified',
    ashaWorkerId: 'ASHA-SIT-1042',
  },

  professional: {
    id: 'user-professional',
    name: 'Dr. Nandini Rao',
    email: 'nandini.rao@demo.bloomher',
    role: 'professional',
    title: 'Obstetrician & Maternal Health Specialist',
    phone: '+91 80xxx xx902',
    location: 'District Hospital, Sitapur',
    verificationStatus: 'verified',
    qualification: 'MBBS, MD (Obstetrics & Gynaecology)',
    expertise: 'Maternal mental health, pregnancy care, postpartum wellbeing',
    workplace: 'District Hospital, Sitapur',
    registrationNumber: 'MED-SIT-78421',
  },
}

export const ashaWorkers: AshaWorkerRecord[] = [
  {
    id: 'user-asha',
    name: 'Sunita Devi',
    ashaWorkerId: 'ASHA-SIT-1042',
    phone: '+91 97xxx xx118',
    email: 'sunita@demo.bloomher',
    location: 'PHC Sitapur',
    verificationStatus: 'verified',
    assignedMotherIds: [
      'mother-1',
      'mother-2',
      'mother-3',
      'mother-4',
    ],
  },
]

export const healthcareProfessionals: HealthcareProfessionalRecord[] = [
  {
    id: 'user-professional',
    name: 'Dr. Nandini Rao',
    qualification: 'MBBS, MD (Obstetrics & Gynaecology)',
    expertise:
      'Maternal mental health, pregnancy care, postpartum wellbeing',
    phone: '+91 80xxx xx902',
    email: 'nandini.rao@demo.bloomher',
    workplace: 'District Hospital, Sitapur',
    location: 'Sitapur',
    registrationNumber: 'MED-SIT-78421',
    verificationStatus: 'verified',
    assignedMotherIds: ['mother-1', 'mother-3'],
  },
]

export const mothers: MotherRecord[] = [
  {
    id: 'mother-1',
    name: 'Ananya Sharma',
    age: 26,
    stage: 'postpartum',
    stageLabel: '8 weeks after birth',
    village: 'Ward 4, Sitapur',
    phone: '+91 98xxx xx241',

    ashaId: 'user-asha',
    ashaName: 'Sunita Devi',

    professionalId: 'user-professional',
    professionalName: 'Dr. Nandini Rao',

    lastCheckIn: '18 Aug 2026',
    supportStatus: 'follow_up_planned',

    notes:
      'Asked for help with sleep and feeling overwhelmed in the evenings. No clinical conclusion is recorded.',
  },

  {
    id: 'mother-2',
    name: 'Kavita Yadav',
    age: 31,
    stage: 'pregnancy',
    stageLabel: '28 weeks pregnant',
    village: 'Ward 2, Sitapur',
    phone: '+91 99xxx xx774',

    ashaId: 'user-asha',
    ashaName: 'Sunita Devi',

    lastCheckIn: '16 Aug 2026',
    supportStatus: 'community_support',

    notes:
      'Requested more information about rest, nutrition, and talking with family.',
  },

  {
    id: 'mother-3',
    name: 'Meera Joshi',
    age: 22,
    stage: 'postpartum',
    stageLabel: '3 weeks after birth',
    village: 'Ward 1, Sitapur',
    phone: '+91 90xxx xx553',

    ashaId: 'user-asha',
    ashaName: 'Sunita Devi',

    professionalId: 'user-professional',
    professionalName: 'Dr. Nandini Rao',

    lastCheckIn: '19 Aug 2026',
    supportStatus: 'referred',

    notes:
      'Family asked for a clinician conversation after several difficult nights. BloomHer has not made a diagnosis.',
  },

  {
    id: 'mother-4',
    name: 'Priya Nair',
    age: 29,
    stage: 'pregnancy',
    stageLabel: '14 weeks pregnant',
    village: 'Ward 5, Sitapur',
    phone: '+91 96xxx xx310',

    ashaId: 'user-asha',
    ashaName: 'Sunita Devi',

    lastCheckIn: '12 Aug 2026',
    supportStatus: 'check_in_recorded',

    notes:
      'Completed her first wellbeing check-in and asked for local support group details.',
  },
]

export const checkIns: CheckInRecord[] = [
  {
    id: 'check-1',
    motherId: 'mother-1',
    date: '18 Aug 2026',
    sleepNote: 'Sleeping in short stretches; waking often to feed.',
    moodNote: 'Described feeling tired and tearful in the evenings.',
    supportNote: 'Would like an ASHA visit this week.',
    sharedWithCareTeam: true,
  },

  {
    id: 'check-2',
    motherId: 'mother-1',
    date: '11 Aug 2026',
    sleepNote: 'Resting better during the day when family helps.',
    moodNote: 'Felt more settled after talking with her sister.',
    supportNote: 'Asked for gentle movement ideas.',
    sharedWithCareTeam: false,
  },

  {
    id: 'check-3',
    motherId: 'mother-1',
    date: '4 Aug 2026',
    sleepNote: 'Hard to fall asleep after night feeds.',
    moodNote: 'Worried about doing enough for the baby.',
    supportNote: 'Requested reassurance, not urgent care.',
    sharedWithCareTeam: true,
  },
]

export const followUps: FollowUpRecord[] = [
  {
    id: 'fu-1',
    motherId: 'mother-1',
    motherName: 'Ananya Sharma',
    scheduledFor: '21 Aug 2026, 10:30',
    owner: 'Sunita Devi',
    reason:
      'Home visit to talk about rest, feeding support, and family help.',
    status: 'upcoming',
  },

  {
    id: 'fu-2',
    motherId: 'mother-2',
    motherName: 'Kavita Yadav',
    scheduledFor: '22 Aug 2026, 16:00',
    owner: 'Sunita Devi',
    reason:
      'Share antenatal wellbeing resources and check whether she wants a clinic conversation.',
    status: 'upcoming',
  },

  {
    id: 'fu-3',
    motherId: 'mother-4',
    motherName: 'Priya Nair',
    scheduledFor: '14 Aug 2026, 11:00',
    owner: 'Sunita Devi',
    reason: 'Welcome visit after first check-in.',
    status: 'completed',
  },
]

export const referrals: ReferralRecord[] = [
  {
    id: 'referral-ananya',
    motherId: 'ananya-sharma-id',
    motherName: 'Ananya Sharma',
    referredBy: 'Sunita Devi',
    assignedTo: 'Dr. Nandini Rao',
    createdOn: '10 Aug 2026',
    reason:
      'Optional clinician check-in for sleep and overwhelm. Mother agreed to be contacted.',
    status: 'family_contacted',
  },
]

export const resources: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Finding rest in the fourth trimester',
    topic: 'Sleep and recovery',
    summary:
      'Practical ways families can share night-time care without treating tiredness as an illness.',
    minutes: 6,
  },

  {
    id: 'res-2',
    title: 'Talking with your ASHA worker',
    topic: 'Community support',
    summary:
      'What a wellbeing conversation can include, and how to ask for a follow-up visit.',
    minutes: 4,
  },

  {
    id: 'res-3',
    title: 'When to speak with a clinician',
    topic: 'Care pathways',
    summary:
      'Signs that extra support from a doctor or counsellor may be helpful — without naming a diagnosis.',
    minutes: 5,
  },

  {
    id: 'res-4',
    title: 'Feeding, mood, and asking for help',
    topic: 'Postpartum',
    summary:
      'Gentle guidance for mothers who feel stretched, including how partners and family can help.',
    minutes: 7,
  },
]

export const roleHomePath: Record<DemoUser['role'], string> = {
  mother: '/mother',
  asha: '/asha',
  professional: '/professional',
}