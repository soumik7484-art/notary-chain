import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';

const DocumentUpload = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('contract');

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    if (!title) setTitle(acceptedFiles[0].name.split('.')[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  const handleUpload = () => {
    if (!file) return toast.error('Please select a file');
    toast.success('Document uploaded successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2A26]/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-xl bg-white border border-[#E8E2DA] rounded-2xl shadow-card-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8E2DA] flex justify-between items-center bg-[#F6F3EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#2E2A26]">Upload Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-[#2D6A4F] bg-[#F0FAF5]' : 'border-[#E8E2DA] bg-[#FFFDF9] hover:border-[#2D6A4F] hover:bg-[#F0FAF5]/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 mx-auto bg-[#F0FAF5] border border-[#B3E4CC] rounded-2xl flex items-center justify-center mb-3 text-[#2D6A4F]">
              <FileText className="w-7 h-7" />
            </div>
            {file ? (
              <div>
                <p className="text-[#2E2A26] font-bold text-sm">{file.name}</p>
                <p className="text-[#7B746E] text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-[#2E2A26] font-semibold text-sm">Drag & drop your document here</p>
                <p className="text-[#7B746E] text-xs mt-1">Supports PDF, DOCX, PNG, JPG up to 50MB</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Financial Report"
            />
            
            <div>
              <label className="block text-xs font-semibold text-[#2E2A26] mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white text-[#2E2A26] border border-[#E8E2DA] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none text-sm transition-all"
              >
                <option value="contract">Contract & Agreement</option>
                <option value="identity">Identity Document</option>
                <option value="financial">Financial Record</option>
                <option value="other">Other Legal Document</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E8E2DA] bg-[#F6F3EE] flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Upload & Analyze
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
