import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FileUploader from './FileUploader';
import TransformResult from './TransformResult';
import DiffView from './DiffView';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RefreshCwIcon, Diff, ArrowRight, CloudIcon, WifiIcon, WifiOffIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  convertToEpcis20Xml, 
  convertToJsonLd,
  convertToEpcis20XmlViaOpenEpcis,
  convertToJsonLdViaOpenEpcis,
  convertFrom12ToJsonLdViaOpenEpcis,
  testOpenEpcisConnection
} from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from "@/components/ui/badge";
import type { StatusMessage, XmlTransformOptions, JsonLdTransformOptions } from '@shared/schema';
import { nanoid } from 'nanoid';

interface TabsContainerProps {
  addStatusMessage: (message: StatusMessage) => void;
}

export default function TabsContainer({ addStatusMessage }: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState('xml');
  
  // XML transformation state
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [xmlFileContent, setXmlFileContent] = useState<string | null>(null);
  const [xmlOptions, setXmlOptions] = useState<XmlTransformOptions>({
    validateXml: false,
    preserveComments: false
  });
  const [xmlResult, setXmlResult] = useState<string | null>(null);
  const [xmlProcessing, setXmlProcessing] = useState(false);
  const [showXmlDiff, setShowXmlDiff] = useState(false);
  
  // JSON-LD transformation state
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonFileContent, setJsonFileContent] = useState<string | null>(null);
  const [jsonOptions, setJsonOptions] = useState<JsonLdTransformOptions>({
    prettyPrint: true,
    includeContext: true
  });
  const [jsonResult, setJsonResult] = useState<string | null>(null);
  const [jsonProcessing, setJsonProcessing] = useState(false);
  const [useXmlResultAsInput, setUseXmlResultAsInput] = useState(false);
  
  // OpenEPCIS API state
  const [openEpcisApiStatus, setOpenEpcisApiStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [openEpcisXmlFile, setOpenEpcisXmlFile] = useState<File | null>(null);
  const [openEpcisXmlContent, setOpenEpcisXmlContent] = useState<string | null>(null);
  const [openEpcisResult, setOpenEpcisResult] = useState<string | null>(null);
  const [openEpcisProcessing, setOpenEpcisProcessing] = useState(false);
  const [openEpcisMode, setOpenEpcisMode] = useState<'xml12-to-xml20' | 'xml20-to-jsonld' | 'xml12-to-jsonld'>('xml12-to-xml20');
  
  const { toast } = useToast();
  
  // Check OpenEPCIS API connection when the tab is selected
  useEffect(() => {
    if (activeTab === 'openepcis') {
      const checkConnection = async () => {
        setOpenEpcisApiStatus('loading');
        try {
          await testOpenEpcisConnection();
          setOpenEpcisApiStatus('connected');
          toast({
            title: 'OpenEPCIS API Connected',
            description: 'Successfully connected to OpenEPCIS API endpoints',
          });
        } catch (error) {
          setOpenEpcisApiStatus('disconnected');
          toast({
            title: 'OpenEPCIS API Unavailable',
            description: 'Could not connect to OpenEPCIS API. Using local implementation.',
            variant: 'destructive'
          });
        }
      };
      
      checkConnection();
    }
  }, [activeTab, toast]);
  
  // Handle OpenEPCIS file selection
  const handleOpenEpcisFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      setOpenEpcisXmlFile(file);
      setOpenEpcisXmlContent(content);
      setOpenEpcisResult(null); // Clear previous results
      
      addStatusMessage({
        id: nanoid(),
        type: 'info',
        title: `File "${file.name}" selected for OpenEPCIS API`,
        description: 'Ready for transformation via OpenEPCIS API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      toast({
        title: 'File Read Error',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };
  
  // Handle XML file selection
  const handleXmlFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      setXmlFile(file);
      setXmlFileContent(content);
      setXmlResult(null); // Clear previous results
      setShowXmlDiff(false);
      
      addStatusMessage({
        id: nanoid(),
        type: 'info',
        title: `File "${file.name}" selected`,
        description: 'Ready for XML transformation',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      toast({
        title: 'File Read Error',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };
  
  // Handle JSON file selection
  const handleJsonFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      setJsonFile(file);
      setJsonFileContent(content);
      setJsonResult(null); // Clear previous results
      
      addStatusMessage({
        id: nanoid(),
        type: 'info',
        title: `File "${file.name}" selected`,
        description: 'Ready for JSON-LD transformation',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      toast({
        title: 'File Read Error',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };
  
  // Perform XML transformation
  const handleXmlTransform = async () => {
    if (!xmlFile || !xmlFileContent) return;
    
    setXmlProcessing(true);
    const statusId = nanoid();
    
    addStatusMessage({
      id: statusId,
      type: 'processing',
      title: 'Processing XML transformation',
      description: 'Converting EPCIS 1.2 to 2.0 format',
      timestamp: new Date().toISOString()
    });
    
    try {
      // Perform transformation using the stored file content
      const result = await convertToEpcis20Xml(xmlFileContent, xmlOptions);
      
      // Update status and set result
      addStatusMessage({
        id: statusId,
        type: 'success',
        title: 'XML transformation complete',
        description: 'EPCIS 2.0 XML generated successfully',
        timestamp: new Date().toISOString()
      });
      
      setXmlResult(result);
    } catch (error) {
      // Handle error
      addStatusMessage({
        id: statusId,
        type: 'error',
        title: 'XML transformation failed',
        description: (error as Error).message,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'Transformation Error',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setXmlProcessing(false);
    }
  };
  
  // Perform JSON-LD transformation
  const handleJsonTransform = async () => {
    // Determine what content to use as input
    const xmlInputContent = useXmlResultAsInput && xmlResult 
      ? xmlResult 
      : jsonFileContent;
    
    if (!xmlInputContent) {
      if (useXmlResultAsInput) {
        toast({
          title: 'Missing XML Result',
          description: 'You need to first transform EPCIS 1.2 to 2.0 XML on the previous tab',
          variant: 'destructive'
        });
      } else if (!jsonFile) {
        toast({
          title: 'Missing Input',
          description: 'Please upload an EPCIS 2.0 XML file',
          variant: 'destructive'
        });
      }
      return;
    }
    
    setJsonProcessing(true);
    const statusId = nanoid();
    
    const sourceDescription = useXmlResultAsInput 
      ? 'from previously generated XML'
      : 'from uploaded file';
    
    addStatusMessage({
      id: statusId,
      type: 'processing',
      title: 'Processing JSON-LD transformation',
      description: `Converting EPCIS 2.0 XML to JSON-LD ${sourceDescription}`,
      timestamp: new Date().toISOString()
    });
    
    try {  
      // Perform transformation
      const result = await convertToJsonLd(xmlInputContent, jsonOptions);
      
      // Update status and set result
      addStatusMessage({
        id: statusId,
        type: 'success',
        title: 'JSON-LD transformation complete',
        description: 'EPCIS 2.0 JSON-LD generated successfully',
        timestamp: new Date().toISOString()
      });
      
      setJsonResult(result);
    } catch (error) {
      // Handle error
      addStatusMessage({
        id: statusId,
        type: 'error',
        title: 'JSON-LD transformation failed',
        description: (error as Error).message,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'Transformation Error',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setJsonProcessing(false);
    }
  };
  
  // Perform transformation using the OpenEPCIS API
  const handleOpenEpcisTransform = async () => {
    if (!openEpcisXmlFile || !openEpcisXmlContent) {
      toast({
        title: 'Missing Input',
        description: 'Please upload an XML file first',
        variant: 'destructive'
      });
      return;
    }
    
    setOpenEpcisProcessing(true);
    const statusId = nanoid();
    
    let operationDescription = '';
    switch (openEpcisMode) {
      case 'xml12-to-xml20':
        operationDescription = 'Converting EPCIS 1.2 XML to EPCIS 2.0 XML';
        break;
      case 'xml20-to-jsonld':
        operationDescription = 'Converting EPCIS 2.0 XML to JSON-LD';
        break;
      case 'xml12-to-jsonld':
        operationDescription = 'Directly converting EPCIS 1.2 XML to JSON-LD';
        break;
    }
    
    addStatusMessage({
      id: statusId,
      type: 'processing',
      title: 'Processing via OpenEPCIS API',
      description: operationDescription,
      timestamp: new Date().toISOString()
    });
    
    try {
      let result = '';
      
      // Perform the appropriate transformation based on the selected mode
      switch (openEpcisMode) {
        case 'xml12-to-xml20':
          result = await convertToEpcis20XmlViaOpenEpcis(openEpcisXmlContent, xmlOptions);
          break;
          
        case 'xml20-to-jsonld':
          result = await convertToJsonLdViaOpenEpcis(openEpcisXmlContent, jsonOptions);
          break;
          
        case 'xml12-to-jsonld':
          result = await convertFrom12ToJsonLdViaOpenEpcis(openEpcisXmlContent, jsonOptions);
          break;
      }
      
      // Update status and set result
      addStatusMessage({
        id: statusId,
        type: 'success',
        title: 'OpenEPCIS transformation complete',
        description: `Successfully processed via OpenEPCIS API`,
        timestamp: new Date().toISOString()
      });
      
      setOpenEpcisResult(result);
    } catch (error) {
      // Handle error
      addStatusMessage({
        id: statusId,
        type: 'error',
        title: 'OpenEPCIS transformation failed',
        description: (error as Error).message,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'OpenEPCIS API Error',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setOpenEpcisProcessing(false);
    }
  };
  
  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-gray-200">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="xml" 
              className="px-6 py-4 font-medium text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              EPCIS 1.2 to 2.0 XML
            </TabsTrigger>
            <TabsTrigger 
              value="json" 
              className="px-6 py-4 font-medium text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              EPCIS 2.0 XML to JSON-LD
            </TabsTrigger>
            <TabsTrigger 
              value="openepcis" 
              className="px-6 py-4 font-medium text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              <CloudIcon className="w-4 h-4 mr-1 inline" />
              OpenEPCIS API
            </TabsTrigger>
            <TabsTrigger 
              value="module" 
              className="px-6 py-4 font-medium text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Module API
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* XML Transformation Tab */}
        <TabsContent value="xml" className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Convert EPCIS 1.2 XML to EPCIS 2.0 XML</h3>
          
          <FileUploader 
            onFileSelect={handleXmlFileSelect}
            accept=".xml"
            title="Upload EPCIS 1.2 XML File"
            description="File should be a valid EPCIS 1.2 XML document"
          />
          
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Transformation Options</h4>
            <div className="flex items-center mb-2">
              <Checkbox 
                id="validate-xml" 
                checked={xmlOptions.validateXml}
                onCheckedChange={(checked) => 
                  setXmlOptions({...xmlOptions, validateXml: checked as boolean})
                }
              />
              <Label htmlFor="validate-xml" className="ml-2 text-sm text-gray-700">
                Validate XML before transformation
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="preserve-comments" 
                checked={xmlOptions.preserveComments}
                onCheckedChange={(checked) => 
                  setXmlOptions({...xmlOptions, preserveComments: checked as boolean})
                }
              />
              <Label htmlFor="preserve-comments" className="ml-2 text-sm text-gray-700">
                Preserve XML comments
              </Label>
            </div>
          </div>
          
          <Button 
            className="w-full"
            disabled={!xmlFile || xmlProcessing}
            onClick={handleXmlTransform}
          >
            {xmlProcessing ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Transform to EPCIS 2.0 XML
              </>
            )}
          </Button>
          
          {xmlResult && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="xml-diff-switch"
                    checked={showXmlDiff}
                    onCheckedChange={setShowXmlDiff}
                  />
                  <Label htmlFor="xml-diff-switch" className="text-sm font-medium">
                    <Diff className="inline-block w-4 h-4 mr-1" />
                    Show diff view (before/after)
                  </Label>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab('json');
                      setUseXmlResultAsInput(true);
                      toast({
                        title: 'Ready for JSON-LD conversion',
                        description: 'The XML result will be used as input for the JSON-LD conversion',
                      });
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Use as input for JSON-LD
                  </Button>
                </div>
              </div>
              
              {showXmlDiff && xmlFileContent ? (
                <DiffView 
                  originalText={xmlFileContent}
                  transformedText={xmlResult}
                  height="400px"
                />
              ) : (
                <TransformResult 
                  content={xmlResult} 
                  fileName="epcis20.xml" 
                  contentType="application/xml" 
                  language="xml"
                />
              )}
            </div>
          )}
        </TabsContent>
        
        {/* JSON-LD Transformation Tab */}
        <TabsContent value="json" className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transform EPCIS 2.0 XML to JSON-LD</h3>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-xml-result-switch"
                checked={useXmlResultAsInput}
                onCheckedChange={(checked) => {
                  setUseXmlResultAsInput(checked);
                  if (checked && !xmlResult) {
                    toast({
                      title: 'No XML Result Available',
                      description: 'Generate XML in the previous tab first',
                      variant: 'destructive'
                    });
                  }
                }}
              />
              <Label htmlFor="use-xml-result-switch" className="text-sm font-medium">
                <ArrowRight className="inline-block w-4 h-4 mr-1" />
                Use XML result from previous tab
              </Label>
            </div>
          </div>
          
          {!useXmlResultAsInput && (
            <FileUploader 
              onFileSelect={handleJsonFileSelect}
              accept=".xml"
              title="Upload EPCIS 2.0 XML File"
              description="File should be a valid EPCIS 2.0 XML document"
            />
          )}
          
          {useXmlResultAsInput && xmlResult && (
            <div className="mb-6 border border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Using XML Result as Input</h4>
              <p className="text-sm text-gray-600">
                Using EPCIS 2.0 XML from the previous transformation step
              </p>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">JSON-LD Options</h4>
            <div className="flex items-center mb-2">
              <Checkbox 
                id="pretty-json" 
                checked={jsonOptions.prettyPrint}
                onCheckedChange={(checked) => 
                  setJsonOptions({...jsonOptions, prettyPrint: checked as boolean})
                }
              />
              <Label htmlFor="pretty-json" className="ml-2 text-sm text-gray-700">
                Pretty-print JSON output
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="include-context" 
                checked={jsonOptions.includeContext}
                onCheckedChange={(checked) => 
                  setJsonOptions({...jsonOptions, includeContext: checked as boolean})
                }
              />
              <Label htmlFor="include-context" className="ml-2 text-sm text-gray-700">
                Include JSON-LD @context
              </Label>
            </div>
          </div>
          
          <Button 
            className="w-full"
            disabled={(useXmlResultAsInput ? !xmlResult : !jsonFile) || jsonProcessing}
            onClick={handleJsonTransform}
          >
            {jsonProcessing ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Transform to JSON-LD
              </>
            )}
          </Button>
          
          {jsonResult && (
            <TransformResult 
              content={jsonResult} 
              fileName="epcis20.jsonld" 
              contentType="application/ld+json" 
              language="json"
            />
          )}
        </TabsContent>
        
        {/* OpenEPCIS API Tab */}
        <TabsContent value="openepcis" className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <CloudIcon className="w-5 h-5 inline-block mr-2" />
            OpenEPCIS API Transformation
          </h3>
          
          <div className="mb-6">
            {openEpcisApiStatus === 'loading' ? (
              <Alert>
                <RefreshCwIcon className="h-4 w-4 animate-spin mr-2" />
                <AlertTitle>Checking connection to OpenEPCIS API...</AlertTitle>
                <AlertDescription>
                  Verifying connection to OpenEPCIS API endpoints at tools.openepcis.io
                </AlertDescription>
              </Alert>
            ) : openEpcisApiStatus === 'connected' ? (
              <Alert className="bg-green-50 border-green-200">
                <WifiIcon className="h-4 w-4 text-green-500 mr-2" />
                <AlertTitle className="text-green-700">Connected to OpenEPCIS API</AlertTitle>
                <AlertDescription className="text-green-600">
                  Successfully connected to OpenEPCIS API. You can use the remote transformation capabilities.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-amber-50 border-amber-200">
                <WifiOffIcon className="h-4 w-4 text-amber-500 mr-2" />
                <AlertTitle className="text-amber-700">OpenEPCIS API Connection Issue</AlertTitle>
                <AlertDescription className="text-amber-600">
                  Could not connect to OpenEPCIS API status endpoint. Transformations will still be attempted.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Transformation Mode</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`cursor-pointer rounded-md p-3 border ${openEpcisMode === 'xml12-to-xml20' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setOpenEpcisMode('xml12-to-xml20')}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">EPCIS 1.2 to 2.0 XML</span>
                  {openEpcisMode === 'xml12-to-xml20' && (
                    <Badge variant="default" className="text-xs">Selected</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Converts EPCIS 1.2 XML documents to the newer EPCIS 2.0 format
                </p>
              </div>
              
              <div 
                className={`cursor-pointer rounded-md p-3 border ${openEpcisMode === 'xml20-to-jsonld' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setOpenEpcisMode('xml20-to-jsonld')}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">EPCIS 2.0 to JSON-LD</span>
                  {openEpcisMode === 'xml20-to-jsonld' && (
                    <Badge variant="default" className="text-xs">Selected</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Converts EPCIS 2.0 XML documents to JSON-LD format
                </p>
              </div>
              
              <div 
                className={`cursor-pointer rounded-md p-3 border ${openEpcisMode === 'xml12-to-jsonld' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setOpenEpcisMode('xml12-to-jsonld')}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">EPCIS 1.2 to JSON-LD</span>
                  {openEpcisMode === 'xml12-to-jsonld' && (
                    <Badge variant="default" className="text-xs">Selected</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Direct conversion from EPCIS 1.2 XML to JSON-LD in one step
                </p>
              </div>
            </div>
          </div>
          
          <FileUploader 
            onFileSelect={handleOpenEpcisFileSelect}
            accept=".xml"
            title={`Upload ${openEpcisMode === 'xml20-to-jsonld' ? 'EPCIS 2.0' : 'EPCIS 1.2'} XML File`}
            description={`File should be a valid ${openEpcisMode === 'xml20-to-jsonld' ? 'EPCIS 2.0' : 'EPCIS 1.2'} XML document`}
          />
          
          {(openEpcisMode === 'xml12-to-xml20' || openEpcisMode === 'xml12-to-jsonld') && (
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">XML Transformation Options</h4>
              <div className="flex items-center mb-2">
                <Checkbox 
                  id="openepcis-validate-xml" 
                  checked={xmlOptions.validateXml}
                  onCheckedChange={(checked) => 
                    setXmlOptions({...xmlOptions, validateXml: checked as boolean})
                  }
                />
                <Label htmlFor="openepcis-validate-xml" className="ml-2 text-sm text-gray-700">
                  Validate XML before transformation
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="openepcis-preserve-comments" 
                  checked={xmlOptions.preserveComments}
                  onCheckedChange={(checked) => 
                    setXmlOptions({...xmlOptions, preserveComments: checked as boolean})
                  }
                />
                <Label htmlFor="openepcis-preserve-comments" className="ml-2 text-sm text-gray-700">
                  Preserve XML comments
                </Label>
              </div>
            </div>
          )}
          
          {(openEpcisMode === 'xml20-to-jsonld' || openEpcisMode === 'xml12-to-jsonld') && (
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">JSON-LD Options</h4>
              <div className="flex items-center mb-2">
                <Checkbox 
                  id="openepcis-pretty-json" 
                  checked={jsonOptions.prettyPrint}
                  onCheckedChange={(checked) => 
                    setJsonOptions({...jsonOptions, prettyPrint: checked as boolean})
                  }
                />
                <Label htmlFor="openepcis-pretty-json" className="ml-2 text-sm text-gray-700">
                  Pretty-print JSON output
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="openepcis-include-context" 
                  checked={jsonOptions.includeContext}
                  onCheckedChange={(checked) => 
                    setJsonOptions({...jsonOptions, includeContext: checked as boolean})
                  }
                />
                <Label htmlFor="openepcis-include-context" className="ml-2 text-sm text-gray-700">
                  Include JSON-LD @context
                </Label>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full"
            disabled={!openEpcisXmlFile || openEpcisProcessing || openEpcisApiStatus === 'loading'}
            onClick={handleOpenEpcisTransform}
          >
            {openEpcisProcessing ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Processing via OpenEPCIS API...
              </>
            ) : (
              <>
                <CloudIcon className="mr-2 h-4 w-4" />
                Transform using OpenEPCIS API
              </>
            )}
          </Button>
          
          {openEpcisResult && (
            <div className="mt-6">
              <TransformResult 
                content={openEpcisResult} 
                fileName={
                  openEpcisMode === 'xml12-to-xml20' ? 'epcis20.xml' : 
                  (openEpcisMode === 'xml20-to-jsonld' || openEpcisMode === 'xml12-to-jsonld') ? 'epcis.jsonld' :
                  'result.txt'
                } 
                contentType={
                  openEpcisMode === 'xml12-to-xml20' ? 'application/xml' : 
                  (openEpcisMode === 'xml20-to-jsonld' || openEpcisMode === 'xml12-to-jsonld') ? 'application/ld+json' :
                  'text/plain'
                } 
                language={
                  openEpcisMode === 'xml12-to-xml20' ? 'xml' : 'json'
                }
              />
            </div>
          )}
        </TabsContent>
        
        {/* Module API Documentation Tab */}
        <TabsContent value="module" className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Node.js Module API Documentation</h3>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Installation</h4>
            <div className="bg-gray-800 rounded-md p-4">
              <pre className="text-gray-200 text-sm"><code>npm install epcis-transformer</code></pre>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Usage</h4>
            <div className="bg-gray-800 rounded-md p-4">
              <pre className="text-gray-200 text-sm"><code>{`const epcisTransformer = require('epcis-transformer');

// Convert EPCIS 1.2 XML to EPCIS 2.0 XML
const epcis20Xml = await epcisTransformer.convertToEpcis20Xml(epcis12XmlString);

// Transform EPCIS 2.0 XML to JSON-LD
const jsonld = await epcisTransformer.convertToJsonLd(epcis20Xml);`}</code></pre>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Core API Reference</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <h5 className="font-medium text-gray-800 mb-2">convertToEpcis20Xml(xml, options)</h5>
                <p className="text-sm text-gray-600 mb-2">Converts EPCIS 1.2 XML to EPCIS 2.0 XML</p>
                <h6 className="text-xs font-medium text-gray-700 mt-3 mb-1">Parameters:</h6>
                <ul className="text-xs text-gray-600 list-disc list-inside">
                  <li><code>xml</code> - String containing EPCIS 1.2 XML</li>
                  <li><code>options</code> - Optional configuration object</li>
                </ul>
                <h6 className="text-xs font-medium text-gray-700 mt-3 mb-1">Returns:</h6>
                <p className="text-xs text-gray-600">Promise that resolves to EPCIS 2.0 XML string</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Transformation Options</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <h5 className="font-medium text-gray-800 mb-2">convertToJsonLd(xml, options)</h5>
                <p className="text-sm text-gray-600 mb-2">Transforms EPCIS 2.0 XML to JSON-LD</p>
                <h6 className="text-xs font-medium text-gray-700 mt-3 mb-1">Parameters:</h6>
                <ul className="text-xs text-gray-600 list-disc list-inside">
                  <li><code>xml</code> - String containing EPCIS 2.0 XML</li>
                  <li><code>options</code> - Optional configuration object</li>
                </ul>
                <h6 className="text-xs font-medium text-gray-700 mt-3 mb-1">Returns:</h6>
                <p className="text-xs text-gray-600">Promise that resolves to JSON-LD string or object</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              <CloudIcon className="w-4 h-4 inline-block mr-1" />
              OpenEPCIS API Integration
            </h4>
            <div className="bg-gray-800 rounded-md p-4 mb-4">
              <pre className="text-gray-200 text-sm"><code>{`const { openEpcisClient } = require('epcis-transformer');

// Convert EPCIS 1.2 XML to EPCIS 2.0 XML using OpenEPCIS API
const epcis20Xml = await openEpcisClient.convertToEpcis20Xml(epcis12XmlString);

// Transform EPCIS 2.0 XML to JSON-LD using OpenEPCIS API
const jsonld = await openEpcisClient.convertToJsonLd(epcis20Xml);

// Direct conversion from EPCIS 1.2 XML to JSON-LD
const jsonldResult = await openEpcisClient.convertFrom12ToJsonLd(epcis12XmlString);

// Test if OpenEPCIS API is accessible
const isConnected = await openEpcisClient.testConnection();`}</code></pre>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-gray-50 rounded-md p-4">
                  <h5 className="font-medium text-gray-800 mb-2">OpenEPCIS API Methods</h5>
                  <p className="text-sm text-gray-600 mb-2">Access to OpenEPCIS API endpoints (tools.openepcis.io)</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside">
                    <li><code>convertToEpcis20Xml(xml, options)</code></li>
                    <li><code>convertToJsonLd(xml, options)</code></li>
                    <li><code>convertFrom12ToJsonLd(xml, options)</code></li>
                    <li><code>testConnection()</code></li>
                  </ul>
                </div>
              </div>
              <div>
                <div className="bg-gray-50 rounded-md p-4">
                  <h5 className="font-medium text-gray-800 mb-2">Command Line Usage</h5>
                  <p className="text-sm text-gray-600 mb-2">Use the EPCIS CLI tool to transform files</p>
                  <div className="text-xs text-gray-600">
                    <code>./epcis-cli.sh convert-to-epcis20 input.xml --remote</code><br/>
                    <code>./epcis-cli.sh convert-to-jsonld input.xml --remote</code><br/>
                    <code>./epcis-cli.sh convert-from-12-to-jsonld input.xml --remote</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Error Handling</h4>
            <div className="bg-gray-800 rounded-md p-4">
              <pre className="text-gray-200 text-sm"><code>{`try {
  const jsonld = await epcisTransformer.convertToJsonLd(xmlString);
  // Process the result
} catch (error) {
  if (error.code === 'INVALID_XML') {
    console.error('The XML input is invalid:', error.message);
  } else if (error.code === 'TRANSFORMATION_ERROR') {
    console.error('Error during transformation:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}`}</code></pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
