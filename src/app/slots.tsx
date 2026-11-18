import React from 'react';
import { Link } from 'react-router-dom';
import { captureError } from '@/shared/lib/monitoring';
import { HudSlot as CoreHudSlot } from '@/core/hud/HudSlot';
import { ClockDisplay, ClockSettingsPopover } from '@/features/clock-modes';
import {
  WallpaperLayer as ThemeWallpaperLayer,
  EffectsLayer as ThemeEffectsLayer,
  WallpaperPickerModal as ThemeWallpaperPickerModal,
  ThemeCustomizerModal as ThemeThemeCustomizerModal,
  ThemesPage as ThemeThemesPage,
} from '@/features/theme-wallpaper';
import { ControlBar as AudioControlBar, SoundPanel as AudioSoundPanel } from '@/features/audio';
import { QuoteDisplay as QuotesDisplay } from '@/features/quotes';
import {
  FocusIntent as ProductivityFocusIntent,
  ToolPanels as ProductivityToolPanels,
  AnalyticsPage as ProductivityAnalyticsPage,
} from '@/features/productivity';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class SlotErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Slot Error:', error, errorInfo);
    captureError(error, { componentStack: errorInfo.componentStack });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export const WallpaperLayerSlot: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <SlotErrorBoundary>
    <ThemeWallpaperLayer>{children}</ThemeWallpaperLayer>
  </SlotErrorBoundary>
);

export const EffectsLayerSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ThemeEffectsLayer />
  </SlotErrorBoundary>
);

export const HudSlot: React.FC = () => (
  <SlotErrorBoundary>
    <CoreHudSlot
      brand={
        <Link
          to="/"
          title="Back to the FocusFlow website"
          className="rounded-lg text-sm font-semibold tracking-wider opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          FocusFlow
        </Link>
      }
    />
  </SlotErrorBoundary>
);

export const FocusIntentSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ProductivityFocusIntent />
  </SlotErrorBoundary>
);

export const ClockDisplaySlot: React.FC = () => (
  <SlotErrorBoundary>
    <ClockDisplay />
  </SlotErrorBoundary>
);

export const ClockSettingsSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ClockSettingsPopover />
  </SlotErrorBoundary>
);

export const WallpaperPickerSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ThemeWallpaperPickerModal />
  </SlotErrorBoundary>
);

export const ThemeCustomizerSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ThemeThemeCustomizerModal />
  </SlotErrorBoundary>
);

export const ControlBarSlot: React.FC = () => (
  <SlotErrorBoundary>
    <AudioControlBar />
  </SlotErrorBoundary>
);

export const SoundPanelSlot: React.FC = () => (
  <SlotErrorBoundary>
    <AudioSoundPanel />
  </SlotErrorBoundary>
);

export const ToolPanelsSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ProductivityToolPanels />
  </SlotErrorBoundary>
);

export const ThemesPageSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ThemeThemesPage />
  </SlotErrorBoundary>
);

export const AnalyticsPageSlot: React.FC = () => (
  <SlotErrorBoundary>
    <ProductivityAnalyticsPage />
  </SlotErrorBoundary>
);

export const QuoteSlot: React.FC = () => (
  <SlotErrorBoundary>
    <QuotesDisplay />
  </SlotErrorBoundary>
);
