/**
 * CODEX5.3TREES - Unified Left Drawer
 * 
 * Expandable drawer for left panels: Presets, Environment, Seed.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { LEFT_PANELS, getLeftPanel } from '@/config/workspaceScenes';
import { ScrollArea } from '@/components/ui/scroll-area';
import LeftPresetsPanel from '@/components/panels/LeftPresetsPanel';
import LeftEnvironmentPanel from '@/components/panels/LeftEnvironmentPanel';
import LeftSeedPanel from '@/components/panels/LeftSeedPanel';
import LeftDiagnosticsPanel from '@/components/panels/LeftDiagnosticsPanel';

export function UnifiedLeftDrawer() {
  const {
    leftDrawerOpen,
    leftPanel,
    leftDrawerWidthPx,
  } = useProVegLayout();

  if (!leftDrawerOpen) return null;

  const panelConfig = getLeftPanel(leftPanel);
  const title = panelConfig?.label || 'Panel';

  return (
    <div
      className="flex flex-col proveg-drawer border-r border-border animate-slide-in-left"
      style={{ width: leftDrawerWidthPx }}
    >
      {/* Header */}
      <div className="h-10 flex items-center px-4 border-b border-border">
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4">
          {leftPanel === 'presets' && <LeftPresetsPanel />}
          {leftPanel === 'environment' && <LeftEnvironmentPanel />}
          {leftPanel === 'seed' && <LeftSeedPanel />}
          {leftPanel === 'diagnostics' && <LeftDiagnosticsPanel />}
        </div>
      </ScrollArea>
    </div>
  );
}
