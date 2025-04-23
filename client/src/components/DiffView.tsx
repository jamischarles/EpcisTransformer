import React, { useMemo } from 'react';
import { generateDiff } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DiffViewProps {
  originalText: string;
  transformedText: string;
  height?: string;
}

export default function DiffView({ originalText, transformedText, height = '500px' }: DiffViewProps) {
  // Generate diff using the improved diff library
  const diffResult = useMemo(() => generateDiff(originalText, transformedText), [originalText, transformedText]);
  
  const renderLineNumbers = (text: string, startNumber: number) => {
    const lines = text.split('\n');
    if (lines[lines.length - 1] === '') {
      lines.pop(); // Remove the last empty line if it exists
    }
    return lines.map((_, i) => startNumber + i);
  };
  
  // Track line numbers for original and transformed text
  let originalLineNumber = 1;
  let transformedLineNumber = 1;
  
  return (
    <Card className="w-full border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs font-medium">Removed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium">Added</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs font-medium">Unchanged</span>
          </div>
        </div>
        <ScrollArea className={`w-full overflow-auto font-mono text-sm ${height}`}>
          <div className="p-4 w-full relative">
            {diffResult.map((part, index) => {
              // Calculate line numbers for this diff part
              const currentOriginalLineNumbers = part.type !== 'added' 
                ? renderLineNumbers(part.value, originalLineNumber) 
                : [];
              
              const currentTransformedLineNumbers = part.type !== 'removed' 
                ? renderLineNumbers(part.value, transformedLineNumber) 
                : [];
              
              // Update line counters for next iteration
              if (part.type !== 'added') {
                originalLineNumber += currentOriginalLineNumbers.length;
              }
              
              if (part.type !== 'removed') {
                transformedLineNumber += currentTransformedLineNumbers.length;
              }
              
              // Split the value into individual lines
              const lines = part.value.split('\n');
              if (lines[lines.length - 1] === '') {
                lines.pop(); // Remove the last empty line if it exists
              }
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "relative",
                    part.type === 'added' && 'bg-green-50 text-green-900 border-l-4 border-green-500 pl-2',
                    part.type === 'removed' && 'bg-red-50 text-red-900 border-l-4 border-red-500 pl-2',
                    part.type === 'unchanged' && 'pl-2'
                  )}
                >
                  {lines.map((line, lineIndex) => (
                    <div 
                      key={`${index}-${lineIndex}`} 
                      className="py-0.5 whitespace-pre-wrap"
                    >
                      {part.type === 'added' && <span className="text-green-600 mr-1">+</span>}
                      {part.type === 'removed' && <span className="text-red-600 mr-1">-</span>}
                      {part.type === 'unchanged' && <span className="text-gray-400 mr-1">&nbsp;</span>}
                      {line}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}