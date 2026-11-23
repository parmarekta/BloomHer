import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/layouts/AppLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AboutPage } from '@/pages/public/AboutPage'
import { LandingPage } from '@/pages/public/LandingPage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { MotherCheckInPage } from '@/pages/mother/MotherCheckInPage'
import { MotherDashboardPage } from '@/pages/mother/MotherDashboardPage'
import { MotherFollowUpPage } from '@/pages/mother/MotherFollowUpPage'
import { MotherHistoryPage } from '@/pages/mother/MotherHistoryPage'
import { MotherProfilePage } from '@/pages/mother/MotherProfilePage'
import { MotherResourcesPage } from '@/pages/mother/MotherResourcesPage'
import { AshaDashboardPage } from '@/pages/asha/AshaDashboardPage'
import { AshaFollowUpsPage } from '@/pages/asha/AshaFollowUpsPage'
import { AshaMotherDetailsPage } from '@/pages/asha/AshaMotherDetailsPage'
import { AshaMothersPage } from '@/pages/asha/AshaMothersPage'
import { AshaReferralsPage } from '@/pages/asha/AshaReferralsPage'
import { ProfessionalCaseDetailsPage } from '@/pages/professional/ProfessionalCaseDetailsPage'
import { ProfessionalCasesPage } from '@/pages/professional/ProfessionalCasesPage'
import { ProfessionalDashboardPage } from '@/pages/professional/ProfessionalDashboardPage'
import { MotherFeedbackPage, StaffFeedbackPage } from '@/pages/FeedbackPages'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute role="mother" />}>
            <Route element={<AppLayout role="mother" />}>
              <Route path="/mother" element={<MotherDashboardPage />} />
              <Route path="/mother/feedback" element={<MotherFeedbackPage />} />
              <Route path="/mother/profile" element={<MotherProfilePage />} />
              <Route path="/mother/check-in" element={<MotherCheckInPage />} />
              <Route path="/mother/history" element={<MotherHistoryPage />} />
              <Route path="/mother/resources" element={<MotherResourcesPage />} />
              <Route path="/mother/follow-up" element={<MotherFollowUpPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="asha" />}>
            <Route element={<AppLayout role="asha" />}>
              <Route path="/asha" element={<AshaDashboardPage />} />
              <Route path="/asha/mothers" element={<AshaMothersPage />} />
              <Route path="/asha/mothers/:motherId" element={<AshaMotherDetailsPage />} />
              <Route path="/asha/follow-ups" element={<AshaFollowUpsPage />} />
              <Route path="/asha/feedback" element={<StaffFeedbackPage />} />
              <Route path="/asha/referrals" element={<AshaReferralsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="professional" />}>
            <Route element={<AppLayout role="professional" />}>
              <Route path="/professional" element={<ProfessionalDashboardPage />} />
              <Route path="/professional/feedback" element={<StaffFeedbackPage />} />
              <Route path="/professional/cases" element={<ProfessionalCasesPage />} />
              <Route path="/professional/cases/:caseId" element={<ProfessionalCaseDetailsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
