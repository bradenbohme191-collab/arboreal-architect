/**
 * CODEX5.3ROCKS - Rock Workspace Scenes Configuration
 */

import type { PanelConfig } from './workspaceScenes';

export const ROCK_LEFT_PANELS: PanelConfig[] = [
  { id: 'presets', label: 'Presets', icon: 'Bookmark' },
  { id: 'environment', label: 'Environment', icon: 'Cloud' },
  { id: 'seed', label: 'Seed & Scale', icon: 'Hash' },
  { id: 'diagnostics', label: 'Diagnostics', icon: 'Activity' },
];

export const ROCK_RIGHT_PANELS: PanelConfig[] = [
  {
    id: 'surface',
    label: 'Surface',
    icon: 'Box',
    subTabs: [
      { id: 'roughness', label: 'Roughness', icon: 'Circle' },
      { id: 'displacement', label: 'Displacement', icon: 'Mountain' },
      { id: 'micro', label: 'Micro Detail', icon: 'CircleDot' },
    ],
  },
  {
    id: 'geology',
    label: 'Geology',
    icon: 'Layers',
    subTabs: [
      { id: 'stratification', label: 'Layers', icon: 'Layers' },
      { id: 'minerals', label: 'Minerals', icon: 'Zap' },
      { id: 'formation', label: 'Formation', icon: 'Mountain' },
    ],
  },
  {
    id: 'weathering',
    label: 'Weathering',
    icon: 'Droplets',
    subTabs: [
      { id: 'erosion', label: 'Erosion', icon: 'Wind' },
      { id: 'biological', label: 'Biological', icon: 'Sprout' },
      { id: 'chemical', label: 'Chemical', icon: 'Droplets' },
    ],
  },
  {
    id: 'fractures',
    label: 'Fractures',
    icon: 'AlertTriangle',
    subTabs: [
      { id: 'cracks', label: 'Cracks', icon: 'Minus' },
      { id: 'joints', label: 'Joints', icon: 'Grid3x3' },
      { id: 'faults', label: 'Faults', icon: 'Move' },
    ],
  },
  {
    id: 'color',
    label: 'Color & Material',
    icon: 'Palette',
    subTabs: [
      { id: 'base', label: 'Base', icon: 'Palette' },
      { id: 'veins', label: 'Veins', icon: 'GitBranch' },
      { id: 'patina', label: 'Patina', icon: 'Eye' },
    ],
  },
  {
    id: 'shape',
    label: 'Shape & LOD',
    icon: 'Mountain',
    subTabs: [
      { id: 'dimensions', label: 'Dimensions', icon: 'Maximize2' },
      { id: 'silhouette', label: 'Silhouette', icon: 'Circle' },
      { id: 'lod', label: 'LOD', icon: 'Eye' },
    ],
  },
];

export function getRockLeftPanel(id: string) {
  return ROCK_LEFT_PANELS.find(p => p.id === id);
}

export function getRockRightPanel(id: string) {
  return ROCK_RIGHT_PANELS.find(p => p.id === id);
}

export function getRockDefaultSubTab(panelId: string): string {
  const panel = getRockRightPanel(panelId);
  return panel?.subTabs?.[0]?.id || '';
}
