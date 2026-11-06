import React, { useId } from 'react';
import { Loader2 } from 'lucide-react';
import { AUTH_MESSAGES } from '@/shared/lib/messages';
import { useAuthStore } from './useAuthStore';

const BUTTON_CLASS =
  'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-50';

/** Asks whether guest data should be merged into the account that just signed in (AC-02.3). */
export const GuestMergeDialog: React.FC = () => {
  const state = useAuthStore((s) => s.mergePrompt);
  const resolve = useAuthStore((s) => s.resolveGuestMerge);
  const titleId = useId();

  if (state === 'hidden') return null;
  const isRunning = state === 'running';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-capsule border border-white/10 bg-zinc-900 p-6 text-white shadow-xl"
      >
        <p id={titleId} className="mb-5 text-sm leading-relaxed">
          {AUTH_MESSAGES.guestMergeQuestion}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => void resolve('discard')}
            className={`${BUTTON_CLASS} bg-white/10 text-white hover:bg-white/20`}
          >
            {AUTH_MESSAGES.guestMergeDiscard}
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => void resolve('merge')}
            className={`${BUTTON_CLASS} bg-white/90 font-medium text-black hover:bg-white`}
          >
            {isRunning && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
            {AUTH_MESSAGES.guestMergeConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestMergeDialog;
