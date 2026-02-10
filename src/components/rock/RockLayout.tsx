/**
 * Rock Studio Layout Components
 * Mirrors tree studio structure but uses rock context.
 */

import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { ROCK_LEFT_PANELS, ROCK_RIGHT_PANELS, getRockLeftPanel, getRockRightPanel, getRockDefaultSubTab } from '@/config/rockWorkspaceScenes';
import { getIcon, PanelLeftClose, PanelRightClose, Shuffle, BarChart3, Camera, Settings, ChevronUp, ChevronDown } from '@/config/workspaceIcons';
import { Mountain } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import RockPresetsPanel from './panels/left/RockPresetsPanel';
import RockEnvironmentPanel from './panels/left/RockEnvironmentPanel';
import RockSeedPanel from './panels/left/RockSeedPanel';
import RockDiagnosticsPanel from './panels/left/RockDiagnosticsPanel';
import RockSurfacePanel from './panels/right/RockSurfacePanel';
import RockGeologyPanel from './panels/right/RockGeologyPanel';
import RockWeatheringPanel from './panels/right/RockWeatheringPanel';
import RockFracturesPanel from './panels/right/RockFracturesPanel';
import RockColorPanel from './panels/right/RockColorPanel';
import RockShapePanel from './panels/right/RockShapePanel';

// ─── TOP BAR ────────────────────────────────────────────────────────────────
export function RockTopBar() {
  const { seed, setSeed, showStats, setShowStats, rightDrawerOpen, setRightDrawerOpen } = useProRockLayout();
  
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-proveg-topbar border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight">ProRock Studio</span>
          <span className="text-[10px] font-mono text-muted-foreground">v1 Pro</span>
        </div>
        <div className="w-px h-6 bg-border mx-2" />
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Tree Studio</Link>
        <div className="w-px h-6 bg-border mx-2" />
        <div className="flex items-center gap-2">
          <span className="param-label">SEED</span>
          <div className="seed-display">{seed}</div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSeed(Math.floor(Math.random() * 100000))}>
            <Shuffle className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant={showStats ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setShowStats(!showStats)}>
          <BarChart3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Camera className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
        <div className="w-px h-6 bg-border mx-2" />
        <Button variant={rightDrawerOpen ? 'secondary' : 'outline'} size="sm" className="h-8 text-xs" onClick={() => setRightDrawerOpen(!rightDrawerOpen)}>
          {rightDrawerOpen ? 'Hide Panels' : 'Show Panels'}
        </Button>
      </div>
    </header>
  );
}

