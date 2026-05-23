/** True while useSyncPanelFromNode is applying node data to the UI store. */
let suppressPanelPersist = false;

export function isPanelPersistSuppressed(): boolean {
  return suppressPanelPersist;
}

export function runWithPanelPersistSuppressed(fn: () => void): void {
  suppressPanelPersist = true;
  try {
    fn();
  } finally {
    queueMicrotask(() => {
      suppressPanelPersist = false;
    });
  }
}
