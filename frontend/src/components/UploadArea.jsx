import React, { useRef, useState } from 'react';
import { AlertTriangle, FileImage, FileText } from 'lucide-react';
import { UI_STRINGS } from '../translations/content';

/**
 * Drag‑and‑drop + file input component.
 * Props:
 *   onFileSelect(file: File) – called when a valid file is chosen.
 *   language – locale key (en/hi/te).
 */
export default function UploadArea({ onFileSelect, language }) {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const maxSize = 5 * 1024 * 1024; // 5 MiB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const validate = (file) => {
    if (!allowedTypes.includes(file.type)) {
      setError(t.fileTypeError);
      return false;
    }
    if (file.size > maxSize) {
      setError(t.sizeError);
      return false;
    }
    setError('');
    return true;
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;
    if (!validate(file)) return;
    // create preview for images; PDFs get a generic icon
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
    onFileSelect(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const onChange = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => inputRef.current && inputRef.current.click()}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="preview" className="mx-auto mb-4 max-h-48 object-contain" />
      ) : (
        <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
      )}
      <p className="text-sm text-slate-600 mb-2">{t.uploadPrompt}</p>
      <input
        type="file"
        accept={allowedTypes.join(',')}
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={onChange}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1">
          <AlertTriangle className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  );
}
