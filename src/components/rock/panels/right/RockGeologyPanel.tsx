/**
 * Rock Geology Panel - Expanded with cross-bedding, ripple marks, unconformities
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockSectionTitle } from '../shared/RockSliderRow';

const ROCK_TYPES = [
  { value: 'granite', label: 'Granite' }, { value: 'sandstone', label: 'Sandstone' },
  { value: 'limestone', label: 'Limestone' }, { value: 'basalt', label: 'Basalt' },
  { value: 'marble', label: 'Marble' }, { value: 'slate', label: 'Slate' },
  { value: 'obsidian', label: 'Obsidian' }, { value: 'quartzite', label: 'Quartzite' },
  { value: 'gneiss', label: 'Gneiss' }, { value: 'shale', label: 'Shale' },
  { value: 'pumice', label: 'Pumice' }, { value: 'tuff', label: 'Tuff' },
  { value: 'diorite', label: 'Diorite' }, { value: 'gabbro', label: 'Gabbro' },
  { value: 'rhyolite', label: 'Rhyolite' }, { value: 'andesite', label: 'Andesite' },
  { value: 'conglomerate', label: 'Conglomerate' }, { value: 'breccia', label: 'Breccia' },
  { value: 'chalk', label: 'Chalk' }, { value: 'dolomite', label: 'Dolomite' },
  { value: 'mudstone', label: 'Mudstone' }, { value: 'siltstone', label: 'Siltstone' },
  { value: 'phyllite', label: 'Phyllite' }, { value: 'schist', label: 'Schist' },
  { value: 'hornfels', label: 'Hornfels' }, { value: 'migmatite', label: 'Migmatite' },
  { value: 'eclogite', label: 'Eclogite' }, { value: 'serpentinite', label: 'Serpentinite' },
  { value: 'travertine', label: 'Travertine' }, { value: 'flint', label: 'Flint' },
];

const FORMATION_TYPES = [
  { value: 'boulder', label: 'Boulder' }, { value: 'cliff', label: 'Cliff Face' },
  { value: 'mountain', label: 'Mountain Side' }, { value: 'outcrop', label: 'Outcrop' },
  { value: 'pebble', label: 'Pebble' }, { value: 'slab', label: 'Slab' },
  { value: 'pillar', label: 'Pillar/Column' }, { value: 'arch', label: 'Natural Arch' },
  { value: 'tor', label: 'Tor' }, { value: 'stack', label: 'Sea Stack' },
  { value: 'cave_wall', label: 'Cave Wall' }, { value: 'riverbed', label: 'Riverbed' },
  { value: 'scree', label: 'Scree' }, { value: 'talus', label: 'Talus' },
  { value: 'moraine', label: 'Moraine' }, { value: 'dike', label: 'Dike' },
  { value: 'sill', label: 'Sill' }, { value: 'batholith', label: 'Batholith' },
  { value: 'xenolith', label: 'Xenolith' },
];

export default function RockGeologyPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const g = rockParams.geology;

  if (subTab === 'minerals') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Mineral Composition</RockSectionTitle>
        <RockSliderRow label="Mineral Density" section="geology" field="mineralDensity" value={g.mineralDensity} min={0} max={1} />
        <RockSliderRow label="Mineral Scale" section="geology" field="mineralScale" value={g.mineralScale} min={0.01} max={0.5} />
      </div>
    );
  }

  if (subTab === 'formation') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Formation Type</RockSectionTitle>
        <RockSelectRow label="Formation" section="geology" field="formationType" value={g.formationType} options={FORMATION_TYPES} />
        <RockSectionTitle>Folding</RockSectionTitle>
        <RockSliderRow label="Fold Intensity" section="geology" field="foldIntensity" value={g.foldIntensity} min={0} max={1} />
        <RockSliderRow label="Fold Wavelength" section="geology" field="foldWavelength" value={g.foldWavelength} min={0.1} max={5} step={0.1} />
        <RockSliderRow label="Fold Asymmetry" section="geology" field="foldAsymmetry" value={g.foldAsymmetry} min={0} max={1} />
        <RockSectionTitle>Sedimentary Structures</RockSectionTitle>
        <RockSliderRow label="Cross Bedding" section="geology" field="crossBedding" value={g.crossBedding} min={0} max={1} />
        <RockSliderRow label="Cross Bed Angle" section="geology" field="crossBeddingAngle" value={g.crossBeddingAngle} min={0} max={45} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Ripple Marks" section="geology" field="rippleMarks" value={g.rippleMarks} min={0} max={1} />
        <RockSliderRow label="Mud Cracks" section="geology" field="mudCracks" value={g.mudCracks} min={0} max={1} />
        <RockSliderRow label="Load Casts" section="geology" field="loadCasts" value={g.loadCasts} min={0} max={1} />
        <RockSliderRow label="Unconformity" section="geology" field="unconformity" value={g.unconformity} min={0} max={1} />
        <RockSliderRow label="Interbedding" section="geology" field="interbedding" value={g.interbedding} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Rock Classification</RockSectionTitle>
      <RockSelectRow label="Rock Type" section="geology" field="rockType" value={g.rockType} options={ROCK_TYPES} />
      <RockSectionTitle>Stratification</RockSectionTitle>
      <RockSliderRow label="Stratification" section="geology" field="stratification" value={g.stratification} min={0} max={1} />
      <RockSliderRow label="Layer Thickness" section="geology" field="layerThickness" value={g.layerThickness} min={0.01} max={0.5} step={0.005} />
      <RockSliderRow label="Layer Angle" section="geology" field="layerAngle" value={g.layerAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
      <RockSliderRow label="Layer Distortion" section="geology" field="layerDistortion" value={g.layerDistortion} min={0} max={1} />
    </div>
  );
}
