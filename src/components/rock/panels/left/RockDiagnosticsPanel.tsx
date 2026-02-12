/**
 * Rock Left Diagnostics Panel - Expanded
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSectionTitle } from '../shared/RockSliderRow';

export default function RockDiagnosticsPanel() {
  const { rockParams, seed } = useProRockLayout();
  const tess = rockParams.shape.tessellation;
  const triCount = tess * tess * 2;

  return (
    <div className="space-y-3">
      <RockSectionTitle>Mesh Statistics</RockSectionTitle>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted rounded p-2">
          <span className="param-label">Triangles</span>
          <div className="text-primary font-mono mt-1">{triCount.toLocaleString()}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">Vertices</span>
          <div className="text-primary font-mono mt-1">{((tess+1)*(tess+1)).toLocaleString()}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">Rock Type</span>
          <div className="text-primary font-mono mt-1 capitalize">{rockParams.geology.rockType}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">Formation</span>
          <div className="text-primary font-mono mt-1 capitalize">{rockParams.geology.formationType}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">Seed</span>
          <div className="text-primary font-mono mt-1">{seed}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">LOD</span>
          <div className="text-primary font-mono mt-1 uppercase">{rockParams.lod.lodLevel}</div>
        </div>
      </div>

      <RockSectionTitle>Origin Class</RockSectionTitle>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted rounded p-2">
          <span className="param-label">Origin</span>
          <div className="text-primary font-mono mt-1 capitalize">{rockParams.origin.originClass}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">Cooling Rate</span>
          <div className="text-primary font-mono mt-1">{rockParams.origin.coolingRate.toFixed(2)}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">Grain Size</span>
          <div className="text-primary font-mono mt-1">{rockParams.internalStructure.grainSize.toFixed(2)}</div>
        </div>
        <div className="bg-muted rounded p-2">
          <span className="param-label">Age</span>
          <div className="text-primary font-mono mt-1">{rockParams.weathering.ageYears >= 1000 ? `${(rockParams.weathering.ageYears/1000).toFixed(0)}k` : rockParams.weathering.ageYears} yrs</div>
        </div>
      </div>

      <RockSectionTitle>Parameter Count</RockSectionTitle>
      <div className="bg-muted rounded p-2 text-xs">
        <div className="flex justify-between">
          <span className="param-label">Total Parameters</span>
          <span className="text-primary font-mono">200+</span>
        </div>
      </div>
    </div>
  );
}
