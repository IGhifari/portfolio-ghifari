import { useEffect, useRef, useCallback } from 'react';

/**
 * Standard CSS selector for focusable elements
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

/**
 * Filter visible and focusable DOM elements within container and optional additional elements
 */
export const getFocusableElements = (container, additionalElements = []) => {
  if (!container && additionalElements.length === 0) return [];

  const rawElements = container ? Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) : [];

  const extraElements = (additionalElements || [])
    .map((item) => (item && 'current' in item ? item.current : item))
    .filter(Boolean);

  const combined = [...rawElements, ...extraElements];

  return combined.filter((el, index, self) => {
    // Unique only
    if (self.indexOf(el) !== index) return false;

    // Disabled, aria-hidden, or tabIndex -1
    if (el.hasAttribute('disabled')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    if (el.getAttribute('tabindex') === '-1') return false;

    // Computed style check in browser
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
    }

    return true;
  });
};

/**
 * Custom hook to trap focus within a modal/drawer container, manage initial focus,
 * handle escape key closure, and restore focus to trigger element on deactivation.
 *
 * @param {Object} options
 * @param {boolean} options.isOpen - Whether the dialog/drawer is open
 * @param {React.RefObject} options.containerRef - Ref of the dialog container
 * @param {React.RefObject} [options.initialFocusRef] - Optional ref to focus on open
 * @param {React.RefObject|HTMLElement} [options.triggerRef] - Optional ref of the element that opened dialog
 * @param {string} [options.fallbackSelector] - Selector to find trigger if element was remounted
 * @param {Function} [options.onClose] - Callback when Escape is pressed
 * @param {boolean} [options.closeOnEscape=true] - Whether Escape closes dialog
 * @param {boolean} [options.enableTrap=true] - Whether Tab is trapped
 * @param {boolean} [options.restoreFocus=true] - Whether to restore focus upon closing
 * @param {Array<React.RefObject|HTMLElement>} [options.additionalElements=[]] - Elements outside container to include in focus cycle
 */
export const useFocusTrap = ({
  isOpen,
  containerRef,
  initialFocusRef,
  triggerRef,
  fallbackSelector,
  onClose,
  closeOnEscape = true,
  enableTrap = true,
  restoreFocus = true,
  additionalElements = [],
}) => {
  const lastActiveElementRef = useRef(null);
  const wasOpenRef = useRef(false);

  // Capture active element before dialog opens if not explicitly passed
  useEffect(() => {
    if (isOpen) {
      if (!triggerRef?.current && typeof document !== 'undefined') {
        const active = document.activeElement;
        if (active && active !== document.body) {
          lastActiveElementRef.current = active;
        }
      }
    }
  }, [isOpen, triggerRef]);

  // Handle initial focus when opened
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (initialFocusRef?.current && typeof initialFocusRef.current.focus === 'function') {
        initialFocusRef.current.focus();
        return;
      }

      if (containerRef?.current) {
        const focusable = getFocusableElements(containerRef.current, additionalElements);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else if (containerRef.current.getAttribute('tabindex') !== null) {
          containerRef.current.focus();
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, containerRef, initialFocusRef, additionalElements]);

  // Handle Tab trapping and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // 1. Escape key
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      // 2. Tab key trapping
      if (e.key === 'Tab' && enableTrap) {
        const container = containerRef?.current;
        const focusable = getFocusableElements(container, additionalElements);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];
        const currentActive = document.activeElement;

        const isInside =
          (container && container.contains(currentActive)) ||
          additionalElements.some(
            (item) => (item && 'current' in item ? item.current : item) === currentActive
          );

        if (e.shiftKey) {
          // Backward tab: Shift + Tab
          if (currentActive === firstElement || !isInside) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Forward tab: Tab
          if (currentActive === lastElement || !isInside) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, containerRef, onClose, closeOnEscape, enableTrap, additionalElements]);

  // Handle focus restoration when closed
  const restoreFocusHandler = useCallback(() => {
    if (!restoreFocus || typeof document === 'undefined') return;

    const target = triggerRef?.current || lastActiveElementRef.current;

    setTimeout(() => {
      if (target && target.isConnected && typeof target.focus === 'function') {
        target.focus();
      } else if (fallbackSelector) {
        const el = document.querySelector(fallbackSelector);
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      }
    }, 50);
  }, [restoreFocus, triggerRef, fallbackSelector]);

  // Trigger restore focus when transition from open to closed
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      restoreFocusHandler();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, restoreFocusHandler]);

  // Cleanup on unmount if still open
  useEffect(() => {
    return () => {
      if (wasOpenRef.current) {
        restoreFocusHandler();
      }
    };
  }, [restoreFocusHandler]);

  return {
    setTrigger: (el) => {
      lastActiveElementRef.current = el;
    },
  };
};

export default useFocusTrap;
