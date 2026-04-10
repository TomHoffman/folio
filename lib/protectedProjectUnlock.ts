const STORAGE_PREFIX = "folio:protected-unlock:";

export function protectedUnlockStorageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function markProjectProtectedUnlocked(slug: string): void {
  try {
    sessionStorage.setItem(protectedUnlockStorageKey(slug), "1");
  } catch {
    /* private mode / quota */
  }
}

export function isProjectProtectedUnlockedClient(slug: string): boolean {
  try {
    return sessionStorage.getItem(protectedUnlockStorageKey(slug)) === "1";
  } catch {
    return false;
  }
}
