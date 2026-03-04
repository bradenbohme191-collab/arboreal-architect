/**
 * CODEX5.3TREES - Unified Right Drawer
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
import BarkDetailPanel from '@/components/panels/right/BarkDetailPanel';
import RootSystemPanel from '@/components/panels/right/RootSystemPanel';
import DamagePanel from '@/components/panels/right/DamagePanel';
import WindLODPanel from '@/components/panels/right/WindLODPanel';
import SoilPanel from '@/components/panels/right/SoilPanel';
import GrowthPanel from '@/components/panels/right/GrowthPanel';
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
          <div className="flex px-2 pb-2 gap-1 flex-wrap">
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
          {rightPanel === 'bark-detail' && <BarkDetailPanel subTab={effectiveSubTab} />}
          {rightPanel === 'root-system' && <RootSystemPanel subTab={effectiveSubTab} />}
          {rightPanel === 'damage' && <DamagePanel subTab={effectiveSubTab} />}
          {rightPanel === 'wind-lod' && <WindLODPanel subTab={effectiveSubTab} />}
          {rightPanel === 'soil' && <SoilPanel subTab={effectiveSubTab} />}
          {rightPanel === 'growth' && <GrowthPanel subTab={effectiveSubTab} />}
          {rightPanel === 'space-colonization' && <SpaceColonizationPanel subTab={effectiveSubTab} />}
        </div>
      </ScrollArea>
    </div>
  );
}
