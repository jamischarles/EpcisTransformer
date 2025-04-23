import { convertToEpcis20Xml, convertToEpcis20XmlSync } from './xml-converter';
import { convertToJsonLd, convertToJsonLdSync } from './json-converter';
import { ValidationError, TransformationError } from './utils';
import type { XmlTransformOptions, JsonLdTransformOptions } from '@shared/schema';

/**
 * EPCIS Transformer module
 * 
 * A Node.js module for converting EPCIS 1.2 XML to EPCIS 2.0 XML and JSON-LD formats
 */
export {
  convertToEpcis20Xml,
  convertToEpcis20XmlSync,
  convertToJsonLd,
  convertToJsonLdSync,
  ValidationError,
  TransformationError
};

/**
 * Main interface for the EPCIS Transformer
 */
export default {
  /**
   * Convert EPCIS 1.2 XML to EPCIS 2.0 XML
   * 
   * @param xml - String containing EPCIS 1.2 XML
   * @param options - Optional configuration object
   * @returns Promise that resolves to EPCIS 2.0 XML string
   */
  convertToEpcis20Xml,
  
  /**
   * Convert EPCIS 1.2 XML to EPCIS 2.0 XML (synchronous version)
   * 
   * @param xml - String containing EPCIS 1.2 XML
   * @param options - Optional configuration object
   * @returns EPCIS 2.0 XML string
   */
  convertToEpcis20XmlSync,
  
  /**
   * Transform EPCIS 2.0 XML to JSON-LD
   * 
   * @param xml - String containing EPCIS 2.0 XML
   * @param options - Optional configuration object
   * @returns Promise that resolves to JSON-LD string
   */
  convertToJsonLd,
  
  /**
   * Transform EPCIS 2.0 XML to JSON-LD (synchronous version)
   * 
   * @param xml - String containing EPCIS 2.0 XML
   * @param options - Optional configuration object
   * @returns JSON-LD string
   */
  convertToJsonLdSync
};
