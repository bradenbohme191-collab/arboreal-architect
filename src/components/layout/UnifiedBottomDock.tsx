/**
 * CODEX5.3TREES - Unified Bottom Dock
 * 
 * Expandable dock for captures, console, timeline.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';

export function UnifiedBottomDock() {
  const {
    bottomDockExpanded,
    bottomDockHeightPx,
  } = useProVegLayout();

  if (!bottomDockExpanded) return null;

  return (
    <div
      className="flex flex-col bg-proveg-drawer border-t border-border animate-fade-in"
      style={{ height: bottomDockHeightPx }}
    >
      {/* Tabs */}
      <div className="h-8 flex items-center gap-4 px-4 border-b border-border">
        <span className="text-xs font-medium text-primary">Captures</span>
        <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Console</span>
        <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Timeline</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No captures yet</span>
      </div>
    </div>
  );
}
