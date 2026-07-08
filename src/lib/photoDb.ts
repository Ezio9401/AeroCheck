const DB_NAME = "aerocheck_photos_db";
const DB_VERSION = 1;
const STORE = "photos";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  // If opening fails, drop the cached rejected promise so a later call can
  // retry instead of being stuck with a permanently-rejected singleton.
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

export async function savePhoto(entryId: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(blob, entryId);
    // A QuotaExceededError surfaces on the request and aborts the tx, so
    // listen on all three to make sure the failure is never swallowed.
    req.onerror = () => reject(req.error ?? tx.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("Transacción de guardado abortada"));
  });
}

export async function getPhoto(entryId: string): Promise<Blob | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(entryId);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhoto(entryId: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(entryId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhotosFor(entryIds: string[]): Promise<Record<string, Blob>> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const result: Record<string, Blob> = {};
    let pending = entryIds.length;
    if (pending === 0) {
      resolve(result);
      return;
    }
    for (const id of entryIds) {
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result) result[id] = req.result as Blob;
        pending -= 1;
        if (pending === 0) resolve(result);
      };
      req.onerror = () => reject(req.error);
    }
  });
}

/**
 * Fraction of the origin's storage quota already in use (0–1), or null if the
 * Storage API isn't available. Used to warn before IndexedDB fills up.
 */
export async function storageUsageRatio(): Promise<number | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    if (!usage || !quota) return null;
    return usage / quota;
  } catch {
    return null;
  }
}

/**
 * Storage estimate in megabytes plus a nearLimit flag (usage over 80%). Falls
 * back to zeros / nearLimit=false when the Storage API isn't available.
 */
export async function checkStorageQuota(): Promise<{ usedMB: number; quotaMB: number; nearLimit: boolean }> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return { usedMB: 0, quotaMB: 0, nearLimit: false };
  }
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    const usedMB = usage / (1024 * 1024);
    const quotaMB = quota / (1024 * 1024);
    const nearLimit = quota > 0 && usage / quota > 0.8;
    return { usedMB, quotaMB, nearLimit };
  } catch {
    return { usedMB: 0, quotaMB: 0, nearLimit: false };
  }
}

export async function clearPhotos(entryIds: string[]): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    for (const id of entryIds) store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
