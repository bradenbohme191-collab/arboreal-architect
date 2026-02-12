/**
 * Rock Surface Panel - Expanded with luster, cleavage, schistosity, conchoidal
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSelectRow, RockSectionTitle } from '../shared/RockSliderRow';

const LUSTER_TYPES = [
  { value: 'vitreous', label: 'Vitreous (Glassy)' }, { value: 'pearly', label: 'Pearly' },
  { value: 'silky', label: 'Silky' }, { value: 'waxy', label: 'Waxy' },
  { value: 'resinous', label: 'Resinous' }, { value: 'adamantine', label: 'Adamantine' },
  { value: 'metallic', label: 'Metallic' }, { value: 'earthy', label: 'Earthy' },
  { value: 'dull', label: 'Dull' },
];
const CLEAVAGE_TYPES = [
  { value: 'none', label: 'None' }, { value: 'basal', label: 'Basal' },
  { value: 'cubic', label: 'Cubic' }, { value: 'rhombohedral', label: 'Rhombohedral' },
  { value: 'prismatic', label: 'Prismatic' }, { value: 'pinacoidal', label: 'Pinacoidal' },
];

export default function RockSurfacePanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const s = rockParams.surface;

  if (subTab === 'displacement') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Displacement</RockSectionTitle>
        <RockSliderRow label="Height" section="surface" field="displacement" value={s.displacement} min={0} max={2} step={0.01} />
        <RockSliderRow label="Bump Scale" section="surface" field="bumpScale" value={s.bumpScale} min={0} max={3} step={0.05} />
        <RockSliderRow label="Noise Octaves" section="surface" field="noiseOctaves" value={s.noiseOctaves} min={1} max={8} step={1} format={v => v.toFixed(0)} />
        <RockSliderRow label="Frequency" section="surface" field="noiseFrequency" value={s.noiseFrequency} min={0.1} max={10} step={0.1} />
        <RockSliderRow label="Lacunarity" section="surface" field="noiseLacunarity" value={s.noiseLacunarity} min={1} max={4} step={0.05} />
        <RockSliderRow label="Persistence" section="surface" field="noisePersistence" value={s.noisePersistence} min={0} max={1} />
      </div>
    );
  }

  if (subTab === 'micro') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Micro Detail</RockSectionTitle>
        <RockSliderRow label="Micro Detail" section="surface" field="microDetail" value={s.microDetail} min={0} max={1} />
        <RockSliderRow label="Porosity" section="surface" field="porosity" value={s.porosity} min={0} max={1} />
        <RockSliderRow label="Microcrystalline" section="surface" field="microCrystalline" value={s.microCrystalline} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Chalcedony, chert-like fine crystal texture</p>
        <RockSliderRow label="Exfoliation Layers" section="surface" field="exfoliationLayers" value={s.exfoliationLayers} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Onion-skin peeling layers</p>
      </div>
    );
  }

  if (subTab === 'optical') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Optical Properties</RockSectionTitle>
        <RockSelectRow label="Luster" section="surface" field="luster" value={s.luster} options={LUSTER_TYPES} />
        <RockSliderRow label="Transparency" section="surface" field="transparency" value={s.transparency} min={0} max={1} />
        <RockSliderRow label="Subsurface Scatter" section="surface" field="subsurfaceScatter" value={s.subsurfaceScatter} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Light penetration (marble, jade, onyx)</p>
        <RockSliderRow label="Conchoidal" section="surface" field="conchoidal" value={s.conchoidal} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Shell-like fracture surfaces (obsidian, flint)</p>
        <RockSectionTitle>Cleavage</RockSectionTitle>
        <RockSelectRow label="Type" section="surface" field="cleavageType" value={s.cleavageType} options={CLEAVAGE_TYPES} />
        <RockSliderRow label="Cleavage Angle" section="surface" field="cleavageAngle" value={s.cleavageAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
        <RockSliderRow label="Schistosity" section="surface" field="schistosity" value={s.schistosity} min={0} max={1} />
        <RockSliderRow label="Porphyritic Texture" section="surface" field="porphyriticTexture" value={s.porphyriticTexture} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Roughness & Finish</RockSectionTitle>
      <RockSliderRow label="Roughness" section="surface" field="roughness" value={s.roughness} min={0} max={1} />
      <RockSliderRow label="Glossiness" section="surface" field="glossiness" value={s.glossiness} min={0} max={1} />
    </div>
  );
}
