/**
 * Rock Internal Structure Panel - Grain, crystal, void, inclusion, fossil systems
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockColorRow, RockSectionTitle } from '../shared/RockSliderRow';

const GRAIN_SHAPES = [
  { value: 'equant', label: 'Equant' }, { value: 'tabular', label: 'Tabular' },
  { value: 'prismatic', label: 'Prismatic' }, { value: 'acicular', label: 'Acicular (Needle)' },
  { value: 'fibrous', label: 'Fibrous' }, { value: 'dendritic', label: 'Dendritic (Branching)' },
];
const INCLUSION_MINERALS = [
  { value: 'quartz', label: 'Quartz' }, { value: 'feldspar', label: 'Feldspar' },
  { value: 'mica', label: 'Mica' }, { value: 'pyroxene', label: 'Pyroxene' },
  { value: 'olivine', label: 'Olivine' }, { value: 'garnet', label: 'Garnet' },
  { value: 'tourmaline', label: 'Tourmaline' }, { value: 'pyrite', label: 'Pyrite' },
  { value: 'calcite', label: 'Calcite' },
];
const FOSSIL_TYPES = [
  { value: 'none', label: 'None' }, { value: 'shell', label: 'Shell' },
  { value: 'coral', label: 'Coral' }, { value: 'ammonite', label: 'Ammonite' },
  { value: 'crinoid', label: 'Crinoid' }, { value: 'plant', label: 'Plant' },
  { value: 'trace', label: 'Trace Fossil' },
];

export default function RockInternalPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const s = rockParams.internalStructure;

  if (subTab === 'crystals') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Crystal Matrix</RockSectionTitle>
        <RockSliderRow label="Crystal Size" section="internalStructure" field="crystalSize" value={s.crystalSize} min={0} max={1} />
        <RockSliderRow label="Crystal Density" section="internalStructure" field="crystalDensity" value={s.crystalDensity} min={0} max={1} />
        <RockSliderRow label="Orientation" section="internalStructure" field="crystalOrientation" value={s.crystalOrientation} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">0 = random · 1 = aligned</p>
        <RockSectionTitle>Phenocrysts</RockSectionTitle>
        <RockSliderRow label="Size" section="internalStructure" field="phenocrystSize" value={s.phenocrystSize} min={0} max={1} />
        <RockSliderRow label="Density" section="internalStructure" field="phenocrystDensity" value={s.phenocrystDensity} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Large crystals embedded in fine matrix</p>
      </div>
    );
  }

  if (subTab === 'voids') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Voids & Porosity</RockSectionTitle>
        <RockSliderRow label="Void Density" section="internalStructure" field="voidDensity" value={s.voidDensity} min={0} max={1} />
        <RockSliderRow label="Void Size" section="internalStructure" field="voidSize" value={s.voidSize} min={0} max={1} />
        <RockSliderRow label="Void Shape" section="internalStructure" field="voidShape" value={s.voidShape} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">0 = spherical vesicles · 1 = elongated</p>
        <RockSliderRow label="Connectivity" section="internalStructure" field="voidConnectivity" value={s.voidConnectivity} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Permeability — how connected pores are</p>
        <RockSectionTitle>Inclusions</RockSectionTitle>
        <RockSelectRow label="Mineral" section="internalStructure" field="inclusionMineral" value={s.inclusionMineral} options={INCLUSION_MINERALS} />
        <RockSliderRow label="Density" section="internalStructure" field="inclusionDensity" value={s.inclusionDensity} min={0} max={1} />
        <RockSliderRow label="Size" section="internalStructure" field="inclusionSize" value={s.inclusionSize} min={0} max={1} />
        <RockColorRow label="Color" section="internalStructure" field="inclusionColor" value={s.inclusionColor} />
      </div>
    );
  }

  if (subTab === 'banding') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Banding & Foliation</RockSectionTitle>
        <RockSliderRow label="Intensity" section="internalStructure" field="bandingIntensity" value={s.bandingIntensity} min={0} max={1} />
        <RockSliderRow label="Scale" section="internalStructure" field="bandingScale" value={s.bandingScale} min={0.01} max={1} />
        <RockSliderRow label="Contrast" section="internalStructure" field="bandingContrast" value={s.bandingContrast} min={0} max={1} />
        <RockColorRow label="Band Color" section="internalStructure" field="bandingColor" value={s.bandingColor} />
        <RockSectionTitle>Vein Network</RockSectionTitle>
        <RockSliderRow label="Density" section="internalStructure" field="veinNetworkDensity" value={s.veinNetworkDensity} min={0} max={1} />
        <RockSliderRow label="Width" section="internalStructure" field="veinWidth" value={s.veinWidth} min={0} max={1} />
        <RockSliderRow label="Branching" section="internalStructure" field="veinBranching" value={s.veinBranching} min={0} max={1} />
        <RockColorRow label="Vein Color" section="internalStructure" field="veinColor" value={s.veinColor} />
      </div>
    );
  }

  if (subTab === 'fossils') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Fossils (Sedimentary)</RockSectionTitle>
        <RockSelectRow label="Type" section="internalStructure" field="fossilType" value={s.fossilType} options={FOSSIL_TYPES} />
        <RockSliderRow label="Density" section="internalStructure" field="fossilDensity" value={s.fossilDensity} min={0} max={1} />
        <RockSliderRow label="Size" section="internalStructure" field="fossilSize" value={s.fossilSize} min={0} max={1} />
        <RockSliderRow label="Preservation" section="internalStructure" field="fossilPreservation" value={s.fossilPreservation} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">0 = fragmentary · 1 = pristine detail</p>
      </div>
    );
  }

  // Default: grain
  return (
    <div className="space-y-3">
      <RockSectionTitle>Grain Structure</RockSectionTitle>
      <RockSliderRow label="Grain Size" section="internalStructure" field="grainSize" value={s.grainSize} min={0} max={1} />
      <p className="text-[10px] text-muted-foreground -mt-1">0 = aphanitic (fine) · 1 = pegmatitic (coarse)</p>
      <RockSelectRow label="Grain Shape" section="internalStructure" field="grainShape" value={s.grainShape} options={GRAIN_SHAPES} />
      <RockSliderRow label="Uniformity" section="internalStructure" field="grainUniformity" value={s.grainUniformity} min={0} max={1} />
      <p className="text-[10px] text-muted-foreground -mt-1">0 = porphyritic (varied) · 1 = equigranular</p>
      <RockSliderRow label="Flow Intensity" section="internalStructure" field="grainFlowIntensity" value={s.grainFlowIntensity} min={0} max={1} />
      <RockSliderRow label="Flow Angle" section="internalStructure" field="grainFlowAngle" value={s.grainFlowAngle} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
    </div>
  );
}
