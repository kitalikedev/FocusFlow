import React, { lazy, Suspense } from 'react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ToastViewport } from '@/core/ui/ToastViewport';
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
  SidePanelsSlot,
  DrawerTabsSlot,
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

      <div className="relative z-10 flex flex-col justify-between w-screen h-screen overflow-hidden">
        {/* Tier 1: Header HUD */}
        <HudSlot />

        {/* Tier 2: Center Workspace & Capsule */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
          <div className="w-full flex items-center justify-center relative">
            <SidePanelsSlot />

            <div className="flex flex-col items-center gap-6 z-20">
              <FocusIntentSlot />
              <div className="relative">
                <ClockDisplaySlot />
                <ClockSettingsSlot />
              </div>
            </div>
          </div>
        </main>

        {/* Tier 3: Bottom Control Bar & Mobile Drawer */}
        <div className="w-full">
          <ControlBarSlot />
          <DrawerTabsSlot />
        </div>
      </div>

      {/* Global Modals */}
      <WallpaperPickerSlot />
      <ThemeCustomizerSlot />
      <AuthOverlays />
      <ToastViewport />
    </WallpaperLayerSlot>
  );
};
