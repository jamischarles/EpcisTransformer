import path from 'path';
import fs from 'fs/promises';
import SaxonJS from 'saxon-js';
import { ValidationError, TransformationError, validateXml, ensureXslTransform } from './utils';
import type { XmlTransformOptions } from '@shared/schema';

// Constants
const XSL_URL = 'https://ref.gs1.org/tools/epcis/xsl/convert-1.2-to-2.0.xsl';
const XSL_PATH = path.resolve(process.cwd(), 'server/epcis-transformer/xslt/convert-1.2-to-2.0.xsl');

/**
 * Converts EPCIS 1.2 XML to EPCIS 2.0 XML using the GS1 XSL transform
 */
export async function convertToEpcis20Xml(
  xml: string, 
  options: XmlTransformOptions = { validateXml: false, preserveComments: false }
): Promise<string> {
  try {
    // Validate XML if option is enabled
    if (options.validateXml && !validateXml(xml)) {
      throw new ValidationError('Invalid EPCIS 1.2 XML document');
    }
    
    // Ensure XSL file exists (download if needed)
    const xslFilePath = await ensureXslTransform(XSL_PATH, XSL_URL);
    
    // Compile the XSLT stylesheet once and cache it
    // For production, this would be better done at module initialization 
    // and cached for reuse
    const xsltContent = await fs.readFile(xslFilePath, 'utf-8');
    
    // Perform the XSLT transformation
    const result = SaxonJS.transform({
      stylesheetText: xsltContent,
      sourceText: xml,
      destination: 'serialized',
      // Saxon-JS allows passing parameters to the XSLT
      // We can pass the preserveComments option to the transform if needed
      // stylesheetParams: { preserveComments: options.preserveComments }
    });
    
    // The result should be a string
    if (typeof result !== 'string') {
      throw new TransformationError('Unexpected transformation result format');
    }
    
    return result;
  } catch (error) {
    // Re-throw validation and transformation errors as they are already handled
    if (error instanceof ValidationError || error instanceof TransformationError) {
      throw error;
    }
    
    // Wrap other errors in a transformation error
    throw new TransformationError(`Failed to convert XML: ${(error as Error).message}`);
  }
}

/**
 * Synchronous version of the converter (for API compatibility)
 * Note: This is a wrapper around the async version that blocks execution
 * Not recommended for production use with large files
 */
export function convertToEpcis20XmlSync(
  xml: string, 
  options: XmlTransformOptions = { validateXml: false, preserveComments: false }
): string {
  // This is a simplified synchronous implementation
  // In a real-world scenario, we would need a proper synchronous XSLT processor
  throw new Error('Synchronous conversion is not implemented in this version');
}
