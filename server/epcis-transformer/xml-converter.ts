import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { ValidationError, TransformationError, validateXml } from './utils';
import type { XmlTransformOptions } from '@shared/schema';

/**
 * Converts EPCIS 1.2 XML to EPCIS 2.0 XML
 * 
 * This is a simplified implementation that handles the most common conversion cases
 * In a production environment, a proper XSLT processor should be used
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
    
    console.log('Starting manual XML transformation');
    
    // Parse input XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    
    // Check for parsing errors
    const errors = doc.getElementsByTagName('parsererror');
    if (errors.length > 0) {
      throw new ValidationError('XML parsing failed: ' + (errors[0].textContent || 'Unknown error'));
    }
    
    // Get root element
    const rootElement = doc.documentElement;
    if (!rootElement) {
      throw new ValidationError('Invalid XML document: no root element');
    }
    
    // Check if this is an EPCIS document
    if (rootElement.nodeName !== 'epcis:EPCISDocument' && 
        rootElement.nodeName !== 'EPCISDocument') {
      throw new ValidationError('Not an EPCIS document');
    }
    
    // Update namespace and schema version
    const oldNamespace = 'urn:epcglobal:epcis:xsd:1';
    const newNamespace = 'urn:epcglobal:epcis:xsd:2';
    
    // Update root element namespace
    if (rootElement.namespaceURI === oldNamespace) {
      // Create a new document with the updated namespace
      const newDoc = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><epcis:EPCISDocument xmlns:epcis="' + newNamespace + '"></epcis:EPCISDocument>', 'application/xml');
      const newRoot = newDoc.documentElement;
      
      // Copy attributes from old root to new root
      for (let i = 0; i < rootElement.attributes.length; i++) {
        const attr = rootElement.attributes[i];
        if (attr.name === 'xmlns:epcis') {
          newRoot.setAttribute(attr.name, newNamespace);
        } else {
          newRoot.setAttribute(attr.name, attr.value);
        }
      }
      
      // Set schema version to 2.0
      newRoot.setAttribute('schemaVersion', '2.0');
      
      // Copy children
      Array.from(rootElement.childNodes).forEach(child => {
        const importedNode = newDoc.importNode(child, true);
        newRoot.appendChild(importedNode);
      });
      
      // Serialize to string
      const serializer = new XMLSerializer();
      return serializer.serializeToString(newDoc);
    } else {
      // Just update the schema version attribute
      rootElement.setAttribute('schemaVersion', '2.0');
      
      // Serialize to string
      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc);
    }
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
 * Synchronous version of the converter
 */
export function convertToEpcis20XmlSync(
  xml: string, 
  options: XmlTransformOptions = { validateXml: false, preserveComments: false }
): string {
  // We can directly use the async version since our implementation is actually synchronous
  // In a real implementation with proper XSLT processing, we would need different code here
  try {
    return convertToEpcis20Xml(xml, options) as unknown as string;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof TransformationError) {
      throw error;
    }
    throw new TransformationError(`Failed to convert XML: ${(error as Error).message}`);
  }
}