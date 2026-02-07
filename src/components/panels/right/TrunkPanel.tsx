/**
 * CODEX5.3TREES - Trunk Panel
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow, ColorRow, SectionTitle } from '@/components/panels/shared/SliderRow';
import { getPN, getPS } from '@/types/treeParams';

export default function TrunkPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();

  if (subTab === 'shape') {
    return (
      <div className="space-y-4">
        <SliderRow label="Height (m)" value={getPN(treeParams, 'height', 'vegetation.species.heightBase_m', 8)} min={2} max={30} step={0.5} keyPrimary="height" keyAlt="vegetation.species.heightBase_m" unit="m" />
        <SliderRow label="Base Radius (m)" value={getPN(treeParams, 'baseRadius', 'vegetation.trunk.baseRadius_m', 0.4)} min={0.1} max={1.5} step={0.02} keyPrimary="baseRadius" keyAlt="vegetation.trunk.baseRadius_m" unit="m" />
        <SliderRow label="Taper" value={getPN(treeParams, 'taperExponent', 'vegetation.trunk.taperExponent', 0.7)} min={0.3} max={1.5} step={0.05} keyPrimary="taperExponent" keyAlt="vegetation.trunk.taperExponent" />
        <SliderRow label="Base Flare" value={getPN(treeParams, 'baseFlare', 'vegetation.trunk.baseFlare', 1.3)} min={1} max={2.5} step={0.05} keyPrimary="baseFlare" keyAlt="vegetation.trunk.baseFlare" />
        <SliderRow label="Twist (°)" value={getPN(treeParams, 'twist', 'vegetation.trunk.twist_deg', 0)} min={-90} max={90} step={5} keyPrimary="twist" keyAlt="vegetation.trunk.twist_deg" unit="°" />
        <ColorRow label="Bark Color" value={getPS(treeParams, 'trunkColor', 'vegetation.trunk.barkColor', '#5d4037')} keyPrimary="trunkColor" keyAlt="vegetation.trunk.barkColor" />
      </div>
    );
  }

  if (subTab === 'gesture') {
    return (
      <div className="space-y-4">
        <SliderRow label="Knot Count" value={getPN(treeParams, 'trunkKnotCount', 'vegetation.trunk.gestureKnotCount', 2)} min={0} max={6} step={1} keyPrimary="trunkKnotCount" keyAlt="vegetation.trunk.gestureKnotCount" />
        <SliderRow label="Knot Strength" value={getPN(treeParams, 'trunkKnotStrength', 'vegetation.trunk.gestureKnotStrength', 0.25)} min={0} max={1} step={0.05} keyPrimary="trunkKnotStrength" keyAlt="vegetation.trunk.gestureKnotStrength" />
        <SliderRow label="Knot Width" value={getPN(treeParams, 'trunkKnotWidth', 'vegetation.trunk.gestureKnotWidth', 0.12)} min={0.02} max={0.3} step={0.01} keyPrimary="trunkKnotWidth" keyAlt="vegetation.trunk.gestureKnotWidth" />
      </div>
    );
  }

  if (subTab === 'cross') {
    return (
      <div className="space-y-4">
        <SliderRow label="Ovality" value={getPN(treeParams, 'trunkOvality', 'vegetation.trunk.ovality', 0.06)} min={0} max={0.3} step={0.01} keyPrimary="trunkOvality" keyAlt="vegetation.trunk.ovality" />
        <SliderRow label="Bark Roughness" value={getPN(treeParams, 'barkRoughness', 'vegetation.trunk.barkRoughness', 0.75)} min={0} max={1} step={0.05} keyPrimary="barkRoughness" keyAlt="vegetation.trunk.barkRoughness" />
      </div>
    );
  }

  if (subTab === 'buttress') {
    return (
      <div className="space-y-4">
        <SliderRow label="Buttress Strength" value={getPN(treeParams, 'buttressStrength', 'vegetation.trunk.buttressStrength', 0)} min={0} max={1} step={0.05} keyPrimary="buttressStrength" keyAlt="vegetation.trunk.buttressStrength" />
        <SliderRow label="Buttress Count" value={getPN(treeParams, 'buttressCount', 'vegetation.trunk.buttressCount', 4)} min={2} max={8} step={1} keyPrimary="buttressCount" keyAlt="vegetation.trunk.buttressCount" />
      </div>
    );
  }

  return null;
}