// ─── LEFT RAIL ──────────────────────────────────────────────────────────────
export function RockLeftRail() {
  const { leftDrawerOpen, leftPanel, openLeftPanel, setLeftDrawerOpen } = useProRockLayout();
  
  return (
    <div className="w-12 flex flex-col items-center py-2 proveg-rail border-r border-border">
      <div className="flex flex-col gap-1">
        {ROCK_LEFT_PANELS.map((panel) => {
          const Icon = getIcon(panel.icon);
          const isActive = leftDrawerOpen && leftPanel === panel.id;
          return (
            <Tooltip key={panel.id}>
              <TooltipTrigger asChild>
                <Button variant={isActive ? 'secondary' : 'ghost'} size="icon"
                  className={`h-9 w-9 ${isActive ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => openLeftPanel(panel.id)}>
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-mono text-xs">{panel.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex-1" />
      {leftDrawerOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => setLeftDrawerOpen(false)}>
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-mono text-xs">Close drawer</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ─── LEFT DRAWER ────────────────────────────────────────────────────────────
export function RockLeftDrawer() {
  const { leftDrawerOpen, leftPanel, leftDrawerWidthPx } = useProRockLayout();
  if (!leftDrawerOpen) return null;
  const panelConfig = getRockLeftPanel(leftPanel);
  
  return (
    <div className="flex flex-col proveg-drawer border-r border-border animate-slide-in-left" style={{ width: leftDrawerWidthPx }}>
      <div className="h-10 flex items-center px-4 border-b border-border">
        <h2 className="text-sm font-medium">{panelConfig?.label || 'Panel'}</h2>
      </div>
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4">
          {leftPanel === 'presets' && <RockPresetsPanel />}
          {leftPanel === 'environment' && <RockEnvironmentPanel />}
          {leftPanel === 'seed' && <RockSeedPanel />}
          {leftPanel === 'diagnostics' && <RockDiagnosticsPanel />}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── RIGHT RAIL ─────────────────────────────────────────────────────────────
export function RockRightRail() {
  const { rightDrawerOpen, rightPanel, openRightPanel, setRightDrawerOpen } = useProRockLayout();
  
  return (
    <div className="w-12 flex flex-col items-center py-2 proveg-rail border-l border-border">
      {rightDrawerOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground mb-2" onClick={() => setRightDrawerOpen(false)}>
              <PanelRightClose className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-mono text-xs">Close drawer</TooltipContent>
        </Tooltip>
      )}
      <div className="flex flex-col gap-1">
        {ROCK_RIGHT_PANELS.map((panel) => {
          const Icon = getIcon(panel.icon);
          const isActive = rightDrawerOpen && rightPanel === panel.id;
          return (
            <Tooltip key={panel.id}>
              <TooltipTrigger asChild>
                <Button variant={isActive ? 'secondary' : 'ghost'} size="icon"
                  className={`h-9 w-9 ${isActive ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => openRightPanel(panel.id)}>
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-mono text-xs">{panel.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

// ─── RIGHT DRAWER ───────────────────────────────────────────────────────────
export function RockRightDrawer() {
  const { rightDrawerOpen, rightPanel, rightSubTab, setRightSubTab, rightDrawerWidthPx } = useProRockLayout();
  if (!rightDrawerOpen) return null;
  
  const panelConfig = getRockRightPanel(rightPanel);
  const subTabs = panelConfig?.subTabs || [];
  const effectiveSubTab = rightSubTab || getRockDefaultSubTab(rightPanel);
  
  return (
    <div className="flex flex-col proveg-drawer border-l border-border animate-slide-in-right" style={{ width: rightDrawerWidthPx }}>
      <div className="flex flex-col border-b border-border">
        <div className="h-10 flex items-center px-4">
          <h2 className="text-sm font-medium">{panelConfig?.label || 'Panel'}</h2>
        </div>
        {subTabs.length > 0 && (
          <div className="flex px-2 pb-2 gap-1">
            {subTabs.map((tab) => {
              const Icon = getIcon(tab.icon);
              const isActive = effectiveSubTab === tab.id;
              return (
                <Button key={tab.id} variant={isActive ? 'secondary' : 'ghost'} size="sm"
                  className={`h-7 text-xs gap-1.5 ${isActive ? 'bg-accent/20 text-accent' : 'text-muted-foreground'}`}
                  onClick={() => setRightSubTab(tab.id)}>
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4">
          {rightPanel === 'surface' && <RockSurfacePanel subTab={effectiveSubTab} />}
          {rightPanel === 'geology' && <RockGeologyPanel subTab={effectiveSubTab} />}
          {rightPanel === 'weathering' && <RockWeatheringPanel subTab={effectiveSubTab} />}
          {rightPanel === 'fractures' && <RockFracturesPanel subTab={effectiveSubTab} />}
          {rightPanel === 'color' && <RockColorPanel subTab={effectiveSubTab} />}
          {rightPanel === 'shape' && <RockShapePanel subTab={effectiveSubTab} />}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── BOTTOM BAR ─────────────────────────────────────────────────────────────
export function RockBottomBar() {
  const { bottomDockExpanded, setBottomDockExpanded } = useProRockLayout();
  
  return (
    <footer className="h-8 flex items-center justify-between px-4 bg-proveg-bottombar border-t border-border">
      <span className="text-xs text-muted-foreground">CODEX5.3ROCKS · ProRock Studio v1 Pro</span>
      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => setBottomDockExpanded(!bottomDockExpanded)}>
        {bottomDockExpanded ? <><ChevronDown className="w-3 h-3" /> Hide Dock</> : <><ChevronUp className="w-3 h-3" /> Show Dock</>}
      </Button>
    </footer>
  );
}

// ─── BOTTOM DOCK ────────────────────────────────────────────────────────────
export function RockBottomDock() {
  const { bottomDockExpanded, bottomDockHeightPx } = useProRockLayout();
  if (!bottomDockExpanded) return null;
  
  return (
    <div className="flex flex-col bg-proveg-drawer border-t border-border animate-fade-in" style={{ height: bottomDockHeightPx }}>
      <div className="h-8 flex items-center gap-4 px-4 border-b border-border">
        <span className="text-xs font-medium text-primary">Captures</span>
        <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Console</span>
        <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Material Export</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No captures yet</span>
      </div>
    </div>
  );
}
