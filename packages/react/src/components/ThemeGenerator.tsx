import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GenerateThemeRequest } from '@dheme/sdk';
import { useThemeActions } from '../hooks/useThemeActions';
import { useDebounce } from '../hooks/useDebounce';

// ─── Icons (inline SVG — no lucide-react dependency) ──────────────────────────

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function RotateCcwIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

// ─── Minimal HexColorPicker ────────────────────────────────────────────────────

interface HexColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

function HexColorPicker({ color, onChange }: HexColorPickerProps) {
  // Convert hex to HSV for the gradient picker
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
  };

  const hsvToHex = (h: number, s: number, v: number) => {
    s /= 100;
    v /= 100;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = 0,
      g = 0,
      b = 0;
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }
    return (
      '#' +
      [r, g, b]
        .map((x) =>
          Math.round(x * 255)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
    );
  };

  const rgb = hexToRgb(color);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const isDraggingGradient = useRef(false);
  const isDraggingHue = useRef(false);

  const handleGradientPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = gradientRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      onChange(hsvToHex(hsv.h, x * 100, (1 - y) * 100));
    },
    [hsv.h, onChange]
  );

  const handleHuePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = hueRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onChange(hsvToHex(x * 360, hsv.s, hsv.v));
    },
    [hsv.s, hsv.v, onChange]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', userSelect: 'none' }}>
      {/* Gradient box */}
      <div
        ref={gradientRef}
        style={{
          position: 'relative',
          height: '120px',
          borderRadius: '6px',
          cursor: 'crosshair',
          background: `linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
          touchAction: 'none',
        }}
        onPointerDown={(e) => {
          isDraggingGradient.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          handleGradientPointer(e);
        }}
        onPointerMove={(e) => {
          if (isDraggingGradient.current) handleGradientPointer(e);
        }}
        onPointerUp={() => {
          isDraggingGradient.current = false;
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '6px',
            background: 'linear-gradient(to top, #000, transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        style={{
          position: 'relative',
          height: '12px',
          borderRadius: '6px',
          cursor: 'pointer',
          background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
          touchAction: 'none',
        }}
        onPointerDown={(e) => {
          isDraggingHue.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          handleHuePointer(e);
        }}
        onPointerMove={(e) => {
          if (isDraggingHue.current) handleHuePointer(e);
        }}
        onPointerUp={() => {
          isDraggingHue.current = false;
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${(hsv.h / 360) * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
            background: `hsl(${hsv.h}, 100%, 50%)`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'hsl(var(--muted-foreground))',
        marginBottom: '10px',
      }}
    >
      {children}
    </div>
  );
}

interface ColorRowProps {
  label: string;
  badge?: string;
  color: string;
  disabled?: boolean;
  onColorChange: (c: string) => void;
  onInputChange: (v: string) => void;
  actionButton?: React.ReactNode;
}

function ColorRow({
  label,
  badge,
  color,
  disabled,
  onColorChange,
  onInputChange,
  actionButton,
}: ColorRowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hex = color.replace('#', '').toUpperCase();

  return (
    <div style={{ marginBottom: '10px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'hsl(var(--foreground))' }}>
            {label}
          </span>
          {badge && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '1px 5px',
                borderRadius: '99px',
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {actionButton}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Color swatch — opens picker */}
        <button
          onClick={() => !disabled && setPickerOpen((p) => !p)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid hsl(var(--border))',
            background: disabled ? 'hsl(var(--muted))' : color,
            cursor: disabled ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            opacity: disabled ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        />

        {/* Hex input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            overflow: 'hidden',
            background: disabled ? 'hsl(var(--muted))' : 'hsl(var(--background))',
            flex: 1,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span
            style={{
              padding: '0 8px',
              fontSize: '12px',
              color: 'hsl(var(--muted-foreground))',
              fontFamily: 'monospace',
            }}
          >
            #
          </span>
          <input
            type="text"
            value={hex}
            disabled={disabled}
            maxLength={6}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9a-fA-F]/g, '');
              onInputChange(v);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 500,
              color: 'hsl(var(--foreground))',
              width: '100%',
              padding: '7px 8px 7px 0',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
        </div>
      </div>

      {/* Color picker popover */}
      {pickerOpen && !disabled && (
        <div
          style={{
            marginTop: '8px',
            padding: '10px',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <HexColorPicker color={color} onChange={onColorChange} />
        </div>
      )}
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number[];
  onChange: (v: number[]) => void;
  min: number;
  max: number;
  step: number;
  display: (v: number) => string;
}

function SliderRow({ label, value, onChange, min, max, step, display }: SliderRowProps) {
  const pct = ((value[0] - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{ fontSize: '12px', color: 'hsl(var(--foreground))', minWidth: '70px' }}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onChange([Number(e.target.value)])}
        style={{
          flex: 1,
          height: '4px',
          appearance: 'none',
          WebkitAppearance: 'none',
          background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
          borderRadius: '2px',
          cursor: 'pointer',
          outline: 'none',
        }}
      />
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 500,
          color: 'hsl(var(--muted-foreground))',
          minWidth: '48px',
          textAlign: 'right',
        }}
      >
        {display(value[0])}
      </span>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}
    >
      <span style={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: '36px',
          height: '20px',
          borderRadius: '10px',
          background: checked ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '18px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'white',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

// ─── cn helper (no clsx dependency) ───────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── ThemeGeneratorProps ───────────────────────────────────────────────────────

export interface ThemeGeneratorProps {
  defaultTheme?: string;
  defaultSecondaryColor?: string;
  defaultSaturation?: number;
  defaultLightness?: number;
  defaultRadius?: number;
  position?: 'bottom-right' | 'bottom-left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: {
    title?: string;
    description?: string;
    baseColors?: string;
    primary?: string;
    secondary?: string;
    optional?: string;
    fineTuning?: string;
    saturation?: string;
    lightness?: string;
    borderRadius?: string;
    advancedOptions?: string;
    colorfulCard?: string;
    colorfulBackground?: string;
    colorfulBorder?: string;
    reset?: string;
    fabPrimaryLabel?: string;
  };
  className?: string;
}

// ─── ThemeGenerator ────────────────────────────────────────────────────────────

export function ThemeGenerator({
  defaultTheme = '#4332f6',
  defaultSecondaryColor = '#ab67f1',
  defaultSaturation = 10,
  defaultLightness = 2,
  defaultRadius = 0,
  position = 'bottom-right',
  open: controlledOpen,
  onOpenChange,
  labels: labelsProp,
  className,
}: ThemeGeneratorProps): React.ReactElement {
  const { generateTheme } = useThemeActions();

  const labels = {
    title: 'Theme Generator',
    description: 'Generate complete themes from a single color. Changes apply in real time.',
    baseColors: 'Base Colors',
    primary: 'Primary',
    secondary: 'Secondary',
    optional: 'Optional',
    fineTuning: 'Fine Tuning',
    saturation: 'Saturation',
    lightness: 'Lightness',
    borderRadius: 'Border Radius',
    advancedOptions: 'Advanced Options',
    colorfulCard: 'Colorful Card',
    colorfulBackground: 'Colorful Background',
    colorfulBorder: 'Colorful Border',
    reset: 'Reset',
    fabPrimaryLabel: 'Primary',
    ...labelsProp,
  };

  // ── Open state (controlled or uncontrolled) ────────────────────────────────
  const [internalOpen, setInternalOpen] = useState(controlledOpen ?? false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  // ── Local state (source of truth for controls) ─────────────────────────────
  const [localPrimary, setLocalPrimary] = useState(defaultTheme);
  const [localSecondary, setLocalSecondary] = useState(defaultSecondaryColor);
  const [isSecondaryEnabled, setIsSecondaryEnabled] = useState(false);
  const [localSaturation, setLocalSaturation] = useState([defaultSaturation]);
  const [localLightness, setLocalLightness] = useState([defaultLightness]);
  const [localRadius, setLocalRadius] = useState([defaultRadius]);
  const [localCardIsColored, setLocalCardIsColored] = useState(false);
  const [localBackgroundIsColored, setLocalBackgroundIsColored] = useState(false);
  const [localBorderIsColored, setLocalBorderIsColored] = useState(false);

  // ── paramsRef — always-fresh params, avoids stale closure in debounce effects
  const paramsRef = useRef<GenerateThemeRequest>({
    theme: localPrimary,
    secondaryColor: isSecondaryEnabled ? localSecondary : undefined,
    saturationAdjust: localSaturation[0],
    lightnessAdjust: localLightness[0],
    radius: localRadius[0],
    cardIsColored: localCardIsColored,
    backgroundIsColored: localBackgroundIsColored,
    borderIsColored: localBorderIsColored,
  });

  // Runs on every render, before effects — keeps paramsRef in sync
  useEffect(() => {
    paramsRef.current = {
      theme: localPrimary,
      secondaryColor: isSecondaryEnabled ? localSecondary : undefined,
      saturationAdjust: localSaturation[0],
      lightnessAdjust: localLightness[0],
      radius: localRadius[0],
      cardIsColored: localCardIsColored,
      backgroundIsColored: localBackgroundIsColored,
      borderIsColored: localBorderIsColored,
    };
  });

  // ── Debounced values ───────────────────────────────────────────────────────
  const debouncedPrimary = useDebounce(localPrimary, 150);
  const debouncedSecondary = useDebounce(localSecondary, 150);
  const debouncedSaturation = useDebounce(localSaturation[0], 200);
  const debouncedLightness = useDebounce(localLightness[0], 200);
  const debouncedRadius = useDebounce(localRadius[0], 200);

  // ── Debounced effects ──────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateTheme(paramsRef.current);
  }, [debouncedPrimary]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isSecondaryEnabled) generateTheme(paramsRef.current);
  }, [debouncedSecondary]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateTheme(paramsRef.current);
  }, [debouncedSaturation]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateTheme(paramsRef.current);
  }, [debouncedLightness]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateTheme(paramsRef.current);
  }, [debouncedRadius]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleEnableSecondary = () => {
    setIsSecondaryEnabled(true);
    generateTheme({ ...paramsRef.current, secondaryColor: localSecondary });
  };

  const handleDisableSecondary = () => {
    setIsSecondaryEnabled(false);
    generateTheme({ ...paramsRef.current, secondaryColor: undefined });
  };

  const handleToggle = (
    key: 'cardIsColored' | 'backgroundIsColored' | 'borderIsColored',
    value: boolean
  ) => {
    if (key === 'cardIsColored') setLocalCardIsColored(value);
    if (key === 'backgroundIsColored') setLocalBackgroundIsColored(value);
    if (key === 'borderIsColored') setLocalBorderIsColored(value);
    generateTheme({ ...paramsRef.current, [key]: value });
  };

  const handleReset = () => {
    setLocalPrimary(defaultTheme);
    setLocalSecondary(defaultSecondaryColor);
    setLocalSaturation([defaultSaturation]);
    setLocalLightness([defaultLightness]);
    setLocalRadius([defaultRadius]);
    setIsSecondaryEnabled(false);
    setLocalCardIsColored(false);
    setLocalBackgroundIsColored(false);
    setLocalBorderIsColored(false);
    generateTheme({
      theme: defaultTheme,
      saturationAdjust: defaultSaturation,
      lightnessAdjust: defaultLightness,
      radius: defaultRadius,
      cardIsColored: false,
      backgroundIsColored: false,
      borderIsColored: false,
    });
  };

  // ── Position styles ────────────────────────────────────────────────────────
  const positionStyle: React.CSSProperties =
    position === 'bottom-left'
      ? { bottom: '24px', left: '24px', alignItems: 'flex-start' }
      : { bottom: '24px', right: '24px', alignItems: 'flex-end' };

  const panelOrigin = position === 'bottom-left' ? 'bottom left' : 'bottom right';
  const panelPosition: React.CSSProperties =
    position === 'bottom-left' ? { bottom: 0, left: 0 } : { bottom: 0, right: 0 };

  // ── Slider thumb styles (injected once) ───────────────────────────────────
  const styleId = 'dheme-slider-styles';
  if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      input[type=range].dheme-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px; height: 14px;
        border-radius: 50%;
        background: hsl(var(--primary, 221.2 83.2% 53.3%));
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
        cursor: pointer;
      }
      input[type=range].dheme-slider::-moz-range-thumb {
        width: 14px; height: 14px;
        border-radius: 50%;
        background: hsl(var(--primary, 221.2 83.2% 53.3%));
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <>
      {/* Fixed container */}
      <div
        className={cn(className)}
        style={{
          position: 'fixed',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          ...positionStyle,
        }}
      >
        {/* ── Expanded panel ─────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            ...panelPosition,
            width: isOpen ? '340px' : '180px',
            height: isOpen ? 'auto' : '56px',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(32px)',
            pointerEvents: isOpen ? 'auto' : 'none',
            transformOrigin: panelOrigin,
            transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
            borderRadius: '12px',
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--card))',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid hsl(var(--border))',
              background: 'hsl(var(--muted) / 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SparklesIcon className="dheme-sparkles" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                {labels.title}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: 'hsl(var(--muted-foreground))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
              }}
            >
              <XIcon />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto',
              background: 'hsl(var(--background))',
            }}
          >
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <p
                style={{
                  fontSize: '11px',
                  color: 'hsl(var(--muted-foreground))',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {labels.description}
              </p>

              {/* Section 1: Base Colors */}
              <section>
                <SectionHeading>{labels.baseColors}</SectionHeading>
                <ColorRow
                  label={labels.primary}
                  color={localPrimary}
                  onColorChange={setLocalPrimary}
                  onInputChange={(v) => {
                    if (v.length === 6) setLocalPrimary(`#${v}`);
                  }}
                />
                <ColorRow
                  label={labels.secondary}
                  badge={labels.optional}
                  color={localSecondary}
                  disabled={!isSecondaryEnabled}
                  onColorChange={(c) => {
                    if (isSecondaryEnabled) setLocalSecondary(c);
                  }}
                  onInputChange={(v) => {
                    if (isSecondaryEnabled && v.length === 6) setLocalSecondary(`#${v}`);
                  }}
                  actionButton={
                    <button
                      onClick={isSecondaryEnabled ? handleDisableSecondary : handleEnableSecondary}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: 'hsl(var(--muted-foreground))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                      }}
                    >
                      {isSecondaryEnabled ? <XIcon /> : <PlusIcon />}
                    </button>
                  }
                />
              </section>

              {/* Section 2: Fine Tuning */}
              <section>
                <SectionHeading>{labels.fineTuning}</SectionHeading>
                <SliderRow
                  label={labels.saturation}
                  value={localSaturation}
                  onChange={setLocalSaturation}
                  min={-100}
                  max={100}
                  step={1}
                  display={(v) => `${v > 0 ? '+' : ''}${v}%`}
                />
                <SliderRow
                  label={labels.lightness}
                  value={localLightness}
                  onChange={setLocalLightness}
                  min={-100}
                  max={100}
                  step={1}
                  display={(v) => `${v > 0 ? '+' : ''}${v}%`}
                />
                <SliderRow
                  label={labels.borderRadius}
                  value={localRadius}
                  onChange={setLocalRadius}
                  min={0}
                  max={2}
                  step={0.1}
                  display={(v) => `${v.toFixed(1)}rem`}
                />
              </section>

              {/* Section 3: Advanced Options */}
              <section>
                <SectionHeading>{labels.advancedOptions}</SectionHeading>
                <ToggleRow
                  label={labels.colorfulCard}
                  checked={localCardIsColored}
                  onChange={(v) => handleToggle('cardIsColored', v)}
                />
                <ToggleRow
                  label={labels.colorfulBackground}
                  checked={localBackgroundIsColored}
                  onChange={(v) => handleToggle('backgroundIsColored', v)}
                />
                <ToggleRow
                  label={labels.colorfulBorder}
                  checked={localBorderIsColored}
                  onChange={(v) => handleToggle('borderIsColored', v)}
                />
              </section>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid hsl(var(--border))',
              background: 'hsl(var(--muted) / 0.2)',
            }}
          >
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                height: '32px',
                background: 'none',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--muted))';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
              }}
            >
              <RotateCcwIcon />
              {labels.reset}
            </button>
          </div>
        </div>

        {/* ── FAB (pill) ──────────────────────────────────────────────────── */}
        <div
          onClick={() => setIsOpen(true)}
          style={{
            width: isOpen ? '56px' : '180px',
            height: '56px',
            borderRadius: '99px',
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--card))',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            cursor: isOpen ? 'default' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'scale(0.5) translateY(16px)' : 'scale(1) translateY(0)',
            pointerEvents: isOpen ? 'none' : 'auto',
            transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px 0 12px',
            }}
          >
            {/* Primary color dot */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: localPrimary,
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 0 0 2px hsl(var(--background))',
                flexShrink: 0,
              }}
            />

            {/* Label + stats */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flex: 1,
                padding: '0 8px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'hsl(var(--foreground))',
                }}
              >
                {labels.fabPrimaryLabel}
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                <span>
                  S:{localSaturation[0] > 0 ? '+' : ''}
                  {localSaturation[0]}%
                </span>
                <span>
                  L:{localLightness[0] > 0 ? '+' : ''}
                  {localLightness[0]}%
                </span>
              </div>
            </div>

            {/* Chevron button */}
            <div
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'hsl(var(--muted) / 0.5)',
                flexShrink: 0,
              }}
            >
              <ChevronUpIcon />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
