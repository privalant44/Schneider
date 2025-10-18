'use client';

import { useState } from 'react';

export default function TestRadarPage() {
  const [shortUrl, setShortUrl] = useState('K4XAEoby');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCompleteFlow = async () => {
    setLoading(true);
    setResult('Test du flux complet avec radar...');
    
    try {
      // Étape 1: Récupérer les données de session
      setResult('Étape 1: Récupération des données de session...');
      const sessionResponse = await fetch(`/api/short-url?shortUrl=${shortUrl}`);
      
      if (!sessionResponse.ok) {
        setResult(`❌ Erreur session: ${sessionResponse.status}`);
        setLoading(false);
        return;
      }
      
      const sessionData = await sessionResponse.json();
      console.log('Données de session:', sessionData);
      
      // Étape 2: Simuler la soumission
      setResult('Étape 2: Soumission du questionnaire...');
      const submitData = {
        session_id: sessionData.id,
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

      const profileResponse = await fetch('/api/respondent-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        // Étape 3: Tester l'API results
        setResult('Étape 3: Test de l\'API results...');
        const resultsResponse = await fetch(`/api/results?sessionId=${sessionData.id}`);
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          setResult(`✅ Succès complet!\n\nSession: ${sessionData.name}\nProfil créé: ${profileData.id}\n\nRésultats:\n${JSON.stringify(resultsData, null, 2)}\n\nURL de la page de résultats:\n/resultats?sessionId=${sessionData.id}`);
        } else {
          setResult(`❌ Erreur API results: ${resultsResponse.status}`);
        }
      } else {
        const errorData = await profileResponse.json();
        setResult(`❌ Erreur soumission: ${profileResponse.status}\n${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testResultsOnly = async () => {
    setLoading(true);
    setResult('Test de l\'API results...');
    
    try {
      const sessionResponse = await fetch(`/api/short-url?shortUrl=${shortUrl}`);
      const sessionData = await sessionResponse.json();
      
      const resultsResponse = await fetch(`/api/results?sessionId=${sessionData.id}`);
      const resultsData = await resultsResponse.json();
      
      if (resultsResponse.ok) {
        setResult(`✅ Résultats trouvés:\n${JSON.stringify(resultsData, null, 2)}\n\nURL de la page:\n/resultats?sessionId=${sessionData.id}`);
      } else {
        setResult(`❌ Erreur: ${resultsResponse.status}\n${JSON.stringify(resultsData, null, 2)}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test du Radar et des Jauges</h1>
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={testResultsOnly}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Tester Résultats
          </button>
          
          <button
            onClick={testCompleteFlow}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test Complet + Radar
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
              <strong>Questionnaire complet:</strong> <a href={`/questionnaire/${shortUrl}`} target="_blank" className="underline font-mono">/questionnaire/{shortUrl}</a>
            </p>
            <p>
              <strong>Page de résultats avec radar:</strong> <a href={`/resultats?sessionId=session_1760801667448_orhjixf07`} target="_blank" className="underline font-mono">/resultats?sessionId=session_1760801667448_orhjixf07</a>
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
          <p className="text-blue-700 text-sm">
            1. Cliquez sur "Tester Résultats" pour vérifier l'API results<br/>
            2. Cliquez sur "Test Complet + Radar" pour simuler une soumission complète<br/>
            3. Utilisez le questionnaire complet pour tester le flux réel<br/>
            4. La page de résultats affichera le radar et les jauges comme avant
          </p>
        </div>
      </div>
    </div>
  );
}
