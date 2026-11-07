import React, { useState } from 'react';
import type { EffectsConfig, ThemeConfig, ThemeTokens } from '@/shared/types/contracts';
import { parseColor, toHex } from '@/core/theme/color';
import {
  ACCENT_ADJUSTED_NOTE,
  CAPSULE_CLAMPED_NOTE,
  enforceReadability,
  isBrightBackground,
  OPACITY_FLOOR,
  OPACITY_LOCKED_NOTE,
} from '../lib/contrast';
import { FONT_OPTIONS, fontFromStack, loadFont } from '../lib/fonts';
import { backgroundLuminance, useThemeLibraryStore } from '../store/useThemeLibraryStore';

interface CustomizeTabProps {
  draft: ThemeConfig;
  isDirty: boolean;
  onChange: (next: ThemeConfig) => void;
  onApply: () => void;
  onRevert: () => void;
  onSaveAsNew: (name: string) => Promise<boolean>;
}

const FIELD = 'rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

interface RangeProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  note?: string | null;
}

const Range: React.FC<RangeProps> = ({ id, label, value, min, max, step = 1, unit, onChange, note }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs">
      <label htmlFor={id} className="text-white/75">
        {label}
      </label>
      <span className="tabular-nums text-white/50">
        {value}
        {unit}
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-1.5 w-full cursor-pointer accent-[var(--color-accent)]"
    />
    {note && (
      <p role="status" className="text-[11px] text-amber-200">
        {note}
      </p>
    )}
  </div>
);

