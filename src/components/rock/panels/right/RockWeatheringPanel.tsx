/**
 * Rock Weathering Panel - Expanded with tafoni, honeycomb, karst, glacial, desert varnish
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockColorRow, RockSectionTitle } from '../shared/RockSliderRow';

const EROSION_PATTERNS = [
  { value: 'uniform', label: 'Uniform' }, { value: 'directional', label: 'Directional' },
  { value: 'chemical', label: 'Chemical' }, { value: 'freeze-thaw', label: 'Freeze-Thaw' },
  { value: 'thermal', label: 'Thermal' }, { value: 'salt', label: 'Salt Crystal' },
  { value: 'abrasion', label: 'Abrasion' }, { value: 'glacial', label: 'Glacial' },
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
        <RockSliderRow label="Biological Boring" section="weathering" field="biologicalBoring" value={w.biologicalBoring} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Organism-created holes (marine borers)</p>
        <RockSliderRow label="Root Wedging" section="weathering" field="rootWedging" value={w.rootWedging} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Plant root mechanical fracturing</p>
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
        <RockSectionTitle>Dissolution</RockSectionTitle>
        <RockSliderRow label="Karst Dissolution" section="weathering" field="karstDissolution" value={w.karstDissolution} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Limestone/carbonate dissolution</p>
        <RockSliderRow label="Speleothem" section="weathering" field="speleothem" value={w.speleothem} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Stalactite/stalagmite mineral deposits</p>
        <RockSliderRow label="Spheroidal" section="weathering" field="spheroidalWeathering" value={w.spheroidalWeathering} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Onion-skin chemical decay pattern</p>
      </div>
    );
  }

  if (subTab === 'mechanical') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Tafoni & Honeycomb</RockSectionTitle>
        <RockSliderRow label="Tafoni Density" section="weathering" field="tafoniDensity" value={w.tafoniDensity} min={0} max={1} />
        <RockSliderRow label="Tafoni Scale" section="weathering" field="tafoniScale" value={w.tafoniScale} min={0} max={1} />
        <RockSliderRow label="Honeycomb" section="weathering" field="honeycombDensity" value={w.honeycombDensity} min={0} max={1} />
        <RockSliderRow label="Alveolar Depth" section="weathering" field="alveolarDepth" value={w.alveolarDepth} min={0} max={1} />
        <RockSliderRow label="Cavernous" section="weathering" field="cavernousWeathering" value={w.cavernousWeathering} min={0} max={1} />
        <RockSectionTitle>Surface Effects</RockSectionTitle>
        <RockSliderRow label="Case Hardening" section="weathering" field="caseHardening" value={w.caseHardening} min={0} max={1} />
        <RockSliderRow label="Desert Varnish" section="weathering" field="desertVarnish" value={w.desertVarnish} min={0} max={1} />
        <RockColorRow label="Varnish Color" section="weathering" field="desertVarnishColor" value={w.desertVarnishColor} />
        <RockSliderRow label="Pedestal" section="weathering" field="pedestal" value={w.pedestal} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Undercut mushroom/hoodoo shape</p>
      </div>
    );
  }

  if (subTab === 'glacial') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Glacial & Water</RockSectionTitle>
        <RockSliderRow label="Glacial Striae" section="weathering" field="glacialStriae" value={w.glacialStriae} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Parallel scratch marks from ice movement</p>
        <RockSliderRow label="Glacial Polish" section="weathering" field="glacialPolish" value={w.glacialPolish} min={0} max={1} />
        <RockSectionTitle>Rill Erosion</RockSectionTitle>
        <RockSliderRow label="Rill Erosion" section="weathering" field="rillErosion" value={w.rillErosion} min={0} max={1} />
        <RockSliderRow label="Rill Depth" section="weathering" field="rillDepth" value={w.rillDepth} min={0} max={1} />
        <RockSliderRow label="Rill Direction" section="weathering" field="rillDirection" value={w.rillDirection} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
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
