/**
 * Rock Left Environment Panel - Expanded with climate, tectonic, submersion
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
      <RockSliderRow label="Soil Contact" section="environment" field="soilContact" value={e.soilContact} min={0} max={1} />
      <RockSliderRow label="Debris Apron" section="environment" field="debrisApron" value={e.debrisApron} min={0} max={1} />
      <RockSliderRow label="Debris Size" section="environment" field="debrisSize" value={e.debrisSize} min={0} max={1} />
      <RockSliderRow label="Scatter Density" section="environment" field="scatterDensity" value={e.scatterDensity} min={0} max={1} />
      <RockSliderRow label="Scatter Scale" section="environment" field="scatterScale" value={e.scatterScale} min={0.01} max={0.5} step={0.01} />
      <RockSliderRow label="Dust Amount" section="environment" field="dustAmount" value={e.dustAmount} min={0} max={1} />

      <RockSectionTitle>Climate & Exposure</RockSectionTitle>
      <RockSliderRow label="Wind Exposure" section="environment" field="windExposure" value={e.windExposure} min={0} max={1} />
      <RockSliderRow label="Wind Direction" section="environment" field="windDirection" value={e.windDirection} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
      <RockSliderRow label="Solar Exposure" section="environment" field="solarExposure" value={e.solarExposure} min={0} max={1} />
      <RockSliderRow label="Rainfall" section="environment" field="rainfallIntensity" value={e.rainfallIntensity} min={0} max={1} />
      <RockSliderRow label="Altitude" section="environment" field="altitude" value={e.altitude} min={0} max={1} />

      <RockSectionTitle>Snow & Water</RockSectionTitle>
      <RockSliderRow label="Snow Coverage" section="environment" field="snowCoverage" value={e.snowCoverage} min={0} max={1} />
      <RockSliderRow label="Snow Angle" section="environment" field="snowAngleThreshold" value={e.snowAngleThreshold} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
      <RockSliderRow label="Water Pooling" section="environment" field="waterPooling" value={e.waterPooling} min={0} max={1} />
      <RockSliderRow label="Submersion" section="environment" field="submersionDepth" value={e.submersionDepth} min={0} max={1} />
      <RockSliderRow label="Tide Line" section="environment" field="tideLine" value={e.tideLine} min={0} max={1} />
      <RockSliderRow label="Permafrost" section="environment" field="permafrostDepth" value={e.permafrostDepth} min={0} max={1} />

      <RockSectionTitle>Tectonic & Chemistry</RockSectionTitle>
      <RockSliderRow label="Tectonic Stress" section="environment" field="tectonicStress" value={e.tectonicStress} min={0} max={1} />
      <RockSliderRow label="Acid Rain" section="environment" field="acidRainExposure" value={e.acidRainExposure} min={0} max={1} />
      <RockSliderRow label="Thermal Vents" section="environment" field="thermalVentProximity" value={e.thermalVentProximity} min={0} max={1} />
      <RockSliderRow label="Vegetation" section="environment" field="vegetationGrowth" value={e.vegetationGrowth} min={0} max={1} />
    </div>
  );
}
