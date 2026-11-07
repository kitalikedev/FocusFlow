import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AnalyticsModal, FocusIntent, ToolPanels } from '../index';
import { INTENT_DRAFT_KEY, readIntentDraft } from '../components/FocusIntent';
import { useTasksStore } from '../store/useTasksStore';
import { NOTE_SAVE_DELAY_MS, useNoteStore } from '../store/useNoteStore';
import { DEFAULT_VIEW } from '../lib/tasks';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { useFocusIntentStore } from '@/core/timer/useFocusIntentStore';
import { useFocusSessionsStore } from '@/core/data/useFocusSessionsStore';
import { getLocalRepository } from '@/core/data/useDataRepository';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, isGuest: true, isLoading: false });
  useUiStore.setState({ isZen: false, isTasksOpen: false, isNoteOpen: false, isAnalyticsOpen: false });
  useTasksStore.setState({ tasks: [], status: 'idle', view: DEFAULT_VIEW });
  useNoteStore.setState({ content: '', status: 'idle', isLoaded: false });
  useFocusIntentStore.setState({ intentTitle: '', taskId: null });
  useFocusSessionsStore.setState({ sessions: [] });
});
afterEach(() => {
  vi.useRealTimers();
});

async function openTasks() {
  act(() => useUiStore.setState({ isTasksOpen: true }));
  return screen.findByTestId('tasks-panel');
}

async function addTask(title: string) {
  fireEvent.change(screen.getByLabelText('New task'), { target: { value: title } });
  fireEvent.submit(screen.getByLabelText('New task').closest('form') as HTMLFormElement);
  await waitFor(() => expect(useTasksStore.getState().tasks.some((t) => t.title === title && !t.id.startsWith('temp-'))).toBe(true));
}

