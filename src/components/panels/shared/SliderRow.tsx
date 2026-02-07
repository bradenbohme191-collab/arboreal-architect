/**
 * CODEX5.3TREES - Slider Row Component
 * 
 * Reusable slider with label and value display for parameter editing.
 */

import { Slider } from '@/components/ui/slider';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  keyPrimary: string;
  keyAlt?: string;
  format?: (value: number) => string;
  unit?: string;
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 0.01,
  keyPrimary,
  keyAlt,
  format,
  unit = '',
}: SliderRowProps) {
  const { setTreeParam } = useProVegLayout();

  const handleChange = (values: number[]) => {
    const v = values[0];
    setTreeParam(keyPrimary, v);
    if (keyAlt) {
      setTreeParam(keyAlt, v);
    }
  };

  const displayValue = format ? format(value) : value.toFixed(2);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="param-label">{label}</span>
        <span className="param-value">
          {displayValue}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
        className="w-full"
      />
    </div>
  );
}

interface ColorRowProps {
  label: string;
  value: string;
  keyPrimary: string;
  keyAlt?: string;
}

export function ColorRow({ label, value, keyPrimary, keyAlt }: ColorRowProps) {
  const { setTreeParam } = useProVegLayout();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTreeParam(keyPrimary, v);
    if (keyAlt) {
      setTreeParam(keyAlt, v);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span className="param-label">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase">{value}</span>
        <input
          type="color"
          value={value}
          onChange={handleChange}
          className="w-8 h-6 rounded cursor-pointer border border-border bg-transparent"
        />
      </div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  keyPrimary: string;
  keyAlt?: string;
}

export function ToggleRow({ label, value, keyPrimary, keyAlt }: ToggleRowProps) {
  const { setTreeParam } = useProVegLayout();

  const handleChange = () => {
    const v = !value;
    setTreeParam(keyPrimary, v);
    if (keyAlt) {
      setTreeParam(keyAlt, v);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span className="param-label">{label}</span>
      <button
        onClick={handleChange}
        className={`w-10 h-5 rounded-full transition-colors relative ${
          value ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

interface SelectRowProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  keyPrimary: string;
  keyAlt?: string;
}

export function SelectRow({ label, value, options, keyPrimary, keyAlt }: SelectRowProps) {
  const { setTreeParam } = useProVegLayout();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setTreeParam(keyPrimary, v);
    if (keyAlt) {
      setTreeParam(keyAlt, v);
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="param-label">{label}</span>
      <select
        value={value}
        onChange={handleChange}
        className="w-full h-8 px-2 text-sm bg-muted border border-border rounded text-foreground"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3 mt-4 first:mt-0">
      {children}
    </h3>
  );
}
