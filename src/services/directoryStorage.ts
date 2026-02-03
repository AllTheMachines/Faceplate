/**
 * IndexedDB storage for directory handles
 * Remembers last used folders for project save/load and export operations
 */

const DB_NAME = 'vst-ui-directories'
const DB_VERSION = 1
const HANDLES_STORE = 'handles'

// Keys for different directory/file types
export const DIR_KEYS = {
  PROJECT: 'project-directory',  // For Save/Load project (legacy)
  PROJECT_FILE: 'project-file',  // For Save/Load project (file handle)
  EXPORT: 'export-directory',    // For ZIP and folder export (shared)
} as const

type DirectoryKey = typeof DIR_KEYS[keyof typeof DIR_KEYS]

/**
 * Opens or creates the directories database
 */
function openDirectoriesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(HANDLES_STORE)) {
        db.createObjectStore(HANDLES_STORE)
      }
    }
  })
}

/**
 * Store a directory handle for persistence
 */
export async function storeDirectoryHandle(
  key: DirectoryKey,
  handle: FileSystemDirectoryHandle
): Promise<void> {
  const db = await openDirectoriesDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readwrite')
    const store = transaction.objectStore(HANDLES_STORE)
    const request = store.put(handle, key)

    request.onerror = () => {
      reject(new Error(`Failed to store directory handle: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve()
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Retrieve a stored directory handle
 */
export async function getDirectoryHandle(
  key: DirectoryKey
): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDirectoriesDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLES_STORE, 'readonly')
      const store = transaction.objectStore(HANDLES_STORE)
      const request = store.get(key)

      request.onerror = () => {
        reject(new Error(`Failed to get directory handle: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  } catch {
    return null
  }
}

/**
 * Clear a stored directory handle
 */
export async function clearDirectoryHandle(key: DirectoryKey): Promise<void> {
  const db = await openDirectoriesDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readwrite')
    const store = transaction.objectStore(HANDLES_STORE)
    const request = store.delete(key)

    request.onerror = () => {
      reject(new Error(`Failed to clear directory handle: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve()
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Get a directory handle with permission verification
 * Returns null if permission is denied or handle is invalid
 */
export async function getDirectoryHandleWithPermission(
  key: DirectoryKey
): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await getDirectoryHandle(key)
    if (!handle) return null

    // Check current permission status
    // @ts-ignore - queryPermission may not be in type definitions
    const permission = await handle.queryPermission({ mode: 'readwrite' })

    if (permission === 'granted') {
      return handle
    }

    // Need to request permission (requires user gesture)
    if (permission === 'prompt') {
      // @ts-ignore - requestPermission may not be in type definitions
      const requestedPermission = await handle.requestPermission({ mode: 'readwrite' })
      if (requestedPermission === 'granted') {
        return handle
      }
    }

    // Permission denied - clear the stored handle
    await clearDirectoryHandle(key)
    return null
  } catch {
    // Handle is invalid or error occurred
    await clearDirectoryHandle(key).catch(() => {})
    return null
  }
}

/**
 * Store a file handle for persistence
 * Used for remembering last opened/saved project file location
 */
export async function storeFileHandle(
  key: DirectoryKey,
  handle: FileSystemFileHandle
): Promise<void> {
  const db = await openDirectoriesDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readwrite')
    const store = transaction.objectStore(HANDLES_STORE)
    const request = store.put(handle, key)

    request.onerror = () => {
      reject(new Error(`Failed to store file handle: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve()
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Retrieve a stored file handle
 */
export async function getFileHandle(
  key: DirectoryKey
): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openDirectoriesDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HANDLES_STORE, 'readonly')
      const store = transaction.objectStore(HANDLES_STORE)
      const request = store.get(key)

      request.onerror = () => {
        reject(new Error(`Failed to get file handle: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  } catch {
    return null
  }
}
