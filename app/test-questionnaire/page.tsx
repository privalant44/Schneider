'use client';

import { useState } from 'react';

export default function TestQuestionnairePage() {
  const [shortUrl, setShortUrl] = useState('JQ56nkzT');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testQuestionnaireSubmission = async () => {
    setLoading(true);
    setResult('Test en cours...');
    
    try {
      // Simuler les données d'un questionnaire complet
      const testData = {
        session_id: 'session_1760801222375_h6e4qv2dy', // ID de session fixe pour le test
        division: 'IT',
        domain: 'Développement',
        age_range: '25-35',
        gender: 'M',
        seniority: '3-5 ans',
        position: 'Développeur',
        department: 'R&D',
        answers: [
          { questionId: 1, answer: 'A' },
          { questionId: 2, answer: 'B' },
          { questionId: 3, answer: 'C' },
          { questionId: 4, answer: 'D' },
          { questionId: 5, answer: 'A' }
        ]
      };

      console.log('Données de test envoyées:', testData);

      const response = await fetch('/api/respondent-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setResult(`✅ Succès: Profil créé\n${JSON.stringify(responseData, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(responseData, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testShortUrl = async () => {
    setLoading(true);
    setResult('Test de l\'URL courte...');
    
    try {
      const response = await fetch(`/api/short-url?shortUrl=${shortUrl}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ URL courte valide:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getSessionId = async () => {
    setLoading(true);
    setResult('Récupération de l\'ID de session...');
    
    try {
      const response = await fetch(`/api/short-url?shortUrl=${shortUrl}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ ID de session: ${data.sessionId}\n\nDonnées complètes:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test de Soumission de Questionnaire</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Configuration du test
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL courte à tester:
            </label>
            <input
              type="text"
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
              placeholder="Entrez l'URL courte"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testShortUrl}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Tester URL courte
          </button>
          
          <button
            onClick={getSessionId}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Récupérer ID session
          </button>
          
          <button
            onClick={testQuestionnaireSubmission}
            disabled={loading}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Tester soumission
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat du test</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result || 'Aucun test effectué'}
          </pre>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
          <p className="text-yellow-700 text-sm">
            1. Cliquez sur "Tester URL courte" pour vérifier que l'URL fonctionne<br/>
            2. Cliquez sur "Récupérer ID session" pour voir l'ID de session<br/>
            3. Cliquez sur "Tester soumission" pour simuler une soumission complète<br/>
            4. Vérifiez les logs du serveur pour voir les détails
          </p>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">URL de test</h3>
          <p className="text-blue-700 text-sm">
            Questionnaire complet: <a href={`/questionnaire/${shortUrl}`} target="_blank" className="underline">/questionnaire/{shortUrl}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
