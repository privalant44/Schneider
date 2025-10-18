'use client';

import { useState } from 'react';

export default function TestSessionsPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSessionsAPI = async () => {
    setLoading(true);
    setResult('Test de l\'API sessions-with-stats...');
    
    try {
      const response = await fetch('/api/sessions-with-stats');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ API fonctionne!\n\n${data.length} session(s) trouvée(s):\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur API: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testFilters = async () => {
    setLoading(true);
    setResult('Test des filtres...');
    
    try {
      // Test avec un client spécifique
      const response = await fetch('/api/sessions-with-stats?clientId=client_1760801652494_dt90svg0i');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Filtre par client fonctionne!\n\n${data.length} session(s) trouvée(s) pour ce client:\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur filtre: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDateFilters = async () => {
    setLoading(true);
    setResult('Test des filtres par date...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/sessions-with-stats?startDate=${today}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Filtre par date fonctionne!\n\n${data.length} session(s) trouvée(s) depuis aujourd'hui:\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur filtre date: ${response.status}\n${JSON.stringify(data, null, 2)}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test de la Page Sessions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testSessionsAPI}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Test API Sessions
          </button>
          
          <button
            onClick={testFilters}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test Filtres Client
          </button>
          
          <button
            onClick={testDateFilters}
            disabled={loading}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Test Filtres Date
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat du test</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result || 'Aucun test effectué'}
          </pre>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">URLs de test</h3>
          <div className="text-green-700 text-sm space-y-2">
            <p>
              <strong>Page des sessions:</strong> <a href="/admin/sessions" target="_blank" className="underline">/admin/sessions</a>
            </p>
            <p>
              <strong>API sessions avec stats:</strong> <a href="/api/sessions-with-stats" target="_blank" className="underline">/api/sessions-with-stats</a>
            </p>
            <p>
              <strong>Administration:</strong> <a href="/admin" target="_blank" className="underline">/admin</a>
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Fonctionnalités</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>✅ Affichage condensé des sessions (1 ligne par session)</li>
            <li>✅ Colonnes: Description, Statut, Client, Date début, Date fin, Réponses, URL courte</li>
            <li>✅ Filtres par client</li>
            <li>✅ Filtres par dates (début et fin)</li>
            <li>✅ Actions: Voir résultats, Tester questionnaire, Copier URL, Supprimer</li>
            <li>✅ Navigation intégrée dans l'administration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
