/**
 * CODEX5.3TREES - ProVeg Layout Context
 * 
 * Single source of truth for:
 * - Layout state (drawers, panels, widths)
 * - Tree parameters
 * - Viewport settings
 * - Wind mode and playback
 * - Seed and ground layer
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_TREE_PARAMS, type TreeParams, type GroundLayerType, type LODLevel, type WindMode } from '@/types/treeParams';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const MIN_DRAWER_WIDTH = 280;
const MAX_DRAWER_WIDTH = 480;
const DEFAULT_LEFT_DRAWER_WIDTH = 300;
const DEFAULT_RIGHT_DRAWER_WIDTH = 340;
const MIN_BOTTOM_DOCK_HEIGHT = 120;
const MAX_BOTTOM_DOCK_HEIGHT = 400;
const DEFAULT_BOTTOM_DOCK_HEIGHT = 200;

// ─── VIEWPORT SETTINGS ──────────────────────────────────────────────────────

export interface ViewportSettings {
  backgroundColor: string;
  ambientLightIntensity: number;
  ambientLightColor: string;
  enableShadows: boolean;
  mainLightIntensity: number;
  mainLightColor: string;
  mainLightPosition: [number, number, number];
  fillLightIntensity: number;
  fillLightColor: string;
  fillLightPosition: [number, number, number];
  hemiIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  exposure: number;
  fogEnabled: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

export const DEFAULT_VIEWPORT_SETTINGS: ViewportSettings = {
  backgroundColor: '#0d1117',
  ambientLightIntensity: 0.35,
  ambientLightColor: '#c8d6e5',
  enableShadows: true,
  mainLightIntensity: 0.8,
  mainLightColor: '#ffffff',
  mainLightPosition: [8, 12, 5],
  fillLightIntensity: 0.25,
  fillLightColor: '#6b8cce',
  fillLightPosition: [-4, 6, -3],
  hemiIntensity: 0.3,
  hemiSkyColor: '#c8d6e5',
  hemiGroundColor: '#1a1a2e',
  exposure: 1.0,
  fogEnabled: true,
  fogColor: '#0d1117',
  fogNear: 20,
  fogFar: 100,
};

// ─── LAYOUT STATE ───────────────────────────────────────────────────────────

export interface ProVegLayoutState {
  // Left drawer
  leftDrawerOpen: boolean;
  leftPanel: string;
  leftDrawerWidthPx: number;
  
  // Right drawer
  rightDrawerOpen: boolean;
  rightPanel: string;
  rightSubTab: string;
  rightDrawerWidthPx: number;
  
  // Bottom dock
  bottomDockExpanded: boolean;
  bottomDockHeightPx: number;
  
  // Simulation state
  paused: boolean;
  showStats: boolean;
  
  // Tree state
  treeParams: TreeParams;
  seed: number;
  isPlaying: boolean;
  groundLayer: GroundLayerType;
  
  // Viewport
  viewportSettings: ViewportSettings;
  lodLevel: LODLevel;
  
  // Wind
  windMode: WindMode;
}

// ─── CONTEXT INTERFACE ──────────────────────────────────────────────────────

export interface ProVegLayoutContextValue extends ProVegLayoutState {
  // Left drawer actions
  setLeftDrawerOpen: (open: boolean) => void;
  setLeftPanel: (panel: string) => void;
  openLeftPanel: (panel: string) => void;
  setLeftDrawerWidthPx: (width: number) => void;
  
  // Right drawer actions
  setRightDrawerOpen: (open: boolean) => void;
  setRightPanel: (panel: string) => void;
  setRightSubTab: (subTab: string) => void;
  openRightPanel: (panel: string, subTab?: string) => void;
  setRightDrawerWidthPx: (width: number) => void;
  
  // Bottom dock actions
  setBottomDockExpanded: (expanded: boolean) => void;
  setBottomDockHeightPx: (height: number) => void;
  
  // Simulation actions
  togglePaused: () => void;
  setShowStats: (show: boolean) => void;
  
  // Tree actions
  setTreeParams: (params: Partial<TreeParams>) => void;
  setTreeParam: (key: string, value: number | string | boolean) => void;
  setSeed: (seed: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setGroundLayer: (layer: GroundLayerType) => void;
  
  // Viewport actions
  setViewportSettings: (settings: Partial<ViewportSettings>) => void;
  setLodLevel: (level: LODLevel) => void;
  
  // Wind actions
  setWindMode: (mode: WindMode) => void;
  
  // Reset
  resetToDefaults: () => void;
  
  // Constants
  minDrawerWidth: number;
  maxDrawerWidth: number;
}

// ─── DEFAULT STATE ──────────────────────────────────────────────────────────

const defaultState: ProVegLayoutState = {
  leftDrawerOpen: false,
  leftPanel: 'presets',
  leftDrawerWidthPx: DEFAULT_LEFT_DRAWER_WIDTH,
  
  rightDrawerOpen: true,
  rightPanel: 'trunk',
  rightSubTab: 'shape',
  rightDrawerWidthPx: DEFAULT_RIGHT_DRAWER_WIDTH,
  
  bottomDockExpanded: false,
  bottomDockHeightPx: DEFAULT_BOTTOM_DOCK_HEIGHT,
  
  paused: false,
  showStats: false,
  
  treeParams: { ...DEFAULT_TREE_PARAMS },
  seed: 1337,
  isPlaying: true,
  groundLayer: 'simple',
  
  viewportSettings: { ...DEFAULT_VIEWPORT_SETTINGS },
  lodLevel: 'near',
  
  windMode: 'vertex',
};

// ─── CONTEXT ────────────────────────────────────────────────────────────────

const ProVegLayoutContext = createContext<ProVegLayoutContextValue | null>(null);

// ─── PROVIDER ───────────────────────────────────────────────────────────────

export function ProVegLayoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProVegLayoutState>(defaultState);

  // Helper to update state
  const updateState = useCallback((updates: Partial<ProVegLayoutState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Left drawer actions
  const setLeftDrawerOpen = useCallback((open: boolean) => {
    updateState({ leftDrawerOpen: open });
  }, [updateState]);

  const setLeftPanel = useCallback((panel: string) => {
    updateState({ leftPanel: panel });
  }, [updateState]);

  const openLeftPanel = useCallback((panel: string) => {
    setState(prev => {
      if (prev.leftDrawerOpen && prev.leftPanel === panel) {
        return { ...prev, leftDrawerOpen: false };
      }
      return { ...prev, leftDrawerOpen: true, leftPanel: panel };
    });
  }, []);

  const setLeftDrawerWidthPx = useCallback((width: number) => {
    const clamped = Math.min(MAX_DRAWER_WIDTH, Math.max(MIN_DRAWER_WIDTH, width));
    updateState({ leftDrawerWidthPx: clamped });
  }, [updateState]);

  // Right drawer actions
  const setRightDrawerOpen = useCallback((open: boolean) => {
    updateState({ rightDrawerOpen: open });
  }, [updateState]);

  const setRightPanel = useCallback((panel: string) => {
    updateState({ rightPanel: panel, rightSubTab: '' });
  }, [updateState]);

  const setRightSubTab = useCallback((subTab: string) => {
    updateState({ rightSubTab: subTab });
  }, [updateState]);

  const openRightPanel = useCallback((panel: string, subTab?: string) => {
    setState(prev => {
      if (prev.rightDrawerOpen && prev.rightPanel === panel && !subTab) {
        return { ...prev, rightDrawerOpen: false };
      }
      return {
        ...prev,
        rightDrawerOpen: true,
        rightPanel: panel,
        rightSubTab: subTab || prev.rightSubTab,
      };
    });
  }, []);

  const setRightDrawerWidthPx = useCallback((width: number) => {
    const clamped = Math.min(MAX_DRAWER_WIDTH, Math.max(MIN_DRAWER_WIDTH, width));
    updateState({ rightDrawerWidthPx: clamped });
  }, [updateState]);

  // Bottom dock actions
  const setBottomDockExpanded = useCallback((expanded: boolean) => {
    updateState({ bottomDockExpanded: expanded });
  }, [updateState]);

  const setBottomDockHeightPx = useCallback((height: number) => {
    const clamped = Math.min(MAX_BOTTOM_DOCK_HEIGHT, Math.max(MIN_BOTTOM_DOCK_HEIGHT, height));
    updateState({ bottomDockHeightPx: clamped });
  }, [updateState]);

  // Simulation actions
  const togglePaused = useCallback(() => {
    setState(prev => ({ ...prev, paused: !prev.paused }));
  }, []);

  const setShowStats = useCallback((show: boolean) => {
    updateState({ showStats: show });
  }, [updateState]);

  // Tree actions
  const setTreeParams = useCallback((params: Partial<TreeParams>) => {
    setState(prev => ({
      ...prev,
      treeParams: { ...prev.treeParams, ...params },
    }));
  }, []);

  const setTreeParam = useCallback((key: string, value: number | string | boolean) => {
    setState(prev => ({
      ...prev,
      treeParams: { ...prev.treeParams, [key]: value },
    }));
  }, []);

  const setSeed = useCallback((seed: number) => {
    updateState({ seed });
  }, [updateState]);

  const setIsPlaying = useCallback((playing: boolean) => {
    updateState({ isPlaying: playing });
  }, [updateState]);

  const setGroundLayer = useCallback((layer: GroundLayerType) => {
    updateState({ groundLayer: layer });
  }, [updateState]);

  // Viewport actions
  const setViewportSettings = useCallback((settings: Partial<ViewportSettings>) => {
    setState(prev => ({
      ...prev,
      viewportSettings: { ...prev.viewportSettings, ...settings },
    }));
  }, []);

  const setLodLevel = useCallback((level: LODLevel) => {
    updateState({ lodLevel: level });
  }, [updateState]);

  // Wind actions
  const setWindMode = useCallback((mode: WindMode) => {
    updateState({ windMode: mode });
  }, [updateState]);

  // Reset
  const resetToDefaults = useCallback(() => {
    setState(defaultState);
  }, []);

  const value: ProVegLayoutContextValue = {
    ...state,
    setLeftDrawerOpen,
    setLeftPanel,
    openLeftPanel,
    setLeftDrawerWidthPx,
    setRightDrawerOpen,
    setRightPanel,
    setRightSubTab,
    openRightPanel,
    setRightDrawerWidthPx,
    setBottomDockExpanded,
    setBottomDockHeightPx,
    togglePaused,
    setShowStats,
    setTreeParams,
    setTreeParam,
    setSeed,
    setIsPlaying,
    setGroundLayer,
    setViewportSettings,
    setLodLevel,
    setWindMode,
    resetToDefaults,
    minDrawerWidth: MIN_DRAWER_WIDTH,
    maxDrawerWidth: MAX_DRAWER_WIDTH,
  };

  return (
    <ProVegLayoutContext.Provider value={value}>
      {children}
    </ProVegLayoutContext.Provider>
  );
}

// ─── HOOK ───────────────────────────────────────────────────────────────────

export function useProVegLayout(): ProVegLayoutContextValue {
  const context = useContext(ProVegLayoutContext);
  if (!context) {
    throw new Error('useProVegLayout must be used within a ProVegLayoutProvider');
  }
  return context;
}
