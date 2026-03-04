/**
 * OPUS INSTRUMENT: Growth Timeline Scrubber
 * 
 * A visual timeline where dragging across growth stages shows real-time
 * tree evolution from seed to ancient. Replaces the age slider with
 * a kinesthetic, spatial instrument.
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { GROWTH_STAGES, interpolateGrowthStage, type GrowthStageName } from '@/types/hyperParams';

const STAGE_COLORS: Record<GrowthStageName, string> = {
  SEED: 'hsl(var(--species-pine))',
  SEEDLING: 'hsl(var(--lod-near))',
  SAPLING: 'hsl(var(--primary))',
  POLE: 'hsl(var(--accent))',
  MATURE: 'hsl(var(--lod-mid))',
  OVERMATURE: 'hsl(var(--lod-far))',
  ANCIENT: 'hsl(var(--lod-ultra))',
};

// Simplified tree silhouette for each stage
const TREE_SHAPES: Record<GrowthStageName, (cx: number, h: number) => string> = {
  SEED: (cx, h) => `M${cx},${h-2} L${cx-1},${h} L${cx+1},${h} Z`,
  SEEDLING: (cx, h) => `M${cx},${h-8} Q${cx-2},${h-4} ${cx-3},${h} L${cx+3},${h} Q${cx+2},${h-4} ${cx},${h-8} Z`,
  SAPLING: (cx, h) => `M${cx},${h-16} Q${cx-4},${h-8} ${cx-5},${h} L${cx+5},${h} Q${cx+4},${h-8} ${cx},${h-16} Z`,
  POLE: (cx, h) => `M${cx},${h-22} Q${cx-5},${h-12} ${cx-6},${h} L${cx+6},${h} Q${cx+5},${h-12} ${cx},${h-22} Z`,
  MATURE: (cx, h) => `M${cx},${h-26} Q${cx-10},${h-16} ${cx-8},${h} L${cx+8},${h} Q${cx+10},${h-16} ${cx},${h-26} Z`,
  OVERMATURE: (cx, h) => `M${cx},${h-24} Q${cx-12},${h-14} ${cx-9},${h} L${cx+9},${h} Q${cx+12},${h-14} ${cx},${h-24} Z`,
  ANCIENT: (cx, h) => `M${cx-1},${h-20} Q${cx-14},${h-12} ${cx-10},${h} L${cx+10},${h} Q${cx+14},${h-12} ${cx+1},${h-20} Z`,
};

export default function GrowthTimelineScrubber() {
  const { treeParams, setTreeParam } = useProVegLayout();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverAge, setHoverAge] = useState<number | null>(null);
  
  const age = treeParams.growth.age;
  const stage = interpolateGrowthStage(age);

  const ageFromX = useCallback((clientX: number) => {
    if (!containerRef.current) return age;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return x;
  }, [age]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const newAge = ageFromX(e.clientX);
    setTreeParam('growth', 'age', newAge);
  }, [ageFromX, setTreeParam]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const newAge = ageFromX(e.clientX);
    if (dragging) {
      setTreeParam('growth', 'age', newAge);
    }
    setHoverAge(newAge);
  }, [dragging, ageFromX, setTreeParam]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHoverAge(null);
  }, []);

  const displayAge = hoverAge !== null ? hoverAge : age;
  const displayStage = interpolateGrowthStage(displayAge);

  return (
    <div className="space-y-2">
      {/* Timeline track */}
      <div
        ref={containerRef}
        className="relative h-32 rounded-lg overflow-hidden cursor-crosshair select-none"
        style={{ background: 'hsl(var(--muted))' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* Stage segments background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          {GROWTH_STAGES.map((s, i) => {
            const x1 = s.ageRange[0] * 400;
            const x2 = s.ageRange[1] * 400;
            return (
              <rect
                key={s.name}
                x={x1} y={0}
                width={x2 - x1} height={100}
                fill={STAGE_COLORS[s.name]}
                opacity={0.08 + (i * 0.03)}
              />
            );
          })}
        </svg>

        {/* Tree silhouettes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          {GROWTH_STAGES.map((s) => {
            const cx = ((s.ageRange[0] + s.ageRange[1]) / 2) * 400;
            const shapeFn = TREE_SHAPES[s.name];
            return (
              <path
                key={s.name}
                d={shapeFn(cx, 98)}
                fill={STAGE_COLORS[s.name]}
                opacity={0.25}
              />
            );
          })}
        </svg>

        {/* Playhead */}
        <div
          className="absolute top-0 h-full w-0.5 transition-transform"
          style={{
            left: `${age * 100}%`,
            background: 'hsl(var(--primary))',
            boxShadow: '0 0 8px hsl(var(--glow-primary))',
            transition: dragging ? 'none' : 'left 0.1s ease-out',
          }}
        >
          {/* Playhead diamond */}
          <div className="absolute -top-1 -left-1.5 w-3 h-3 rotate-45 bg-primary border border-primary-foreground/30" />
        </div>

        {/* Hover indicator */}
        {hoverAge !== null && !dragging && (
          <div
            className="absolute top-0 h-full w-px bg-foreground/20"
            style={{ left: `${hoverAge * 100}%` }}
          />
        )}

        {/* Stage labels */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {GROWTH_STAGES.map((s) => {
            const left = ((s.ageRange[0] + s.ageRange[1]) / 2) * 100;
            const isCurrentStage = s.name === stage.name;
            return (
              <div
                key={s.name}
                className="absolute -translate-x-1/2 text-center"
                style={{ left: `${left}%`, bottom: 2 }}
              >
                <span className={`text-[8px] font-mono uppercase ${isCurrentStage ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {s.name.slice(0, 4)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats readout */}
      <div className="glass-panel rounded p-2 grid grid-cols-4 gap-1 text-[9px] font-mono">
        <div className="text-center">
          <div className="text-muted-foreground">Stage</div>
          <div className="text-primary font-bold">{displayStage.name}</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Height×</div>
          <div className="text-foreground">{displayStage.heightMultiplier.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Branch×</div>
          <div className="text-foreground">{displayStage.branchCountMultiplier.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Crown</div>
          <div className="text-foreground capitalize">{displayStage.crownShape}</div>
        </div>
      </div>
    </div>
  );
}
