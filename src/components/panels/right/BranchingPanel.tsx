/**
 * CODEX5.3TREES - Branching Panel
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow, SectionTitle } from '@/components/panels/shared/SliderRow';
import { getPN } from '@/types/treeParams';

export default function BranchingPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();

  if (subTab === 'structure') {
    return (
      <div className="space-y-4">
        <SliderRow label="Branch Count" value={getPN(treeParams, 'branchCount', 'vegetation.branching.mainBranchCount', 8)} min={2} max={20} step={1} keyPrimary="branchCount" keyAlt="vegetation.branching.mainBranchCount" />
        <SliderRow label="Branch Angle (°)" value={getPN(treeParams, 'branchAngle', 'vegetation.branching.angleMean_deg', 40)} min={10} max={80} step={1} keyPrimary="branchAngle" keyAlt="vegetation.branching.angleMean_deg" unit="°" />
        <SliderRow label="Max Order" value={getPN(treeParams, 'maxOrder', 'vegetation.branching.maxOrder', 4)} min={1} max={6} step={1} keyPrimary="maxOrder" keyAlt="vegetation.branching.maxOrder" />
        <SliderRow label="Length Decay" value={getPN(treeParams, 'lengthDecay', 'vegetation.branching.lengthDecay', 0.75)} min={0.4} max={0.95} step={0.05} keyPrimary="lengthDecay" keyAlt="vegetation.branching.lengthDecay" />
        <SliderRow label="Radius Decay" value={getPN(treeParams, 'radiusDecay', 'vegetation.branching.radiusDecay', 0.6)} min={0.3} max={0.9} step={0.05} keyPrimary="radiusDecay" keyAlt="vegetation.branching.radiusDecay" />
        <SliderRow label="Probability" value={getPN(treeParams, 'branchProbability', 'vegetation.branching.probability', 0.85)} min={0.3} max={1} step={0.05} keyPrimary="branchProbability" keyAlt="vegetation.branching.probability" />
        <SliderRow label="Apical Dominance" value={getPN(treeParams, 'apicalDominance', 'vegetation.branching.apicalDominance', 0.6)} min={0} max={1} step={0.05} keyPrimary="apicalDominance" keyAlt="vegetation.branching.apicalDominance" />
      </div>
    );
  }

  if (subTab === 'junction') {
    return (
      <div className="space-y-4">
        <SliderRow label="Collar Strength" value={getPN(treeParams, 'collarStrength', 'vegetation.branching.collarStrength', 0.3)} min={0} max={1} step={0.05} keyPrimary="collarStrength" keyAlt="vegetation.branching.collarStrength" />
        <SliderRow label="Metaball Strength" value={getPN(treeParams, 'junctionMetaballStrength', 'vegetation.branching.junctionMetaballStrength', 0.2)} min={0} max={0.5} step={0.02} keyPrimary="junctionMetaballStrength" keyAlt="vegetation.branching.junctionMetaballStrength" />
      </div>
    );
  }

  if (subTab === 'gesture') {
    return (
      <div className="space-y-4">
        <SliderRow label="Branch Knot Strength" value={getPN(treeParams, 'branchKnotStrength', 'vegetation.branching.gestureKnotStrength', 0.15)} min={0} max={0.5} step={0.02} keyPrimary="branchKnotStrength" keyAlt="vegetation.branching.gestureKnotStrength" />
      </div>
    );
  }

  if (subTab === 'damage') {
    return (
      <div className="space-y-4">
        <SliderRow label="Break Probability" value={getPN(treeParams, 'breakProbability', 'vegetation.branching.breakProbability', 0.02)} min={0} max={0.2} step={0.01} keyPrimary="breakProbability" keyAlt="vegetation.branching.breakProbability" />
        <SliderRow label="Break Severity" value={getPN(treeParams, 'breakSeverity', 'vegetation.branching.breakSeverity', 0.3)} min={0} max={1} step={0.05} keyPrimary="breakSeverity" keyAlt="vegetation.branching.breakSeverity" />
      </div>
    );
  }

  return null;
}
