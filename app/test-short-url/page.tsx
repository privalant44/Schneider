'use client';

import { useState } from 'react';

export default function TestShortUrlPage() {
  const [shortUrl, setShortUrl] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testShortUrl = async () => {
    if (!shortUrl.trim()) {
      setResult('❌ Veuillez entrer une URL courte');
      return;
    }

    setLoading(true);
    setResult('Test en cours...');
    
    try {
      const response = await fetch(`/api/short-url?shortUrl=${encodeURIComponent(shortUrl)}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Succès: Session trouvée\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const listAllSessions = async () => {
    setLoading(true);
    setResult('Récupération des sessions...');
    
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Sessions trouvées (${data.length}):\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestSession = async () => {
    setLoading(true);
    setResult('Création d\'une session de test...');
    
    try {
      // D'abord créer un client de test
      const clientResponse = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Client Test',
          description: 'Client créé pour les tests'
        })
      });

      if (!clientResponse.ok) {
        setResult(`❌ Erreur création client: ${await clientResponse.text()}`);
        setLoading(false);
        return;
      }

      const client = await clientResponse.json();

      // Ensuite créer une session de test
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          name: 'Session Test',
          description: 'Session créée pour les tests',
          start_date: new Date().toISOString(),
          is_active: true
        })
      });

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        setResult(`✅ Session de test créée:\n${JSON.stringify(session, null, 2)}\n\nURL courte: ${session.short_url}`);
        setShortUrl(session.short_url);
      } else {
        setResult(`❌ Erreur création session: ${await sessionResponse.text()}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test des URLs Courtes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={listAllSessions}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Lister toutes les sessions
          </button>
          
          <button
            onClick={createTestSession}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Créer session de test
          </button>
          
          <button
            onClick={testShortUrl}
            disabled={loading || !shortUrl.trim()}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Tester URL courte
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tester une URL courte
          </h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="Entrez l'URL courte (ex: abc12345)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
            />
            <button
              onClick={testShortUrl}
              disabled={loading || !shortUrl.trim()}
              className="px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue disabled:opacity-50"
            >
              Tester
            </button>
          </div>
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
            1. Cliquez sur "Lister toutes les sessions" pour voir les sessions existantes<br/>
            2. Cliquez sur "Créer session de test" pour créer une session de test<br/>
            3. Copiez l'URL courte générée et testez-la<br/>
            4. Si une erreur apparaît, copiez le message d'erreur pour le diagnostic
          </p>
        </div>
      </div>
    </div>
  );
}
