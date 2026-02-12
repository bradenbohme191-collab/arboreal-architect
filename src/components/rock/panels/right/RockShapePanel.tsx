/**
 * Rock Shape & LOD Panel - Expanded with elongation, concavity, pinnacles, hollowness
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSectionTitle } from '../shared/RockSliderRow';

export default function RockShapePanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const sh = rockParams.shape;
  const lod = rockParams.lod;

  if (subTab === 'silhouette') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Silhouette</RockSectionTitle>
        <RockSliderRow label="Roundness" section="shape" field="roundness" value={sh.roundness} min={0} max={1} />
        <RockSliderRow label="Angularity" section="shape" field="angularity" value={sh.angularity} min={0} max={1} />
        <RockSliderRow label="Asymmetry" section="shape" field="asymmetry" value={sh.asymmetry} min={0} max={1} />
        <RockSliderRow label="Sphericity" section="shape" field="sphericity" value={sh.sphericity} min={0} max={1} />
        <RockSliderRow label="Elongation" section="shape" field="elongation" value={sh.elongation} min={0} max={1} />
        <RockSliderRow label="Flatness" section="shape" field="flatness" value={sh.flatness} min={0} max={1} />
        <RockSectionTitle>Taper</RockSectionTitle>
        <RockSliderRow label="Taper Top" section="shape" field="taperTop" value={sh.taperTop} min={0} max={1} />
        <RockSliderRow label="Taper Bottom" section="shape" field="taperBottom" value={sh.taperBottom} min={0} max={1} />
        <RockSliderRow label="Mass Distribution" section="shape" field="massDistribution" value={sh.massDistribution} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">0 = bottom-heavy · 1 = top-heavy</p>
      </div>
    );
  }

  if (subTab === 'features') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Overhangs & Undercuts</RockSectionTitle>
        <RockSliderRow label="Overhang" section="shape" field="overhangAmount" value={sh.overhangAmount} min={0} max={1} />
        <RockSliderRow label="Overhang Dir" section="shape" field="overhangDirection" value={sh.overhangDirection} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Undercuts" section="shape" field="undercuts" value={sh.undercuts} min={0} max={1} />
        <RockSliderRow label="Undercut Depth" section="shape" field="undercutDepth" value={sh.undercutDepth} min={0} max={1} />
        <RockSliderRow label="Concavity" section="shape" field="concavity" value={sh.concavity} min={0} max={1} />
        <RockSectionTitle>Protrusions</RockSectionTitle>
        <RockSliderRow label="Pinnacles" section="shape" field="pinnacleCount" value={sh.pinnacleCount} min={0} max={5} step={1} format={v => v.toFixed(0)} />
        <RockSliderRow label="Pinnacle Height" section="shape" field="pinnacleHeight" value={sh.pinnacleHeight} min={0} max={1} />
        <RockSliderRow label="Facets" section="shape" field="facetCount" value={sh.facetCount} min={0} max={20} step={1} format={v => v.toFixed(0)} />
        <RockSliderRow label="Facet Sharpness" section="shape" field="facetSharpness" value={sh.facetSharpness} min={0} max={1} />
        <RockSliderRow label="Core Hollow" section="shape" field="coreHollowness" value={sh.coreHollowness} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Geode-like hollow interior</p>
      </div>
    );
  }

  if (subTab === 'lod') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Level of Detail</RockSectionTitle>
        <RockSliderRow label="Tessellation" section="shape" field="tessellation" value={sh.tessellation} min={4} max={256} step={4} format={v => v.toFixed(0)} />
        <RockSliderRow label="Noise Displacement" section="shape" field="noiseDisplacement" value={sh.noiseDisplacement} min={0} max={2} />
        <RockSliderRow label="LOD Bias" section="lod" field="lodBias" value={lod.lodBias} min={0} max={2} />
        <RockSliderRow label="Normal Map" section="lod" field="normalMapIntensity" value={lod.normalMapIntensity} min={0} max={2} />
        <RockSliderRow label="Parallax Depth" section="lod" field="parallaxDepth" value={lod.parallaxDepth} min={0} max={0.1} step={0.005} />
        <RockSliderRow label="Displacement Subdivs" section="lod" field="displacementSubdivisions" value={lod.displacementSubdivisions} min={1} max={8} step={1} format={v => v.toFixed(0)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Dimensions</RockSectionTitle>
      <RockSliderRow label="Width" section="shape" field="width" value={sh.width} min={0.1} max={20} step={0.1} unit="m" />
      <RockSliderRow label="Height" section="shape" field="height" value={sh.height} min={0.1} max={30} step={0.1} unit="m" />
      <RockSliderRow label="Depth" section="shape" field="depth" value={sh.depth} min={0.1} max={20} step={0.1} unit="m" />
    </div>
  );
}
