import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon, 
  LoaderIcon, 
  InfoIcon 
} from 'lucide-react';
import type { StatusMessage } from '@shared/schema';

interface StatusPanelProps {
  messages: StatusMessage[];
}

export default function StatusPanel({ messages }: StatusPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-700">Transformation Status</h2>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex justify-between items-center py-3 px-6 hover:bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <InfoIcon className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Ready</h3>
                <p className="text-xs text-gray-500">EPCIS Transformer module initialized</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : (
          messages.map((message) => (
            <StatusItem key={message.id} message={message} />
          ))
        )}
      </div>
    </div>
  );
}

function StatusItem({ message }: { message: StatusMessage }) {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />;
      case 'warning':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />;
      case 'processing':
        return <LoaderIcon className="h-5 w-5 text-blue-500 mr-3 animate-spin" />;
      case 'info':
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500 mr-3" />;
    }
  };

  // Format timestamp to show only hours and minutes
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex justify-between items-center py-3 px-6 hover:bg-gray-50 border-b border-gray-200">
      <div className="flex items-center">
        {getIcon()}
        <div>
          <h3 className="text-sm font-medium text-gray-900">{message.title}</h3>
          <p className="text-xs text-gray-500">{message.description}</p>
        </div>
      </div>
      <span className="text-xs text-gray-500">{formattedTime}</span>
    </div>
  );
}
