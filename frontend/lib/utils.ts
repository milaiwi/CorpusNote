import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const INVALID_CHARACTERS_ARRAY = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
export const INVALID_CHARACTERS_STRING = "/\\:*?\"<>|"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract the current directory from a path
 * @param path - The path to extract the current directory from
 * @returns The current directory
 */
export function extractCurrentDirectory(path: string) {
  const lastSlashIndex = path.lastIndexOf('/')
  return path.substring(0, lastSlashIndex)
}

/**
 * Ensure the title does not contain invalid characters
 * @param title - The title to check
 * @returns True if the title contains invalid characters, false otherwise
 */
export function invalidCharactersExist(title: string) {
  return INVALID_CHARACTERS_ARRAY.some(char => title.includes(char))
}

/**
 * Extract the file name from a path
 * @param title - The path to extract the file name from
 * @returns The file name
 */
export function extractFileName(title: string) {
  return title.split('/').pop()?.split('.')[0]
}

/**
 * Convert an absolute path to a relative path based on the vault path
 * @param absPath - The absolute path to convert
 * @param vaultPath - The vault path to make relative to
 * @returns The relative path (e.g., "./testin/hehe")
 */
export function getRelativePath(absPath: string, vaultPath: string): string {
  // Normalize paths by converting backslashes to forward slashes and removing trailing slashes
  const normalizedAbsPath = absPath.replace(/\\/g, '/').replace(/\/+$/, '')
  const normalizedVaultPath = vaultPath.replace(/\\/g, '/').replace(/\/+$/, '')
  
  // Check if the absolute path starts with the vault path
  if (!normalizedAbsPath.startsWith(normalizedVaultPath)) {
    throw new Error(`Absolute path '${absPath}' is not within vault path '${vaultPath}'`)
  }
  
  // Remove the vault path prefix and any leading slashes
  const relativePath = normalizedAbsPath.slice(normalizedVaultPath.length).replace(/^\/+/, '')
  
  // Return with "./" prefix if there's a path, or "." if it's the vault root
  return relativePath ? `./${relativePath}` : '.'
}