/**
 * CODEX5.3TREES - Left Seed Panel
 * 
 * Seed and age controls.
 */

import { useState } from 'react';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow, SectionTitle } from './shared/SliderRow';
import { getPN } from '@/types/treeParams';
import { Button } from '@/components/ui/button';
import { Shuffle } from '@/config/workspaceIcons';

export default function LeftSeedPanel() {
  const { seed, setSeed, treeParams, setTreeParam } = useProVegLayout();
  const [inputSeed, setInputSeed] = useState(seed.toString());

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSeed(e.target.value);
  };

  const handleSeedSubmit = () => {
    const parsed = parseInt(inputSeed, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setSeed(parsed);
    }
  };

  const handleRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000);
    setSeed(newSeed);
    setInputSeed(newSeed.toString());
  };

  return (
    <div className="space-y-4">
      <SectionTitle>Seed</SectionTitle>
      
      <p className="text-xs text-muted-foreground">
        The seed determines the random variation of the tree. Same seed + same parameters = same tree.
      </p>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            value={inputSeed}
            onChange={handleSeedChange}
            onBlur={handleSeedSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleSeedSubmit()}
            className="flex-1 h-9 px-3 text-sm font-mono bg-muted border border-border rounded text-foreground"
            min={0}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={handleRandomSeed}
            title="Generate random seed"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {[1337, 42, 2024, 9999].map((s) => (
            <Button
              key={s}
              variant={seed === s ? 'default' : 'ghost'}
              size="sm"
              className="text-xs font-mono"
              onClick={() => {
                setSeed(s);
                setInputSeed(s.toString());
              }}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
      
      <SectionTitle>Age</SectionTitle>
      
      <p className="text-xs text-muted-foreground">
        Age affects overall size, branch development, and leaf density. 0 = sapling, 1 = mature tree.
      </p>
      
      <SliderRow
        label="Age"
        value={getPN(treeParams, 'age01', 'vegetation.instance.age01', 1.0)}
        min={0}
        max={1}
        step={0.01}
        keyPrimary="age01"
        keyAlt="vegetation.instance.age01"
        format={(v) => `${Math.round(v * 100)}%`}
      />
      
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Sapling', value: 0.25 },
          { label: 'Young', value: 0.5 },
          { label: 'Mature', value: 1.0 },
        ].map((preset) => (
          <Button
            key={preset.label}
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              setTreeParam('age01', preset.value);
              setTreeParam('vegetation.instance.age01', preset.value);
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
