#!/usr/bin/env node
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { openEpcisClient } from './openEpcisClient';
import { ValidationError, TransformationError } from './utils';

// Local implementations
import { convertToEpcis20Xml, convertToJsonLd } from './index';

// Define the CLI version
program.version('1.0.0');

// Helper function to read file
const readFile = (filePath: string): string => {
  try {
    return fs.readFileSync(path.resolve(filePath), 'utf8');
  } catch (error) {
    console.error(`Error reading file: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Helper function to write file
const writeFile = (filePath: string, content: string): void => {
  try {
    fs.writeFileSync(path.resolve(filePath), content, 'utf8');
    console.log(`File written successfully: ${filePath}`);
  } catch (error) {
    console.error(`Error writing file: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Command to convert EPCIS 1.2 XML to EPCIS 2.0 XML
program
  .command('convert-to-epcis20')
  .description('Convert EPCIS 1.2 XML to EPCIS 2.0 XML')
  .argument('<inputFile>', 'Input EPCIS 1.2 XML file path')
  .option('-o, --output <outputFile>', 'Output file path')
  .option('-r, --remote', 'Use OpenEPCIS remote API instead of local implementation')
  .option('-p, --preserve-comments', 'Preserve comments in the XML')
  .option('-v, --validate', 'Validate XML before conversion')
  .action(async (inputFile, options) => {
    try {
      const xml = readFile(inputFile);
      let result: string;

      if (options.remote) {
        console.log('Using OpenEPCIS remote API...');
        result = await openEpcisClient.convertToEpcis20Xml(xml, {
          preserveComments: options.preserveComments || false,
          validateXml: options.validate || false
        });
      } else {
        console.log('Using local implementation...');
        result = await convertToEpcis20Xml(xml, {
          preserveComments: options.preserveComments || false,
          validateXml: options.validate || false
        });
      }

      if (options.output) {
        writeFile(options.output, result);
      } else {
        console.log(result);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`Validation Error: ${error.message}`);
      } else if (error instanceof TransformationError) {
        console.error(`Transformation Error: ${error.message}`);
      } else {
        console.error(`Error: ${(error as Error).message}`);
      }
      process.exit(1);
    }
  });

// Command to convert EPCIS 2.0 XML to JSON-LD
program
  .command('convert-to-jsonld')
  .description('Convert EPCIS 2.0 XML to JSON-LD')
  .argument('<inputFile>', 'Input EPCIS 2.0 XML file path')
  .option('-o, --output <outputFile>', 'Output file path')
  .option('-r, --remote', 'Use OpenEPCIS remote API instead of local implementation')
  .option('-n, --no-pretty', 'Disable pretty printing of JSON')
  .option('-c, --no-context', 'Exclude JSON-LD context')
  .action(async (inputFile, options) => {
    try {
      const xml = readFile(inputFile);
      let result: string;

      if (options.remote) {
        console.log('Using OpenEPCIS remote API...');
        result = await openEpcisClient.convertToJsonLd(xml, {
          prettyPrint: options.pretty !== false,
          includeContext: options.context !== false
        });
      } else {
        console.log('Using local implementation...');
        result = await convertToJsonLd(xml, {
          prettyPrint: options.pretty !== false,
          includeContext: options.context !== false
        });
      }

      if (options.output) {
        writeFile(options.output, result);
      } else {
        console.log(result);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`Validation Error: ${error.message}`);
      } else if (error instanceof TransformationError) {
        console.error(`Transformation Error: ${error.message}`);
      } else {
        console.error(`Error: ${(error as Error).message}`);
      }
      process.exit(1);
    }
  });

// Command to convert EPCIS 1.2 XML directly to JSON-LD
program
  .command('convert-from-12-to-jsonld')
  .description('Convert EPCIS 1.2 XML directly to JSON-LD')
  .argument('<inputFile>', 'Input EPCIS 1.2 XML file path')
  .option('-o, --output <outputFile>', 'Output file path')
  .option('-r, --remote', 'Use OpenEPCIS remote API')
  .option('-n, --no-pretty', 'Disable pretty printing of JSON')
  .option('-c, --no-context', 'Exclude JSON-LD context')
  .action(async (inputFile, options) => {
    try {
      const xml = readFile(inputFile);
      let result: string;

      if (options.remote) {
        console.log('Using OpenEPCIS remote API...');
        result = await openEpcisClient.convertFrom12ToJsonLd(xml, {
          prettyPrint: options.pretty !== false,
          includeContext: options.context !== false
        });
      } else {
        console.log('Using local implementation...');
        // For local implementation, we'll do a two-step process
        const epcis20Xml = await convertToEpcis20Xml(xml);
        result = await convertToJsonLd(epcis20Xml, {
          prettyPrint: options.pretty !== false,
          includeContext: options.context !== false
        });
      }

      if (options.output) {
        writeFile(options.output, result);
      } else {
        console.log(result);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`Validation Error: ${error.message}`);
      } else if (error instanceof TransformationError) {
        console.error(`Transformation Error: ${error.message}`);
      } else {
        console.error(`Error: ${(error as Error).message}`);
      }
      process.exit(1);
    }
  });

// Test connection to OpenEPCIS API
program
  .command('test-connection')
  .description('Test connection to OpenEPCIS API')
  .action(async () => {
    try {
      const isConnected = await openEpcisClient.testConnection();
      if (isConnected) {
        console.log('Connection to OpenEPCIS API successful');
      } else {
        console.error('Failed to connect to OpenEPCIS API');
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error testing connection: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// If no arguments, show help
if (process.argv.length <= 2) {
  program.help();
}