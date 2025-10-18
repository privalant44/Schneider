'use client';

import { useState } from 'react';
import { TestTube, Building2, Calendar, UserCog, HelpCircle, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function TestsPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testClientsAPI = async () => {
    setLoading(true);
    setResult('Test de l\'API clients...');
    
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ API Clients fonctionne!\n\n${data.length} client(s) trouvé(s):\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur API: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testSessionsAPI = async () => {
    setLoading(true);
    setResult('Test de l\'API sessions...');
    
    try {
      const response = await fetch('/api/sessions-with-stats');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ API Sessions fonctionne!\n\n${data.length} session(s) trouvée(s):\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur API: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testClientParametersAPI = async () => {
    setLoading(true);
    setResult('Test de l\'API paramètres par client...');
    
    try {
      const response = await fetch('/api/respondent-parameters');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ API Paramètres par Client fonctionne!\n\n${data.length} paramètre(s) trouvé(s):\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur API: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testQuestionsAPI = async () => {
    setLoading(true);
    setResult('Test de l\'API questions...');
    
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ API Questions fonctionne!\n\n${data.length} question(s) trouvée(s):\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur API: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllPages = async () => {
    setLoading(true);
    setResult('Test de toutes les pages d\'administration...');
    
    try {
      const pages = [
        '/admin/clients',
        '/admin/client-parameters',
        '/admin/sessions',
        '/admin/questions',
        '/admin/analytics'
      ];
      
      const results = [];
      
      for (const page of pages) {
        const response = await fetch(page);
        results.push(`${page}: ${response.ok ? '✅ OK' : '❌ Erreur'} (${response.status})`);
      }
      
      setResult(`✅ Test des pages d'administration:\n\n${results.join('\n')}`);
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseStatus = async () => {
    setLoading(true);
    setResult('Test du statut de la base de données...');
    
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Base de données accessible!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur base de données: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    setLoading(true);
    setResult('Création de données de test...');
    
    try {
      // Créer un client de test
      const clientResponse = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Client Test ${new Date().toLocaleTimeString()}`,
          description: 'Client créé automatiquement pour les tests',
          industry: 'Technologie'
        })
      });
      
      const clientData = await clientResponse.json();
      
      if (clientResponse.ok) {
        setResult(`✅ Données de test créées!\n\nClient créé:\n${JSON.stringify(clientData, null, 2)}`);
      } else {
        setResult(`❌ Erreur création: ${clientResponse.status}\n${JSON.stringify(clientData, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tests de la Plateforme</h1>
            <p className="text-gray-600 mt-2">
              Testez toutes les fonctionnalités de la plateforme
            </p>
          </div>
          
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'Administration
          </Link>
        </div>

        {/* Grille des tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={testClientsAPI}
            disabled={loading}
            className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 disabled:opacity-50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Test API Clients</h3>
              <p className="text-gray-600 text-sm">
                Tester l'API de gestion des clients
              </p>
            </div>
          </button>

          <button
            onClick={testSessionsAPI}
            disabled={loading}
            className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 disabled:opacity-50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Test API Sessions</h3>
              <p className="text-gray-600 text-sm">
                Tester l'API de gestion des sessions
              </p>
            </div>
          </button>

          <button
            onClick={testClientParametersAPI}
            disabled={loading}
            className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 disabled:opacity-50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <UserCog className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Test API Paramètres</h3>
              <p className="text-gray-600 text-sm">
                Tester l'API des paramètres par client
              </p>
            </div>
          </button>

          <button
            onClick={testQuestionsAPI}
            disabled={loading}
            className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 disabled:opacity-50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                <HelpCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Test API Questions</h3>
              <p className="text-gray-600 text-sm">
                Tester l'API du référentiel questions
              </p>
            </div>
          </button>

          <button
            onClick={testAllPages}
            disabled={loading}
            className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 disabled:opacity-50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Test Toutes les Pages</h3>
              <p className="text-gray-600 text-sm">
                Tester l'accessibilité de toutes les pages
              </p>
            </div>
          </button>

          <button
            onClick={testDatabaseStatus}
            disabled={loading}
            className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 disabled:opacity-50"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Test Base de Données</h3>
              <p className="text-gray-600 text-sm">
                Vérifier le statut de la base de données
              </p>
            </div>
          </button>
        </div>

        {/* Bouton de création de données de test */}
        <div className="text-center mb-8">
          <button
            onClick={createTestData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors mx-auto disabled:opacity-50"
          >
            <TestTube className="w-5 h-5" />
            Créer des Données de Test
          </button>
        </div>

        {/* Résultat des tests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat du test</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap min-h-[200px]">
            {result || 'Aucun test effectué'}
          </pre>
        </div>

        {/* Informations sur les tests */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-4">Informations sur les Tests</h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p><strong>API Clients:</strong> Teste la création, lecture, mise à jour et suppression des clients</p>
            <p><strong>API Sessions:</strong> Teste la récupération des sessions avec statistiques et filtres</p>
            <p><strong>API Paramètres:</strong> Teste la gestion des paramètres spécifiques par client</p>
            <p><strong>API Questions:</strong> Teste le référentiel de questions et leurs images</p>
            <p><strong>Pages d'Administration:</strong> Vérifie l'accessibilité de toutes les pages</p>
            <p><strong>Base de Données:</strong> Affiche le statut complet de la base de données JSON</p>
          </div>
        </div>
      </div>
    </div>
  );
}
