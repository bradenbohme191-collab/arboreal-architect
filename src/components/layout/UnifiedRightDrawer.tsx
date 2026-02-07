/**
 * CODEX5.3TREES - Unified Right Drawer
 * 
 * Expandable drawer for tree parameter panels with sub-tabs.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { RIGHT_PANELS, getRightPanel, getDefaultSubTab } from '@/config/workspaceScenes';
import { getIcon } from '@/config/workspaceIcons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import TrunkPanel from '@/components/panels/right/TrunkPanel';
import BranchingPanel from '@/components/panels/right/BranchingPanel';
import LeavesPanel from '@/components/panels/right/LeavesPanel';
import BarkRootsPanel from '@/components/panels/right/BarkRootsPanel';
import WindLODPanel from '@/components/panels/right/WindLODPanel';
import SpaceColonizationPanel from '@/components/panels/right/SpaceColonizationPanel';

export function UnifiedRightDrawer() {
  const {
    rightDrawerOpen,
    rightPanel,
    rightSubTab,
    setRightSubTab,
    rightDrawerWidthPx,
  } = useProVegLayout();

  if (!rightDrawerOpen) return null;

  const panelConfig = getRightPanel(rightPanel);
  const title = panelConfig?.label || 'Panel';
  const subTabs = panelConfig?.subTabs || [];
  const effectiveSubTab = rightSubTab || getDefaultSubTab(rightPanel);

  return (
    <div
      className="flex flex-col proveg-drawer border-l border-border animate-slide-in-right"
      style={{ width: rightDrawerWidthPx }}
    >
      {/* Header */}
      <div className="flex flex-col border-b border-border">
        <div className="h-10 flex items-center px-4">
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
        
        {/* Sub-tabs */}
        {subTabs.length > 0 && (
          <div className="flex px-2 pb-2 gap-1">
            {subTabs.map((tab) => {
              const Icon = getIcon(tab.icon);
              const isActive = effectiveSubTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`h-7 text-xs gap-1.5 ${isActive ? 'bg-accent/20 text-accent' : 'text-muted-foreground'}`}
                  onClick={() => setRightSubTab(tab.id)}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4">
          {rightPanel === 'trunk' && <TrunkPanel subTab={effectiveSubTab} />}
          {rightPanel === 'branching' && <BranchingPanel subTab={effectiveSubTab} />}
          {rightPanel === 'leaves' && <LeavesPanel subTab={effectiveSubTab} />}
          {rightPanel === 'bark-roots' && <BarkRootsPanel subTab={effectiveSubTab} />}
          {rightPanel === 'wind-lod' && <WindLODPanel subTab={effectiveSubTab} />}
          {rightPanel === 'space-colonization' && <SpaceColonizationPanel subTab={effectiveSubTab} />}
        </div>
      </ScrollArea>
    </div>
  );
}
