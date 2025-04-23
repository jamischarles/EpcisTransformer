import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  convertToEpcis20Xml, 
  convertToJsonLd, 
  ValidationError, 
  TransformationError,
  openEpcisClient
} from './epcis-transformer';
import { 
  xmlTransformOptionsSchema, 
  jsonLdTransformOptionsSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for converting EPCIS 1.2 XML to EPCIS 2.0 XML
  app.post('/api/convert-to-epcis20-xml', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const requestSchema = z.object({
        xml: z.string().min(1, "XML content is required"),
        options: xmlTransformOptionsSchema.optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }
      
      const { xml, options = { validateXml: false, preserveComments: false } } = parseResult.data;
      
      console.log('Starting XML transformation');
      
      // Perform the conversion
      const result = await convertToEpcis20Xml(xml, options);
      
      console.log('XML transformation successful');
      
      // Return the result
      res.json({ result });
    } catch (error) {
      console.error('Error in convert-to-epcis20-xml endpoint:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else if (error instanceof TransformationError) {
        res.status(500).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred", 
          details: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  });
  
  // API endpoint for converting EPCIS 2.0 XML to JSON-LD
  app.post('/api/convert-to-jsonld', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const requestSchema = z.object({
        xml: z.string().min(1, "XML content is required"),
        options: jsonLdTransformOptionsSchema.optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }
      
      const { xml, options = { prettyPrint: true, includeContext: true } } = parseResult.data;
      
      console.log('Starting JSON-LD transformation');
      
      // Perform the conversion
      const result = await convertToJsonLd(xml, options);
      
      console.log('JSON-LD transformation successful');
      
      // Return the result
      res.json({ result });
    } catch (error) {
      console.error('Error in convert-to-jsonld endpoint:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else if (error instanceof TransformationError) {
        res.status(500).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred", 
          details: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  });
  
  // OpenEPCIS API endpoint for converting EPCIS 1.2 XML to EPCIS 2.0 XML
  app.post('/api/openepcis/convert-to-epcis20-xml', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const requestSchema = z.object({
        xml: z.string().min(1, "XML content is required"),
        options: xmlTransformOptionsSchema.optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }
      
      const { xml, options = { validateXml: false, preserveComments: false } } = parseResult.data;
      
      console.log('Starting XML transformation via OpenEPCIS API');
      
      // Perform the conversion using OpenEPCIS API
      const result = await openEpcisClient.convertToEpcis20Xml(xml, options);
      
      console.log('OpenEPCIS XML transformation successful');
      
      // Return the result
      res.json({ result });
    } catch (error) {
      console.error('Error in OpenEPCIS convert-to-epcis20-xml endpoint:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else if (error instanceof TransformationError) {
        res.status(500).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred with OpenEPCIS API", 
          details: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  });
  
  // OpenEPCIS API endpoint for converting EPCIS 2.0 XML to JSON-LD
  app.post('/api/openepcis/convert-to-jsonld', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const requestSchema = z.object({
        xml: z.string().min(1, "XML content is required"),
        options: jsonLdTransformOptionsSchema.optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }
      
      const { xml, options = { prettyPrint: true, includeContext: true } } = parseResult.data;
      
      console.log('Starting JSON-LD transformation via OpenEPCIS API');
      
      // Perform the conversion using OpenEPCIS API
      const result = await openEpcisClient.convertToJsonLd(xml, options);
      
      console.log('OpenEPCIS JSON-LD transformation successful');
      
      // Return the result
      res.json({ result });
    } catch (error) {
      console.error('Error in OpenEPCIS convert-to-jsonld endpoint:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else if (error instanceof TransformationError) {
        res.status(500).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred with OpenEPCIS API", 
          details: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  });
  
  // OpenEPCIS API endpoint for direct conversion from EPCIS 1.2 XML to JSON-LD
  app.post('/api/openepcis/convert-from-12-to-jsonld', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const requestSchema = z.object({
        xml: z.string().min(1, "XML content is required"),
        options: jsonLdTransformOptionsSchema.optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }
      
      const { xml, options = { prettyPrint: true, includeContext: true } } = parseResult.data;
      
      console.log('Starting direct 1.2-to-JSON-LD transformation via OpenEPCIS API');
      
      // Perform the conversion using OpenEPCIS API
      const result = await openEpcisClient.convertFrom12ToJsonLd(xml, options);
      
      console.log('OpenEPCIS direct transformation successful');
      
      // Return the result
      res.json({ result });
    } catch (error) {
      console.error('Error in OpenEPCIS convert-from-12-to-jsonld endpoint:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else if (error instanceof TransformationError) {
        res.status(500).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred with OpenEPCIS API", 
          details: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  });
  
  // Test connection to OpenEPCIS API
  app.get('/api/openepcis/test-connection', async (_req: Request, res: Response) => {
    try {
      const isConnected = await openEpcisClient.testConnection();
      if (isConnected) {
        res.json({ status: 'connected', message: 'Successfully connected to OpenEPCIS API' });
      } else {
        res.status(503).json({ status: 'disconnected', message: 'Failed to connect to OpenEPCIS API' });
      }
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: "An unexpected error occurred while testing connection", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}