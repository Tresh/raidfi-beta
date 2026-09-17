import * as React from "react";

const STORAGE_KEY = "raidfi:desktop-navigation-locked";

function readStoredLockState() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useDesktopNavigationRailLock() {
  const [locked, setLockedState] = React.useState(readStoredLockState);

  const setLocked = React.useCallback((nextLocked: boolean) => {
    setLockedState(nextLocked);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(nextLocked));
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, []);

  return [locked, setLocked] as const;
}
