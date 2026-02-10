/**
 * RockSliderRow - Parameter controls wired to HyperRockParams
 */

import { Slider } from '@/components/ui/slider';
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import type { HyperRockParams } from '@/types/rockParams';

interface RockSliderRowProps {
  label: string;
  section: keyof HyperRockParams;
  field: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
}

export function RockSliderRow({ label, section, field, value, min, max, step = 0.01, unit = '', format }: RockSliderRowProps) {
  const { setRockParam } = useProRockLayout();
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
        onValueChange={([v]) => setRockParam(section, field, v)}
        className="w-full"
      />
    </div>
  );
}

interface RockColorRowProps {
  label: string;
  section: keyof HyperRockParams;
  field: string;
  value: string;
}

export function RockColorRow({ label, section, field, value }: RockColorRowProps) {
  const { setRockParam } = useProRockLayout();
  return (
    <div className="flex items-center justify-between">
      <span className="param-label">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => setRockParam(section, field, e.target.value)}
          className="w-8 h-6 rounded cursor-pointer border border-border bg-transparent"
        />
      </div>
    </div>
  );
}

interface RockSelectRowProps {
  label: string;
  section: keyof HyperRockParams;
  field: string;
  value: string;
  options: { value: string; label: string }[];
}

export function RockSelectRow({ label, section, field, value, options }: RockSelectRowProps) {
  const { setRockParam } = useProRockLayout();
  return (
    <div className="space-y-1.5">
      <span className="param-label">{label}</span>
      <select
        value={value}
        onChange={(e) => setRockParam(section, field, e.target.value)}
        className="w-full h-8 px-2 text-sm bg-muted border border-border rounded text-foreground"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function RockSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3 mt-4 first:mt-0">
      {children}
    </h3>
  );
}
