/**
 * Rock Left Diagnostics Panel
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
    </div>
  );
}
