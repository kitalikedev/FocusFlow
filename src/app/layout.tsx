import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ToastViewport } from '@/core/ui/ToastViewport';
import { usePageTitle } from '@/core/ui/usePageTitle';
import { isOnAppPage } from '@/core/ui/routes';
import { QuickControls, ToolDock } from '@/core/hud/Dock';
import { SiteLayout } from './site/SiteLayout';
import { HomePage } from './pages/HomePage';
import { TrackingPage } from './pages/TrackingPage';
import { AboutPage } from './pages/AboutPage';
import {
  WallpaperLayerSlot,
  EffectsLayerSlot,
  HudSlot,
  FocusIntentSlot,
  ClockDisplaySlot,
  ClockSettingsSlot,
  WallpaperPickerSlot,
  ThemeCustomizerSlot,
  ControlBarSlot,
  SoundPanelSlot,
  ToolPanelsSlot,
  ThemesPageSlot,
  AnalyticsPageSlot,
  QuoteSlot,
} from './slots';

// Auth dialogs are loaded on demand so they never weigh on the initial bundle.
// The website pages ship in the main bundle: each is only about 1 KB gzipped, and loading one on demand added a
// request after the app had started, so a page opened directly appeared later (Lighthouse, issues #30 and #86).
const AuthModal = lazy(() => import('@/core/auth/AuthModal'));
const GuestMergeDialog = lazy(() => import('@/core/auth/GuestMergeDialog'));

const AuthOverlays: React.FC = () => {
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const mergePrompt = useAuthStore((state) => state.mergePrompt);

  return (
    <Suspense fallback={null}>
      {isAuthModalOpen && <AuthModal />}
      {mergePrompt !== 'hidden' && <GuestMergeDialog />}
    </Suspense>
  );
};

/** The focus workspace at /app: wallpaper, clock, docks, sounds and the panels they open. */
const AppShell: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  usePageTitle('Workspace', isVisible);

  return (
    <WallpaperLayerSlot>
      <EffectsLayerSlot />

      <div className="relative z-10 flex h-screen w-screen flex-col overflow-hidden">
        {/* Top: brand (back to the website), today's sessions, streak, sync and account */}
        <HudSlot />

        {/* Top right, under the HUD: random quotes as end credits (hidden unless the user turns them on); above the clock so a quote passing over it stays readable on small screens */}
        <div className="pointer-events-none absolute right-6 top-16 z-30 max-w-xs text-right max-sm:right-4 max-sm:top-14 max-sm:max-w-[60vw]">
          <QuoteSlot />
        </div>

        {/* Center: focus intent and the clock capsule */}
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-20">
          <div className="z-20 flex flex-col items-center gap-6">
            <FocusIntentSlot />
            <div className="relative">
              <ClockDisplaySlot />
              <ClockSettingsSlot />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom: floating tools above the two docks (desktop); tools become bottom sheets on phones */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 p-4">
        <div className="flex items-end gap-3">
          <ToolPanelsSlot />
          <SoundPanelSlot />
        </div>
        <div className="flex items-center justify-between gap-3 [&>*]:pointer-events-auto">
          <ToolDock />
          <ControlBarSlot />
          <QuickControls />
        </div>
      </div>

      <WallpaperPickerSlot />
      <ThemeCustomizerSlot />
    </WallpaperLayerSlot>
  );
};

export const Layout: React.FC = () => {
  const isApp = isOnAppPage(useLocation().pathname);

  return (
    <>
      {/* The workspace stays mounted while the website is shown, so the timer and the music keep going. */}
      <div data-testid="app-shell" hidden={!isApp}>
        <AppShell isVisible={isApp} />
      </div>

      {!isApp && (
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="themes" element={<ThemesPageSlot />} />
            <Route path="analytics" element={<AnalyticsPageSlot />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}

      <AuthOverlays />
      <ToastViewport />
    </>
  );
};
