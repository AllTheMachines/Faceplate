/**
 * IndexedDB operations for font storage
 * Stores custom fonts and directory handles for persistence across browser sessions
 */

export interface FontMetadata {
  family: string           // CSS font-family name (from name table)
  fullName: string         // Full font name
  postScriptName: string   // PostScript name
  version?: string         // Font version
  format: 'ttf' | 'otf' | 'woff' | 'woff2'
  fileName: string         // Original file name
}

export interface StoredFont {
  family: string           // CSS font-family value (unique key)
  data: ArrayBuffer        // Raw font data for embedding
  metadata: FontMetadata   // Parsed metadata (name, format, etc.)
  addedAt: number          // Timestamp for sorting
}

const DB_NAME = 'vst-ui-fonts'
const DB_VERSION = 1
const FONTS_STORE = 'fonts'
const HANDLES_STORE = 'handles'
const DIRECTORY_HANDLE_KEY = 'fonts-directory'

/**
 * Opens or creates the fonts database
 */
export function openFontsDB(): Promise<IDBDatabase> {
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

      // Create fonts object store with family as keyPath
      if (!db.objectStoreNames.contains(FONTS_STORE)) {
        db.createObjectStore(FONTS_STORE, { keyPath: 'family' })
      }

      // Create handles object store for directory handle persistence
      if (!db.objectStoreNames.contains(HANDLES_STORE)) {
        db.createObjectStore(HANDLES_STORE)
      }
    }
  })
}

/**
 * Store or update a font in the database
 */
export async function storeFont(font: StoredFont): Promise<void> {
  const db = await openFontsDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONTS_STORE, 'readwrite')
    const store = transaction.objectStore(FONTS_STORE)
    const request = store.put(font)

    request.onerror = () => {
      reject(new Error(`Failed to store font: ${request.error?.message}`))
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
 * Get all fonts from the database, sorted by addedAt timestamp
 */
export async function getAllFonts(): Promise<StoredFont[]> {
  const db = await openFontsDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONTS_STORE, 'readonly')
    const store = transaction.objectStore(FONTS_STORE)
    const request = store.getAll()

    request.onerror = () => {
      reject(new Error(`Failed to get fonts: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      const fonts = request.result as StoredFont[]
      // Sort by addedAt timestamp (newest first)
      fonts.sort((a, b) => b.addedAt - a.addedAt)
      resolve(fonts)
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Get a single font by family name
 */
export async function getFont(family: string): Promise<StoredFont | undefined> {
  const db = await openFontsDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONTS_STORE, 'readonly')
    const store = transaction.objectStore(FONTS_STORE)
    const request = store.get(family)

    request.onerror = () => {
      reject(new Error(`Failed to get font: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      resolve(request.result as StoredFont | undefined)
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Clear all fonts from the database (for rescan)
 */
export async function clearFonts(): Promise<void> {
  const db = await openFontsDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FONTS_STORE, 'readwrite')
    const store = transaction.objectStore(FONTS_STORE)
    const request = store.clear()

    request.onerror = () => {
      reject(new Error(`Failed to clear fonts: ${request.error?.message}`))
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
 * Store directory handle for persistence across browser sessions
 */
export async function storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openFontsDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readwrite')
    const store = transaction.objectStore(HANDLES_STORE)
    const request = store.put(handle, DIRECTORY_HANDLE_KEY)

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
 * Retrieve stored directory handle
 */
export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openFontsDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readonly')
    const store = transaction.objectStore(HANDLES_STORE)
    const request = store.get(DIRECTORY_HANDLE_KEY)

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
}

/**
 * Remove stored directory handle
 */
export async function clearDirectoryHandle(): Promise<void> {
  const db = await openFontsDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readwrite')
    const store = transaction.objectStore(HANDLES_STORE)
    const request = store.delete(DIRECTORY_HANDLE_KEY)

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
