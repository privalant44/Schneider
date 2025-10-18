'use client';

import { useState } from 'react';
import ImageUpload from '@/app/components/ImageUpload';

export default function TestUploadPage() {
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Upload de Logo</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Uploader un logo</h2>
            <ImageUpload
              value={uploadedUrl}
              onChange={setUploadedUrl}
              placeholder="Cliquez pour uploader un logo..."
            />
          </div>

          {uploadedUrl && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">URL générée :</h3>
              <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded border break-all">
                {uploadedUrl}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">Aperçu :</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img
                  src={uploadedUrl}
                  alt="Logo uploadé"
                  className="max-w-full h-auto max-h-32 mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.textContent = 'Erreur de chargement de l\'image';
                    errorDiv.className = 'text-red-500 text-center';
                    target.parentNode?.appendChild(errorDiv);
                  }}
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions :</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Cliquez sur la zone d'upload pour sélectionner un fichier</li>
              <li>• Formats acceptés : JPEG, PNG, GIF, WebP, SVG</li>
              <li>• Taille maximale : 5MB</li>
              <li>• L'image sera sauvegardée dans /public/uploads/</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
