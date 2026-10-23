import React from 'react';
import { CATEGORIES } from '../utils/categoryLabels.js';
import {
  AlertTriangle,
  Lightbulb,
  Droplets,
  Waves,
  Trash2,
  Footprints,
  HelpCircle
} from 'lucide-react';

const ICON_MAP = {
  road_damage: AlertTriangle,
  streetlight: Lightbulb,
  water_leak: Droplets,
  drainage: Waves,
  waste: Trash2,
  sidewalk: Footprints,
  other: HelpCircle
};

export default function CategoryBadge({ category, showIcon = true, size = 'sm' }) {
  const cat = CATEGORIES[category] || CATEGORIES.other;
  const IconComponent = ICON_MAP[category] || HelpCircle;

  const sizeStyles = size === 'lg'
    ? 'px-3 py-1 text-sm gap-2'
    : 'px-2 py-0.5 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-800 border border-slate-200 ${sizeStyles}`}>
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4 text-slate-600' : 'w-3.5 h-3.5 text-slate-600'} />}
      <span>{cat.shortLabel || cat.label}</span>
    </span>
  );
}
