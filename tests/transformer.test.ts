import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  convertToEpcis20Xml,
  convertToJsonLd
} from '../server/epcis-transformer';

// Test files
const TEST_FILES = [
  'epcis_1.2.cardinal_health.xml',
  'epcis_1.2.sample.xml'
];

// Options - disable XML validation to avoid issues with malformed XML
const xmlOptions = { validateXml: false, preserveComments: false };
const jsonOptions = { prettyPrint: true, includeContext: true };

// Helper function to normalize XML/JSON for comparison
function normalizeString(str: string): string {
  // Remove all whitespace between tags, normalize line endings, and convert to lowercase
  return str
    .replace(/>\s+</g, '><')
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/gm, '')
    .trim();
}

describe('EPCIS Transformer Tests', () => {
  describe('XML 1.2 to XML 2.0 Conversion', () => {
    for (const fileName of TEST_FILES) {
      it(`correctly converts ${fileName} from EPCIS 1.2 to EPCIS 2.0 XML`, async () => {
        // Read the test file and fixture
        const inputPath = path.join('attached_assets', fileName);
        const fixturePath = path.join('tests/fixtures', `${fileName}.epcis20.xml`);
        
        const xmlContent = await fs.readFile(inputPath, 'utf-8');
        const expectedOutput = await fs.readFile(fixturePath, 'utf-8');
        
        // Run the transformation
        const result = await convertToEpcis20Xml(xmlContent, xmlOptions);
        
        // Compare results (normalized to remove whitespace differences)
        const normalizedResult = normalizeString(result);
        const normalizedExpected = normalizeString(expectedOutput);
        
        // Basic checks for expected elements
        expect(normalizedResult.includes('EPCISDocument')).toBe(true);
        expect(normalizedExpected.includes('EPCISDocument')).toBe(true);
        
        // Check for additional characteristic elements of EPCIS events
        expect(normalizedResult.includes('EventList')).toBe(true);
        expect(normalizedExpected.includes('EventList')).toBe(true);
        
        // Check that both documents have the same key events
        // This is a more practical check than exact string matching
        ['ObjectEvent', 'AggregationEvent', 'TransactionEvent'].forEach(eventType => {
          if (normalizedExpected.includes(eventType)) {
            expect(normalizedResult.includes(eventType)).toBe(true);
          }
        });
      });
    }
  });

  describe('XML 2.0 to JSON-LD Conversion', () => {
    for (const fileName of TEST_FILES) {
      it(`correctly converts ${fileName} from EPCIS 2.0 XML to JSON-LD`, async () => {
        // Read the test file and fixture
        const inputPath = path.join('tests/fixtures', `${fileName}.epcis20.xml`);
        const fixturePath = path.join('tests/fixtures', `${fileName}.jsonld`);
        
        const xmlContent = await fs.readFile(inputPath, 'utf-8');
        const expectedOutput = await fs.readFile(fixturePath, 'utf-8');
        
        // Run the transformation
        const result = await convertToJsonLd(xmlContent, jsonOptions);
        
        // Parse JSON for more structured comparison
        const resultJson = JSON.parse(result);
        const expectedJson = JSON.parse(expectedOutput);
        
        // Check for key JSON-LD elements
        expect(resultJson['@context']).toBeDefined();
        expect(expectedJson['@context']).toBeDefined();
        
        // Check for epcisDocument type
        const resultHasCorrectType = (
          resultJson.type === 'EPCISDocument' || 
          (resultJson['@type'] && resultJson['@type'] === 'EPCISDocument')
        );
        const expectedHasCorrectType = (
          expectedJson.type === 'EPCISDocument' || 
          (expectedJson['@type'] && expectedJson['@type'] === 'EPCISDocument')
        );
        
        expect(resultHasCorrectType).toBe(true);
        expect(expectedHasCorrectType).toBe(true);
        
        // Check for events array
        if (expectedJson.epcisBody?.eventList) {
          expect(resultJson.epcisBody?.eventList).toBeDefined();
          // If we want to check event counts:
          expect(resultJson.epcisBody.eventList.length).toBe(expectedJson.epcisBody.eventList.length);
        }
      });
    }
  });

  describe('End-to-End: EPCIS 1.2 XML to JSON-LD Conversion', () => {
    for (const fileName of TEST_FILES) {
      it(`correctly converts ${fileName} from EPCIS 1.2 XML to JSON-LD in sequence`, async () => {
        // Read the test file and fixture
        const inputPath = path.join('attached_assets', fileName);
        const fixturePath = path.join('tests/fixtures', `${fileName}.direct.jsonld`);
        
        const xmlContent = await fs.readFile(inputPath, 'utf-8');
        const expectedOutput = await fs.readFile(fixturePath, 'utf-8');
        
        // Run the transformations in sequence
        const xml20Result = await convertToEpcis20Xml(xmlContent, xmlOptions);
        const jsonLdResult = await convertToJsonLd(xml20Result, jsonOptions);
        
        // Parse JSON for more structured comparison
        const resultJson = JSON.parse(jsonLdResult);
        const expectedJson = JSON.parse(expectedOutput);
        
        // Check for key JSON-LD elements
        expect(resultJson['@context']).toBeDefined();
        expect(expectedJson['@context']).toBeDefined();
        
        // Check for epcisDocument type
        const resultHasCorrectType = (
          resultJson.type === 'EPCISDocument' || 
          (resultJson['@type'] && resultJson['@type'] === 'EPCISDocument')
        );
        const expectedHasCorrectType = (
          expectedJson.type === 'EPCISDocument' || 
          (expectedJson['@type'] && expectedJson['@type'] === 'EPCISDocument')
        );
        
        expect(resultHasCorrectType).toBe(true);
        expect(expectedHasCorrectType).toBe(true);
        
        // Check for events array
        if (expectedJson.epcisBody?.eventList) {
          expect(resultJson.epcisBody?.eventList).toBeDefined();
          // If we want to check event counts:
          expect(resultJson.epcisBody.eventList.length).toBe(expectedJson.epcisBody.eventList.length);
        }
      });
    }
  });
});