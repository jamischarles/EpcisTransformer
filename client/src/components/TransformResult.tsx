import { Button } from '@/components/ui/button';
import { CopyIcon, DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard, downloadAsFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TransformResultProps {
  content: string;
  fileName: string;
  contentType: string;
  language: 'xml' | 'json';
}

export default function TransformResult({ 
  content, 
  fileName, 
  contentType, 
  language 
}: TransformResultProps) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
        variant: "default"
      });
    } else {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    downloadAsFile(content, fileName, contentType);
    toast({
      title: "Download started",
      description: `${fileName} is being downloaded.`,
      variant: "default"
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700">Transformation Result</h4>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy}
          >
            <CopyIcon className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
          >
            <DownloadIcon className="h-4 w-4 mr-1" /> Download
          </Button>
        </div>
      </div>
      <div className="bg-gray-800 rounded-md p-4 overflow-auto max-h-96">
        <pre className="text-gray-200 text-sm whitespace-pre-wrap">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
