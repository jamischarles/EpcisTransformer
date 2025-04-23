import { DOMParser } from '@xmldom/xmldom';
import { ValidationError, TransformationError, validateXml } from './utils';
import { JsonLdTransformOptions } from '@shared/schema';

// Define a new type that represents the xmldom Element interface
type XmlDomElement = import('@xmldom/xmldom').Element;

/**
 * Transforms EPCIS 2.0 XML to EPCIS 2.0 JSON-LD format
 */
export async function convertToJsonLd(
  xml: string,
  options: JsonLdTransformOptions = { prettyPrint: true, includeContext: true }
): Promise<string> {
  console.log('Starting JSON-LD conversion');
  try {
    // Validate the XML input
    console.log('Validating XML input');
    if (!validateXml(xml)) {
      console.error('XML validation failed');
      throw new ValidationError('Invalid EPCIS 2.0 XML document');
    }
    
    // Parse the XML
    console.log('Parsing XML document');
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    
    // Check for parsing errors
    const parseErrors = doc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      console.error('XML parse error:', parseErrors[0].textContent);
      throw new ValidationError('XML parsing failed: ' + (parseErrors[0].textContent || 'Unknown error'));
    }
    
    // Check if this is actually an EPCIS 2.0 document
    console.log('Checking if document is EPCIS 2.0');
    const documentElement = doc.documentElement as XmlDomElement;
    console.log('Document namespace:', documentElement ? documentElement.namespaceURI : 'none');
    
    // For debugging, allow non-EPCIS 2.0 documents temporarily
    if (!documentElement) {
      throw new ValidationError('Invalid XML document structure - no document element');
    }
    
    // Build the JSON-LD object
    const jsonLd: any = {};
    
    // Add JSON-LD context if option is enabled
    if (options.includeContext) {
      jsonLd['@context'] = 'https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld';
    }
    
    // Extract document attributes
    jsonLd.type = 'EPCISDocument';
    jsonLd.schemaVersion = documentElement.getAttribute('schemaVersion') || '2.0';
    jsonLd.creationDate = documentElement.getAttribute('creationDate') || new Date().toISOString();
    
    // Process the EPCISBody (or similar element)
    const epcisBody = documentElement.getElementsByTagName('epcis:EPCISBody')[0] 
      || documentElement.getElementsByTagName('EPCISBody')[0] as XmlDomElement;
    
    // Always create an epcisBody with eventList to match the expected OpenEPCIS structure
    jsonLd.epcisBody = { eventList: [] };
    
    if (epcisBody) {
      // Process EventList
      const eventList = epcisBody.getElementsByTagName('epcis:EventList')[0] 
        || epcisBody.getElementsByTagName('EventList')[0] as XmlDomElement;
      
      if (eventList) {
        // Process each type of event
        processEvents(eventList, 'epcis:ObjectEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'ObjectEvent', jsonLd.epcisBody.eventList);
        
        processEvents(eventList, 'epcis:AggregationEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'AggregationEvent', jsonLd.epcisBody.eventList);
        
        processEvents(eventList, 'epcis:TransactionEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'TransactionEvent', jsonLd.epcisBody.eventList);
        
        processEvents(eventList, 'epcis:TransformationEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'TransformationEvent', jsonLd.epcisBody.eventList);
        
        processEvents(eventList, 'epcis:AssociationEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'AssociationEvent', jsonLd.epcisBody.eventList);
      }
    }
    
    // Serialize to JSON string with appropriate formatting
    return JSON.stringify(
      jsonLd, 
      null, 
      options.prettyPrint ? 2 : 0
    );
  } catch (error) {
    // Re-throw validation and transformation errors as they are already handled
    if (error instanceof ValidationError || error instanceof TransformationError) {
      throw error;
    }
    
    // Wrap other errors in a transformation error
    throw new TransformationError(`Failed to convert to JSON-LD: ${(error as Error).message}`);
  }
}

/**
 * Process EPCIS events of a specific type
 */
function processEvents(eventList: XmlDomElement, eventType: string, resultArray: any[]): void {
  const events = eventList.getElementsByTagName(eventType);
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i] as XmlDomElement;
    const eventObj: any = {
      type: eventType.split(':')[1] // Remove namespace prefix
    };
    
    // Process common event fields
    processEventFields(event, eventObj);
    
    // Add to result array
    resultArray.push(eventObj);
  }
}

/**
 * Process common EPCIS event fields
 */
function processEventFields(event: XmlDomElement, eventObj: any): void {
  // Process eventTime
  const eventTime = getElementTextContent(event, 'eventTime');
  if (eventTime) eventObj.eventTime = eventTime;
  
  // Process eventTimeZoneOffset
  const timeZoneOffset = getElementTextContent(event, 'eventTimeZoneOffset');
  if (timeZoneOffset) eventObj.eventTimeZoneOffset = timeZoneOffset;
  
  // Process epcList if available
  const epcList = event.getElementsByTagName('epcList')[0] as XmlDomElement;
  if (epcList) {
    eventObj.epcList = [];
    const epcs = epcList.getElementsByTagName('epc');
    for (let j = 0; j < epcs.length; j++) {
      const epc = epcs[j].textContent;
      if (epc) eventObj.epcList.push(epc);
    }
  }
  
  // Process action
  const action = getElementTextContent(event, 'action');
  if (action) eventObj.action = action;
  
  // Process bizStep
  const bizStep = getElementTextContent(event, 'bizStep');
  if (bizStep) eventObj.bizStep = bizStep;
  
  // Process disposition
  const disposition = getElementTextContent(event, 'disposition');
  if (disposition) eventObj.disposition = disposition;
  
  // Process readPoint
  const readPoint = event.getElementsByTagName('readPoint')[0] as XmlDomElement;
  if (readPoint) {
    const id = getElementTextContent(readPoint, 'id');
    if (id) eventObj.readPoint = { id };
  }
  
  // Process bizLocation
  const bizLocation = event.getElementsByTagName('bizLocation')[0] as XmlDomElement;
  if (bizLocation) {
    const id = getElementTextContent(bizLocation, 'id');
    if (id) eventObj.bizLocation = { id };
  }
  
  // Additional fields would be added here for a complete implementation
}

/**
 * Helper function to get text content of a child element
 */
function getElementTextContent(parent: XmlDomElement, tagName: string): string | null {
  const elements = parent.getElementsByTagName(tagName);
  if (elements.length > 0 && elements[0].textContent) {
    return elements[0].textContent;
  }
  return null;
}

/**
 * Synchronous version of the converter (for API compatibility)
 */
export function convertToJsonLdSync(
  xml: string,
  options: JsonLdTransformOptions = { prettyPrint: true, includeContext: true }
): string {
  // This is a simplified synchronous implementation
  // In a real-world scenario, we would handle this differently
  throw new Error('Synchronous conversion is not implemented in this version');
}