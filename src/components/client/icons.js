import {
  CookingPot,
  Cog,
  Cpu,
  DoorClosed,
  Factory,
  Flame,
  Gauge,
  Layers,
  LayoutGrid,
  Package,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
} from 'lucide-react';

export const ICONS = {
  CookingPot,
  Cog,
  Cpu,
  DoorClosed,
  Factory,
  Flame,
  Gauge,
  Layers,
  LayoutGrid,
  Grid: LayoutGrid,
  Package,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
};

export const iconFor = (name) => ICONS[name] || Package;
