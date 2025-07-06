import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, isOpen, onClose }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="flex flex-col items-center p-4">
          <div className="mb-4 flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pageNumber} of {numPages || '...'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              Next
            </Button>
          </div>
          <div className="flex items-center justify-center min-h-[300px] w-full">
            <Document
              file={file.url} // Blob URL
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="text-gray-500 dark:text-gray-400 animate-pulse">Loading PDF...</div>}
              error={<div className="text-red-500 dark:text-red-400">Failed to load PDF file.</div>}
              className="border rounded-lg shadow-lg"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                className="max-w-full"
                loading={<div className="text-gray-500 dark:text-gray-400 animate-pulse">Loading page...</div>}
                error={<div className="text-red-500 dark:text-red-400">Failed to load page.</div>}
              />
            </Document>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Preview not available for this file type
          </p>
          <Button onClick={handleDownload} icon={Download}>
            Download File
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={file.name}
      size="xl"
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={ZoomOut}
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={ZoomIn}
              onClick={() => setScale(Math.min(3, scale + 0.1))}
            />
            <Button
              variant="outline"
              size="sm"
              icon={RotateCw}
              onClick={() => setRotation((rotation + 90) % 360)}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>

        {/* Preview */}
        <div className="max-h-[70vh] overflow-auto">
          {renderPreview()}
        </div>
      </div>
    </Modal>
  );
};

export default FilePreview;