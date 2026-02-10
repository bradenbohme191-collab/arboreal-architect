/**
 * Rock Weathering Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockColorRow, RockSectionTitle } from '../shared/RockSliderRow';

const EROSION_PATTERNS = [
  { value: 'uniform', label: 'Uniform' }, { value: 'directional', label: 'Directional' },
  { value: 'chemical', label: 'Chemical' }, { value: 'freeze-thaw', label: 'Freeze-Thaw' },
];

export default function RockWeatheringPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const w = rockParams.weathering;

  if (subTab === 'biological') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Biological Growth</RockSectionTitle>
        <RockSliderRow label="Lichen Coverage" section="weathering" field="lichenCoverage" value={w.lichenCoverage} min={0} max={1} />
        <RockColorRow label="Lichen Color" section="weathering" field="lichenColor" value={w.lichenColor} />
        <RockSliderRow label="Moss Coverage" section="weathering" field="mossCoverage" value={w.mossCoverage} min={0} max={1} />
        <RockColorRow label="Moss Color" section="weathering" field="mossColor" value={w.mossColor} />
      </div>
    );
  }

  if (subTab === 'chemical') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Chemical Weathering</RockSectionTitle>
        <RockSliderRow label="Water Staining" section="weathering" field="waterStaining" value={w.waterStaining} min={0} max={1} />
        <RockSliderRow label="Flow Direction" section="weathering" field="waterFlowDirection" value={w.waterFlowDirection} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Oxidation" section="weathering" field="oxidation" value={w.oxidation} min={0} max={1} />
        <RockSliderRow label="Salt Deposits" section="weathering" field="saltDeposit" value={w.saltDeposit} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Erosion</RockSectionTitle>
      <RockSliderRow label="Erosion Amount" section="weathering" field="erosionAmount" value={w.erosionAmount} min={0} max={1} />
      <RockSelectRow label="Erosion Pattern" section="weathering" field="erosionPattern" value={w.erosionPattern} options={EROSION_PATTERNS} />
      <RockSliderRow label="Wind Polish" section="weathering" field="windPolish" value={w.windPolish} min={0} max={1} />
      <RockSliderRow label="Geological Age" section="weathering" field="ageYears" value={w.ageYears} min={0} max={1000000} step={1000} unit=" yrs" format={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toFixed(0)} />
    </div>
  );
}
