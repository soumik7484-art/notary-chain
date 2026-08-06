import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onUpload, maxSize = 50 * 1024 * 1024, acceptedTypes = { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple = false, className = '' }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => multiple ? [...prev, ...acceptedFiles] : acceptedFiles);
    if (onUpload) onUpload(multiple ? acceptedFiles : acceptedFiles[0]);
  }, [multiple, onUpload]);

  const removeFile = (e, idx) => {
    e.stopPropagation();
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes,
    multiple
  });

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ease-in-out
          ${isDragActive ? 'border-[#2D6A4F] bg-[#F0FAF5] scale-[1.01]' : 'border-[#E8E2DA] bg-[#FFFDF9] hover:border-[#2D6A4F] hover:bg-[#F0FAF5]/50'}
          ${isDragReject ? 'border-[#DC2626] bg-[#FEE2E2]/30' : ''}
          flex flex-col items-center justify-center text-center shadow-xs
        `}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 mb-3 rounded-2xl bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] flex items-center justify-center">
          <UploadCloud className="w-7 h-7" />
        </div>
        <p className="text-base font-semibold text-[#2E2A26] mb-1">
          {isDragActive ? 'Drop file here...' : 'Click or drag & drop to upload'}
        </p>
        <p className="text-xs text-[#7B746E]">
          Supported formats: PDF, PNG, JPG (Max {maxSize / (1024 * 1024)}MB)
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
            {files.map((file, idx) => (
              <motion.div
                key={`${file.name}-${idx}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E8E2DA] bg-white shadow-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#2E2A26] truncate">{file.name}</p>
                    <p className="text-[11px] text-[#7B746E]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => removeFile(e, idx)}
                  className="p-1 rounded-lg text-[#7B746E] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
