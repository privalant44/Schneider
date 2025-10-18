'use client';

import { useState } from 'react';

export default function TestSubmissionPage() {
  const [shortUrl, setShortUrl] = useState('wCQVI6Va');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCompleteFlow = async () => {
    setLoading(true);
    setResult('Test du flux complet...');
    
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
        setResult(`✅ Succès complet!\n\nSession: ${sessionData.name}\nProfil créé: ${profileData.id}\n\nDonnées complètes:\n${JSON.stringify(profileData, null, 2)}`);
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

  const testSessionOnly = async () => {
    setLoading(true);
    setResult('Test de la session...');
    
    try {
      const response = await fetch(`/api/short-url?shortUrl=${shortUrl}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Session trouvée:\nID: ${data.id}\nNom: ${data.name}\nActif: ${data.isActive}\n\nDonnées complètes:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur: ${response.status}\n${JSON.stringify(data, null, 2)}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test de Soumission Complète</h1>
        
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
            onClick={testSessionOnly}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Tester Session
          </button>
          
          <button
            onClick={testCompleteFlow}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test Complet
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat du test</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result || 'Aucun test effectué'}
          </pre>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">URL de test</h3>
          <p className="text-green-700 text-sm">
            Questionnaire complet: <a href={`/questionnaire/${shortUrl}`} target="_blank" className="underline font-mono">/questionnaire/{shortUrl}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
