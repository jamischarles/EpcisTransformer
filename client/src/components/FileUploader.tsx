import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpIcon } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept: string;
  title: string;
  description: string;
}

export default function FileUploader({ onFileSelect, accept, title, description }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div 
        className={`border-2 border-dashed rounded-lg px-6 py-10 text-center cursor-pointer transition duration-150 
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <FileUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-1">Drag and drop your file here</p>
        <p className="text-xs text-gray-500">or</p>
        <Button 
          variant="default" 
          size="sm" 
          className="mt-2"
        >
          Select File
        </Button>
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept={accept}
          onChange={handleFileChange}
        />
        
        {selectedFile && (
          <p className="mt-3 text-sm text-primary-600 font-medium">
            {selectedFile.name}
          </p>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
