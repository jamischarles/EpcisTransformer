# EPCIS Transformer

A robust Node.js module for EPCIS XML transformation, providing advanced conversion capabilities between EPCIS 1.2 and 2.0 formats with comprehensive JSON-LD support.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/your-repo/epcis-transformer)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

![EPCIS Transformer](./generated-icon.png)

## 🌟 Features

- **Format Conversion**: Transform EPCIS 1.2 XML to EPCIS 2.0 XML
- **JSON-LD Support**: Convert EPCIS 2.0 XML to JSON-LD format
- **Multiple Interfaces**: Access via programmatic API, web UI, or CLI
- **OpenEPCIS Integration**: Optional API integration with OpenEPCIS
- **Visual Diff**: Compare original and transformed documents
- **TypeScript Implementation**: Strong typing and modern codebase

## 📋 Requirements

- Node.js 18.x or higher
- NPM 9.x or higher

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/epcis-transformer.git
cd epcis-transformer

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 💻 Usage

### Web Interface

Start the web server and navigate to `http://localhost:5000` in your browser:

```bash
npm run dev
```

The web interface provides three main tabs:
- **EPCIS 1.2 to 2.0**: Convert EPCIS 1.2 XML to EPCIS 2.0 XML
- **EPCIS 2.0 to JSON-LD**: Convert EPCIS 2.0 XML to JSON-LD format
- **OpenEPCIS API**: Use OpenEPCIS API for transformations

### Programmatic API

```typescript
import { 
  convertToEpcis20Xml, 
  convertToJsonLd 
} from 'epcis-transformer';

// Convert EPCIS 1.2 XML to EPCIS 2.0 XML
const epcis12xml = `<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1">...</epcis:EPCISDocument>`;
const epcis20xml = await convertToEpcis20Xml(epcis12xml);

// Convert EPCIS 2.0 XML to JSON-LD
const jsonLd = await convertToJsonLd(epcis20xml);

// Chain transformations (1.2 XML to JSON-LD)
const epcis12xml = `<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1">...</epcis:EPCISDocument>`;
const epcis20xml = await convertToEpcis20Xml(epcis12xml);
const jsonLd = await convertToJsonLd(epcis20xml);
```

### CLI

The CLI allows transforming files directly from the command line:

```bash
# Convert EPCIS 1.2 XML to EPCIS 2.0 XML
./epcis-cli.sh convert-to-xml sample.xml -o output.xml

# Convert EPCIS 2.0 XML to JSON-LD
./epcis-cli.sh convert-to-jsonld sample-2.0.xml -o output.json

# Use OpenEPCIS API instead of local transformations
./epcis-cli.sh --use-api convert-to-xml sample.xml -o output.xml
```

## 🔍 API Reference

### `convertToEpcis20Xml(xml: string, options?: XmlTransformOptions): Promise<string>`

Converts EPCIS 1.2 XML to EPCIS 2.0 XML.

**Parameters**:
- `xml`: String containing EPCIS 1.2 XML
- `options` (optional): Configuration object with the following properties:
  - `validateXml`: Whether to validate the XML before processing (default: `false`)
  - `preserveComments`: Whether to preserve XML comments (default: `false`)

**Returns**: Promise that resolves to EPCIS 2.0 XML string

### `convertToJsonLd(xml: string, options?: JsonLdTransformOptions): Promise<string>`

Converts EPCIS 2.0 XML to JSON-LD format.

**Parameters**:
- `xml`: String containing EPCIS 2.0 XML
- `options` (optional): Configuration object with the following properties:
  - `prettyPrint`: Whether to format the JSON with indentation (default: `true`)
  - `includeContext`: Whether to include `@context` in the JSON-LD (default: `true`)

**Returns**: Promise that resolves to JSON-LD string

### OpenEPCIS API Client

The module also provides an API client for interacting with the OpenEPCIS service:

```typescript
import { openEpcisClient } from 'epcis-transformer';

// Convert using OpenEPCIS API
const result = await openEpcisClient.convertToEpcis20Xml(epcis12xml);
```

## 🧪 Testing

The project includes comprehensive tests for all transformation capabilities:

```bash
# Run all tests
npm test

# Generate test fixtures from OpenEPCIS API
node create-fixture-output-from-openEPCIS-api.ts
```

Test fixtures are generated from the OpenEPCIS API to ensure compatibility with the service.

## 🔄 Conversion Examples

### EPCIS 1.2 XML to EPCIS 2.0 XML

Input (EPCIS 1.2):
```xml
<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.2">
  <!-- Document content -->
</epcis:EPCISDocument>
```

Output (EPCIS 2.0):
```xml
<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:2" schemaVersion="2.0">
  <!-- Transformed content -->
</epcis:EPCISDocument>
```

### EPCIS 2.0 XML to JSON-LD

Input (EPCIS 2.0 XML):
```xml
<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:2" schemaVersion="2.0">
  <!-- Document content -->
</epcis:EPCISDocument>
```

Output (JSON-LD):
```json
{
  "@context": "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "epcisBody": {
    "eventList": [
      // Event data
    ]
  }
}
```

## 📚 Resources

- [EPCIS 1.2 Standard](https://www.gs1.org/standards/epcis)
- [EPCIS 2.0 Standard](https://www.gs1.org/standards/epcis-and-cbv)
- [OpenEPCIS Project](https://github.com/openepcis)
- [JSON-LD Specification](https://json-ld.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenEPCIS](https://github.com/openepcis) for their API service and EPCIS tools
- [GS1](https://www.gs1.org/) for the EPCIS standards
- All contributors who have helped improve this project
- 🤖🤖🤖 Replit-Agent for coding this up. Be kind to me when you rule as all!