/**
 * CODEX5.3TREES - Workspace Scenes Configuration
 * Defines the panel structure for left and right rails/drawers.
 */

export interface SubTab {
  id: string;
  label: string;
  icon: string;
}

export interface PanelConfig {
  id: string;
  label: string;
  icon: string;
  subTabs?: SubTab[];
}

// ─── LEFT PANELS ────────────────────────────────────────────────────────────

export const LEFT_PANELS: PanelConfig[] = [
  { id: 'presets', label: 'Presets', icon: 'Bookmark' },
  { id: 'environment', label: 'Environment', icon: 'Cloud' },
  { id: 'seed', label: 'Seed & Age', icon: 'Hash' },
  { id: 'diagnostics', label: 'Diagnostics', icon: 'Activity' },
];

// ─── RIGHT PANELS ───────────────────────────────────────────────────────────

export const RIGHT_PANELS: PanelConfig[] = [
  {
    id: 'trunk',
    label: 'Trunk',
    icon: 'TreePine',
    subTabs: [
      { id: 'shape', label: 'Shape', icon: 'Circle' },
      { id: 'gesture', label: 'Gesture', icon: 'Move' },
      { id: 'cross', label: 'Cross-section', icon: 'CircleDot' },
      { id: 'buttress', label: 'Buttress', icon: 'Mountain' },
    ],
  },
  {
    id: 'branching',
    label: 'Branching',
    icon: 'GitBranch',
    subTabs: [
      { id: 'structure', label: 'Structure', icon: 'Network' },
      { id: 'junction', label: 'Junction', icon: 'Merge' },
      { id: 'gesture', label: 'Gesture', icon: 'Move' },
    ],
  },
  {
    id: 'leaves',
    label: 'Leaves',
    icon: 'Leaf',
    subTabs: [
      { id: 'representation', label: 'Representation', icon: 'Layers' },
      { id: 'petiole', label: 'Petiole', icon: 'Minus' },
      { id: 'color', label: 'Color', icon: 'Palette' },
    ],
  },
  {
    id: 'bark-detail',
    label: 'Bark',
    icon: 'Box',
    subTabs: [
      { id: 'pattern', label: 'Pattern', icon: 'Box' },
      { id: 'peeling', label: 'Peeling', icon: 'Layers' },
      { id: 'moss', label: 'Moss', icon: 'Sprout' },
      { id: 'weathering', label: 'Weathering', icon: 'Cloud' },
    ],
  },
  {
    id: 'root-system',
    label: 'Roots',
    icon: 'Sprout',
    subTabs: [
      { id: 'architecture', label: 'Architecture', icon: 'Network' },
      { id: 'fluting', label: 'Fluting', icon: 'CircleDot' },
      { id: 'tropism', label: 'Tropism', icon: 'Target' },
    ],
  },
  {
    id: 'damage',
    label: 'Damage',
    icon: 'AlertTriangle',
    subTabs: [
      { id: 'deformation', label: 'Deformation', icon: 'Move' },
      { id: 'knots', label: 'Knots', icon: 'Circle' },
      { id: 'breaking', label: 'Breaking', icon: 'Scissors' },
      { id: 'disease', label: 'Disease', icon: 'AlertTriangle' },
    ],
  },
  {
    id: 'wind-lod',
    label: 'Wind & LOD',
    icon: 'Wind',
    subTabs: [
      { id: 'wind', label: 'Wind', icon: 'Wind' },
      { id: 'lod', label: 'LOD', icon: 'Eye' },
    ],
  },
  {
    id: 'soil',
    label: 'Soil',
    icon: 'Layers',
    subTabs: [
      { id: 'composition', label: 'Composition', icon: 'Layers' },
      { id: 'visual', label: 'Visual', icon: 'Eye' },
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    icon: 'Zap',
    subTabs: [
      { id: 'timeline', label: 'Timeline', icon: 'Activity' },
      { id: 'vitality', label: 'Vitality', icon: 'Zap' },
    ],
  },
  {
    id: 'space-colonization',
    label: 'Space Col.',
    icon: 'Grid3x3',
    subTabs: [
      { id: 'attractors', label: 'Attractors', icon: 'Target' },
      { id: 'crown', label: 'Crown', icon: 'Cloud' },
    ],
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

export function getLeftPanel(id: string): PanelConfig | undefined {
  return LEFT_PANELS.find(p => p.id === id);
}

export function getRightPanel(id: string): PanelConfig | undefined {
  return RIGHT_PANELS.find(p => p.id === id);
}

export function getDefaultSubTab(panelId: string): string {
  const panel = getRightPanel(panelId);
  return panel?.subTabs?.[0]?.id || '';
}
