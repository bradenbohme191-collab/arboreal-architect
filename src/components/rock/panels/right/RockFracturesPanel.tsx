/**
 * Rock Fractures Panel - Expanded with exfoliation, brecciation, micro-fractures, fracture marks
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockColorRow, RockSectionTitle } from '../shared/RockSliderRow';

const CRACK_PATTERNS = [
  { value: 'random', label: 'Random' }, { value: 'columnar', label: 'Columnar' },
  { value: 'conchoidal', label: 'Conchoidal' }, { value: 'sheeting', label: 'Sheeting' },
  { value: 'blocky', label: 'Blocky' }, { value: 'radial', label: 'Radial' },
  { value: 'en_echelon', label: 'En Echelon' }, { value: 'pinnate', label: 'Pinnate' },
];
const EXFOLIATION_TYPES = [
  { value: 'none', label: 'None' }, { value: 'sheeting', label: 'Sheeting' },
  { value: 'spheroidal', label: 'Spheroidal' }, { value: 'onion_skin', label: 'Onion Skin' },
];

export default function RockFracturesPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const f = rockParams.fractures;

  if (subTab === 'joints') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Joint Sets</RockSectionTitle>
        <RockSliderRow label="Joint Sets" section="fractures" field="jointSetCount" value={f.jointSetCount} min={0} max={3} step={1} format={v => v.toFixed(0)} />
        <RockSliderRow label="Joint Angle" section="fractures" field="jointAngle" value={f.jointAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Joint Spacing" section="fractures" field="jointSpacing" value={f.jointSpacing} min={0.1} max={2} step={0.05} />
        <RockSliderRow label="Joint Roughness" section="fractures" field="jointRoughness" value={f.jointRoughness} min={0} max={1} />
        <RockSliderRow label="Joint Persistence" section="fractures" field="jointPersistence" value={f.jointPersistence} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">How far joints extend through rock</p>
      </div>
    );
  }

  if (subTab === 'faults') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Faults & Damage</RockSectionTitle>
        <RockSliderRow label="Fault Offset" section="fractures" field="faultOffset" value={f.faultOffset} min={0} max={1} />
        <RockSliderRow label="Fault Angle" section="fractures" field="faultAngle" value={f.faultAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Fault Gouge" section="fractures" field="faultGouge" value={f.faultGouge} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Crushed rock material in fault zone</p>
        <RockSliderRow label="Chipping" section="fractures" field="chippingAmount" value={f.chippingAmount} min={0} max={1} />
        <RockSliderRow label="Spalling Depth" section="fractures" field="spallingDepth" value={f.spallingDepth} min={0} max={0.5} step={0.01} />
        <RockSectionTitle>Shear Zones</RockSectionTitle>
        <RockSliderRow label="Shear Zones" section="fractures" field="shearZones" value={f.shearZones} min={0} max={1} />
        <RockSliderRow label="Zone Width" section="fractures" field="shearZoneWidth" value={f.shearZoneWidth} min={0} max={0.5} step={0.01} />
        <RockSliderRow label="Tension Cracks" section="fractures" field="tensionCracks" value={f.tensionCracks} min={0} max={1} />
      </div>
    );
  }

  if (subTab === 'exfoliation') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Exfoliation</RockSectionTitle>
        <RockSelectRow label="Type" section="fractures" field="exfoliationType" value={f.exfoliationType} options={EXFOLIATION_TYPES} />
        <RockSliderRow label="Thickness" section="fractures" field="exfoliationThickness" value={f.exfoliationThickness} min={0} max={1} />
        <RockSectionTitle>Brecciation</RockSectionTitle>
        <RockSliderRow label="Brecciation" section="fractures" field="brecciation" value={f.brecciation} min={0} max={1} />
        <RockSliderRow label="Fragment Scale" section="fractures" field="brecciationScale" value={f.brecciationScale} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Angular fragment texture from crushing</p>
        <RockSectionTitle>Fracture Surface Marks</RockSectionTitle>
        <RockSliderRow label="Hackle Marks" section="fractures" field="hackleMarks" value={f.hackleMarks} min={0} max={1} />
        <RockSliderRow label="Rib Marks" section="fractures" field="ribMarks" value={f.ribMarks} min={0} max={1} />
        <RockSliderRow label="Plumose Structure" section="fractures" field="plumoseStructure" value={f.plumoseStructure} min={0} max={1} />
        <RockSliderRow label="Micro Fractures" section="fractures" field="microFractures" value={f.microFractures} min={0} max={1} />
        <RockSliderRow label="Cleavage Fracture" section="fractures" field="cleavageFracture" value={f.cleavageFracture} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Cracks</RockSectionTitle>
      <RockSliderRow label="Crack Density" section="fractures" field="crackDensity" value={f.crackDensity} min={0} max={1} />
      <RockSliderRow label="Crack Depth" section="fractures" field="crackDepth" value={f.crackDepth} min={0} max={1} />
      <RockSliderRow label="Crack Width" section="fractures" field="crackWidth" value={f.crackWidth} min={0} max={0.1} step={0.002} />
      <RockSelectRow label="Crack Pattern" section="fractures" field="crackPattern" value={f.crackPattern} options={CRACK_PATTERNS} />
      <RockSliderRow label="Propagation" section="fractures" field="crackPropagation" value={f.crackPropagation} min={0} max={1} />
      <RockSliderRow label="Crack Fill" section="fractures" field="crackFill" value={f.crackFill} min={0} max={1} />
      <RockColorRow label="Fill Color" section="fractures" field="crackFillColor" value={f.crackFillColor} />
    </div>
  );
}
