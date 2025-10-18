'use client';

import { useState, useEffect } from 'react';
import { Building2, UserCog, Calendar, HelpCircle as QuestionIcon, BarChart3, Settings, TestTube, Edit3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ImageUpload from '@/app/components/ImageUpload';

export default function AdminPage() {
  const [settings, setSettings] = useState({
    welcome_text: '',
    company_logo: ''
  });
  const [showSettingsForm, setShowSettingsForm] = useState(false);

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
    }
  };

  const handleSaveSettings = async (newSettings: any) => {
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'welcome_text', value: newSettings.welcome_text })
        }),
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'company_logo', value: newSettings.company_logo })
        })
      ]);
      
      setSettings(newSettings);
      setShowSettingsForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec logo Anima Néo et bouton paramètres */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <div className="mb-6">
              <Image
                src={settings.company_logo || "/logo-anima-neo.svg"}
                alt="Anima Néo"
                width={200}
                height={80}
                className="mx-auto"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Administration
            </h1>
          </div>
          
          {/* Bouton paramètres en haut à droite */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowSettingsForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              Paramètres
            </button>
            <Link
              href="/test-upload"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <TestTube className="w-5 h-5" />
              Test Upload
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Retour au Site
            </Link>
          </div>
        </div>

        {/* Encart de bienvenue */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto shadow-lg border border-white/20 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Bienvenue dans l'administration
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed text-center">
            Utilisez les sections ci-dessus pour gérer tous les aspects de votre plateforme de questionnaires. 
            Chaque section est conçue pour vous offrir un contrôle total sur vos clients, sessions et analyses.
          </p>
        </div>

        {/* Navigation vers les sections d'administration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            href="/admin/clients"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Clients</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Créer et gérer vos clients
              </p>
            </div>
          </Link>

          <Link
            href="/admin/analysis-axes"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <UserCog className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Axes d'Analyse</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Configurer les axes d'analyse par défaut pour tous les clients
              </p>
            </div>
          </Link>

          <Link
            href="/admin/sessions"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Calendar className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Sessions</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Voir toutes les sessions avec filtres et statistiques
              </p>
            </div>
          </Link>

          <Link
            href="/admin/questions"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                <QuestionIcon className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Référentiel Questions</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Gérer le référentiel de questions
              </p>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <BarChart3 className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Analyses et Comparaisons</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Analyser et comparer les résultats entre sessions
              </p>
            </div>
          </Link>

          <Link
            href="/admin/tests"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-200 transition-colors">
                <TestTube className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Tests</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Tester toutes les fonctionnalités de la plateforme
              </p>
            </div>
          </Link>
        </div>

        {/* Modal de paramètres */}
        {showSettingsForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
                <button
                  onClick={() => setShowSettingsForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <SettingsForm
                settings={settings}
                onSave={handleSaveSettings}
                onCancel={() => setShowSettingsForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant formulaire de paramètres
function SettingsForm({ 
  settings, 
  onSave, 
  onCancel 
}: { 
  settings: any; 
  onSave: (settings: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    welcome_text: settings.welcome_text || '',
    company_logo: settings.company_logo || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, company_logo: url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texte de bienvenue
        </label>
        <textarea
          value={formData.welcome_text}
          onChange={(e) => setFormData({ ...formData, welcome_text: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          rows={3}
          placeholder="Texte de bienvenue pour la page d'administration..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo de l'entreprise
        </label>
        <div className="space-y-4">
          {formData.company_logo && (
            <div className="text-center">
              <Image
                src={formData.company_logo}
                alt="Logo actuel"
                width={200}
                height={80}
                className="mx-auto border border-gray-200 rounded-lg"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Uploader un nouveau logo
            </label>
            <ImageUpload
              value={formData.company_logo}
              onChange={(url) => setFormData({ ...formData, company_logo: url })}
              placeholder="Cliquez pour uploader un logo..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ou saisir une URL
            </label>
            <input
              type="text"
              value={formData.company_logo}
              onChange={(e) => setFormData({ ...formData, company_logo: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
              placeholder="URL du logo de l'entreprise (optionnel)..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
        >
          Sauvegarder
        </button>
      </div>
    </form>
  );
}