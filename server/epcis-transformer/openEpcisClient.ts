import axios from 'axios';
import { ValidationError, TransformationError } from './utils';
import type { XmlTransformOptions, JsonLdTransformOptions } from '@shared/schema';

// Constants - Using the correct OpenEPCIS API URL structure
const OPEN_EPCIS_API_BASE_URL = 'https://tools.openepcis.io/api';

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
   * @param xml EPCIS 1.2 XML content
   * @param options Transformation options (not used in API call)
   * @returns Promise resolving to EPCIS 2.0 XML string
   */
  async convertToEpcis20Xml(xml: string, options?: XmlTransformOptions): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/convert/xml/2.0`, 
        xml, 
        {
          headers: {
            'Content-Type': 'application/xml'
          }
        }
      );
      
      return response.data;
    } catch (unknown) {
      const error = unknown as Error;
      console.error('OpenEPCIS API Error:', error.message || 'Unknown error');
      throw new TransformationError(`OpenEPCIS API Error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Convert EPCIS 2.0 XML to JSON-LD format using OpenEPCIS API
   * @param xml EPCIS 2.0 XML content
   * @param options Transformation options
   * @returns Promise resolving to JSON-LD string
   */
  async convertToJsonLd(xml: string, options: JsonLdTransformOptions = { prettyPrint: true, includeContext: true }): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/convert/json/2.0`, 
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
    } catch (unknown) {
      const error = unknown as Error;
      console.error('OpenEPCIS API Error:', error.message || 'Unknown error');
      throw new TransformationError(`OpenEPCIS API Error: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Convert EPCIS 1.2 XML directly to JSON-LD using OpenEPCIS API
   * @param xml EPCIS 1.2 XML content
   * @param options Transformation options
   * @returns Promise resolving to JSON-LD string
   */
  async convertFrom12ToJsonLd(xml: string, options: JsonLdTransformOptions = { prettyPrint: true, includeContext: true }): Promise<string> {
    try {
      // Using the direct conversion endpoint
      const response = await axios.post(
        `${this.baseUrl}/convert/json/1.2`, 
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
    } catch (unknown) {
      const error = unknown as Error;
      console.error('OpenEPCIS API Error:', error.message || 'Unknown error');
      throw new TransformationError(`OpenEPCIS API Error: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Test the connection to the OpenEPCIS API
   * @returns Promise resolving to true if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      // Just try to access the base API endpoint
      await axios.get(`${this.baseUrl}/convert`);
      return true;
    } catch (unknown) {
      const error = unknown as Error;
      console.log('OpenEPCIS connection test failed:', error.message || 'Unknown error');
      return false;
    }
  }
}

// Default instance for easy usage
export const openEpcisClient = new OpenEpcisClient();