const ColorField: React.FC<{ id: string; label: string; value: string; onChange: (value: string) => void }> = ({
  id,
  label,
  value,
  onChange,
}) => {
  const hex = toHex(parseColor(value) ?? { r: 0, g: 0, b: 0, a: 1 });
  const [text, setText] = useState(hex);
  React.useEffect(() => setText(hex), [hex]);
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-xs text-white/75">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          aria-label={`${label} picker`}
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
        />
        <input
          id={id}
          value={text}
          maxLength={7}
          onChange={(event) => {
            setText(event.target.value);
            if (/^#[0-9a-f]{6}$/i.test(event.target.value)) onChange(event.target.value);
          }}
          className={`${FIELD} w-24 font-mono`}
        />
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h3 className="text-xs font-medium uppercase tracking-wider text-white/50">{title}</h3>
    {children}
  </section>
);

const EFFECTS: { key: keyof EffectsConfig; label: string }[] = [
  { key: 'rain', label: 'Rain' },
  { key: 'snow', label: 'Snow' },
  { key: 'fireflies', label: 'Fireflies' },
  { key: 'grain', label: 'Film grain' },
  { key: 'vignette', label: 'Vignette' },
  { key: 'scanlines', label: 'Scanlines' },
  { key: 'glow', label: 'Clock glow' },
];

/** Theme Customizer (FR-25): every token with Live Preview, Apply / Revert and the readability floor. */
export const CustomizeTab: React.FC<CustomizeTabProps> = ({ draft, isDirty, onChange, onApply, onRevert, onSaveAsNew }) => {
  const customs = useThemeLibraryStore((state) => state.customWallpapers);
  const [name, setName] = useState('');
  const { tokens } = draft;
  const luminance = backgroundLuminance(draft.wallpaperRef, customs);
  const bright = isBrightBackground(luminance, tokens);
  const check = enforceReadability(tokens, luminance);
  const isSolid = draft.wallpaperRef.type === 'solid';
  const font = fontFromStack(tokens.fontClock) ?? FONT_OPTIONS[0];

  const setTokens = (partial: Partial<ThemeTokens>) =>
    onChange({ ...draft, presetId: undefined, tokens: { ...tokens, ...partial } });
  const setEffect = (key: keyof EffectsConfig, value: number) =>
    onChange({ ...draft, effects: { ...draft.effects, [key]: value } });

  return (
    <div className="flex flex-col gap-6 p-5 pt-1">
      <Section title="Accent">
        <ColorField id="accent-color" label="Accent color" value={tokens.colorAccent} onChange={(colorAccent) => setTokens({ colorAccent })} />
        {check.accentAdjusted && (
          <p role="status" className="text-[11px] text-amber-200">
            {ACCENT_ADJUSTED_NOTE}
          </p>
        )}
      </Section>

      <Section title="Glass capsule">
        <ColorField id="capsule-color" label="Capsule color" value={tokens.capsuleBg} onChange={(capsuleBg) => setTokens({ capsuleBg })} />
        {check.capsuleClamped && (
          <p role="status" className="text-[11px] text-amber-200">
            {CAPSULE_CLAMPED_NOTE}
          </p>
        )}
        <Range
          id="capsule-opacity"
          label="Opacity"
          unit="%"
          min={bright ? OPACITY_FLOOR * 100 : 20}
          max={95}
          value={Math.round(Math.max(tokens.capsuleOpacity, bright ? OPACITY_FLOOR : 0) * 100)}
          onChange={(value) => setTokens({ capsuleOpacity: value / 100 })}
          note={bright ? OPACITY_LOCKED_NOTE : null}
        />
        <Range id="capsule-blur" label="Blur" unit="px" min={0} max={32} value={tokens.capsuleBlur} onChange={(capsuleBlur) => setTokens({ capsuleBlur })} />
        <Range id="capsule-radius" label="Corner radius" unit="px" min={4} max={48} value={tokens.capsuleRadius} onChange={(capsuleRadius) => setTokens({ capsuleRadius })} />
        <Range
          id="capsule-border"
          label="Border width"
          unit="px"
          min={0}
          max={2}
          step={0.5}
          value={tokens.capsuleBorderWidth}
          onChange={(capsuleBorderWidth) => setTokens({ capsuleBorderWidth })}
        />
      </Section>

      <Section title="Clock">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="clock-font" className="text-xs text-white/75">
            Font
          </label>
          <select
            id="clock-font"
            value={font.id}
            onChange={(event) => {
              const next = FONT_OPTIONS.find((option) => option.id === event.target.value) ?? FONT_OPTIONS[0];
              void loadFont(next);
              setTokens({ fontClock: next.stack });
            }}
            className={FIELD}
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="clock-weight" className="text-xs text-white/75">
            Weight
          </label>
          <select
            id="clock-weight"
            value={tokens.clockWeight}
            onChange={(event) => setTokens({ clockWeight: Number(event.target.value) })}
            className={FIELD}
          >
            {[300, 400, 600, 700].map((weight) => (
              <option key={weight} value={weight}>
                {weight}
              </option>
            ))}
          </select>
        </div>
        <Range
          id="clock-scale"
          label="Size"
          unit="%"
          min={80}
          max={140}
          value={Math.round(tokens.clockScale * 100)}
          onChange={(value) => setTokens({ clockScale: value / 100 })}
        />
      </Section>

      <Section title="Background">
        <ColorField
          id="solid-color"
          label="Solid color"
          value={tokens.bgSolidColor}
          onChange={(bgSolidColor) =>
            onChange({ ...draft, presetId: undefined, tokens: { ...tokens, bgSolidColor }, wallpaperRef: { type: 'solid', idOrColor: bgSolidColor } })
          }
        />
        {/* AC-25.5: image adjustments are hidden for a solid color. */}
        {!isSolid && (
          <>
            <Range id="bg-dim" label="Dim" unit="%" min={0} max={80} value={tokens.bgDim} onChange={(bgDim) => setTokens({ bgDim })} />
            <Range id="bg-blur" label="Blur" unit="px" min={0} max={20} value={tokens.bgBlur} onChange={(bgBlur) => setTokens({ bgBlur })} />
            <Range
              id="bg-brightness"
              label="Brightness"
              unit="%"
              min={40}
              max={120}
              value={tokens.bgBrightness}
              onChange={(bgBrightness) => setTokens({ bgBrightness })}
            />
          </>
        )}
      </Section>

      <Section title="Effects">
        {EFFECTS.map(({ key, label }) => (
          <Range key={key} id={`effect-${key}`} label={label} unit="%" min={0} max={100} value={draft.effects[key]} onChange={(value) => setEffect(key, value)} />
        ))}
      </Section>

      <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-white/10 px-5 py-4" style={{ backgroundColor: 'var(--panel-bg)' }}>
        <div className="flex gap-2">
          <button
            type="button"
            data-testid="revert-btn"
            onClick={onRevert}
            disabled={!isDirty}
            className="flex-1 rounded-lg bg-white/10 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-40"
          >
            Revert
          </button>
          <button
            type="button"
            data-testid="apply-btn"
            onClick={onApply}
            disabled={!isDirty}
            className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-accent-contrast disabled:opacity-40"
          >
            Apply
          </button>
        </div>
        <form
          className="flex gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (name.trim() && (await onSaveAsNew(name.trim()))) setName('');
          }}
        >
          <label htmlFor="theme-name" className="sr-only">
            Theme name
          </label>
          <input
            id="theme-name"
            value={name}
            maxLength={50}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name this theme"
            className={`${FIELD} min-w-0 flex-1`}
          />
          <button type="submit" data-testid="save-theme-btn" disabled={!name.trim()} className="rounded-lg bg-white/10 px-3 text-sm text-white hover:bg-white/20 disabled:opacity-40">
            Save as New Theme
          </button>
        </form>
      </div>
    </div>
  );
};
