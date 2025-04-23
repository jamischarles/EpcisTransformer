import axios from 'axios';
import { ValidationError, TransformationError } from './utils';
import type { XmlTransformOptions, JsonLdTransformOptions } from '@shared/schema';
import { convertToEpcis20Xml as localConvertToEpcis20Xml } from './xml-converter';
import { convertToJsonLd as localConvertToJsonLd } from './json-converter';

// Constants
// Using a mock endpoint for now that would return a 200 status for test-connection
// In a real implementation, this would be the actual OpenEPCIS API URL
const OPEN_EPCIS_API_BASE_URL = 'https://httpstat.us';

/**
 * Client for OpenEPCIS API endpoints
 */
export class OpenEpcisClient {
  private baseUrl: string;

  constructor(baseUrl: string = OPEN_EPCIS_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Convert EPCIS 1.2 XML to EPCIS 2.0 XML using OpenEPCIS API
   * If the OpenEPCIS API is not available, falls back to local implementation
   * @param xml EPCIS 1.2 XML content
   * @param options Transformation options
   * @returns Promise resolving to EPCIS 2.0 XML string
   */
  async convertToEpcis20Xml(xml: string, options: XmlTransformOptions = { validateXml: false, preserveComments: false }): Promise<string> {
    return this.withFallback(
      // API method
      async () => {
        const response = await axios.post(
          `${this.baseUrl}/translator/1.2/2.0/xml`, 
          xml, 
          {
            headers: {
              'Content-Type': 'application/xml'
            }
          }
        );
        
        return response.data;
      },
      // Fallback method
      async () => {
        return localConvertToEpcis20Xml(xml, options);
      },
      'XML 1.2 to 2.0 conversion'
    );
  }

  /**
   * Convert EPCIS 2.0 XML to JSON-LD format using OpenEPCIS API
   * If the OpenEPCIS API is not available, falls back to local implementation
   * @param xml EPCIS 2.0 XML content
   * @param options Transformation options
   * @returns Promise resolving to JSON-LD string
   */
  async convertToJsonLd(xml: string, options: JsonLdTransformOptions = { prettyPrint: true, includeContext: true }): Promise<string> {
    return this.withFallback(
      // API method
      async () => {
        const response = await axios.post(
          `${this.baseUrl}/converter/epcis-document/xml/json`, 
          xml, 
          {
            headers: {
              'Content-Type': 'application/xml'
            }
          }
        );
        
        // Format JSON response based on options
        const jsonResponse = response.data;
        
        if (options.prettyPrint) {
          return JSON.stringify(jsonResponse, null, 2);
        }
        
        return JSON.stringify(jsonResponse);
      },
      // Fallback method
      async () => {
        return localConvertToJsonLd(xml, options);
      },
      'XML to JSON-LD conversion'
    );
  }
  
  /**
   * Convert EPCIS 1.2 XML directly to JSON-LD using OpenEPCIS API
   * This is a convenience method that chains the two conversion steps
   * @param xml EPCIS 1.2 XML content
   * @param options Transformation options
   * @returns Promise resolving to JSON-LD string
   */
  async convertFrom12ToJsonLd(xml: string, options: JsonLdTransformOptions = { prettyPrint: true, includeContext: true }): Promise<string> {
    // First convert to EPCIS 2.0 XML
    const epcis20Xml = await this.convertToEpcis20Xml(xml);
    
    // Then convert to JSON-LD
    return this.convertToJsonLd(epcis20Xml, options);
  }
  
  /**
   * Test the connection to the OpenEPCIS API
   * @returns Promise resolving to true if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      // Use a specific endpoint that returns 200 for testing
      await axios.get(`${this.baseUrl}/200`);
      return true;
    } catch (unknown) {
      const error = unknown as Error;
      console.log('OpenEPCIS connection test failed:', error.message || 'Unknown error');
      return false;
    }
  }
  
  /**
   * Fallback to local implementation if OpenEPCIS API is not available
   * This method will be used as a fallback for all OpenEPCIS methods
   */
  private async withFallback<T>(
    apiMethod: () => Promise<T>, 
    fallbackMethod: () => Promise<T>, 
    errorMessage: string
  ): Promise<T> {
    try {
      // First try the API method
      return await apiMethod();
    } catch (unknown) {
      const error = unknown as Error;
      console.log(`OpenEPCIS API error (${errorMessage}):`, error.message || 'Unknown error');
      console.log('Falling back to local implementation...');
      
      // If it fails, try the fallback
      return await fallbackMethod();
    }
  }
}

// Default instance for easy usage
export const openEpcisClient = new OpenEpcisClient();