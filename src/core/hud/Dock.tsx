import React from 'react';
import { BarChart3, EyeOff, ListChecks, Music, NotebookPen, Palette } from 'lucide-react';
import type { ToolPanel } from '@/shared/types/contracts';
import { useUiStore } from '../ui/useUiStore';
import { NARROW_SCREEN_QUERY, useMediaQuery } from '../ui/useMediaQuery';

const DOCK_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--capsule-bg)',
  backdropFilter: 'blur(var(--capsule-blur))',
  WebkitBackdropFilter: 'blur(var(--capsule-blur))',
  borderColor: 'var(--capsule-border-color)',
};

const BUTTON_CLASS =
  'rounded-xl p-2.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';
const ACTIVE_CLASS = 'bg-accent text-accent-contrast hover:bg-accent hover:text-accent-contrast';

interface DockButtonProps {
  label: string;
  testId: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}

const DockButton: React.FC<DockButtonProps> = ({ label, testId, icon, isActive, onClick }) => (
  <button
    type="button"
    data-testid={testId}
    aria-label={label}
    title={label}
    aria-pressed={isActive}
    onClick={onClick}
    className={`${BUTTON_CLASS} ${isActive ? ACTIVE_CLASS : ''}`}
  >
    {icon}
  </button>
);

const TOOLS: { panel: ToolPanel; label: string; testId: string; Icon: typeof ListChecks }[] = [
  { panel: 'tasks', label: 'Tasks', testId: 'dock-tasks', Icon: ListChecks },
  { panel: 'note', label: 'Notepad', testId: 'dock-note', Icon: NotebookPen },
  { panel: 'mixer', label: 'Sounds', testId: 'dock-sounds', Icon: Music },
];

/** Bottom-left dock: opens the floating tools; on phones only one tool is open at a time (FR-22). */
export const ToolDock: React.FC = () => {
  const isZen = useUiStore((state) => state.isZen);
  const isTasksOpen = useUiStore((state) => state.isTasksOpen);
  const isNoteOpen = useUiStore((state) => state.isNoteOpen);
  const isMixerOpen = useUiStore((state) => state.isMixerOpen);
  const togglePanel = useUiStore((state) => state.togglePanel);
  const isNarrow = useMediaQuery(NARROW_SCREEN_QUERY);
  const open: Record<ToolPanel, boolean> = { tasks: isTasksOpen, note: isNoteOpen, mixer: isMixerOpen };

  if (isZen) return null;

  return (
    <nav
      data-testid="tool-dock"
      aria-label="Tools"
      className="flex items-center gap-1 rounded-2xl border p-1"
      style={DOCK_STYLE}
    >
      {TOOLS.map(({ panel, label, testId, Icon }) => (
        <DockButton
          key={panel}
          label={label}
          testId={testId}
          isActive={open[panel]}
          icon={<Icon className="h-4 w-4" aria-hidden="true" />}
          onClick={() => togglePanel(panel, isNarrow)}
        />
      ))}
    </nav>
  );
};

/** Bottom-right quick controls: theme library, analytics and Zen (shortcut F). */
export const QuickControls: React.FC = () => {
  const isZen = useUiStore((state) => state.isZen);
  const isThemeOpen = useUiStore((state) => state.isThemeCustomizerOpen);
  const isAnalyticsOpen = useUiStore((state) => state.isAnalyticsOpen);
  const setThemeOpen = useUiStore((state) => state.setThemeCustomizerOpen);
  const setAnalyticsOpen = useUiStore((state) => state.setAnalyticsOpen);
  const toggleZen = useUiStore((state) => state.toggleZen);

  if (isZen) return null;

  return (
    <nav
      data-testid="quick-controls"
      aria-label="Quick controls"
      className="flex items-center gap-1 rounded-2xl border p-1"
      style={DOCK_STYLE}
    >
      <DockButton
        label="Themes"
        testId="open-themes"
        isActive={isThemeOpen}
        icon={<Palette className="h-4 w-4" aria-hidden="true" />}
        onClick={() => setThemeOpen(!isThemeOpen)}
      />
      <DockButton
        label="Focus analytics"
        testId="open-analytics"
        isActive={isAnalyticsOpen}
        icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
        onClick={() => setAnalyticsOpen(!isAnalyticsOpen)}
      />
      <DockButton
        label="Zen mode (F)"
        testId="enter-zen"
        icon={<EyeOff className="h-4 w-4" aria-hidden="true" />}
        onClick={toggleZen}
      />
    </nav>
  );
};
