import { useSyncExternalStore } from 'react';

const OPENING_STORAGE_KEY = 'v2_opening_completed';

const readStoredOpeningCompleted = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(OPENING_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const writeStoredOpeningCompleted = () => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(OPENING_STORAGE_KEY, '1');
  } catch {
    // Ignore storage quota or restricted context errors
  }
};

const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

let v2OpeningCompleted = readStoredOpeningCompleted();
const shouldStartWithRefreshCurtain = v2OpeningCompleted && !prefersReducedMotion();
let refreshRevealStarted = false;

export function hasCompletedV2Opening() {
  return v2OpeningCompleted;
}

export function markV2OpeningCompleted() {
  writeStoredOpeningCompleted();
  if (!v2OpeningCompleted) {
    v2OpeningCompleted = true;
    transitionSnapshot = { ...transitionSnapshot, openingCompleted: true };
    listeners.forEach((fn) => fn());
  }
}

/* ==========================================================================
   V2 3-Beat Bottom-to-Top Page Transition Store
   1. `covering`  (0ms -> 540ms): Solid `#3b82f6` curtain rises `100% -> 0%` over current page
   2. `holding`   (540ms -> 1620ms): Route swaps behind curtain + `GHIFARI®` rises into center
   3. `uncovering`(1620ms -> 2240ms): Curtain continues upward `0% -> -100%` + subpage reveals
   ========================================================================== */

let transitionSnapshot = {
  phase: shouldStartWithRefreshCurtain ? 'holding' : 'idle', // 'idle' | 'covering' | 'holding' | 'uncovering'
  showLogo: false,
  startCovered: shouldStartWithRefreshCurtain,
  subpageRevealReady: !shouldStartWithRefreshCurtain,
  openingCompleted: v2OpeningCompleted,
  runId: 0,
};

const listeners = new Set();
let activeTimers = [];

function emitChange() {
  listeners.forEach((fn) => fn());
}

function setSnapshot(patch) {
  transitionSnapshot = { ...transitionSnapshot, ...patch };
  emitChange();
}

function clearTransitionTimers() {
  activeTimers.forEach((id) => clearTimeout(id));
  activeTimers = [];
}

export function subscribeV2Transition(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getV2TransitionSnapshot() {
  return transitionSnapshot;
}

export function useV2TransitionState() {
  return useSyncExternalStore(
    subscribeV2Transition,
    getV2TransitionSnapshot,
    getV2TransitionSnapshot
  );
}

export function startV2RefreshReveal() {
  if (refreshRevealStarted || !transitionSnapshot.startCovered || transitionSnapshot.phase !== 'holding') {
    return;
  }
  refreshRevealStarted = true;
  clearTransitionTimers();

  // Beat 1 (120ms): `GHIFARI®` wordmark rises into center over the blue curtain
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({ showLogo: true });
    }, 120)
  );

  // Beat 2 (920ms): Blue curtain wipes upward (`0% -> -100%`) to reveal page
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({ phase: 'uncovering' });
    }, 920)
  );

  // Beat 3 (1420ms): Curtain clears top -> trigger hero/navbar reveal
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({ subpageRevealReady: true });
    }, 1420)
  );

  // Cleanup (1580ms): Reset overlay back to `idle`
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({
        phase: 'idle',
        showLogo: false,
        startCovered: false,
        subpageRevealReady: true,
      });
      activeTimers = [];
    }, 1580)
  );
}

export function runV2PageTransition(commitRouteFn) {
  clearTransitionTimers();
  refreshRevealStarted = true;
  const nextRunId = transitionSnapshot.runId + 1;

  // Beat 1: Slide solid blue curtain up from bottom (`100% -> 0%`) over the OLD page
  setSnapshot({
    phase: 'covering',
    showLogo: false,
    startCovered: false,
    subpageRevealReady: true,
    runId: nextRunId,
  });

  // Beat 2A (540ms): Curtain fully covers viewport -> swap route invisibly behind curtain
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({
        phase: 'holding',
        showLogo: false,
        subpageRevealReady: false,
      });
      if (typeof commitRouteFn === 'function') {
        commitRouteFn();
      }
    }, 540)
  );

  // Beat 2B (690ms): `GHIFARI®` wordmark rises & fades cleanly into center
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({
        showLogo: true,
      });
    }, 690)
  );

  // Beat 3A (1620ms): Curtain continues upward (`0% -> -100%`) off the top edge
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({
        phase: 'uncovering',
      });
    }, 1620)
  );

  // Beat 3B (2150ms): Curtain clears top -> trigger crisp subpage hero reveal choreography
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({
        subpageRevealReady: true,
      });
    }, 2150)
  );

  // Cleanup (2280ms): Reset overlay back to `idle` below viewport
  activeTimers.push(
    setTimeout(() => {
      setSnapshot({
        phase: 'idle',
        showLogo: false,
        subpageRevealReady: true,
      });
      activeTimers = [];
    }, 2280)
  );
}
