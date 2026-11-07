import React, { useEffect } from 'react';
import { NotebookPen } from 'lucide-react';
import { LIMITS } from '@/core/data/defaults';
import { FloatingPanel } from '@/core/ui/FloatingPanel';
import { useNoteStore, type NoteSaveStatus } from '../store/useNoteStore';

const STATUS_TEXT: Record<NoteSaveStatus, string> = {
  idle: '',
  pending: 'Editing…',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Not saved',
};

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Scratchpad with debounced auto-save (FR-20). */
export const NotePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const content = useNoteStore((state) => state.content);
  const status = useNoteStore((state) => state.status);
  const isLoaded = useNoteStore((state) => state.isLoaded);
  const setContent = useNoteStore((state) => state.setContent);

  // Closing the panel saves right away instead of waiting for the debounce.
  useEffect(() => () => void useNoteStore.getState().flush(), []);

  return (
    <FloatingPanel title="Notepad" testId="note-panel" icon={<NotebookPen className="h-4 w-4" />} onClose={onClose}>
      <div className="flex h-full flex-col gap-2 p-3">
        <label htmlFor="notepad" className="sr-only">
          Notes
        </label>
        <textarea
          id="notepad"
          value={content}
          disabled={!isLoaded}
          maxLength={LIMITS.noteMaxChars}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Brain dump your ideas without distractions."
          className="min-h-[220px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 max-sm:min-h-0"
        />
        <div className="flex items-center justify-between text-[11px] text-white/50">
          <span>
            {countWords(content)} words · {content.length} chars
          </span>
          <span data-testid="note-status" role="status" className={status === 'error' ? 'text-red-300' : ''}>
            {STATUS_TEXT[status]}
          </span>
        </div>
      </div>
    </FloatingPanel>
  );
};

export default NotePanel;
