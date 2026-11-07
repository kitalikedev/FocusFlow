import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuickControls, ToolDock } from '../Dock';
import { FloatingPanel } from '../../ui/FloatingPanel';
import { SlideOver } from '../../ui/SlideOver';
import { useUiStore } from '../../ui/useUiStore';

function mockNarrow(isNarrow: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isNarrow,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  mockNarrow(false);
  useUiStore.setState({
    isZen: false,
    isTasksOpen: false,
    isNoteOpen: false,
    isMixerOpen: false,
    isThemeCustomizerOpen: false,
    isAnalyticsOpen: false,
  });
});
afterEach(() => {
  delete (window as unknown as { matchMedia?: unknown }).matchMedia;
});

describe('ToolDock', () => {
  it('toggles Tasks, Notepad and Sounds and shows which ones are open', () => {
    render(<ToolDock />);
    fireEvent.click(screen.getByTestId('dock-tasks'));
    fireEvent.click(screen.getByTestId('dock-note'));
    expect(useUiStore.getState()).toMatchObject({ isTasksOpen: true, isNoteOpen: true });
    expect(screen.getByTestId('dock-tasks')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('dock-sounds')).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps a single tool open on phones', () => {
    mockNarrow(true);
    render(<ToolDock />);
    fireEvent.click(screen.getByTestId('dock-tasks'));
    fireEvent.click(screen.getByTestId('dock-sounds'));
    expect(useUiStore.getState()).toMatchObject({ isTasksOpen: false, isMixerOpen: true });
  });

  it('hides itself in Zen mode', () => {
    useUiStore.setState({ isZen: true });
    render(<ToolDock />);
    expect(screen.queryByTestId('tool-dock')).not.toBeInTheDocument();
  });
});

describe('QuickControls', () => {
  it('opens and closes the theme library and analytics, and enters Zen', () => {
    render(<QuickControls />);
    fireEvent.click(screen.getByTestId('open-themes'));
    expect(useUiStore.getState().isThemeCustomizerOpen).toBe(true);
    fireEvent.click(screen.getByTestId('open-themes'));
    expect(useUiStore.getState().isThemeCustomizerOpen).toBe(false);
    fireEvent.click(screen.getByTestId('open-analytics'));
    expect(useUiStore.getState().isAnalyticsOpen).toBe(true);
    fireEvent.click(screen.getByTestId('enter-zen'));
    expect(useUiStore.getState().isZen).toBe(true);
  });

  it('hides itself in Zen mode', () => {
    useUiStore.setState({ isZen: true });
    render(<QuickControls />);
    expect(screen.queryByTestId('quick-controls')).not.toBeInTheDocument();
  });
});

describe('FloatingPanel', () => {
  it('renders a titled region that closes with the button and with Esc outside text fields', () => {
    const onClose = vi.fn();
    render(
      <FloatingPanel title="Tasks" testId="panel" onClose={onClose} actions={<span>extra</span>}>
        <input aria-label="field" />
      </FloatingPanel>,
    );
    expect(screen.getByRole('region', { name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText('field'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText('Close Tasks'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('leaves Esc to an open dialog', () => {
    const onClose = vi.fn();
    render(
      <>
        <div role="dialog" aria-label="Themes" />
        <FloatingPanel title="Notepad" onClose={onClose}>
          text
        </FloatingPanel>
      </>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('SlideOver', () => {
  it('is a labelled modal dialog that closes with Esc, the backdrop and the close button', () => {
    const onClose = vi.fn();
    render(
      <>
        <button type="button">opener</button>
        <SlideOver title="Themes" onClose={onClose} toolbar={<span>tabs</span>}>
          body
        </SlideOver>
      </>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Themes' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
    expect(screen.getByText('tabs')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(screen.getByTestId('slide-over-backdrop'));
    fireEvent.click(screen.getByLabelText('Close Themes'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
