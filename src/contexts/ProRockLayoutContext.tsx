/**
 * CODEX5.3ROCKS - ProRock Layout Context
 * 
 * Single source of truth for Rock Studio layout + parameters.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_ROCK_PARAMS, type HyperRockParams } from '@/types/rockParams';
import { DEFAULT_VIEWPORT_SETTINGS, type ViewportSettings } from '@/contexts/ProVegLayoutContext';

const MIN_DRAWER_WIDTH = 280;
const MAX_DRAWER_WIDTH = 480;

export interface ProRockLayoutState {
  leftDrawerOpen: boolean;
  leftPanel: string;
  leftDrawerWidthPx: number;
  rightDrawerOpen: boolean;
  rightPanel: string;
  rightSubTab: string;
  rightDrawerWidthPx: number;
  bottomDockExpanded: boolean;
  bottomDockHeightPx: number;
  showStats: boolean;
  seed: number;
  rockParams: HyperRockParams;
  viewportSettings: ViewportSettings;
}

const defaultState: ProRockLayoutState = {
  leftDrawerOpen: false,
  leftPanel: 'presets',
  leftDrawerWidthPx: 300,
  rightDrawerOpen: true,
  rightPanel: 'surface',
  rightSubTab: 'roughness',
  rightDrawerWidthPx: 340,
  bottomDockExpanded: false,
  bottomDockHeightPx: 200,
  showStats: false,
  seed: 42,
  rockParams: { ...DEFAULT_ROCK_PARAMS },
  viewportSettings: { ...DEFAULT_VIEWPORT_SETTINGS },
};

export interface ProRockLayoutContextValue extends ProRockLayoutState {
  setLeftDrawerOpen: (open: boolean) => void;
  setLeftPanel: (panel: string) => void;
  openLeftPanel: (panel: string) => void;
  setRightDrawerOpen: (open: boolean) => void;
  setRightPanel: (panel: string) => void;
  setRightSubTab: (subTab: string) => void;
  openRightPanel: (panel: string, subTab?: string) => void;
  setBottomDockExpanded: (expanded: boolean) => void;
  setShowStats: (show: boolean) => void;
  setSeed: (seed: number) => void;
  setRockParam: (section: keyof HyperRockParams, field: string, value: any) => void;
  setRockParams: (params: Partial<HyperRockParams>) => void;
  setViewportSettings: (settings: Partial<ViewportSettings>) => void;
  resetToDefaults: () => void;
  minDrawerWidth: number;
  maxDrawerWidth: number;
}

const ProRockLayoutContext = createContext<ProRockLayoutContextValue | null>(null);

export function ProRockLayoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProRockLayoutState>(defaultState);

  const setLeftDrawerOpen = useCallback((open: boolean) => setState(p => ({ ...p, leftDrawerOpen: open })), []);
  const setLeftPanel = useCallback((panel: string) => setState(p => ({ ...p, leftPanel: panel })), []);
  const openLeftPanel = useCallback((panel: string) => {
    setState(p => p.leftDrawerOpen && p.leftPanel === panel
      ? { ...p, leftDrawerOpen: false }
      : { ...p, leftDrawerOpen: true, leftPanel: panel });
  }, []);

  const setRightDrawerOpen = useCallback((open: boolean) => setState(p => ({ ...p, rightDrawerOpen: open })), []);
  const setRightPanel = useCallback((panel: string) => setState(p => ({ ...p, rightPanel: panel, rightSubTab: '' })), []);
  const setRightSubTab = useCallback((subTab: string) => setState(p => ({ ...p, rightSubTab: subTab })), []);
  const openRightPanel = useCallback((panel: string, subTab?: string) => {
    setState(p => p.rightDrawerOpen && p.rightPanel === panel && !subTab
      ? { ...p, rightDrawerOpen: false }
      : { ...p, rightDrawerOpen: true, rightPanel: panel, rightSubTab: subTab || p.rightSubTab });
  }, []);

  const setBottomDockExpanded = useCallback((expanded: boolean) => setState(p => ({ ...p, bottomDockExpanded: expanded })), []);
  const setShowStats = useCallback((show: boolean) => setState(p => ({ ...p, showStats: show })), []);
  const setSeed = useCallback((seed: number) => setState(p => ({ ...p, seed })), []);

  const setRockParam = useCallback((section: keyof HyperRockParams, field: string, value: any) => {
    setState(p => ({
      ...p,
      rockParams: {
        ...p.rockParams,
        [section]: { ...(p.rockParams[section] as any), [field]: value },
      },
    }));
  }, []);

  const setRockParams = useCallback((params: Partial<HyperRockParams>) => {
    setState(p => {
      const merged = { ...p.rockParams };
      for (const key of Object.keys(params) as (keyof HyperRockParams)[]) {
        merged[key] = { ...(merged[key] as any), ...(params[key] as any) };
      }
      return { ...p, rockParams: merged };
    });
  }, []);

  const setViewportSettings = useCallback((settings: Partial<ViewportSettings>) => {
    setState(p => ({ ...p, viewportSettings: { ...p.viewportSettings, ...settings } }));
  }, []);

  const resetToDefaults = useCallback(() => setState(defaultState), []);

  const value: ProRockLayoutContextValue = {
    ...state,
    setLeftDrawerOpen, setLeftPanel, openLeftPanel,
    setRightDrawerOpen, setRightPanel, setRightSubTab, openRightPanel,
    setBottomDockExpanded, setShowStats, setSeed,
    setRockParam, setRockParams, setViewportSettings, resetToDefaults,
    minDrawerWidth: MIN_DRAWER_WIDTH, maxDrawerWidth: MAX_DRAWER_WIDTH,
  };

  return <ProRockLayoutContext.Provider value={value}>{children}</ProRockLayoutContext.Provider>;
}

export function useProRockLayout(): ProRockLayoutContextValue {
  const ctx = useContext(ProRockLayoutContext);
  if (!ctx) throw new Error('useProRockLayout must be used within ProRockLayoutProvider');
  return ctx;
}
