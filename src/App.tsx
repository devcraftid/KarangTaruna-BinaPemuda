import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

import LandingPage from '@/pages/public/LandingPage'
import RegistrationPage from '@/pages/public/RegistrationPage'
import PublicGalleryPage from '@/pages/public/PublicGalleryPage'
import LoginPage from '@/features/auth/LoginPage'
import AuthLayout from '@/features/auth/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import OverviewPage from '@/pages/dashboard/OverviewPage'

import FinancePage from '@/pages/dashboard/FinancePage'
import SponsorsPage from '@/pages/dashboard/SponsorsPage'
import CompetitionsPage from '@/pages/dashboard/CompetitionsPage'
import AnnouncementsPage from '@/pages/dashboard/AnnouncementsPage'
import GalleryPage from '@/pages/dashboard/GalleryPage'
import AuditLogsPage from '@/pages/dashboard/AuditLogsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/gallery" element={<PublicGalleryPage />} />
            
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="sponsors" element={<SponsorsPage />} />
              <Route path="competitions" element={<CompetitionsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
