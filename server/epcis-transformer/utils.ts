import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import https from 'https';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// Error types for better error handling
export class ValidationError extends Error {
  code: string;
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'INVALID_XML';
  }
}

export class TransformationError extends Error {
  code: string;
  
  constructor(message: string) {
    super(message);
    this.name = 'TransformationError';
    this.code = 'TRANSFORMATION_ERROR';
  }
}

/**
 * Validates if the provided string is valid XML
 */
export function validateXml(xml: string): boolean {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    
    // Check for parsing errors
    const errors = doc.getElementsByTagName('parsererror');
    if (errors.length > 0) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Formats XML string with proper indentation
 */
export function formatXml(xml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const serializer = new XMLSerializer();
    
    // This is a simple pretty print - in a production environment
    // you might want a more sophisticated XML formatter
    return serializer.serializeToString(doc);
  } catch (error) {
    // If formatting fails, return the original XML
    return xml;
  }
}

/**
 * Downloads a file from a URL and saves it to the specified path
 */
export async function downloadFile(url: string, destinationPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const file = fs.createWriteStream(destinationPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destinationPath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

/**
 * Ensures the XSL transform file exists, downloading it if necessary
 */
export async function ensureXslTransform(xslPath: string, xslUrl: string): Promise<string> {
  try {
    // Check if the file exists
    await readFile(xslPath);
    return xslPath;
  } catch (error) {
    // File doesn't exist, download it
    await downloadFile(xslUrl, xslPath);
    return xslPath;
  }
}

/**
 * Gets the current timestamp in ISO format for status messages
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}
