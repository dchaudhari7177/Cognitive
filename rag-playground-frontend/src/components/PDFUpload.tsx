'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function PDFUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileStats, setFileStats] = useState<{
    pages?: number;
    size?: string;
    lastModified?: string;
  }>({
    size: '',
    lastModified: ''
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const validatePDF = (file: File) => {
    if (!file.type.includes('pdf')) {
      throw new Error('Please upload a PDF file');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }
    return true;
  };

  const handleFile = (file: File) => {
    try {
      if (validatePDF(file)) {
        setSelectedFile(file);
        setFileStats({
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          lastModified: new Date(file.lastModified).toLocaleDateString(),
        });
        onUpload(file);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid file');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`group transition-all duration-200 ${
          dragActive ? 'bg-gray-700/50' : 'bg-transparent'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-100">
              Upload Document
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Supported:</span>
              <span className="px-2 py-1 bg-gray-900/50 rounded text-xs text-blue-400">PDF</span>
            </div>
          </div>

          <motion.div 
            className={`flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-xl transition-colors relative ${
              dragActive ? 'border-blue-400 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            {/* Drag Overlay */}
            {dragActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center"
              >
                <span className="text-blue-400 font-medium">Drop your file here</span>
              </motion.div>
            )}

            {/* Upload Icon & Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <svg
                className="w-16 h-16 text-blue-400 mb-4 mx-auto"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-8m0 0-3.5 3.5M12 8l3.5 3.5M21 16.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5M16.5 12.5 12 8l-4.5 4.5"
                />
              </svg>
              <p className="text-gray-400 text-sm mb-2">
                Drag & drop your PDF here, or{' '}
                <button type="button" className="text-blue-400 underline hover:text-blue-300">
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
            </motion.div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="hidden"
            />
          </motion.div>
        </div>
      </div>

      {/* File Details */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-xl p-4"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-200 mb-1">{selectedFile.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="text-sm text-gray-300">{fileStats.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Modified</p>
                  <p className="text-sm text-gray-300">{fileStats.lastModified}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileStats({});
              }}
              className="p-1 hover:bg-gray-800 rounded"
            >
              <svg className="w-5 h-5 text-gray-500 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Requirements Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          <span className="text-blue-400"></span> 
        </p>
      </div>
    </div>
  );
}
