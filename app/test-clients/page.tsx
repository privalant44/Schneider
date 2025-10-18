'use client';

import { useState } from 'react';

export default function TestClientsPage() {
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

  const createTestClient = async () => {
    setLoading(true);
    setResult('Création d\'un client de test...');
    
    try {
      const testClient = {
        name: `Client Test ${new Date().toLocaleTimeString()}`,
        description: 'Client créé automatiquement pour les tests',
        industry: 'Technologie',
        logo: ''
      };

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testClient)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Client créé avec succès!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur création: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testClientPage = async () => {
    setLoading(true);
    setResult('Test de la page des clients...');
    
    try {
      const response = await fetch('/admin/clients');
      
      if (response.ok) {
        setResult(`✅ Page des clients accessible!\n\nStatus: ${response.status}\nContent-Type: ${response.headers.get('content-type')}`);
      } else {
        setResult(`❌ Erreur page: ${response.status}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test de la Page Clients</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testClientsAPI}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Test API Clients
          </button>
          
          <button
            onClick={createTestClient}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Créer Client Test
          </button>
          
          <button
            onClick={testClientPage}
            disabled={loading}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Test Page Clients
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
              <strong>Page des clients:</strong> <a href="/admin/clients" target="_blank" className="underline">/admin/clients</a>
            </p>
            <p>
              <strong>API clients:</strong> <a href="/api/clients" target="_blank" className="underline">/api/clients</a>
            </p>
            <p>
              <strong>Page des sessions:</strong> <a href="/admin/sessions" target="_blank" className="underline">/admin/sessions</a>
            </p>
            <p>
              <strong>Administration:</strong> <a href="/admin" target="_blank" className="underline">/admin</a>
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Modifications apportées</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>✅ Suppression de la section sessions de la page clients</li>
            <li>✅ Suppression du bouton "Nouvelle Session"</li>
            <li>✅ Interface simplifiée focalisée sur la gestion des clients</li>
            <li>✅ Affichage en grille des cartes clients</li>
            <li>✅ Formulaire de création/édition intégré</li>
            <li>✅ Actions: Modifier et Supprimer par client</li>
            <li>✅ Gestion des sessions déplacée vers /admin/sessions</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Séparation des responsabilités</h3>
          <div className="text-yellow-700 text-sm space-y-1">
            <p><strong>/admin/clients</strong> : Gestion des clients uniquement</p>
            <p><strong>/admin/sessions</strong> : Gestion des sessions avec filtres et statistiques</p>
            <p><strong>Navigation claire</strong> : Chaque page a un objectif spécifique</p>
          </div>
        </div>
      </div>
    </div>
  );
}
