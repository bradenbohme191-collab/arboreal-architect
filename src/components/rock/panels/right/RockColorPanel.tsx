/**
 * Rock Color Panel - Expanded with optical effects, dendrites, liesegang
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockColorRow, RockSectionTitle } from '../shared/RockSliderRow';

export default function RockColorPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const c = rockParams.color;

  if (subTab === 'veins') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Veins & Striations</RockSectionTitle>
        <RockColorRow label="Vein Color" section="color" field="veinColor" value={c.veinColor} />
        <RockSliderRow label="Vein Intensity" section="color" field="veinIntensity" value={c.veinIntensity} min={0} max={1} />
        <RockSliderRow label="Vein Scale" section="color" field="veinScale" value={c.veinScale} min={0.1} max={5} step={0.1} />
        <RockSectionTitle>Color Banding</RockSectionTitle>
        <RockSliderRow label="Banding Colors" section="color" field="bandingColors" value={c.bandingColors} min={0} max={1} />
        <RockSliderRow label="Liesegang Rings" section="color" field="liesegang" value={c.liesegang} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Rhythmic color bands from diffusion</p>
        <RockSliderRow label="Manganese Dendrites" section="color" field="manganeseStain" value={c.manganeseStain} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Black branching patterns on surfaces</p>
      </div>
    );
  }

  if (subTab === 'patina') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Patina & Oxidation</RockSectionTitle>
        <RockSliderRow label="Patina" section="color" field="patina" value={c.patina} min={0} max={1} />
        <RockSliderRow label="Iron Oxide" section="color" field="ironOxide" value={c.ironOxide} min={0} max={1} />
        <RockSliderRow label="Limonite Crust" section="color" field="limoniteCrust" value={c.limoniteCrust} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Yellow-brown iron surface coating</p>
        <RockSliderRow label="Bleaching" section="color" field="bleaching" value={c.bleaching} min={0} max={1} />
        <RockSliderRow label="Stain Penetration" section="color" field="stainPenetration" value={c.stainPenetration} min={0} max={1} />
      </div>
    );
  }

  if (subTab === 'optical') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Optical Effects</RockSectionTitle>
        <RockSliderRow label="Iridescence" section="color" field="iridescence" value={c.iridescence} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Labradorite play-of-color</p>
        <RockSliderRow label="Chatoyancy" section="color" field="chatoyancy" value={c.chatoyancy} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Cat's eye light effect</p>
        <RockSliderRow label="Aventurescence" section="color" field="aventurescence" value={c.aventurescence} min={0} max={1} />
        <p className="text-[10px] text-muted-foreground -mt-1">Sparkle from mineral inclusions</p>
        <RockSliderRow label="Color Noise" section="color" field="colorNoise" value={c.colorNoise} min={0} max={1} />
        <RockSliderRow label="Noise Scale" section="color" field="colorNoiseScale" value={c.colorNoiseScale} min={0.01} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Base Colors</RockSectionTitle>
      <RockColorRow label="Base Color" section="color" field="baseColor" value={c.baseColor} />
      <RockColorRow label="Secondary" section="color" field="secondaryColor" value={c.secondaryColor} />
      <RockColorRow label="Tertiary" section="color" field="tertiaryColor" value={c.tertiaryColor} />
      <RockSliderRow label="Color Variation" section="color" field="colorVariation" value={c.colorVariation} min={0} max={1} />
      <RockSliderRow label="Saturation" section="color" field="saturation" value={c.saturation} min={0} max={2} step={0.05} />
      <RockSliderRow label="Brightness" section="color" field="brightness" value={c.brightness} min={0} max={2} step={0.05} />
    </div>
  );
}
