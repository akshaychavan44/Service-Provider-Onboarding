import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUpload({
  label = 'Upload Document',
  accept = '.jpg,.jpeg,.png,.webp,.pdf',
  maxSizeMB = 5,
  onUpload, // async fn(file, setProgress) => Promise
  helpText = 'Supported formats: JPG, PNG, PDF (Max 5MB)',
  isImageOnly = false,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (selectedFile) => {
    setError(null);
    setSuccess(false);

    // Size check
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${maxSizeMB}MB.`);
      return false;
    }

    // Type check
    const allowedTypes = isImageOnly
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        isImageOnly
          ? 'Only JPG, JPEG, PNG, and WEBP image files are allowed.'
          : 'Only JPG, JPEG, PNG, WEBP, and PDF documents are allowed.'
      );
      return false;
    }

    return true;
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;

    if (!validateFile(selectedFile)) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setFile(selectedFile);

    // Create preview if image
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }

    // If auto-upload handler provided
    if (onUpload) {
      try {
        setUploading(true);
        setProgress(10);
        await onUpload(selectedFile, (percent) => setProgress(percent));
        setProgress(100);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-brand-500 bg-brand-50/50'
            : error
            ? 'border-rose-300 bg-rose-50/30'
            : success
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files[0])}
          className="hidden"
        />

        {/* Preview or Icon */}
        {preview ? (
          <div className="relative mb-3 group">
            <img
              src={preview}
              alt="Upload Preview"
              className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-white"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition"
            >
              <X size={14} />
            </button>
          </div>
        ) : file ? (
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-3 w-full max-w-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              {file.type === 'application/pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
              <p className="text-[11px] text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-slate-400 hover:text-rose-500 p-1"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              <span className="text-brand-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1">{helpText}</p>
          </div>
        )}

        {/* Progress indicator */}
        {uploading && (
          <div className="w-full max-w-xs mt-3">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Uploading document...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success message */}
        {success && !uploading && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-2">
            <CheckCircle size={14} />
            <span>Upload completed successfully!</span>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-1.5">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
