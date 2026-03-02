/**
 * TreeSliderRow - Parameter controls wired to HyperTreeParams sections
 * Mirrors RockSliderRow pattern for consistent architecture.
 */

import { Slider } from '@/components/ui/slider';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import type { HyperTreeParams } from '@/types/hyperParams';

interface TreeSliderRowProps {
  label: string;
  section: keyof HyperTreeParams;
  field: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  hint?: string;
}

export function TreeSliderRow({ label, section, field, value, min, max, step = 0.01, unit = '', format, hint }: TreeSliderRowProps) {
  const { setTreeParam } = useProVegLayout();
  const displayValue = format ? format(value) : value.toFixed(2);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="param-label">{label}</span>
        <span className="param-value">{displayValue}{unit}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => setTreeParam(section, field, v)}
        className="w-full"
      />
      {hint && <p className="text-[10px] text-muted-foreground -mt-0.5">{hint}</p>}
    </div>
  );
}

interface TreeColorRowProps {
  label: string;
  section: keyof HyperTreeParams;
  field: string;
  value: string;
}

export function TreeColorRow({ label, section, field, value }: TreeColorRowProps) {
  const { setTreeParam } = useProVegLayout();
  return (
    <div className="flex items-center justify-between">
      <span className="param-label">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => setTreeParam(section, field, e.target.value)}
          className="w-8 h-6 rounded cursor-pointer border border-border bg-transparent"
        />
      </div>
    </div>
  );
}

interface TreeSelectRowProps {
  label: string;
  section: keyof HyperTreeParams;
  field: string;
  value: string;
  options: { value: string; label: string }[];
}

export function TreeSelectRow({ label, section, field, value, options }: TreeSelectRowProps) {
  const { setTreeParam } = useProVegLayout();
  return (
    <div className="space-y-1.5">
      <span className="param-label">{label}</span>
      <select
        value={value}
        onChange={(e) => setTreeParam(section, field, e.target.value)}
        className="w-full h-8 px-2 text-sm bg-muted border border-border rounded text-foreground"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface TreeToggleRowProps {
  label: string;
  section: keyof HyperTreeParams;
  field: string;
  value: boolean;
}

export function TreeToggleRow({ label, section, field, value }: TreeToggleRowProps) {
  const { setTreeParam } = useProVegLayout();
  return (
    <div className="flex items-center justify-between">
      <span className="param-label">{label}</span>
      <button
        onClick={() => setTreeParam(section, field, !value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export function TreeSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3 mt-4 first:mt-0">
      {children}
    </h3>
  );
}
