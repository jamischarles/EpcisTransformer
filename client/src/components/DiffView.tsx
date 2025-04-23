import React from 'react';
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
  const diffResult = generateDiff(originalText, transformedText);
  
  return (
    <Card className="w-full border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <ScrollArea className={`w-full overflow-auto font-mono text-sm ${height}`}>
          <pre className="p-4 w-full">
            {diffResult.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "py-0.5 whitespace-pre-wrap break-all",
                  line.type === 'added' && 'bg-green-50 text-green-900 border-l-4 border-green-500 pl-2',
                  line.type === 'removed' && 'bg-red-50 text-red-900 border-l-4 border-red-500 pl-2',
                  line.type === 'unchanged' && ''
                )}
              >
                {line.type === 'added' && '+ '}
                {line.type === 'removed' && '- '}
                {line.type === 'unchanged' && '  '}
                {line.value}
              </div>
            ))}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}