'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testResponsesApi = async () => {
    setLoading(true);
    setResult('Test en cours...');
    
    try {
      const testData = {
        sessionId: 'test_session_' + Date.now(),
        answers: [
          { questionId: 1, answer: 'A' },
          { questionId: 2, answer: 'B' },
          { questionId: 3, answer: 'C' }
        ]
      };

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Succès: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testResultsApi = async () => {
    setLoading(true);
    setResult('Test en cours...');
    
    try {
      const response = await fetch('/api/results?sessionId=test_session_123');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Succès: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testQuestionsApi = async () => {
    setLoading(true);
    setResult('Test en cours...');
    
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Succès: ${data.length} questions trouvées`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDebugApi = async () => {
    setLoading(true);
    setResult('Test en cours...');
    
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Diagnostic de la base de données:\n${JSON.stringify(data, null, 2)}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test des APIs</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={testDebugApi}
            disabled={loading}
            className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            Diagnostic DB
          </button>
          
          <button
            onClick={testQuestionsApi}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Test API Questions
          </button>
          
          <button
            onClick={testResponsesApi}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test API Responses
          </button>
          
          <button
            onClick={testResultsApi}
            disabled={loading}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Test API Results
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat du test</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {result || 'Aucun test effectué'}
          </pre>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
          <p className="text-yellow-700 text-sm">
            1. Cliquez sur "Test API Questions" pour vérifier que les questions se chargent<br/>
            2. Cliquez sur "Test API Responses" pour tester l'envoi de réponses<br/>
            3. Cliquez sur "Test API Results" pour tester la récupération des résultats<br/>
            4. Si une erreur apparaît, copiez le message d'erreur pour le diagnostic
          </p>
        </div>
      </div>
    </div>
  );
}
