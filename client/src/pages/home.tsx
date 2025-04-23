import { useState } from 'react';
import TabsContainer from '@/components/TabsContainer';
import StatusPanel from '@/components/StatusPanel';
import { nanoid } from 'nanoid';
import type { StatusMessage } from '@shared/schema';
import { getTimestamp } from '@/lib/utils';

export default function Home() {
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([
    {
      id: nanoid(),
      type: 'success',
      title: 'Module Loaded',
      description: 'EPCIS Transformer module initialized successfully',
      timestamp: new Date().toISOString()
    },
    {
      id: nanoid(),
      type: 'info',
      title: 'Ready for transformation',
      description: 'Upload a file to begin transformation',
      timestamp: new Date().toISOString()
    }
  ]);

  const addStatusMessage = (message: StatusMessage) => {
    setStatusMessages(prev => [message, ...prev]);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Introduction Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">EPCIS Document Transformer</h2>
          <p className="text-gray-600 mb-4">
            This tool provides a graphical interface to the Node.js module that converts EPCIS 1.2 XML to EPCIS 2.0 XML 
            and transforms EPCIS 2.0 XML to JSON-LD format.
          </p>
          <div className="bg-primary-50 rounded-md p-4 border border-primary-100">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 mt-1 mr-3">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div>
                <h3 className="font-medium text-primary-800">Module Features:</h3>
                <ul className="mt-2 text-sm text-primary-700 list-disc list-inside">
                  <li>Convert EPCIS 1.2 XML files to EPCIS 2.0 XML files using GS1 XSL transform</li>
                  <li>Transform EPCIS 2.0 XML files to EPCIS 2.0 JSON-LD formats</li>
                  <li>Support for both synchronous and asynchronous operations</li>
                  <li>Comprehensive error handling and validation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs with conversion options */}
      <TabsContainer addStatusMessage={addStatusMessage} />

      {/* Status Panel */}
      <StatusPanel messages={statusMessages} />
    </main>
  );
}
