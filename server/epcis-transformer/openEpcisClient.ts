import axios from 'axios';
import { ValidationError, TransformationError } from './utils';
import type { XmlTransformOptions, JsonLdTransformOptions } from '@shared/schema';

// Constants
const OPEN_EPCIS_API_BASE_URL = 'https://tools.openepcis.io/q';

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
   * @param options Transformation options
   * @returns Promise resolving to EPCIS 2.0 XML string
   */
  async convertToEpcis20Xml(xml: string, options: XmlTransformOptions = { validateXml: false, preserveComments: false }): Promise<string> {
    try {
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;
        
        if (statusCode === 400) {
          throw new ValidationError(`Invalid EPCIS 1.2 XML: ${errorMessage}`);
        } else {
          throw new TransformationError(`API Error (${statusCode}): ${errorMessage}`);
        }
      }
      throw new TransformationError(`Failed to convert XML: ${(error as Error).message}`);
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;
        
        if (statusCode === 400) {
          throw new ValidationError(`Invalid EPCIS 2.0 XML: ${errorMessage}`);
        } else {
          throw new TransformationError(`API Error (${statusCode}): ${errorMessage}`);
        }
      }
      throw new TransformationError(`Failed to convert to JSON-LD: ${(error as Error).message}`);
    }
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
      await axios.get(`${this.baseUrl}/health`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Default instance for easy usage
export const openEpcisClient = new OpenEpcisClient();