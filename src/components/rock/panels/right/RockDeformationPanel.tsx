/**
 * Rock Deformation Panel - Impact, splitting, carving, compression, thermal
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockSectionTitle } from '../shared/RockSliderRow';

const IMPACT_TYPES = [
  { value: 'blunt', label: 'Blunt' }, { value: 'sharp', label: 'Sharp' },
  { value: 'explosive', label: 'Explosive' }, { value: 'projectile', label: 'Projectile' },
];
const SPLIT_TYPES = [
  { value: 'clean', label: 'Clean' }, { value: 'rough', label: 'Rough' },
  { value: 'stepped', label: 'Stepped' }, { value: 'curved', label: 'Curved' },
];
const CARVE_AGENTS = [
  { value: 'water', label: 'Water' }, { value: 'wind', label: 'Wind' },
  { value: 'ice', label: 'Ice/Glacier' }, { value: 'lava', label: 'Lava' },
  { value: 'manual', label: 'Manual/Tool' },
];

export default function RockDeformationPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const d = rockParams.deformation;

  if (subTab === 'splitting') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Split Planes</RockSectionTitle>
        <RockSliderRow label="Split Count" section="deformation" field="splitPlaneCount" value={d.splitPlaneCount} min={0} max={5} step={1} format={v => v.toFixed(0)} />
        <RockSliderRow label="Split Angle" section="deformation" field="splitPlaneAngle" value={d.splitPlaneAngle} min={0} max={180} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Surface Roughness" section="deformation" field="splitPlaneRoughness" value={d.splitPlaneRoughness} min={0} max={1} />
        <RockSelectRow label="Split Type" section="deformation" field="splitPlaneType" value={d.splitPlaneType} options={SPLIT_TYPES} />
        <RockSliderRow label="Separation" section="deformation" field="splitSeparation" value={d.splitSeparation} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">How far apart split fragments separate</p>
      </div>
    );
  }

  if (subTab === 'carving') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Carving & Erosion Channels</RockSectionTitle>
        <RockSelectRow label="Carving Agent" section="deformation" field="carveAgent" value={d.carveAgent} options={CARVE_AGENTS} />
        <RockSliderRow label="Carve Depth" section="deformation" field="carveDepth" value={d.carveDepth} min={0} max={1} />
        <RockSliderRow label="Carve Width" section="deformation" field="carveWidth" value={d.carveWidth} min={0} max={1} />
        <RockSliderRow label="Channels" section="deformation" field="carveChannelCount" value={d.carveChannelCount} min={0} max={10} step={1} format={v => v.toFixed(0)} />
        <RockSliderRow label="Sinuosity" section="deformation" field="carveSinuosity" value={d.carveSinuosity} min={0} max={1} />
        <RockSectionTitle>Tumbling & Polishing</RockSectionTitle>
        <RockSliderRow label="Tumbling" section="deformation" field="tumblingAmount" value={d.tumblingAmount} min={0} max={1} />
        <RockSliderRow label="Duration" section="deformation" field="tumblingTime" value={d.tumblingTime} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">River/glacial rounding over time</p>
      </div>
    );
  }

  if (subTab === 'stress') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Compression & Shear</RockSectionTitle>
        <RockSliderRow label="Compression" section="deformation" field="compressionAmount" value={d.compressionAmount} min={0} max={1} />
        <RockSliderRow label="Compression Axis" section="deformation" field="compressionAxis" value={d.compressionAxis} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Shear Stress" section="deformation" field="shearStress" value={d.shearStress} min={0} max={1} />
        <RockSliderRow label="Shear Angle" section="deformation" field="shearAngle" value={d.shearAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSectionTitle>Thermal</RockSectionTitle>
        <RockSliderRow label="Thermal Shock" section="deformation" field="thermalShock" value={d.thermalShock} min={0} max={1} />
        <RockSliderRow label="Thermal Cycles" section="deformation" field="thermalCycles" value={d.thermalCycles} min={0} max={1000} step={10} format={v => v.toFixed(0)} />
        <RockSliderRow label="Lava Scouring" section="deformation" field="lavaScouring" value={d.lavaScouring} min={0} max={1} />
        <RockSliderRow label="Contact Metamorphism" section="deformation" field="contactMetamorphism" value={d.contactMetamorphism} min={0} max={1} />
        <RockSectionTitle>Burial & Exhumation</RockSectionTitle>
        <RockSliderRow label="Burial Depth" section="deformation" field="burialDepth" value={d.burialDepth} min={0} max={1} />
        <RockSliderRow label="Exhumation Rate" section="deformation" field="exhumationRate" value={d.exhumationRate} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Unloading fractures from pressure release</p>
      </div>
    );
  }

  // Default: impact
  return (
    <div className="space-y-3">
      <RockSectionTitle>Impact Damage</RockSectionTitle>
      <RockSliderRow label="Impact Count" section="deformation" field="impactCount" value={d.impactCount} min={0} max={10} step={1} format={v => v.toFixed(0)} />
      <RockSliderRow label="Impact Depth" section="deformation" field="impactDepth" value={d.impactDepth} min={0} max={1} />
      <RockSliderRow label="Impact Radius" section="deformation" field="impactRadius" value={d.impactRadius} min={0} max={1} />
      <RockSelectRow label="Impact Type" section="deformation" field="impactType" value={d.impactType} options={IMPACT_TYPES} />
      <RockSliderRow label="Ejecta Scatter" section="deformation" field="impactScatter" value={d.impactScatter} min={0} max={1} />
    </div>
  );
}
