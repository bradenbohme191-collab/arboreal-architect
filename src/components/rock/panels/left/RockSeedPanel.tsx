/**
 * Rock Left Seed Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSectionTitle } from '../shared/RockSliderRow';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';

export default function RockSeedPanel() {
  const { seed, setSeed, rockParams } = useProRockLayout();

  return (
    <div className="space-y-4">
      <RockSectionTitle>Procedural Seed</RockSectionTitle>
      <div className="flex items-center gap-2">
        <div className="seed-display flex-1 text-center">{seed}</div>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSeed(Math.floor(Math.random() * 100000))}>
          <Shuffle className="w-3.5 h-3.5" />
        </Button>
      </div>

      <RockSectionTitle>Geological Age</RockSectionTitle>
      <RockSliderRow
        label="Age"
        section="weathering"
        field="ageYears"
        value={rockParams.weathering.ageYears}
        min={0}
        max={1000000}
        step={1000}
        unit=" yrs"
        format={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toFixed(0)}
      />
    </div>
  );
}
