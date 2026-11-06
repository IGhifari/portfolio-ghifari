import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

/**
 * Accessible custom dropdown (listbox pattern) replacing native <select>.
 * Native selects render as OS sheets on mobile, breaking the visual language.
 */
const FilterDropdown = ({ value, options, onChange, label, icon: Icon, align = 'start', cursorLabel = 'Filter' }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  // Close on outside click / touch
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Focus list & scroll active option into view when opened
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openList = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const choose = (index) => {
    const opt = options[index];
    if (opt) onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const onListKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${selected?.label ?? ''}`}
        data-cursor-label={cursorLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        className={`cursor-target inline-flex items-center gap-2 pl-3 pr-2.5 py-2.5 max-w-[220px] rounded-md border font-mono text-xs text-[var(--text-primary)] bg-[var(--surface-alt)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
          open ? 'border-[var(--accent)]' : 'border-[var(--border-subtle)] hover:border-[var(--border)]'
        }`}
      >
        {Icon && <Icon size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />}
        <span className="truncate">{selected?.label}</span>
        <FiChevronDown
          size={14}
          className={`shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-opt-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className={`absolute z-50 mt-1.5 min-w-[200px] w-max max-w-[min(280px,calc(100vw-2.5rem))] max-h-72 overflow-y-auto overscroll-contain p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-black/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
            align === 'end' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;
            return (
              <li
                key={opt.value}
                id={`${listId}-opt-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-md font-mono text-xs cursor-pointer select-none transition-colors ${
                  isActive ? 'bg-[var(--surface-hover)]' : ''
                } ${isSelected ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <FiCheck size={13} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

FilterDropdown.propTypes = {
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  align: PropTypes.oneOf(['start', 'end']),
  cursorLabel: PropTypes.string,
};

export default FilterDropdown;
