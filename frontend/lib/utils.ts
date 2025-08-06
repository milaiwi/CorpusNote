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

