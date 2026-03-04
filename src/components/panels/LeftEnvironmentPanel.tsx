/**
 * CODEX5.3TREES - Left Environment Panel
 * Viewport and environment settings, wired to HyperTreeParams.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeToggleRow, TreeColorRow, TreeSectionTitle } from './shared/TreeSliderRow';

export default function LeftEnvironmentPanel() {
  const { treeParams, viewportSettings, setViewportSettings, groundLayer, setGroundLayer } = useProVegLayout();

  return (
    <div className="space-y-4">
      <TreeSectionTitle>Lighting</TreeSectionTitle>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="param-label">Background</span>
          <input
            type="color"
            value={viewportSettings.backgroundColor}
            onChange={(e) => setViewportSettings({ backgroundColor: e.target.value })}
            className="w-8 h-6 rounded cursor-pointer border border-border bg-transparent"
          />
        </div>
        
        <TreeSliderRow label="Exposure" section="viewport" field="exposure" value={viewportSettings.exposure} min={0.1} max={3} step={0.05} />
        <TreeSliderRow label="Main Light" section="viewport" field="mainLightIntensity" value={viewportSettings.mainLightIntensity} min={0} max={2} step={0.05} />
        <TreeSliderRow label="Ambient" section="viewport" field="ambientIntensity" value={viewportSettings.ambientIntensity} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Fill Light" section="viewport" field="fillLightIntensity" value={viewportSettings.fillLightIntensity} min={0} max={1} step={0.05} />
        <TreeToggleRow label="Shadows" section="viewport" field="enableShadows" value={viewportSettings.enableShadows} />
      </div>
      
      <TreeSectionTitle>Environment</TreeSectionTitle>
      
      <div className="space-y-3">
        <TreeSliderRow label="Moisture" section="soil" field="moisture" value={treeParams.soil.moisture} min={0} max={1} step={0.01} />
        <TreeSliderRow label="Nutrients" section="soil" field="nutrients" value={treeParams.soil.nutrients} min={0} max={1} step={0.01} />
        <TreeSliderRow label="Organic Matter" section="soil" field="organicMatter" value={treeParams.soil.organicMatter} min={0} max={1} step={0.01} />
      </div>
      
      <TreeSectionTitle>Ground Layer</TreeSectionTitle>
      
      <div className="flex gap-2">
        <button
          onClick={() => setGroundLayer('simple')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
            groundLayer === 'simple' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Simple Ground
        </button>
        <button
          onClick={() => setGroundLayer('quick-grass')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
            groundLayer === 'quick-grass' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Quick Grass
        </button>
      </div>
    </div>
  );
}
