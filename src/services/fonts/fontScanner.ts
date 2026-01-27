/**
 * Directory scanning for font files
 * Recursively scans a directory for TTF, OTF, WOFF, and WOFF2 files
 */

const FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2']

/**
 * Async generator that recursively yields FileSystemFileHandle objects from a directory
 */
async function* getFilesRecursively(
  dirHandle: FileSystemDirectoryHandle
): AsyncGenerator<FileSystemFileHandle> {
  try {
    // @ts-ignore - File System Access API types may not be fully recognized
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        yield entry as FileSystemFileHandle
      } else if (entry.kind === 'directory') {
        try {
          yield* getFilesRecursively(entry as FileSystemDirectoryHandle)
        } catch (error) {
          // Permission error on subdirectory - skip with warning
          console.warn(`Skipping directory "${entry.name}": ${error}`)
        }
      }
    }
  } catch (error) {
    console.warn(`Error reading directory: ${error}`)
  }
}

/**
 * Check if a file has a font extension (case-insensitive)
 */
function isFontFile(fileName: string): boolean {
  const lowerName = fileName.toLowerCase()
  return FONT_EXTENSIONS.some(ext => lowerName.endsWith(ext))
}

/**
 * Scan a directory recursively for font files
 * Returns an array of File objects for all font files found
 */
export async function scanFontsDirectory(
  dirHandle: FileSystemDirectoryHandle
): Promise<File[]> {
  const fontFiles: File[] = []

  try {
    for await (const fileHandle of getFilesRecursively(dirHandle)) {
      // Filter to font files only
      if (isFontFile(fileHandle.name)) {
        try {
          // Convert handle to File object
          const file = await fileHandle.getFile()
          fontFiles.push(file)
        } catch (error) {
          console.warn(`Failed to read font file "${fileHandle.name}": ${error}`)
        }
      }
    }
  } catch (error) {
    console.error('Error scanning fonts directory:', error)
  }

  return fontFiles
}
