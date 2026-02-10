/**
 * Rock Left Environment Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSectionTitle } from '../shared/RockSliderRow';

export default function RockEnvironmentPanel() {
  const { rockParams } = useProRockLayout();
  const e = rockParams.environment;

  return (
    <div className="space-y-3">
      <RockSectionTitle>Ground & Surroundings</RockSectionTitle>
      <RockSliderRow label="Ground Embedding" section="environment" field="groundEmbedding" value={e.groundEmbedding} min={0} max={1} />
      <RockSliderRow label="Scatter Density" section="environment" field="scatterDensity" value={e.scatterDensity} min={0} max={1} />
      <RockSliderRow label="Scatter Scale" section="environment" field="scatterScale" value={e.scatterScale} min={0.01} max={0.5} step={0.01} />
      <RockSliderRow label="Dust Amount" section="environment" field="dustAmount" value={e.dustAmount} min={0} max={1} />

      <RockSectionTitle>Snow & Water</RockSectionTitle>
      <RockSliderRow label="Snow Coverage" section="environment" field="snowCoverage" value={e.snowCoverage} min={0} max={1} />
      <RockSliderRow label="Snow Angle Threshold" section="environment" field="snowAngleThreshold" value={e.snowAngleThreshold} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
      <RockSliderRow label="Water Pooling" section="environment" field="waterPooling" value={e.waterPooling} min={0} max={1} />
      <RockSliderRow label="Vegetation Growth" section="environment" field="vegetationGrowth" value={e.vegetationGrowth} min={0} max={1} />
    </div>
  );
}
