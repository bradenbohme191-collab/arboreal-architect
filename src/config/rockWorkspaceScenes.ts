/**
 * CODEX5.3ROCKS - Rock Workspace Scenes Configuration
 * Expanded with Origin, Internal Structure, and Deformation panels
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
    id: 'origin',
    label: 'Origin',
    icon: 'Flame',
    subTabs: [
      { id: 'class', label: 'Class', icon: 'Circle' },
      { id: 'igneous', label: 'Igneous', icon: 'Flame' },
      { id: 'sedimentary', label: 'Sedimentary', icon: 'Layers' },
      { id: 'metamorphic', label: 'Metamorphic', icon: 'Zap' },
    ],
  },
  {
    id: 'internal',
    label: 'Internal',
    icon: 'Scan',
    subTabs: [
      { id: 'grain', label: 'Grain', icon: 'CircleDot' },
      { id: 'crystals', label: 'Crystals', icon: 'Diamond' },
      { id: 'voids', label: 'Voids & Inclusions', icon: 'Circle' },
      { id: 'banding', label: 'Banding & Veins', icon: 'Minus' },
      { id: 'fossils', label: 'Fossils', icon: 'Shell' },
    ],
  },
  {
    id: 'surface',
    label: 'Surface',
    icon: 'Box',
    subTabs: [
      { id: 'roughness', label: 'Roughness', icon: 'Circle' },
      { id: 'displacement', label: 'Displacement', icon: 'Mountain' },
      { id: 'micro', label: 'Micro Detail', icon: 'CircleDot' },
      { id: 'optical', label: 'Optical', icon: 'Eye' },
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
      { id: 'mechanical', label: 'Mechanical', icon: 'Hammer' },
      { id: 'glacial', label: 'Glacial & Water', icon: 'Snowflake' },
    ],
  },
  {
    id: 'fractures',
    label: 'Fractures',
    icon: 'AlertTriangle',
    subTabs: [
      { id: 'cracks', label: 'Cracks', icon: 'Minus' },
      { id: 'joints', label: 'Joints', icon: 'Grid3x3' },
      { id: 'faults', label: 'Faults & Shear', icon: 'Move' },
      { id: 'exfoliation', label: 'Exfoliation', icon: 'Layers' },
    ],
  },
  {
    id: 'deformation',
    label: 'Deformation',
    icon: 'Hammer',
    subTabs: [
      { id: 'impact', label: 'Impact', icon: 'Zap' },
      { id: 'splitting', label: 'Splitting', icon: 'Scissors' },
      { id: 'carving', label: 'Carving', icon: 'Droplets' },
      { id: 'stress', label: 'Stress & Thermal', icon: 'Flame' },
    ],
  },
  {
    id: 'color',
    label: 'Color & Material',
    icon: 'Palette',
    subTabs: [
      { id: 'base', label: 'Base', icon: 'Palette' },
      { id: 'veins', label: 'Veins & Banding', icon: 'GitBranch' },
      { id: 'patina', label: 'Patina', icon: 'Eye' },
      { id: 'optical', label: 'Optical Effects', icon: 'Sparkles' },
    ],
  },
  {
    id: 'shape',
    label: 'Shape & LOD',
    icon: 'Mountain',
    subTabs: [
      { id: 'dimensions', label: 'Dimensions', icon: 'Maximize2' },
      { id: 'silhouette', label: 'Silhouette', icon: 'Circle' },
      { id: 'features', label: 'Features', icon: 'Triangle' },
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
