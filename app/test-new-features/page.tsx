'use client';

import { useState } from 'react';

export default function TestNewFeaturesPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testClientParametersAPI = async () => {
    setLoading(true);
    setResult('Test de l\'API paramètres par client...');
    
    try {
      // Test sans clientId (tous les paramètres)
      const response1 = await fetch('/api/respondent-parameters');
      const data1 = await response1.json();
      
      // Test avec un clientId spécifique
      const response2 = await fetch('/api/respondent-parameters?clientId=client_1760801652494_dt90svg0i');
      const data2 = await response2.json();
      
      setResult(`✅ API Paramètres par Client fonctionne!\n\nTous les paramètres (${data1.length}):\n${JSON.stringify(data1, null, 2)}\n\nParamètres pour client spécifique (${data2.length}):\n${JSON.stringify(data2, null, 2)}`);
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

  const testNewPages = async () => {
    setLoading(true);
    setResult('Test des nouvelles pages...');
    
    try {
      const pages = [
        '/admin/questions',
        '/admin/client-parameters',
        '/admin'
      ];
      
      const results = [];
      
      for (const page of pages) {
        const response = await fetch(page);
        results.push(`${page}: ${response.ok ? '✅ OK' : '❌ Erreur'} (${response.status})`);
      }
      
      setResult(`✅ Test des pages:\n\n${results.join('\n')}`);
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestParameter = async () => {
    setLoading(true);
    setResult('Création d\'un paramètre de test...');
    
    try {
      const testParameter = {
        client_id: 'client_1760801652494_dt90svg0i',
        name: `Paramètre Test ${new Date().toLocaleTimeString()}`,
        type: 'select',
        options: ['Option 1', 'Option 2', 'Option 3'],
        required: true,
        order: 1
      };

      const response = await fetch('/api/respondent-parameters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testParameter)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Paramètre créé avec succès!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur création: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test des Nouvelles Fonctionnalités</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={testClientParametersAPI}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Test API Paramètres par Client
          </button>
          
          <button
            onClick={testQuestionsAPI}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test API Questions
          </button>
          
          <button
            onClick={testNewPages}
            disabled={loading}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Test Nouvelles Pages
          </button>
          
          <button
            onClick={createTestParameter}
            disabled={loading}
            className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Créer Paramètre Test
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat du test</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result || 'Aucun test effectué'}
          </pre>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Nouvelles URLs</h3>
          <div className="text-green-700 text-sm space-y-2">
            <p>
              <strong>Référentiel Questions:</strong> <a href="/admin/questions" target="_blank" className="underline">/admin/questions</a>
            </p>
            <p>
              <strong>Paramètres par Client:</strong> <a href="/admin/client-parameters" target="_blank" className="underline">/admin/client-parameters</a>
            </p>
            <p>
              <strong>Administration:</strong> <a href="/admin" target="_blank" className="underline">/admin</a>
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Nouvelles Fonctionnalités</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>✅ <strong>Paramètres par Client</strong> : Chaque client peut avoir ses propres paramètres de répondants</li>
            <li>✅ <strong>Référentiel Questions</strong> : Page dédiée à la gestion des questions</li>
            <li>✅ <strong>Navigation Simplifiée</strong> : Accès direct aux fonctions essentielles</li>
            <li>✅ <strong>API Mise à Jour</strong> : Support du filtrage par client</li>
            <li>✅ <strong>Interface Améliorée</strong> : Sélection de client et gestion des paramètres</li>
            <li>✅ <strong>Types de Paramètres</strong> : Texte libre, sélection unique, sélection multiple</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Structure de Navigation</h3>
          <div className="text-yellow-700 text-sm space-y-1">
            <p><strong>Accueil</strong> : Vue d'ensemble et accès rapide</p>
            <p><strong>Gestion des Clients</strong> : Création et gestion des clients</p>
            <p><strong>Sessions</strong> : Vue condensée avec filtres et statistiques</p>
            <p><strong>Paramètres par Client</strong> : Configuration spécifique par client</p>
            <p><strong>Référentiel Questions</strong> : Gestion du référentiel de questions</p>
            <p><strong>Analyses et Comparaisons</strong> : Analyses avancées</p>
          </div>
        </div>
      </div>
    </div>
  );
}
