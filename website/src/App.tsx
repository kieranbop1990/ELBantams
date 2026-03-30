import { useEffect, useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, Center, Loader, MantineProvider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { loadAllData } from './data';
import type { AppData } from './types';
import { createClubTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { SiteHeader } from './components/SiteHeader';
import { SiteSidebar } from './components/SiteSidebar';
import { SectionProvider } from './context/SectionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TeamsPage } from './pages/TeamsPage';
import { RegisterPage } from './pages/RegisterPage';
import { CommitteePage } from './pages/CommitteePage';
import { NewsPage } from './pages/NewsPage';
import { GalleryPage } from './pages/GalleryPage';
import { MatchdayPage } from './pages/MatchdayPage';
import { ContactPage } from './pages/ContactPage';
import { FixturesResultsPage } from './pages/FixturesResultsPage';
import { TeamPage } from './pages/TeamPage';
import { CustomizePage } from './pages/CustomizePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { PitchBookingPage } from './pages/PitchBookingPage';
import { BookingAdminPage } from './pages/BookingAdminPage';
import { PitchSchedulePage } from './pages/PitchSchedulePage';

export default function App() {
  const [fetchedData, setFetchedData] = useState<AppData | null>(null);
  const [editingData, setEditingData] = useState<AppData | null>(null);
  const [previewData, setPreviewData] = useState<AppData | null>(null);
  const [opened, { toggle, close }] = useDisclosure();

  useEffect(() => {
    loadAllData().then(setFetchedData);
  }, []);

  const data = previewData ?? fetchedData;

  useEffect(() => {
    if (data) document.title = data.club.name;
  }, [data]);

  const handleApplyPreview = useCallback((updated: AppData) => {
    setPreviewData(updated);
    setEditingData(updated);
  }, []);

  const handleResetPreview = useCallback(() => {
    setPreviewData(null);
    setEditingData(null);
  }, []);

  if (!data) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  const clubTheme = createClubTheme(data.club.primaryColor);

  return (
    <MantineProvider theme={clubTheme}>
    <AuthProvider>
    <SectionProvider>
    <HashRouter>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'md', collapsed: { mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <SiteHeader club={data.club} sections={data.teams.sections} navOpen={opened} onNavToggle={toggle} />
        </AppShell.Header>

        <AppShell.Navbar>
          <SiteSidebar
            club={data.club}
            sections={data.teams.sections}
            sidebarFeeds={data.sidebarFeeds}
            onNavClick={close}
          />
        </AppShell.Navbar>

        <AppShell.Main>
          <Routes>
            <Route path="/" element={<HomePage club={data.club} />} />
            <Route path="/about" element={<AboutPage club={data.club} />} />
            <Route path="/teams" element={<TeamsPage teams={data.teams} liveTeams={data.liveTeams} />} />
            <Route path="/teams/:league/:teamSlug" element={<TeamPage liveTeams={data.liveTeams} />} />
            <Route path="/teams/:teamSlug" element={<TeamPage liveTeams={data.liveTeams} />} />
            <Route path="/fixtures" element={<FixturesResultsPage feed={data.clubFeed} teams={data.teams} liveTeams={data.liveTeams} />} />
            <Route path="/register" element={<RegisterPage items={data.registration} />} />
            <Route path="/committee" element={<CommitteePage committee={data.committee} teams={data.teams} />} />
            <Route path="/news" element={<NewsPage items={data.news} />} />
            <Route path="/gallery" element={<GalleryPage items={data.gallery} />} />
            <Route path="/matchday" element={<MatchdayPage items={data.matchday} club={data.club} />} />
            <Route path="/contact" element={<ContactPage club={data.club} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <AdminUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/customise" element={
              <ProtectedRoute requireAdmin>
                <CustomizePage
                  originalData={fetchedData!}
                  editingData={editingData}
                  onEditingChange={setEditingData}
                  onApplyPreview={handleApplyPreview}
                  onResetPreview={handleResetPreview}
                  previewActive={previewData !== null}
                />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute requireManager>
                <PitchBookingPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute requireAdmin>
                <BookingAdminPage clubFeedSlug={data.club.clubFeedSlug} />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <PitchSchedulePage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </HashRouter>
    </SectionProvider>
    </AuthProvider>
    </MantineProvider>
  );
}
