/**
 * OPUS INSTRUMENT: Wind Rose
 * 
 * A radial dial for wind direction + Beaufort scale. 
 * Drag the needle to set direction, drag the ring edge to set intensity.
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { getWindName, BEAUFORT_SPEEDS } from '@/types/hyperParams';

const SIZE = 160;
const CENTER = SIZE / 2;
const OUTER_R = 65;
const INNER_R = 20;

export default function WindRoseDial() {
  const { treeParams, setTreeParam } = useProVegLayout();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragMode, setDragMode] = useState<'direction' | 'intensity' | null>(null);

  const wind = treeParams.wind;
  const direction = wind.direction; // radians
  const beaufort = wind.beaufortScale;
  const normalizedIntensity = beaufort / 12;

  const angleFromEvent = useCallback((e: React.PointerEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const x = (e.clientX - rect.left) * scale - CENTER;
    const y = (e.clientY - rect.top) * scale - CENTER;
    return Math.atan2(y, x);
  }, []);

  const distFromCenter = useCallback((e: React.PointerEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const x = (e.clientX - rect.left) * scale - CENTER;
    const y = (e.clientY - rect.top) * scale - CENTER;
    return Math.sqrt(x * x + y * y);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const dist = distFromCenter(e);
    if (dist > OUTER_R - 10 && dist < OUTER_R + 10) {
      setDragMode('intensity');
    } else {
      setDragMode('direction');
    }
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    
    const angle = angleFromEvent(e);
    if (dist <= OUTER_R - 10) {
      setTreeParam('wind', 'direction', angle);
    }
  }, [angleFromEvent, distFromCenter, setTreeParam]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragMode) return;
    if (dragMode === 'direction') {
      setTreeParam('wind', 'direction', angleFromEvent(e));
    } else {
      const dist = distFromCenter(e);
      const newBeaufort = Math.max(0, Math.min(12, Math.round((dist / OUTER_R) * 12)));
      setTreeParam('wind', 'beaufortScale', newBeaufort);
    }
  }, [dragMode, angleFromEvent, distFromCenter, setTreeParam]);

  const handlePointerUp = useCallback(() => {
    setDragMode(null);
  }, []);

  // Direction needle
  const needleX = CENTER + Math.cos(direction) * (OUTER_R - 8);
  const needleY = CENTER + Math.sin(direction) * (OUTER_R - 8);

  // Beaufort ring segments
  const beaufortArc = useMemo(() => {
    const ringR = OUTER_R;
    const endAngle = (beaufort / 12) * Math.PI * 2 - Math.PI / 2;
    const startAngle = -Math.PI / 2;
    const largeArc = beaufort > 6 ? 1 : 0;
    const x1 = CENTER + ringR * Math.cos(startAngle);
    const y1 = CENTER + ringR * Math.sin(startAngle);
    const x2 = CENTER + ringR * Math.cos(endAngle);
    const y2 = CENTER + ringR * Math.sin(endAngle);
    return `M${x1},${y1} A${ringR},${ringR} 0 ${largeArc} 1 ${x2},${y2}`;
  }, [beaufort]);

  const windName = getWindName(beaufort);
  const windSpeed = BEAUFORT_SPEEDS[Math.round(beaufort)] || 0;

  return (
    <div className="space-y-2">
      <div className="glass-panel rounded-lg p-2 flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-32 h-32 cursor-crosshair select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Background ring */}
          <circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
          
          {/* Beaufort arc */}
          {beaufort > 0 && (
            <path d={beaufortArc} fill="none" stroke="hsl(var(--wind-gust))" strokeWidth={4} strokeLinecap="round" />
          )}

          {/* Cardinal directions */}
          {['N', 'E', 'S', 'W'].map((label, i) => {
            const a = (i * Math.PI / 2) - Math.PI / 2;
            const x = CENTER + (OUTER_R + 8) * Math.cos(a);
            const y = CENTER + (OUTER_R + 8) * Math.sin(a);
            return (
              <text key={label} x={x} y={y + 3} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))" className="pointer-events-none">
                {label}
              </text>
            );
          })}

          {/* Inner circle */}
          <circle cx={CENTER} cy={CENTER} r={INNER_R} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={0.5} />

          {/* Direction needle */}
          <line
            x1={CENTER} y1={CENTER}
            x2={needleX} y2={needleY}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={needleX} cy={needleY} r={3} fill="hsl(var(--primary))" />

          {/* Center label */}
          <text x={CENTER} y={CENTER + 3} textAnchor="middle" fontSize={8} fill="hsl(var(--foreground))" fontWeight="bold" className="pointer-events-none">
            B{beaufort}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-center">
        <div>
          <div className="text-muted-foreground">Wind</div>
          <div className="text-primary">{windName}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Speed</div>
          <div className="text-primary">{windSpeed.toFixed(1)} m/s</div>
        </div>
      </div>
    </div>
  );
}