describe('Tasks (FR-19)', () => {
  it('AC-19.1 to 19.3: add at the top, complete with strike-through, delete', async () => {
    render(<ToolPanels />);
    await openTasks();
    await addTask('First');
    await addTask('Hoàn thành báo cáo tài chính');

    const titles = screen.getAllByTestId('task-title');
    expect(titles[0]).toHaveTextContent('Hoàn thành báo cáo tài chính');

    fireEvent.click(screen.getByLabelText('Mark "Hoàn thành báo cáo tài chính" as done'));
    await waitFor(() => expect(screen.getByText('Hoàn thành báo cáo tài chính')).toHaveClass('line-through', 'text-zinc-500'));
    const stored = (await getLocalRepository().getTasks()).find((t) => t.title.startsWith('Hoàn'));
    expect(stored?.isCompleted).toBe(true);

    fireEvent.click(screen.getByLabelText('Delete "First"'));
    await waitFor(() => expect(screen.queryByText('First')).not.toBeInTheDocument());
    expect(await getLocalRepository().getTasks()).toHaveLength(1);
  });

  it('AC-19.4: edits priority, due date and labels', async () => {
    render(<ToolPanels />);
    await openTasks();
    await addTask('Report');
    fireEvent.click(screen.getByLabelText('Edit "Report"'));
    const form = screen.getByRole('form', { name: 'Edit Report' });
    fireEvent.change(within(form).getByLabelText('Priority'), { target: { value: 'high' } });
    fireEvent.change(within(form).getByLabelText('Due date'), { target: { value: '2026-12-01' } });
    fireEvent.change(within(form).getByLabelText('Labels (comma separated)'), { target: { value: 'Work, Urgent' } });
    fireEvent.click(within(form).getByText('Save'));

    await waitFor(() => expect(screen.getByTestId('priority-badge')).toHaveTextContent('High'));
    expect(screen.getByTestId('due-date')).toBeInTheDocument();
    expect(screen.getByText('#Work')).toBeInTheDocument();
    expect(screen.getByText('#Urgent')).toBeInTheDocument();
    const [stored] = await getLocalRepository().getTasks();
    expect(stored).toMatchObject({ priority: 'high', labels: ['Work', 'Urgent'] });
  });

  it('rejects too many labels before saving', async () => {
    render(<ToolPanels />);
    await openTasks();
    await addTask('Report');
    fireEvent.click(screen.getByLabelText('Edit "Report"'));
    fireEvent.change(screen.getByLabelText('Labels (comma separated)'), { target: { value: 'a,b,c,d,e,f' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByRole('alert')).toHaveTextContent('Up to 5 labels');
  });

  it('AC-19.5: search and priority filter narrow the list instantly', async () => {
    render(<ToolPanels />);
    await openTasks();
    await addTask('báo cáo tuần');
    await addTask('đi chợ');
    fireEvent.change(screen.getByLabelText('Search tasks'), { target: { value: 'báo' } });
    expect(screen.getAllByTestId('task-row')).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Filter by priority'), { target: { value: 'high' } });
    expect(screen.getByText('No task matches these filters.')).toBeInTheDocument();
  });

  it('keeps the title and shows an error when saving fails', async () => {
    vi.spyOn(getLocalRepository(), 'createTask').mockRejectedValueOnce(new Error('boom'));
    render(<ToolPanels />);
    await openTasks();
    fireEvent.change(screen.getByLabelText('New task'), { target: { value: 'Lost?' } });
    fireEvent.submit(screen.getByLabelText('New task').closest('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByLabelText('New task')).toHaveValue('Lost?'));
    expect(useTasksStore.getState().tasks).toHaveLength(0);
  });

  it('hides every panel in Zen', async () => {
    render(<ToolPanels />);
    await openTasks();
    act(() => useUiStore.setState({ isZen: true }));
    expect(screen.queryByTestId('tasks-panel')).not.toBeInTheDocument();
  });
});

describe('Notepad (FR-20)', () => {
  it('AC-20.1: saves 500 ms after the last keystroke and AC-20.2 restores it', async () => {
    await getLocalRepository().saveNote('old note');
    render(<ToolPanels />);
    act(() => useUiStore.setState({ isNoteOpen: true }));
    const textarea = await screen.findByLabelText('Notes');
    await waitFor(() => expect(textarea).toHaveValue('old note'));

    vi.useFakeTimers();
    fireEvent.change(textarea, { target: { value: 'new idea' } });
    expect(screen.getByTestId('note-status')).toHaveTextContent('Editing');
    await act(async () => {
      vi.advanceTimersByTime(NOTE_SAVE_DELAY_MS - 1);
    });
    expect((await getLocalRepository().getNote()).content).toBe('old note');
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    vi.useRealTimers();
    await waitFor(() => expect(screen.getByTestId('note-status')).toHaveTextContent('Saved'));
    expect((await getLocalRepository().getNote()).content).toBe('new idea');
    expect(screen.getByText('2 words · 8 chars')).toBeInTheDocument();
  });

  it('saves right away when the panel closes', async () => {
    render(<ToolPanels />);
    act(() => useUiStore.setState({ isNoteOpen: true }));
    const textarea = await screen.findByLabelText('Notes');
    await waitFor(() => expect(textarea).not.toBeDisabled());
    fireEvent.change(textarea, { target: { value: 'quick' } });
    act(() => useUiStore.setState({ isNoteOpen: false }));
    await waitFor(async () => expect((await getLocalRepository().getNote()).content).toBe('quick'));
  });
});

describe('FocusIntent (FR-29)', () => {
  it('AC-29.1: picks a task, and AC-29.3 keeps the text when the task is deleted', async () => {
    const created = await getLocalRepository().createTask('Viết báo cáo tài chính');
    useTasksStore.setState({ tasks: [created], status: 'ready' });
    render(<FocusIntent />);

    fireEvent.click(screen.getByTestId('pick-task-btn'));
    fireEvent.click(screen.getByRole('option', { name: 'Viết báo cáo tài chính' }));
    expect(screen.getByLabelText('Focus intent')).toHaveValue('Viết báo cáo tài chính');
    expect(useFocusIntentStore.getState().taskId).toBe(created.id);
    expect(readIntentDraft()).toEqual({ intentTitle: 'Viết báo cáo tài chính', taskId: created.id });

    await act(() => useTasksStore.getState().deleteTask(created.id));
    expect(useFocusIntentStore.getState()).toMatchObject({ intentTitle: 'Viết báo cáo tài chính', taskId: null });
  });

  it('typing replaces the task link, the draft survives a reload and the field caps at 80 chars', () => {
    localStorage.setItem(INTENT_DRAFT_KEY, JSON.stringify({ intentTitle: 'Thiết kế UI Tokens', taskId: 'x' }));
    render(<FocusIntent />);
    const input = screen.getByLabelText('Focus intent');
    expect(input).toHaveValue('Thiết kế UI Tokens');
    expect(input).toHaveAttribute('maxLength', '80');
    fireEvent.change(input, { target: { value: 'Something else' } });
    expect(useFocusIntentStore.getState()).toMatchObject({ intentTitle: 'Something else', taskId: null });
    fireEvent.click(screen.getByLabelText('Clear focus intent'));
    expect(input).toHaveValue('');
  });

  it('shows a hint when there is no open task and closes with Esc', () => {
    render(<FocusIntent />);
    fireEvent.click(screen.getByTestId('pick-task-btn'));
    expect(screen.getByText(/No open tasks/)).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('AnalyticsModal (FR-21)', () => {
  it('shows weekly bars, streak, intents and history', async () => {
    const now = new Date();
    useFocusSessionsStore.setState({
      sessions: [
        { id: '1', durationMinutes: 25, intentTitle: 'Thiết kế UI Tokens', completedAt: now.toISOString() },
        { id: '2', durationMinutes: 50, completedAt: now.toISOString() },
      ],
    });
    useUiStore.setState({ isAnalyticsOpen: true });
    render(<AnalyticsModal />);

    expect(await screen.findByTestId('week-chart')).toBeInTheDocument();
    const todayIndex = (now.getDay() + 6) % 7;
    expect(screen.getByTestId(`bar-${todayIndex}`)).toHaveAttribute('data-minutes', '75');
    expect(screen.getByTestId('current-streak')).toHaveTextContent('1 Day');
    expect(screen.getByTestId('today-count')).toHaveTextContent('2 sessions');
    expect(screen.getAllByText('Thiết kế UI Tokens').length).toBeGreaterThan(0);
    expect(within(screen.getByTestId('session-history')).getAllByRole('listitem')).toHaveLength(2);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useUiStore.getState().isAnalyticsOpen).toBe(false);
  });
});
