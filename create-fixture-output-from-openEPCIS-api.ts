/**
 * EPCIS Transformer Test Fixtures Generator
 * 
 * This script generates fixture files for testing by:
 * 1. Taking sample EPCIS 1.2 XML files from attached_assets
 * 2. Transforming them using the OpenEPCIS API
 * 3. Saving the results as fixture files for testing
 */

import fs from 'fs/promises';
import path from 'path';
import { openEpcisClient } from './server/epcis-transformer/openEpcisClient';

// Sample files to process
const TEST_FILES = [
  'epcis_1.2.cardinal_health.xml',
  'epcis_1.2.sample.xml'
];

// Transformation options
const xmlOptions = { validateXml: false, preserveComments: false };
const jsonOptions = { prettyPrint: true, includeContext: true };

// Fixture directory
const FIXTURES_DIR = path.join('tests', 'fixtures');

async function main() {
  console.log('Generating EPCIS test fixtures from OpenEPCIS API...');
  
  // Ensure fixtures directory exists
  try {
    await fs.mkdir(FIXTURES_DIR, { recursive: true });
    console.log(`Created fixtures directory at ${FIXTURES_DIR}`);
  } catch (error) {
    console.log(`Fixtures directory already exists at ${FIXTURES_DIR}`);
  }
  
  // Process each test file
  for (const fileName of TEST_FILES) {
    console.log(`\nProcessing ${fileName}...`);
    
    try {
      // Read the sample file
      const filePath = path.join('attached_assets', fileName);
      const xmlContent = await fs.readFile(filePath, 'utf-8');
      
      // Generate all fixture types
      await generateFixtures(fileName, xmlContent);
      
      console.log(`Successfully generated fixtures for ${fileName}`);
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  }
  
  console.log('\nFixture generation complete!');
}

async function generateFixtures(fileName: string, xmlContent: string) {
  // 1. Convert EPCIS 1.2 XML to EPCIS 2.0 XML
  console.log(`- Generating XML 2.0 fixture...`);
  const xml20Result = await openEpcisClient.convertToEpcis20Xml(xmlContent, xmlOptions);
  await fs.writeFile(
    path.join(FIXTURES_DIR, `${fileName}.epcis20.xml`), 
    xml20Result, 
    'utf-8'
  );
  
  // 2. Convert EPCIS 2.0 XML to JSON-LD
  console.log(`- Generating JSON-LD fixture...`);
  const jsonLdResult = await openEpcisClient.convertToJsonLd(xml20Result, jsonOptions);
  await fs.writeFile(
    path.join(FIXTURES_DIR, `${fileName}.jsonld`), 
    jsonLdResult, 
    'utf-8'
  );
  
  // 3. Convert EPCIS 1.2 XML directly to JSON-LD
  console.log(`- Generating direct JSON-LD fixture...`);
  const directJsonLdResult = await openEpcisClient.convertFrom12ToJsonLd(xmlContent, jsonOptions);
  await fs.writeFile(
    path.join(FIXTURES_DIR, `${fileName}.direct.jsonld`), 
    directJsonLdResult, 
    'utf-8'
  );
}

// Run the script
main().catch(error => {
  console.error('Error generating fixtures:', error);
  process.exit(1);
});