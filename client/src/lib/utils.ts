import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a basic diff between two text strings
 * @param oldText The original text
 * @param newText The modified text
 * @returns An array of diff objects with type and value
 */
export function generateDiff(oldText: string, newText: string) {
  // Split the texts into lines
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  // Simple diff algorithm (line by line comparison)
  const diffResult: Array<{type: 'added' | 'removed' | 'unchanged', value: string}> = [];
  
  // Find the maximum length between both arrays
  const maxLen = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLen; i++) {
    const oldLine = i < oldLines.length ? oldLines[i] : null;
    const newLine = i < newLines.length ? newLines[i] : null;
    
    if (oldLine === null) {
      // Line was added
      diffResult.push({ type: 'added', value: newLine! });
    } else if (newLine === null) {
      // Line was removed
      diffResult.push({ type: 'removed', value: oldLine });
    } else if (oldLine !== newLine) {
      // Line was changed - show as removed and added
      diffResult.push({ type: 'removed', value: oldLine });
      diffResult.push({ type: 'added', value: newLine });
    } else {
      // Line is unchanged
      diffResult.push({ type: 'unchanged', value: oldLine });
    }
  }
  
  return diffResult;
}
