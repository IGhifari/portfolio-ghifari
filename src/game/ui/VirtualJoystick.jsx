import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

const MAX_RADIUS = 38;

/**
 * On-screen virtual joystick for touch devices.
 * Outputs normalized `{ x, z }` movement vector via `onMove`.
 */
const VirtualJoystick = ({ onMove }) => {
  const { t } = useLanguage();
  const baseRef = useRef(null);
  const pointerIdRef = useRef(null);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const updateVector = useCallback(
    (clientX, clientY) => {
      const baseEl = baseRef.current;
      if (!baseEl) return;
      const rect = baseEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const clampedDist = Math.min(dist, MAX_RADIUS);
      const angle = Math.atan2(dy, dx);

      const offsetX = Math.cos(angle) * clampedDist;
      const offsetY = Math.sin(angle) * clampedDist;

      setKnobOffset({ x: offsetX, y: offsetY });
      onMove({
        x: offsetX / MAX_RADIUS,
        z: offsetY / MAX_RADIUS,
      });
    },
    [onMove]
  );

  const handlePointerDown = (e) => {
    if (pointerIdRef.current !== null) return;
    pointerIdRef.current = e.pointerId;
    setActive(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateVector(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (e.pointerId !== pointerIdRef.current) return;
    updateVector(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e) => {
    if (e.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    setActive(false);
    setKnobOffset({ x: 0, y: 0 });
    onMove({ x: 0, z: 0 });
  };

  return (
    <div
      style={{
        bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        left: 'max(1rem, env(safe-area-inset-left, 0px))',
      }}
      className="fixed z-30 select-none touch-none"
    >
      <div
        ref={baseRef}
        role="slider"
        aria-label={t('game.joystickAria')}
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-valuenow={Math.round(knobOffset.x / MAX_RADIUS)}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[var(--surface)]/90 border-2 flex items-center justify-center transition-colors ${
          active ? 'border-[var(--accent)]' : 'border-[var(--border)]'
        }`}
      >
        <div
          style={{
            transform: `translate3d(${Math.round(knobOffset.x)}px, ${Math.round(knobOffset.y)}px, 0)`,
          }}
          className={`w-11 h-11 rounded-full border transition-colors ${
            active
              ? 'bg-[var(--accent)] border-white/80 shadow-md'
              : 'bg-[var(--surface-hover)] border-[var(--border-hover)]'
          }`}
        />
      </div>
    </div>
  );
};

VirtualJoystick.propTypes = {
  onMove: PropTypes.func.isRequired,
};

export default VirtualJoystick;
