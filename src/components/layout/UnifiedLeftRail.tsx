/**
 * CODEX5.3TREES - Unified Left Rail
 * 
 * Icon buttons for left drawer panels.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { LEFT_PANELS } from '@/config/workspaceScenes';
import { getIcon, PanelLeftClose } from '@/config/workspaceIcons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function UnifiedLeftRail() {
  const {
    leftDrawerOpen,
    leftPanel,
    openLeftPanel,
    setLeftDrawerOpen,
  } = useProVegLayout();

  return (
    <div className="w-12 flex flex-col items-center py-2 proveg-rail border-r border-border">
      {/* Panel icons */}
      <div className="flex flex-col gap-1">
        {LEFT_PANELS.map((panel) => {
          const Icon = getIcon(panel.icon);
          const isActive = leftDrawerOpen && leftPanel === panel.id;
          
          return (
            <Tooltip key={panel.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="icon"
                  className={`h-9 w-9 ${isActive ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => openLeftPanel(panel.id)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-mono text-xs">
                {panel.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Close button when drawer is open */}
      {leftDrawerOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setLeftDrawerOpen(false)}
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-mono text-xs">
            Close drawer
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
