import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
  fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="flex-grow w-full h-full bg-muted overflow-auto">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          // pdf.js 3.x can run attacker JavaScript from a crafted font
          // (CVE-2024-4367); disabling eval closes that path.
          transformGetDocumentParams={(options) => ({
            ...options,
            isEvalSupported: false,
          })}
        />
      </Worker>
    </div>
  );
};

export default PDFViewer;
