import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handler functions
 * @param {boolean} enabled - Whether shortcuts are enabled (default: true)
 */
const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Build key combination string (e.g., "ctrl+s", "cmd+e", "esc")
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const metaKey = isMac ? event.metaKey : event.ctrlKey;
      
      let combination = '';
      if (metaKey) combination += 'mod+';
      if (event.altKey) combination += 'alt+';
      if (event.shiftKey) combination += 'shift+';
      combination += event.key.toLowerCase();

      // Check if this combination has a handler
      const handler = shortcuts[combination];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

export default useKeyboardShortcuts;
