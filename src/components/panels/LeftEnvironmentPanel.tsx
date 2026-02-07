/**
 * CODEX5.3TREES - Left Environment Panel
 * 
 * Viewport and environment settings.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow, ColorRow, ToggleRow, SectionTitle } from './shared/SliderRow';
import { getPN, getPB, getPS } from '@/types/treeParams';

export default function LeftEnvironmentPanel() {
  const { treeParams, viewportSettings, setViewportSettings, groundLayer, setGroundLayer } = useProVegLayout();

  return (
    <div className="space-y-4">
      <SectionTitle>Lighting</SectionTitle>
      
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
        
        <SliderRow
          label="Exposure"
          value={viewportSettings.exposure}
          min={0.1}
          max={3}
          step={0.05}
          keyPrimary=""
          format={(v) => v.toFixed(2)}
        />
        
        <SliderRow
          label="Main Light"
          value={viewportSettings.mainLightIntensity}
          min={0}
          max={2}
          step={0.05}
          keyPrimary=""
          format={(v) => v.toFixed(2)}
        />
        
        <SliderRow
          label="Ambient"
          value={viewportSettings.ambientLightIntensity}
          min={0}
          max={1}
          step={0.05}
          keyPrimary=""
          format={(v) => v.toFixed(2)}
        />
        
        <SliderRow
          label="Fill Light"
          value={viewportSettings.fillLightIntensity}
          min={0}
          max={1}
          step={0.05}
          keyPrimary=""
          format={(v) => v.toFixed(2)}
        />
        
        <ToggleRow
          label="Shadows"
          value={viewportSettings.enableShadows}
          keyPrimary=""
        />
      </div>
      
      <SectionTitle>Environment</SectionTitle>
      
      <div className="space-y-3">
        <SliderRow
          label="Moisture"
          value={getPN(treeParams, 'moisture', 'vegetation.env.moisture', 0.55)}
          min={0}
          max={1}
          step={0.01}
          keyPrimary="moisture"
          keyAlt="vegetation.env.moisture"
        />
        
        <SliderRow
          label="Time of Day"
          value={getPN(treeParams, 'timeOfDay', 'vegetation.env.timeOfDay', 0.45)}
          min={0}
          max={1}
          step={0.01}
          keyPrimary="timeOfDay"
          keyAlt="vegetation.env.timeOfDay"
          format={(v) => {
            const hours = Math.floor(v * 24);
            const mins = Math.floor((v * 24 - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          }}
        />
        
        <ToggleRow
          label="Auto Sun"
          value={getPB(treeParams, 'autoSun', 'vegetation.env.autoSun', true)}
          keyPrimary="autoSun"
          keyAlt="vegetation.env.autoSun"
        />
        
        <SliderRow
          label="Contact Shadow"
          value={getPN(treeParams, 'contactShadowStrength', 'vegetation.env.contactShadowStrength', 0.62)}
          min={0}
          max={1}
          step={0.01}
          keyPrimary="contactShadowStrength"
          keyAlt="vegetation.env.contactShadowStrength"
        />
      </div>
      
      <SectionTitle>Ground Layer</SectionTitle>
      
      <div className="flex gap-2">
        <button
          onClick={() => setGroundLayer('simple')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
            groundLayer === 'simple'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Simple Ground
        </button>
        <button
          onClick={() => setGroundLayer('quick-grass')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
            groundLayer === 'quick-grass'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Quick Grass
        </button>
      </div>
    </div>
  );
}
