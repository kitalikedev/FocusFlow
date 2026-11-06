import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/shared/lib/web-audio', () => ({
  initAudioContext: vi.fn().mockResolvedValue(undefined),
  toggleMasterMute: vi.fn(),
}));
vi.mock('@/core/timer/completion', () => ({
  onSessionCompleted: vi.fn(),
  requestNotificationPermission: vi.fn(),
}));

import { toggleMasterMute } from '@/shared/lib/web-audio';
import { createInitialTimerState, useTimerStore } from '@/core/timer/useTimerStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { isTypingTarget, useShortcuts } from '../useShortcuts';

const Harness: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useShortcuts();
  return <div>{children}</div>;
};

function press(key: string, init: KeyboardEventInit = {}, target: Element | Window = window) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  useTimerStore.getState().reset();
  useTimerStore.setState(createInitialTimerState());
  useUiStore.setState({ isZen: false, isFullscreen: false });
});
afterEach(() => {
  cleanup();
  useTimerStore.getState().reset();
  vi.useRealTimers();
});

describe('shortcuts outside text fields (AC-08.1)', () => {
  it('Space starts and pauses the timer and does not scroll the page', () => {
    render(<Harness />);
    const first = press(' ', { code: 'Space' });
    expect(useTimerStore.getState().status).toBe('running');
    expect(first.defaultPrevented).toBe(true);

    press(' ', { code: 'Space' });
    expect(useTimerStore.getState().status).toBe('paused');
    press(' ', { code: 'Space' });
    expect(useTimerStore.getState().status).toBe('running');
  });

  it('R resets the timer', () => {
    render(<Harness />);
    useTimerStore.getState().start();
    vi.advanceTimersByTime(5_000);
    press('r');
    expect(useTimerStore.getState()).toMatchObject({ status: 'idle', remainingSeconds: 1500 });
    press('R'); // Caps Lock
    expect(useTimerStore.getState().status).toBe('idle');
  });

  it('F toggles Zen and Shift+F toggles fullscreen', () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.documentElement.requestFullscreen = requestFullscreen;
    render(<Harness />);

    press('f');
    expect(useUiStore.getState().isZen).toBe(true);
    press('F', { shiftKey: true });
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(useUiStore.getState().isZen).toBe(true);
  });

  it('M toggles the master mute', () => {
    render(<Harness />);
    press('m');
    expect(toggleMasterMute).toHaveBeenCalledTimes(1);
  });

  it('ignores Shift+R and Shift+M and unrelated keys', () => {
    render(<Harness />);
    useTimerStore.getState().start();
    press('r', { shiftKey: true });
    press('M', { shiftKey: true });
    press('x');
    expect(useTimerStore.getState().status).toBe('running');
    expect(toggleMasterMute).not.toHaveBeenCalled();
  });

  it('stops listening when unmounted', () => {
    const { unmount } = render(<Harness />);
    unmount();
    press(' ', { code: 'Space' });
    expect(useTimerStore.getState().status).toBe('idle');
  });
});

describe('typing is never hijacked (AC-08.2)', () => {
  it.each([
    ['input', () => document.createElement('input')],
    ['textarea', () => document.createElement('textarea')],
    ['select', () => document.createElement('select')],
    [
      'contenteditable',
      () => {
        const element = document.createElement('div');
        element.setAttribute('contenteditable', 'true');
        return element;
      },
    ],
  ])('ignores Space, R, F and M inside a %s', (_name, create) => {
    const field = create();
    render(<Harness />);
    document.body.appendChild(field);

    const space = press(' ', { code: 'Space' }, field);
    press('r', {}, field);
    press('f', {}, field);
    press('m', {}, field);

    expect(space.defaultPrevented).toBe(false);
    expect(useTimerStore.getState().status).toBe('idle');
    expect(useUiStore.getState().isZen).toBe(false);
    expect(toggleMasterMute).not.toHaveBeenCalled();
    field.remove();
  });

  it('ignores keys inside a child of a contenteditable region', () => {
    const editor = document.createElement('div');
    editor.setAttribute('contenteditable', 'true');
    const child = document.createElement('span');
    editor.appendChild(child);
    document.body.appendChild(editor);
    render(<Harness />);

    press(' ', { code: 'Space' }, child);
    expect(useTimerStore.getState().status).toBe('idle');
    editor.remove();
  });

  it('ignores keys while an input method is composing', () => {
    render(<Harness />);
    press('r', { isComposing: true });
    press(' ', { code: 'Space', isComposing: true });
    expect(useTimerStore.getState().status).toBe('idle');
  });

  it('ignores auto-repeat so holding a key does not flip the timer', () => {
    render(<Harness />);
    press(' ', { code: 'Space', repeat: true });
    expect(useTimerStore.getState().status).toBe('idle');
  });
});

describe('browser shortcuts are left alone (AC-08.3)', () => {
  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Alt', { altKey: true }],
  ])('%s + Space, R, F, M do nothing', (_name, modifier) => {
    render(<Harness />);
    const space = press(' ', { code: 'Space', ...modifier });
    press('r', modifier);
    press('f', modifier);
    press('F', { ...modifier, shiftKey: true });
    press('m', modifier);

    expect(space.defaultPrevented).toBe(false);
    expect(useTimerStore.getState().status).toBe('idle');
    expect(useUiStore.getState().isZen).toBe(false);
    expect(toggleMasterMute).not.toHaveBeenCalled();
  });
});

describe('other places that own the keyboard (plan Q9)', () => {
  it('Space on a focused button is left to the button', () => {
    render(
      <Harness>
        <button type="button">Start</button>
      </Harness>,
    );
    const button = document.querySelector('button') as HTMLButtonElement;
    const event = press(' ', { code: 'Space' }, button);
    expect(event.defaultPrevented).toBe(false);
    expect(useTimerStore.getState().status).toBe('idle');
  });

  it('other keys still work while a button has focus', () => {
    render(
      <Harness>
        <button type="button">Start</button>
      </Harness>,
    );
    press('f', {}, document.querySelector('button') as HTMLButtonElement);
    expect(useUiStore.getState().isZen).toBe(true);
  });

  it.each(['dialog', 'alertdialog'])('is disabled while a %s is open', (role) => {
    render(
      <Harness>
        <div role={role} />
      </Harness>,
    );
    press(' ', { code: 'Space' });
    press('f');
    expect(useTimerStore.getState().status).toBe('idle');
    expect(useUiStore.getState().isZen).toBe(false);
  });
});

describe('isTypingTarget', () => {
  it('is false for null, non-elements and plain elements', () => {
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget(window)).toBe(false);
    expect(isTypingTarget(document.createElement('div'))).toBe(false);
  });

  it('honours isContentEditable even without the attribute selector', () => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'isContentEditable', { value: true });
    expect(isTypingTarget(element)).toBe(true);
  });

  it('treats contenteditable="false" as not editable', () => {
    const element = document.createElement('div');
    element.setAttribute('contenteditable', 'false');
    expect(isTypingTarget(element)).toBe(false);
  });
});

describe('integration with the timer', () => {
  it('fireEvent keydown on a plain element reaches the window handler', () => {
    render(<Harness />);
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    expect(useTimerStore.getState().status).toBe('running');
  });
});
