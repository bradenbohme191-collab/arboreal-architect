/**
 * Rock Origin Panel - First-principles geological origin
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockSectionTitle } from '../shared/RockSliderRow';

const ORIGIN_CLASSES = [
  { value: 'igneous', label: 'Igneous' },
  { value: 'sedimentary', label: 'Sedimentary' },
  { value: 'metamorphic', label: 'Metamorphic' },
];
const IGNEOUS_TYPES = [
  { value: 'plutonic', label: 'Plutonic (Deep)' },
  { value: 'volcanic', label: 'Volcanic (Surface)' },
  { value: 'hypabyssal', label: 'Hypabyssal (Shallow)' },
];
const SEDIMENT_SOURCES = [
  { value: 'marine', label: 'Marine' }, { value: 'fluvial', label: 'Fluvial (River)' },
  { value: 'aeolian', label: 'Aeolian (Wind)' }, { value: 'glacial', label: 'Glacial' },
  { value: 'lacustrine', label: 'Lacustrine (Lake)' }, { value: 'chemical', label: 'Chemical' },
];
const CEMENTATION_TYPES = [
  { value: 'silica', label: 'Silica' }, { value: 'calcite', label: 'Calcite' },
  { value: 'iron', label: 'Iron Oxide' }, { value: 'clay', label: 'Clay' },
  { value: 'none', label: 'None' },
];
const META_GRADES = [
  { value: 'low', label: 'Low (Slate)' }, { value: 'medium', label: 'Medium (Schist)' },
  { value: 'high', label: 'High (Gneiss)' }, { value: 'ultra', label: 'Ultra (Migmatite)' },
];

export default function RockOriginPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const o = rockParams.origin;

  if (subTab === 'igneous') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Igneous Formation</RockSectionTitle>
        <RockSelectRow label="Emplacement" section="origin" field="igneousType" value={o.igneousType} options={IGNEOUS_TYPES} />
        <RockSliderRow label="Cooling Rate" section="origin" field="coolingRate" value={o.coolingRate} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Slow → large crystals · Fast → glassy</p>
        <RockSliderRow label="Intrusion Depth" section="origin" field="intrusionDepth" value={o.intrusionDepth} min={0} max={1} />
        <RockSliderRow label="Silica Content" section="origin" field="silicaContent" value={o.silicaContent} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Low = mafic/dark · High = felsic/light</p>
        <RockSliderRow label="Gas Content" section="origin" field="gasContent" value={o.gasContent} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Vesicularity (pumice = high)</p>
      </div>
    );
  }

  if (subTab === 'sedimentary') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Sedimentary Formation</RockSectionTitle>
        <RockSelectRow label="Sediment Source" section="origin" field="sedimentSource" value={o.sedimentSource} options={SEDIMENT_SOURCES} />
        <RockSliderRow label="Compaction Pressure" section="origin" field="compactionPressure" value={o.compactionPressure} min={0} max={1} />
        <RockSelectRow label="Cementation" section="origin" field="cementationType" value={o.cementationType} options={CEMENTATION_TYPES} />
        <RockSliderRow label="Cementation Strength" section="origin" field="cementationStrength" value={o.cementationStrength} min={0} max={1} />
        <RockSliderRow label="Sorting Degree" section="origin" field="sortingDegree" value={o.sortingDegree} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Poorly sorted = varied grain sizes</p>
        <RockSliderRow label="Organic Content" section="origin" field="organicContent" value={o.organicContent} min={0} max={1} />
      </div>
    );
  }

  if (subTab === 'metamorphic') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Metamorphic Transformation</RockSectionTitle>
        <RockSelectRow label="Grade" section="origin" field="metamorphicGrade" value={o.metamorphicGrade} options={META_GRADES} />
        <RockSliderRow label="Heat/Pressure Ratio" section="origin" field="heatPressureRatio" value={o.heatPressureRatio} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">0 = pressure dominant · 1 = heat dominant</p>
        <RockSliderRow label="Foliation" section="origin" field="foliationIntensity" value={o.foliationIntensity} min={0} max={1} />
        <RockSliderRow label="Foliation Angle" section="origin" field="foliationAngle" value={o.foliationAngle} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Recrystallization" section="origin" field="recrystallization" value={o.recrystallization} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Geological Origin</RockSectionTitle>
      <RockSelectRow label="Origin Class" section="origin" field="originClass" value={o.originClass} options={ORIGIN_CLASSES} />
      <p className="text-[10px] text-muted-foreground leading-tight">
        {o.originClass === 'igneous' && 'Formed from cooling molten magma. Controls crystal size, mineral composition, and vesicularity.'}
        {o.originClass === 'sedimentary' && 'Formed from accumulated & compacted sediments. Controls layering, grain sorting, and fossil content.'}
        {o.originClass === 'metamorphic' && 'Transformed under extreme heat & pressure. Controls foliation, banding, and recrystallization.'}
      </p>
    </div>
  );
}
