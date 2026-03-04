/**
 * CODEX5.3TREES - Unified Top Bar
 * App title, seed controls, wind playback, stats, and panel toggles.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Shuffle, BarChart3, TreePine, Settings, Camera } from '@/config/workspaceIcons';
import { Link } from 'react-router-dom';

export function UnifiedTopBar() {
  const {
    seed, setSeed,
    isPlaying, setIsPlaying,
    paused, togglePaused,
    showStats, setShowStats,
    rightDrawerOpen, setRightDrawerOpen,
    windMode, setWindMode,
    lodLevel,
  } = useProVegLayout();

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-proveg-topbar border-b border-border">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <TreePine className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight">ProVeg Studio</span>
          <span className="text-[10px] font-mono text-muted-foreground">v2 Pro</span>
        </div>
        
        <div className="w-px h-6 bg-border mx-2" />
        <Link to="/rocks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Rock Studio →</Link>
        <div className="w-px h-6 bg-border mx-2" />
        
        <div className="flex items-center gap-2">
          <span className="param-label">SEED</span>
          <div className="seed-display">{seed}</div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRandomSeed} title="Generate new random seed">
            <Shuffle className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Center section: Playback controls */}
      <div className="flex items-center gap-1">
        <Button variant={isPlaying ? 'default' : 'outline'} size="sm" className="gap-1.5 h-8" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <><Pause className="w-3.5 h-3.5" /><span className="text-xs">Wind On</span></> : <><Play className="w-3.5 h-3.5" /><span className="text-xs">Wind Off</span></>}
        </Button>
        
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setWindMode(windMode === 'vertex' ? 'skeletal' : 'vertex')} title={`Wind mode: ${windMode}`}>
          <span className={`w-2 h-2 rounded-full ${windMode === 'skeletal' ? 'bg-accent' : 'bg-muted-foreground'}`} />
          <span className="uppercase">{windMode}</span>
        </Button>
        
        <div className="flex items-center gap-1.5 px-2 ml-2">
          <span className="param-label">LOD</span>
          <div className={`lod-indicator lod-${lodLevel}`} />
          <span className="text-xs font-mono uppercase text-muted-foreground">{lodLevel}</span>
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-1">
        <Button variant={showStats ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setShowStats(!showStats)} title="Toggle stats overlay">
          <BarChart3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Capture screenshot">
          <Camera className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Settings">
          <Settings className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-2" />
        <Button variant={rightDrawerOpen ? 'secondary' : 'outline'} size="sm" className="h-8 text-xs" onClick={() => setRightDrawerOpen(!rightDrawerOpen)}>
          {rightDrawerOpen ? 'Hide Panels' : 'Show Panels'}
        </Button>
      </div>
    </header>
  );
}
