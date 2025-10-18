'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Users, Target, Lightbulb, Heart, Settings } from 'lucide-react';

interface Settings {
  welcome_text: string;
  company_logo: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestionnaire = () => {
    router.push('/questionnaire');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec navigation admin */}
        <div className="flex justify-end gap-4 mb-4">
          <button
            onClick={() => router.push('/test-admin-page')}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Test Page Admin
          </button>
          <button
            onClick={() => router.push('/test-new-features')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Test Nouvelles Fonctionnalités
          </button>
          <button
            onClick={() => router.push('/test-clients')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Test Clients
          </button>
          <button
            onClick={() => router.push('/test-sessions')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Test Sessions
          </button>
          <button
            onClick={() => router.push('/test-radar')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Test Radar
          </button>
          <button
            onClick={() => router.push('/test-submission')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Test Soumission
          </button>
          <button
            onClick={() => router.push('/test-questionnaire')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Test Questionnaire
          </button>
          <button
            onClick={() => router.push('/test-short-url')}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Test URLs
          </button>
          <button
            onClick={() => router.push('/test-api')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Test API
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Administration
          </button>
        </div>

        {/* Header avec logo */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <Image
              src={settings?.company_logo || '/logo-anima-neo.svg'}
              alt="Anima Néo"
              width={200}
              height={100}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Questionnaire Schneider
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {settings?.welcome_text || 'Bienvenue dans le questionnaire de cartographie de culture d\'entreprise Schneider.'}
          </p>
        </div>

        {/* Présentation des 4 typologies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Contrôle</h3>
            <p className="text-sm text-gray-600">Structure, processus et hiérarchie</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Expertise</h3>
            <p className="text-sm text-gray-600">Compétence technique et innovation</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Collaboration</h3>
            <p className="text-sm text-gray-600">Travail d'équipe et coopération</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cultivation</h3>
            <p className="text-sm text-gray-600">Développement personnel et apprentissage</p>
          </div>
        </div>

        {/* Informations sur le questionnaire */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            À propos de ce questionnaire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-anima-blue mb-2">15</div>
              <p className="text-gray-600">Questions</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-anima-blue mb-2">5-10</div>
              <p className="text-gray-600">Minutes</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-anima-blue mb-2">4</div>
              <p className="text-gray-600">Typologies</p>
            </div>
          </div>
        </div>

        {/* Bouton de démarrage */}
        <div className="text-center">
          <button
            onClick={handleStartQuestionnaire}
            className="bg-anima-blue hover:bg-anima-dark-blue text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            Commencer le questionnaire
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
