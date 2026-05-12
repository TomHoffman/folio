/**
 * Synchronous snapshot of the last navigation layout pass (written from
 * `NavigationScrollReset` `useLayoutEffect`). Used so `ProjectGrid` can repair the featured
 * mosaic without relying on `sessionStorage` or one-shot custom events.
 *
 * `subscribeFolioNavLayout` registers callbacks invoked from `recordFolioNavLayoutSnapshot`.
 * Snapshot fields update synchronously; listener invocations are deferred with `queueMicrotask`
 * so they can call `setState` after `useLayoutEffect` completes (not nested inside it).
 */
let navLayoutEpoch = 0;
let navPreviousPathname = "";
let navPathname = "";

const navLayoutListeners = new Set<() => void>();

export function subscribeFolioNavLayout(listener: () => void) {
  navLayoutListeners.add(listener);
  return () => {
    navLayoutListeners.delete(listener);
  };
}

export function recordFolioNavLayoutSnapshot(
  epoch: number,
  previous: string | null,
  pathname: string,
) {
  navLayoutEpoch = epoch;
  navPreviousPathname = previous ?? "";
  navPathname = pathname;
  queueMicrotask(() => {
    for (const fn of navLayoutListeners) {
      try {
        fn();
      } catch {
        /* ignore subscriber errors */
      }
    }
  });
}

export function readFolioNavLayoutSnapshot() {
  return {
    epoch: navLayoutEpoch,
    previousPathname: navPreviousPathname,
    pathname: navPathname,
  };
}
