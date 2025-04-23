import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as diffLib from 'diff';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a more accurate diff between two text strings using the diff library
 * @param oldText The original text
 * @param newText The modified text
 * @returns An array of diff objects with type and value
 */
export function generateDiff(oldText: string, newText: string) {
  // Create the patch using the diff library
  const diffResult: Array<{type: 'added' | 'removed' | 'unchanged', value: string}> = [];
  
  // For XML files, we need to be more careful about how we split the text
  // First check if this is likely XML content
  const isXml = oldText.trim().startsWith('<?xml') || newText.trim().startsWith('<?xml');
  
  // Use appropriate diff strategy based on content type
  const changes = isXml
    ? diffLib.diffLines(oldText, newText, {
        newlineIsToken: true,
        ignoreWhitespace: false
      })
    : diffLib.diffLines(oldText, newText);
  
  // Convert the diff library format to our format
  for (const part of changes) {
    if (part.added) {
      diffResult.push({ type: 'added', value: part.value });
    } else if (part.removed) {
      diffResult.push({ type: 'removed', value: part.value });
    } else {
      diffResult.push({ type: 'unchanged', value: part.value });
    }
  }
  
  return diffResult;
}
