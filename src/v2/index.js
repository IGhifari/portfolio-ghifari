// Portfolio V2 Public Barrel API
export { default as PortfolioV2 } from './pages/HomePage';
export { default as WorksPage } from './pages/WorksPage';
export { default as WorkDetailPage } from './pages/WorkDetailPage';

export { default as V2SubpageShell, V2WorkGridCard } from './components/layout/V2Chrome';
export { default as V2MenuDrawer } from './components/layout/V2MenuDrawer';

export { default as RolloverLabel } from './components/ui/RolloverLabel';
export { default as MaskedDisplayHeading } from './components/ui/MaskedDisplayHeading';
export { default as CountUpMetricCell } from './components/ui/CountUpMetricCell';

export { default as OpeningSequence } from './components/motion/OpeningSequence';
export { default as PageTransition } from './components/motion/PageTransition';
export {
  hasCompletedV2Opening,
  markV2OpeningCompleted,
  runV2PageTransition,
  useV2TransitionState,
} from './components/motion/openingState';

export {
  V2_SEASON_OPTIONS,
  V2_DEFAULT_TOKENS,
  V2_DEFAULT_LIGHT_TOKENS,
  buildV2SeasonTokens,
} from './theme/seasonPalette';
export { default as ThemeControls, V2SeasonHeaderBadge } from './theme/ThemeControls';

export { useV2Lenis } from './hooks/useV2Lenis';
export { useJakartaClock } from './hooks/useJakartaClock';
export { useClipboardCopy } from './hooks/useClipboardCopy';
