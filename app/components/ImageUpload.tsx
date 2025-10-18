'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  placeholder = "Sélectionner une image...",
  className = "",
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, GIF, WebP, SVG');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Fichier trop volumineux. Taille maximale: 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.url);
      } else {
        setError(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du fichier');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setError(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      {value ? (
        <div className="relative group">
          <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
            <ImageIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">
                {value.split('/').pop()}
              </p>
              <p className="text-xs text-gray-500">
                Image sélectionnée
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Aperçu de l'image */}
          <div className="mt-2">
            <img
              src={value}
              alt="Aperçu"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`
            relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
            hover:border-anima-blue hover:bg-blue-50 transition-colors
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-anima-blue animate-spin" />
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-500">
                Formats acceptés: JPEG, PNG, GIF, WebP, SVG (max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
}
