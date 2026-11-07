import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTimerStore } from '@/core/timer/useTimerStore';
import { useUiStore } from '@/core/ui/useUiStore';
import { useClockPreferences } from '../hooks/useClockPreferences';
import { CONTROL_BUTTON_CLASS, POSITION_OPTIONS, VISUAL_MODE_OPTIONS } from '../lib/labels';
import {
  INTERVAL_ERROR,
  INTERVAL_MAX,
  INTERVAL_MIN,
  MINUTES_ERROR,
  MINUTES_MAX,
  MINUTES_MIN,
  parseWholeNumber,
} from '../lib/validation';

type DurationField = 'focus' | 'shortBreak' | 'longBreak';

const DURATION_FIELDS: { key: DurationField; label: string }[] = [
  { key: 'focus', label: 'Focus' },
  { key: 'shortBreak', label: 'Short Break' },
  { key: 'longBreak', label: 'Long Break' },
];

interface NumberFieldProps {
  id: string;
  label: string;
  suffix: string;
  value: string;
  min: number;
  max: number;
  error: string | null;
  onChange: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

const NumberField: React.FC<NumberFieldProps> = ({ id, label, suffix, value, min, max, error, onChange, inputRef }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-xs text-white/70">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        id={id}
        ref={inputRef}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-invalid={error !== null}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`w-20 rounded-lg border bg-white/5 px-2 py-1.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
          error ? 'border-red-500' : 'border-white/10'
        }`}
      />
      <span className="text-xs text-white/50">{suffix}</span>
    </div>
    {error && (
      <p id={`${id}-error`} role="alert" className="text-xs text-red-400">
        {error}
      </p>
    )}
  </div>
);

/** Panel content; mounted only while open so every opening starts from the current timer values. */
const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const firstInput = useRef<HTMLInputElement>(null);
  const timer = useTimerStore.getState();
  const { visualMode, position, setVisualMode, setPosition } = useClockPreferences();

  const [minutes, setMinutes] = useState<Record<DurationField, string>>({
    focus: String(Math.round(timer.durations.focus / 60)),
    shortBreak: String(Math.round(timer.durations.shortBreak / 60)),
    longBreak: String(Math.round(timer.durations.longBreak / 60)),
  });
  const [interval, setIntervalValue] = useState(String(timer.longBreakInterval));
  const [autoStartBreaks, setAutoStartBreaks] = useState(timer.autoStartBreaks);
  const [autoStartFocus, setAutoStartFocus] = useState(timer.autoStartFocus);

  useEffect(() => {
    firstInput.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const parsedMinutes = {
    focus: parseWholeNumber(minutes.focus, MINUTES_MIN, MINUTES_MAX),
    shortBreak: parseWholeNumber(minutes.shortBreak, MINUTES_MIN, MINUTES_MAX),
    longBreak: parseWholeNumber(minutes.longBreak, MINUTES_MIN, MINUTES_MAX),
  };
  const parsedInterval = parseWholeNumber(interval, INTERVAL_MIN, INTERVAL_MAX);
  const isValid =
    parsedMinutes.focus !== null &&
    parsedMinutes.shortBreak !== null &&
    parsedMinutes.longBreak !== null &&
    parsedInterval !== null;

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    // The core timer applies this at once when idle (AC-12.1) and saves it to the user settings.
    useTimerStore.getState().updateSettings({
      durations: {
        focus: (parsedMinutes.focus as number) * 60,
        shortBreak: (parsedMinutes.shortBreak as number) * 60,
        longBreak: (parsedMinutes.longBreak as number) * 60,
      },
      longBreakInterval: parsedInterval as number,
      autoStartBreaks,
      autoStartFocus,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="clock-settings-popover"
        onSubmit={save}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-sm flex-col gap-5 overflow-y-auto rounded-t-2xl border border-white/10 bg-zinc-900 p-5 text-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-sm font-semibold">
            Timer Settings
          </h2>
          <button type="button" aria-label="Close timer settings" onClick={onClose} className={CONTROL_BUTTON_CLASS}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <fieldset className="grid grid-cols-3 gap-3">
          <legend className="mb-2 text-xs uppercase tracking-widest text-white/50">Durations</legend>
          {DURATION_FIELDS.map((field, index) => (
            <NumberField
              key={field.key}
              id={`${baseId}-${field.key}`}
              label={field.label}
              suffix="min"
              value={minutes[field.key]}
              min={MINUTES_MIN}
              max={MINUTES_MAX}
              error={parsedMinutes[field.key] === null ? MINUTES_ERROR : null}
              onChange={(value) => setMinutes((current) => ({ ...current, [field.key]: value }))}
              inputRef={index === 0 ? firstInput : undefined}
            />
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-xs uppercase tracking-widest text-white/50">Cycle</legend>
          <NumberField
            id={`${baseId}-interval`}
            label="Long break every"
            suffix="sessions"
            value={interval}
            min={INTERVAL_MIN}
            max={INTERVAL_MAX}
            error={parsedInterval === null ? INTERVAL_ERROR : null}
            onChange={setIntervalValue}
          />
          <label className="flex items-center justify-between text-sm">
            Auto-start breaks
            <input
              type="checkbox"
              data-testid="auto-start-breaks"
              checked={autoStartBreaks}
              onChange={(event) => setAutoStartBreaks(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            Auto-start focus
            <input
              type="checkbox"
              data-testid="auto-start-focus"
              checked={autoStartFocus}
              onChange={(event) => setAutoStartFocus(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-xs uppercase tracking-widest text-white/50">Clock style</legend>
          <div className="flex flex-wrap gap-1">
            {VISUAL_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                data-testid={`visual-${option.value}`}
                aria-pressed={visualMode === option.value}
                onClick={() => setVisualMode(option.value)}
                className={`${CONTROL_BUTTON_CLASS} ${visualMode === option.value ? 'bg-white/15 text-white' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-xs uppercase tracking-widest text-white/50">Position</legend>
          <div className="flex flex-wrap gap-1">
            {POSITION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                data-testid={`position-${option.value}`}
                aria-pressed={position === option.value}
                onClick={() => setPosition(option.value)}
                className={`${CONTROL_BUTTON_CLASS} ${position === option.value ? 'bg-white/15 text-white' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40">Mini Corner applies on screens wider than 640px.</p>
        </fieldset>

        <button
          type="submit"
          data-testid="clock-settings-save"
          disabled={!isValid}
          className="rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
      </form>
    </div>
  );
};

/** FR-12: quick settings next to the clock; opened by the gear button or the mobile drawer (useUiStore). */
export const ClockSettingsPopover: React.FC = () => {
  const isOpen = useUiStore((state) => state.isClockSettingsOpen);
  const setOpen = useUiStore((state) => state.setClockSettingsOpen);
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  if (!isOpen) return null;
  return <SettingsPanel onClose={close} />;
};
