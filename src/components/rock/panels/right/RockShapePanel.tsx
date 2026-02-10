/**
 * Rock Shape & LOD Panel
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
        <RockSliderRow label="Taper Top" section="shape" field="taperTop" value={sh.taperTop} min={0} max={1} />
        <RockSliderRow label="Taper Bottom" section="shape" field="taperBottom" value={sh.taperBottom} min={0} max={1} />
        <RockSliderRow label="Overhang" section="shape" field="overhangAmount" value={sh.overhangAmount} min={0} max={1} />
        <RockSliderRow label="Noise Displacement" section="shape" field="noiseDisplacement" value={sh.noiseDisplacement} min={0} max={2} />
      </div>
    );
  }

  if (subTab === 'lod') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Level of Detail</RockSectionTitle>
        <RockSliderRow label="Tessellation" section="shape" field="tessellation" value={sh.tessellation} min={4} max={256} step={4} format={v => v.toFixed(0)} />
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
