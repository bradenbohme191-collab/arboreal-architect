/**
 * CODEX5.3TREES - Unified Right Rail
 * 
 * Icon buttons for right drawer panels (tree parameters).
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { RIGHT_PANELS } from '@/config/workspaceScenes';
import { getIcon, PanelRightClose } from '@/config/workspaceIcons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function UnifiedRightRail() {
  const {
    rightDrawerOpen,
    rightPanel,
    openRightPanel,
    setRightDrawerOpen,
  } = useProVegLayout();

  return (
    <div className="w-12 flex flex-col items-center py-2 proveg-rail border-l border-border">
      {/* Close button when drawer is open */}
      {rightDrawerOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground mb-2"
              onClick={() => setRightDrawerOpen(false)}
            >
              <PanelRightClose className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-mono text-xs">
            Close drawer
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Panel icons */}
      <div className="flex flex-col gap-1">
        {RIGHT_PANELS.map((panel) => {
          const Icon = getIcon(panel.icon);
          const isActive = rightDrawerOpen && rightPanel === panel.id;
          
          return (
            <Tooltip key={panel.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="icon"
                  className={`h-9 w-9 ${isActive ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => openRightPanel(panel.id)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-mono text-xs">
                {panel.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
