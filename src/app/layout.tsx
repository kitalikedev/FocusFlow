import React, { lazy, Suspense } from 'react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ToastViewport } from '@/core/ui/ToastViewport';
import { QuickControls, ToolDock } from '@/core/hud/Dock';
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
  AnalyticsSlot,
  QuoteSlot,
} from './slots';

// Auth dialogs are loaded on demand so they never weigh on the initial bundle.
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

export const Layout: React.FC = () => {
  return (
    <WallpaperLayerSlot>
      <EffectsLayerSlot />

      <div className="relative z-10 flex h-screen w-screen flex-col overflow-hidden">
        {/* Top: brand, today's sessions, streak, sync and account */}
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

      {/* Global panels and dialogs */}
      <WallpaperPickerSlot />
      <ThemeCustomizerSlot />
      <AnalyticsSlot />
      <AuthOverlays />
      <ToastViewport />
    </WallpaperLayerSlot>
  );
};
