'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Info, ExternalLink } from 'lucide-react';
import { Question, RandomizedOption } from '@/lib/types';

export default function QuestionnairePage() {
  const [showInfo, setShowInfo] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à l'accueil
            </button>
          </div>
        </div>

        {/* Message d'information */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Nouveau Système de Questionnaire
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Le système de questionnaire a été mis à jour pour supporter plusieurs clients et sessions. 
              Pour accéder au questionnaire, vous devez utiliser l'URL courte fournie par votre organisation.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                Comment accéder au questionnaire ?
              </h2>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-yellow-700">
                    Votre organisation vous a fourni une <strong>URL courte</strong> (ex: <code className="bg-yellow-100 px-2 py-1 rounded">abc12345</code>)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-yellow-700">
                    Accédez au questionnaire via : <code className="bg-yellow-100 px-2 py-1 rounded">votre-site.com/questionnaire/[votre-code]</code>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-yellow-700">
                    Remplissez vos informations personnelles puis répondez aux questions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                Pour les administrateurs
              </h2>
              <p className="text-blue-700 mb-4">
                Si vous êtes administrateur et souhaitez créer des sessions de questionnaire :
              </p>
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <ExternalLink className="w-5 h-5" />
                Accéder à l'administration
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Besoin d'aide ?
              </h2>
              <p className="text-gray-600">
                Si vous n'avez pas reçu d'URL courte ou si vous rencontrez des problèmes, 
                contactez votre responsable ou l'équipe d'administration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
