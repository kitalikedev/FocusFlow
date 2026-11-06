import { useEffect } from 'react';
import { toggleMasterMute } from '@/shared/lib/web-audio';
import { useTimerStore } from '@/core/timer/useTimerStore';
import { useUiStore } from '@/core/ui/useUiStore';

const TEXT_FIELD_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const INTERACTIVE_SELECTOR = 'button, a[href], summary, [role="button"], [role="menuitem"], [role="tab"]';
const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"]';

function elementOf(target: EventTarget | null): Element | null {
  return target instanceof Element ? target : null;
}

/** AC-08.2: never steal keys from anything the user can type into (also while an IME is composing). */
export function isTypingTarget(target: EventTarget | null): boolean {
  const element = elementOf(target);
  if (!element) return false;
  return (
    element.closest(TEXT_FIELD_SELECTOR) !== null ||
    (element instanceof HTMLElement && element.isContentEditable === true)
  );
}

function handleKeyDown(event: KeyboardEvent): void {
  // AC-08.3: Ctrl / Cmd / Alt belong to the browser (Cmd+R reload, Ctrl+F find...).
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.repeat || event.isComposing) return;
  if (isTypingTarget(event.target)) return;
  // A modal owns the keyboard while it is open.
  if (document.querySelector(DIALOG_SELECTOR)) return;

  const key = event.key.toLowerCase();

  if (event.key === ' ' || event.code === 'Space') {
    // On a focused button Space already clicks it; handling it twice would toggle the timer back.
    if (elementOf(event.target)?.closest(INTERACTIVE_SELECTOR)) return;
    event.preventDefault(); // stop the page from scrolling
    const timer = useTimerStore.getState();
    if (timer.status === 'running') timer.pause();
    else timer.start();
    return;
  }

  if (key === 'f') {
    const ui = useUiStore.getState();
    if (event.shiftKey) ui.toggleFullscreen();
    else ui.toggleZen();
    return;
  }

  if (event.shiftKey) return;
  if (key === 'r') useTimerStore.getState().reset();
  else if (key === 'm') toggleMasterMute();
}

/** Global keyboard shortcuts (FR-08): Space, R, F, Shift+F, M. */
export function useShortcuts(): void {
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
