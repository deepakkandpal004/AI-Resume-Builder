import { useEffect, useState } from 'react';

/**
 * Custom hook to track unsaved changes and warn user before leaving
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {string} message - Warning message to display
 */
const useUnsavedChangesWarning = (hasUnsavedChanges, message = "You have unsaved changes. Are you sure you want to leave?") => {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Warn before page unload (browser native)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  const confirmNavigation = () => {
    setShowWarning(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const cancelNavigation = () => {
    setShowWarning(false);
    setPendingNavigation(null);
  };

  const checkUnsavedChanges = (callback) => {
    if (hasUnsavedChanges) {
      setShowWarning(true);
      setPendingNavigation(() => callback);
      return false; // Block navigation
    }
    callback();
    return true; // Allow navigation
  };

  return {
    showWarning,
    confirmNavigation,
    cancelNavigation,
    checkUnsavedChanges,
  };
};

export default useUnsavedChangesWarning;
