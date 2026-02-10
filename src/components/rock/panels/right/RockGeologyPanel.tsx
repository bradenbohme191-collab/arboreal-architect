/**
 * Rock Geology Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockSectionTitle } from '../shared/RockSliderRow';

const ROCK_TYPES = [
  { value: 'granite', label: 'Granite' }, { value: 'sandstone', label: 'Sandstone' },
  { value: 'limestone', label: 'Limestone' }, { value: 'basalt', label: 'Basalt' },
  { value: 'marble', label: 'Marble' }, { value: 'slate', label: 'Slate' },
  { value: 'obsidian', label: 'Obsidian' }, { value: 'quartzite', label: 'Quartzite' },
  { value: 'gneiss', label: 'Gneiss' }, { value: 'shale', label: 'Shale' },
];

const FORMATION_TYPES = [
  { value: 'boulder', label: 'Boulder' }, { value: 'cliff', label: 'Cliff' },
  { value: 'mountain', label: 'Mountain' }, { value: 'outcrop', label: 'Outcrop' },
  { value: 'pebble', label: 'Pebble' }, { value: 'slab', label: 'Slab' },
  { value: 'pillar', label: 'Pillar' }, { value: 'arch', label: 'Arch' },
];

export default function RockGeologyPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const g = rockParams.geology;

  if (subTab === 'minerals') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Minerals & Crystals</RockSectionTitle>
        <RockSliderRow label="Mineral Density" section="geology" field="mineralDensity" value={g.mineralDensity} min={0} max={1} />
        <RockSliderRow label="Mineral Scale" section="geology" field="mineralScale" value={g.mineralScale} min={0.01} max={0.5} />
        <RockSliderRow label="Crystal Size" section="geology" field="crystalSize" value={g.crystalSize} min={0} max={1} />
        <RockSliderRow label="Crystal Density" section="geology" field="crystalDensity" value={g.crystalDensity} min={0} max={1} />
        <RockSliderRow label="Grain Size" section="geology" field="grainSize" value={g.grainSize} min={0} max={1} />
      </div>
    );
  }

  if (subTab === 'formation') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Formation</RockSectionTitle>
        <RockSelectRow label="Formation Type" section="geology" field="formationType" value={g.formationType} options={FORMATION_TYPES} />
        <RockSliderRow label="Fold Intensity" section="geology" field="foldIntensity" value={g.foldIntensity} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Stratification</RockSectionTitle>
      <RockSelectRow label="Rock Type" section="geology" field="rockType" value={g.rockType} options={ROCK_TYPES} />
      <RockSliderRow label="Stratification" section="geology" field="stratification" value={g.stratification} min={0} max={1} />
      <RockSliderRow label="Layer Thickness" section="geology" field="layerThickness" value={g.layerThickness} min={0.01} max={0.5} step={0.005} />
      <RockSliderRow label="Layer Angle" section="geology" field="layerAngle" value={g.layerAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
      <RockSliderRow label="Layer Distortion" section="geology" field="layerDistortion" value={g.layerDistortion} min={0} max={1} />
    </div>
  );
}
