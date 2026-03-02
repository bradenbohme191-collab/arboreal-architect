/**
 * CODEX5.3TREES - ProVeg Layout Context (HyperTree Architecture)
 * 
 * Single source of truth for layout + HyperTreeParams.
 * Mirrors rock studio pattern: setTreeParam(section, field, value)
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { 
  DEFAULT_HYPER_TREE_PARAMS, SPECIES_PRESETS, applySpeciesPreset,
  type HyperTreeParams, type ViewportSettings as HyperViewportSettings
} from '@/types/hyperParams';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const MIN_DRAWER_WIDTH = 280;
const MAX_DRAWER_WIDTH = 480;

// ─── VIEWPORT SETTINGS (re-exported for backward compat) ────────────────────

export type ViewportSettings = HyperViewportSettings;
export const DEFAULT_VIEWPORT_SETTINGS = DEFAULT_HYPER_TREE_PARAMS.viewport;

// ─── LAYOUT STATE ───────────────────────────────────────────────────────────

export interface ProVegLayoutState {
  leftDrawerOpen: boolean;
  leftPanel: string;
  leftDrawerWidthPx: number;
  rightDrawerOpen: boolean;
  rightPanel: string;
  rightSubTab: string;
  rightDrawerWidthPx: number;
  bottomDockExpanded: boolean;
  bottomDockHeightPx: number;
  paused: boolean;
  showStats: boolean;
  seed: number;
  isPlaying: boolean;
  treeParams: HyperTreeParams;
}

const defaultState: ProVegLayoutState = {
  leftDrawerOpen: false,
  leftPanel: 'presets',
  leftDrawerWidthPx: 300,
  rightDrawerOpen: true,
  rightPanel: 'trunk',
  rightSubTab: 'shape',
  rightDrawerWidthPx: 340,
  bottomDockExpanded: false,
  bottomDockHeightPx: 200,
  paused: false,
  showStats: false,
  seed: 1337,
  isPlaying: true,
  treeParams: { ...DEFAULT_HYPER_TREE_PARAMS },
};

// ─── CONTEXT INTERFACE ──────────────────────────────────────────────────────

export interface ProVegLayoutContextValue extends ProVegLayoutState {
  setLeftDrawerOpen: (open: boolean) => void;
  setLeftPanel: (panel: string) => void;
  openLeftPanel: (panel: string) => void;
  setLeftDrawerWidthPx: (width: number) => void;
  setRightDrawerOpen: (open: boolean) => void;
  setRightPanel: (panel: string) => void;
  setRightSubTab: (subTab: string) => void;
  openRightPanel: (panel: string, subTab?: string) => void;
  setRightDrawerWidthPx: (width: number) => void;
  setBottomDockExpanded: (expanded: boolean) => void;
  setBottomDockHeightPx: (height: number) => void;
  togglePaused: () => void;
  setShowStats: (show: boolean) => void;
  setSeed: (seed: number) => void;
  setIsPlaying: (playing: boolean) => void;
  
  // HyperTreeParams setters
  setTreeParam: (section: keyof HyperTreeParams, field: string, value: any) => void;
  setTreeParams: (params: Partial<HyperTreeParams>) => void;
  applyPreset: (speciesName: string) => void;
  resetToDefaults: () => void;
  
  minDrawerWidth: number;
  maxDrawerWidth: number;
}

// ─── CONTEXT ────────────────────────────────────────────────────────────────

const ProVegLayoutContext = createContext<ProVegLayoutContextValue | null>(null);

// ─── PROVIDER ───────────────────────────────────────────────────────────────

export function ProVegLayoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProVegLayoutState>(defaultState);

  // Layout actions
  const setLeftDrawerOpen = useCallback((open: boolean) => setState(p => ({ ...p, leftDrawerOpen: open })), []);
  const setLeftPanel = useCallback((panel: string) => setState(p => ({ ...p, leftPanel: panel })), []);
  const openLeftPanel = useCallback((panel: string) => {
    setState(p => p.leftDrawerOpen && p.leftPanel === panel
      ? { ...p, leftDrawerOpen: false }
      : { ...p, leftDrawerOpen: true, leftPanel: panel });
  }, []);
  const setLeftDrawerWidthPx = useCallback((width: number) => {
    setState(p => ({ ...p, leftDrawerWidthPx: Math.min(MAX_DRAWER_WIDTH, Math.max(MIN_DRAWER_WIDTH, width)) }));
  }, []);

  const setRightDrawerOpen = useCallback((open: boolean) => setState(p => ({ ...p, rightDrawerOpen: open })), []);
  const setRightPanel = useCallback((panel: string) => setState(p => ({ ...p, rightPanel: panel, rightSubTab: '' })), []);
  const setRightSubTab = useCallback((subTab: string) => setState(p => ({ ...p, rightSubTab: subTab })), []);
  const openRightPanel = useCallback((panel: string, subTab?: string) => {
    setState(p => p.rightDrawerOpen && p.rightPanel === panel && !subTab
      ? { ...p, rightDrawerOpen: false }
      : { ...p, rightDrawerOpen: true, rightPanel: panel, rightSubTab: subTab || p.rightSubTab });
  }, []);
  const setRightDrawerWidthPx = useCallback((width: number) => {
    setState(p => ({ ...p, rightDrawerWidthPx: Math.min(MAX_DRAWER_WIDTH, Math.max(MIN_DRAWER_WIDTH, width)) }));
  }, []);

  const setBottomDockExpanded = useCallback((expanded: boolean) => setState(p => ({ ...p, bottomDockExpanded: expanded })), []);
  const setBottomDockHeightPx = useCallback((height: number) => setState(p => ({ ...p, bottomDockHeightPx: Math.min(400, Math.max(120, height)) })), []);
  const togglePaused = useCallback(() => setState(p => ({ ...p, paused: !p.paused })), []);
  const setShowStats = useCallback((show: boolean) => setState(p => ({ ...p, showStats: show })), []);
  const setSeed = useCallback((seed: number) => setState(p => ({ ...p, seed })), []);
  const setIsPlaying = useCallback((playing: boolean) => setState(p => ({ ...p, isPlaying: playing })), []);

  // HyperTreeParams setters — mirrors rock studio pattern
  const setTreeParam = useCallback((section: keyof HyperTreeParams, field: string, value: any) => {
    setState(p => {
      // Handle top-level string fields (species, seed)
      if (typeof p.treeParams[section] !== 'object') {
        return { ...p, treeParams: { ...p.treeParams, [section]: value } };
      }
      return {
        ...p,
        treeParams: {
          ...p.treeParams,
          [section]: { ...(p.treeParams[section] as any), [field]: value },
        },
      };
    });
  }, []);

  const setTreeParams = useCallback((params: Partial<HyperTreeParams>) => {
    setState(p => {
      const merged = { ...p.treeParams };
      for (const key of Object.keys(params) as (keyof HyperTreeParams)[]) {
        const val = params[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          (merged as any)[key] = { ...(merged as any)[key], ...val };
        } else {
          (merged as any)[key] = val;
        }
      }
      return { ...p, treeParams: merged };
    });
  }, []);

  const applyPresetCb = useCallback((speciesName: string) => {
    setState(p => ({ ...p, treeParams: applySpeciesPreset(p.treeParams, speciesName) }));
  }, []);

  const resetToDefaults = useCallback(() => setState(defaultState), []);

  const value: ProVegLayoutContextValue = {
    ...state,
    setLeftDrawerOpen, setLeftPanel, openLeftPanel, setLeftDrawerWidthPx,
    setRightDrawerOpen, setRightPanel, setRightSubTab, openRightPanel, setRightDrawerWidthPx,
    setBottomDockExpanded, setBottomDockHeightPx, togglePaused, setShowStats,
    setSeed, setIsPlaying, setTreeParam, setTreeParams,
    applyPreset: applyPresetCb, resetToDefaults,
    minDrawerWidth: MIN_DRAWER_WIDTH, maxDrawerWidth: MAX_DRAWER_WIDTH,
  };

  return <ProVegLayoutContext.Provider value={value}>{children}</ProVegLayoutContext.Provider>;
}

export function useProVegLayout(): ProVegLayoutContextValue {
  const ctx = useContext(ProVegLayoutContext);
  if (!ctx) throw new Error('useProVegLayout must be used within ProVegLayoutProvider');
  return ctx;
}
