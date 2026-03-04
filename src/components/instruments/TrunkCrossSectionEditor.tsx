/**
 * OPUS INSTRUMENT: Trunk Cross-Section Editor
 * 
 * An SVG-based interactive editor showing the trunk's radial profile.
 * Drag control points to adjust ovality, fluting, twist, and bark thickness.
 * Direct spatial manipulation replaces abstract parameter sliders.
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';

interface ControlPoint {
  id: string;
  angle: number;
  radius: number;
  section: 'trunk' | 'roots';
  field: string;
  label: string;
}

const SVG_SIZE = 200;
const CENTER = SVG_SIZE / 2;
const MAX_VISUAL_R = 80;

export default function TrunkCrossSectionEditor() {
  const { treeParams, setTreeParam } = useProVegLayout();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const trunk = treeParams.trunk;
  const roots = treeParams.roots;

  // Generate cross-section path from parameters
  const crossSectionPath = useMemo(() => {
    const segments = 64;
    const points: [number, number][] = [];
    
    const baseR = MAX_VISUAL_R * 0.5;
    const ovality = trunk.ovality;
    const flutingStrength = roots.flutingEnabled ? roots.flutingStrength : 0;
    const flutingCount = roots.flutingCount;
    const flutingSharpness = roots.flutingSharpness;
    const twist = trunk.twist * Math.PI / 180;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const angle = t + twist * 0.1;
      
      // Base elliptical shape with ovality
      let r = baseR * (1 + ovality * Math.cos(2 * angle));
      
      // Fluting ridges
      if (flutingStrength > 0) {
        const fluteAngle = angle * flutingCount;
        const fluteWave = Math.pow(Math.abs(Math.cos(fluteAngle)), flutingSharpness);
        r += baseR * flutingStrength * fluteWave;
      }
      
      const x = CENTER + r * Math.cos(angle);
      const y = CENTER + r * Math.sin(angle);
      points.push([x, y]);
    }

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
  }, [trunk.ovality, trunk.twist, roots.flutingEnabled, roots.flutingStrength, roots.flutingCount, roots.flutingSharpness]);

  // Bark thickness ring
  const barkPath = useMemo(() => {
    const segments = 64;
    const barkThickness = treeParams.bark.totalThickness * 800; // Visual scale
    const baseR = MAX_VISUAL_R * 0.5;
    const outerPoints: [number, number][] = [];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      let r = baseR * (1 + trunk.ovality * Math.cos(2 * t));
      if (roots.flutingEnabled && roots.flutingStrength > 0) {
        r += baseR * roots.flutingStrength * Math.pow(Math.abs(Math.cos(t * roots.flutingCount)), roots.flutingSharpness);
      }
      r += barkThickness;
      outerPoints.push([CENTER + r * Math.cos(t), CENTER + r * Math.sin(t)]);
    }

    return outerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
  }, [trunk.ovality, roots.flutingEnabled, roots.flutingStrength, roots.flutingCount, roots.flutingSharpness, treeParams.bark.totalThickness]);

  // Control points
  const controlPoints: ControlPoint[] = useMemo(() => [
    { id: 'ovality-x', angle: 0, radius: MAX_VISUAL_R * 0.5 * (1 + trunk.ovality), section: 'trunk', field: 'ovality', label: 'Ovality' },
    { id: 'ovality-y', angle: Math.PI / 2, radius: MAX_VISUAL_R * 0.5 * (1 - trunk.ovality), section: 'trunk', field: 'ovality', label: 'Ovality' },
    { id: 'fluting', angle: Math.PI / roots.flutingCount, radius: MAX_VISUAL_R * 0.5 + MAX_VISUAL_R * 0.5 * roots.flutingStrength, section: 'roots', field: 'flutingStrength', label: 'Fluting' },
  ], [trunk.ovality, roots.flutingStrength, roots.flutingCount]);

  const handlePointerDown = useCallback((id: string, e: React.PointerEvent) => {
    setDragging(id);
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scale = SVG_SIZE / rect.width;
    const sx = (x * scale) - CENTER;
    const sy = (y * scale) - CENTER;
    const dist = Math.sqrt(sx * sx + sy * sy);

    const baseR = MAX_VISUAL_R * 0.5;

    if (dragging === 'ovality-x' || dragging === 'ovality-y') {
      const newOvality = Math.max(0, Math.min(0.4, (dist - baseR) / baseR));
      setTreeParam('trunk', 'ovality', newOvality);
    } else if (dragging === 'fluting') {
      const newStrength = Math.max(0, Math.min(0.5, (dist - baseR) / baseR));
      setTreeParam('roots', 'flutingStrength', newStrength);
    }
  }, [dragging, setTreeParam]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  return (
    <div className="space-y-2">
      <div className="glass-panel rounded-lg p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full aspect-square cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Grid rings */}
          {[20, 40, 60, 80].map(r => (
            <circle key={r} cx={CENTER} cy={CENTER} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.3} />
          ))}
          {/* Axis lines */}
          <line x1={CENTER} y1={0} x2={CENTER} y2={SVG_SIZE} stroke="hsl(var(--border))" strokeWidth={0.3} opacity={0.3} />
          <line x1={0} y1={CENTER} x2={SVG_SIZE} y2={CENTER} stroke="hsl(var(--border))" strokeWidth={0.3} opacity={0.3} />

          {/* Bark ring */}
          <path d={barkPath} fill="none" stroke="hsl(var(--species-oak))" strokeWidth={1.5} opacity={0.4} />

          {/* Cross-section fill */}
          <path d={crossSectionPath} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={1.5} />

          {/* Center dot */}
          <circle cx={CENTER} cy={CENTER} r={2} fill="hsl(var(--primary))" />

          {/* Control points */}
          {controlPoints.map(cp => {
            const x = CENTER + cp.radius * Math.cos(cp.angle);
            const y = CENTER + cp.radius * Math.sin(cp.angle);
            const isActive = dragging === cp.id;
            const isHovered = hovered === cp.id;

            return (
              <g key={cp.id}>
                {/* Hit area */}
                <circle
                  cx={x} cy={y} r={8}
                  fill="transparent"
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => handlePointerDown(cp.id, e)}
                  onPointerEnter={() => setHovered(cp.id)}
                  onPointerLeave={() => setHovered(null)}
                />
                {/* Visual dot */}
                <circle
                  cx={x} cy={y}
                  r={isActive ? 5 : isHovered ? 4 : 3}
                  fill={isActive ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth={1}
                  className="pointer-events-none transition-all"
                />
                {/* Label */}
                {(isHovered || isActive) && (
                  <text
                    x={x} y={y - 10}
                    textAnchor="middle"
                    fontSize={8}
                    fill="hsl(var(--foreground))"
                    className="pointer-events-none"
                  >
                    {cp.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Readout */}
      <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center">
        <div>
          <div className="text-muted-foreground">Ovality</div>
          <div className="text-primary">{(trunk.ovality * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Twist</div>
          <div className="text-primary">{trunk.twist.toFixed(1)}°</div>
        </div>
        <div>
          <div className="text-muted-foreground">Fluting</div>
          <div className="text-primary">{(roots.flutingStrength * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
