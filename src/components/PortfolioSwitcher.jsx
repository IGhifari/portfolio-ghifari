import { useRef } from 'react';
import PropTypes from 'prop-types';

const VERSION_OPTIONS = [
  { id: '1', label: 'V1', fullLabel: 'Portfolio 1' },
  { id: '2', label: 'V2', fullLabel: 'Portfolio 2' },
];

export default function PortfolioSwitcher({ version = '2', onChange }) {
  const buttonRefs = useRef([]);
  const activeVersion = version === '1' ? '1' : '2';

  const handleSelect = (targetVersion) => {
    if (targetVersion === activeVersion) return;
    if (typeof onChange === 'function') {
      onChange(targetVersion);
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % VERSION_OPTIONS.length;
      buttonRefs.current[nextIndex]?.focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + VERSION_OPTIONS.length) % VERSION_OPTIONS.length;
      buttonRefs.current[prevIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      buttonRefs.current[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      buttonRefs.current[VERSION_OPTIONS.length - 1]?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label="Portfolio version switcher"
      data-portfolio-switcher={activeVersion}
      className="fixed z-[45] select-none"
      style={{
        bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
        left: 'max(1rem, calc(env(safe-area-inset-left, 0px) + 0.75rem))',
      }}
    >
      <div className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full border border-[#242429] bg-[#0e0e11]/95 p-0.5 sm:p-1 shadow-sm">
        {VERSION_OPTIONS.map((option, index) => {
          const isActive = activeVersion === option.id;
          return (
            <button
              key={option.id}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              aria-pressed={isActive}
              aria-label={`Switch to ${option.fullLabel}`}
              title={`Switch to ${option.fullLabel}`}
              onClick={() => handleSelect(option.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 font-mono text-[10px] sm:text-[11px] font-medium tracking-[0.04em] transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080808] ${
                isActive
                  ? 'bg-[#f4f4f5] text-[#09090b]'
                  : 'text-[#8e8e98] hover:bg-[#18181c] hover:text-[#e4e4e7]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-150 motion-reduce:transition-none ${
                  isActive ? 'bg-[#09090b]' : 'bg-[#3f3f46]'
                }`}
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

PortfolioSwitcher.propTypes = {
  version: PropTypes.string,
  onChange: PropTypes.func,
};

