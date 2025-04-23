import { apiRequest } from './queryClient';
import type { XmlTransformOptions, JsonLdTransformOptions } from '@shared/schema';

// Local implementations

/**
 * Converts EPCIS 1.2 XML to EPCIS 2.0 XML using local implementation
 */
export async function convertToEpcis20Xml(xml: string, options?: XmlTransformOptions): Promise<string> {
  const response = await apiRequest('POST', '/api/convert-to-epcis20-xml', { xml, options });
  const data = await response.json();
  return data.result;
}

/**
 * Converts EPCIS 2.0 XML to JSON-LD format using local implementation
 */
export async function convertToJsonLd(xml: string, options?: JsonLdTransformOptions): Promise<string> {
  const response = await apiRequest('POST', '/api/convert-to-jsonld', { xml, options });
  const data = await response.json();
  return data.result;
}

// OpenEPCIS API implementations

/**
 * Tests the connection to the OpenEPCIS API
 */
export async function testOpenEpcisConnection(): Promise<{ status: string; message: string }> {
  const response = await apiRequest('GET', '/api/openepcis/test-connection');
  const data = await response.json();
  return data;
}

/**
 * Converts EPCIS 1.2 XML to EPCIS 2.0 XML using OpenEPCIS API
 */
export async function convertToEpcis20XmlViaOpenEpcis(xml: string, options?: XmlTransformOptions): Promise<string> {
  const response = await apiRequest('POST', '/api/openepcis/convert-to-epcis20-xml', { xml, options });
  const data = await response.json();
  return data.result;
}

/**
 * Converts EPCIS 2.0 XML to JSON-LD format using OpenEPCIS API
 */
export async function convertToJsonLdViaOpenEpcis(xml: string, options?: JsonLdTransformOptions): Promise<string> {
  const response = await apiRequest('POST', '/api/openepcis/convert-to-jsonld', { xml, options });
  const data = await response.json();
  return data.result;
}

/**
 * Converts EPCIS 1.2 XML directly to JSON-LD using OpenEPCIS API
 */
export async function convertFrom12ToJsonLdViaOpenEpcis(xml: string, options?: JsonLdTransformOptions): Promise<string> {
  const response = await apiRequest('POST', '/api/openepcis/convert-from-12-to-jsonld', { xml, options });
  const data = await response.json();
  return data.result;
}

/**
 * Downloads content as a file
 */
export function downloadAsFile(content: string, filename: string, contentType: string): void {
  // Create a blob with the data
  const blob = new Blob([content], { type: contentType });
  
  // Create a link element
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Append to the document, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      return false;
    }
  }
}
