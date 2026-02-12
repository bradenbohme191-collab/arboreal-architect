/**
 * CODEX5.3TREES - Workspace Icons
 * 
 * Icon mapping from string names to Lucide components.
 */

import {
  Bookmark, Cloud, Hash, Activity, TreePine, GitBranch, Leaf, Mountain, Wind,
  Grid3x3, Circle, CircleDot, Move, Merge, AlertTriangle, Layers, Minus,
  Palette, Box, Sprout, Eye, Target, PanelLeftClose, PanelRightClose,
  Play, Pause, RotateCcw, Camera, Settings, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Shuffle, BarChart3, Maximize2, Minimize2,
  Sun, Moon, Droplets, Thermometer, Zap,
  Flame, Scan, Diamond, Shell, Hammer, Scissors, Sparkles, Triangle, Snowflake,
  type LucideIcon,
} from 'lucide-react';

// ─── ICON MAP ───────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Bookmark, Cloud, Hash, Activity, TreePine, GitBranch, Leaf, Mountain, Wind,
  Grid3x3, Circle, CircleDot, Move, Merge, AlertTriangle, Layers, Minus,
  Palette, Box, Sprout, Eye, Target, PanelLeftClose, PanelRightClose,
  Play, Pause, RotateCcw, Camera, Settings, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Shuffle, BarChart3, Maximize2, Minimize2,
  Sun, Moon, Droplets, Thermometer, Zap,
  Flame, Scan, Diamond, Shell, Hammer, Scissors, Sparkles, Triangle, Snowflake,
  // Aliases
  Network: GitBranch,
  Root: Sprout,
};

// ─── EXPORTS ────────────────────────────────────────────────────────────────

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Cloud;
}

export {
  PanelLeftClose,
  PanelRightClose,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BarChart3,
  Maximize2,
  Minimize2,
  TreePine,
  GitBranch,
  Leaf,
  Wind,
  Eye,
  Sun,
  Moon,
  Droplets,
  Thermometer,
  Zap,
};
