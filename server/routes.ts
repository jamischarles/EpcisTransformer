import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  convertToEpcis20Xml, 
  convertToJsonLd, 
  ValidationError, 
  TransformationError 
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
      
      // Perform the conversion
      const result = await convertToEpcis20Xml(xml, options);
      
      // Return the result
      res.json({ result });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else if (error instanceof TransformationError) {
        res.status(500).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
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
      
      // Perform the conversion
      const result = await convertToJsonLd(xml, options);
      
      // Return the result
      res.json({ result });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message, code: error.code });
      } else if (error instanceof TransformationError) {
        res.status(500).json({ message: error.message, code: error.code });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
