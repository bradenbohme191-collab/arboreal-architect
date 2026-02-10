/**
 * Rock Fractures Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockSectionTitle } from '../shared/RockSliderRow';

const CRACK_PATTERNS = [
  { value: 'random', label: 'Random' }, { value: 'columnar', label: 'Columnar' },
  { value: 'conchoidal', label: 'Conchoidal' }, { value: 'sheeting', label: 'Sheeting' },
  { value: 'blocky', label: 'Blocky' },
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
      </div>
    );
  }

  if (subTab === 'faults') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Faults & Damage</RockSectionTitle>
        <RockSliderRow label="Fault Offset" section="fractures" field="faultOffset" value={f.faultOffset} min={0} max={1} />
        <RockSliderRow label="Fault Angle" section="fractures" field="faultAngle" value={f.faultAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Chipping" section="fractures" field="chippingAmount" value={f.chippingAmount} min={0} max={1} />
        <RockSliderRow label="Spalling Depth" section="fractures" field="spallingDepth" value={f.spallingDepth} min={0} max={0.5} step={0.01} />
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
    </div>
  );
}
