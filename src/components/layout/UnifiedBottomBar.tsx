/**
 * CODEX5.3TREES - Unified Bottom Bar
 * 
 * Footer with dock toggle.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from '@/config/workspaceIcons';

export function UnifiedBottomBar() {
  const {
    bottomDockExpanded,
    setBottomDockExpanded,
  } = useProVegLayout();

  return (
    <footer className="h-8 flex items-center justify-between px-4 bg-proveg-bottombar border-t border-border">
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">
          CODEX5.3TREES · ProVeg Studio v2 Pro
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => setBottomDockExpanded(!bottomDockExpanded)}
      >
        {bottomDockExpanded ? (
          <>
            <ChevronDown className="w-3 h-3" />
            Hide Dock
          </>
        ) : (
          <>
            <ChevronUp className="w-3 h-3" />
            Show Dock
          </>
        )}
      </Button>
    </footer>
  );
}
