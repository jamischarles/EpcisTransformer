import { DOMParser } from '@xmldom/xmldom';
import { ValidationError, TransformationError, validateXml } from './utils';
import { JsonLdTransformOptions } from '@shared/schema';

/**
 * Transforms EPCIS 2.0 XML to EPCIS 2.0 JSON-LD format
 */
export async function convertToJsonLd(
  xml: string,
  options: JsonLdTransformOptions = { prettyPrint: true, includeContext: true }
): Promise<string> {
  try {
    // Validate the XML input
    if (!validateXml(xml)) {
      throw new ValidationError('Invalid EPCIS 2.0 XML document');
    }
    
    // Parse the XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    
    // Check if this is actually an EPCIS 2.0 document
    const documentElement = doc.documentElement;
    if (!documentElement || documentElement.namespaceURI !== 'urn:epcglobal:epcis:xsd:2') {
      throw new ValidationError('XML document is not a valid EPCIS 2.0 document');
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
    
    // Process the EPCISBody
    const epcisBody = documentElement.getElementsByTagName('epcis:EPCISBody')[0];
    if (epcisBody) {
      jsonLd.epcisBody = { eventList: [] };
      
      // Process EventList
      const eventList = epcisBody.getElementsByTagName('epcis:EventList')[0];
      if (eventList) {
        // Process each type of event
        processEvents(eventList, 'epcis:ObjectEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'epcis:AggregationEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'epcis:TransactionEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'epcis:TransformationEvent', jsonLd.epcisBody.eventList);
        processEvents(eventList, 'epcis:AssociationEvent', jsonLd.epcisBody.eventList);
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
function processEvents(eventList: Element, eventType: string, resultArray: any[]): void {
  const events = eventList.getElementsByTagName(eventType);
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
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
function processEventFields(event: Element, eventObj: any): void {
  // Process eventTime
  const eventTime = getElementTextContent(event, 'eventTime');
  if (eventTime) eventObj.eventTime = eventTime;
  
  // Process eventTimeZoneOffset
  const timeZoneOffset = getElementTextContent(event, 'eventTimeZoneOffset');
  if (timeZoneOffset) eventObj.eventTimeZoneOffset = timeZoneOffset;
  
  // Process epcList if available
  const epcList = event.getElementsByTagName('epcList')[0];
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
  const readPoint = event.getElementsByTagName('readPoint')[0];
  if (readPoint) {
    const id = getElementTextContent(readPoint, 'id');
    if (id) eventObj.readPoint = { id };
  }
  
  // Process bizLocation
  const bizLocation = event.getElementsByTagName('bizLocation')[0];
  if (bizLocation) {
    const id = getElementTextContent(bizLocation, 'id');
    if (id) eventObj.bizLocation = { id };
  }
  
  // Additional fields would be added here for a complete implementation
}

/**
 * Helper function to get text content of a child element
 */
function getElementTextContent(parent: Element, tagName: string): string | null {
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
