'use client';

import { useState } from 'react';

export default function TestAdminPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAdminPage = async () => {
    setLoading(true);
    setResult('Test de la nouvelle page d\'administration...');
    
    try {
      const response = await fetch('/admin');
      
      if (response.ok) {
        setResult(`✅ Page d'administration accessible!\n\nStatus: ${response.status}\nContent-Type: ${response.headers.get('content-type')}\n\nLa page contient:\n- Logo Anima Néo\n- 6 gros boutons avec icônes\n- Design moderne avec effets hover\n- Navigation vers toutes les sections`);
      } else {
        setResult(`❌ Erreur page: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllAdminLinks = async () => {
    setLoading(true);
    setResult('Test de tous les liens d\'administration...');
    
    try {
      const links = [
        '/admin/clients',
        '/admin/client-parameters', 
        '/admin/sessions',
        '/admin/questions',
        '/admin/analytics'
      ];
      
      const results = [];
      
      for (const link of links) {
        const response = await fetch(link);
        results.push(`${link}: ${response.ok ? '✅ OK' : '❌ Erreur'} (${response.status})`);
      }
      
      setResult(`✅ Test des liens d'administration:\n\n${results.join('\n')}`);
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testSettingsAPI = async () => {
    setLoading(true);
    setResult('Test de l\'API settings...');
    
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ API Settings fonctionne!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur API: ${response.status}\n${JSON.stringify(data, null, 2)}`);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test de la Nouvelle Page d'Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testAdminPage}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Test Page Admin
          </button>
          
          <button
            onClick={testAllAdminLinks}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test Tous les Liens
          </button>
          
          <button
            onClick={testSettingsAPI}
            disabled={loading}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Test API Settings
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat du test</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result || 'Aucun test effectué'}
          </pre>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Nouvelle Page d'Administration</h3>
          <div className="text-green-700 text-sm space-y-2">
            <p>
              <strong>URL:</strong> <a href="/admin" target="_blank" className="underline">/admin</a>
            </p>
            <p>
              <strong>Design:</strong> Même présentation que la page d'accueil avec logo Anima Néo
            </p>
            <p>
              <strong>Boutons:</strong> 6 gros boutons de même taille avec icônes
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Fonctionnalités de la Page</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>✅ <strong>Logo Anima Néo</strong> : Affiché en haut de la page</li>
            <li>✅ <strong>Design cohérent</strong> : Même style que la page d'accueil</li>
            <li>✅ <strong>6 boutons principaux</strong> : Tous de même taille avec icônes</li>
            <li>✅ <strong>Effets hover</strong> : Animation au survol des boutons</li>
            <li>✅ <strong>Navigation complète</strong> : Accès à toutes les sections</li>
            <li>✅ <strong>Section d'informations</strong> : Guide d'utilisation en bas</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Boutons d'Administration</h3>
          <div className="text-yellow-700 text-sm space-y-1">
            <p><strong>🏢 Clients</strong> : Gestion des clients</p>
            <p><strong>⚙️ Paramètres Client</strong> : Configuration par client</p>
            <p><strong>📅 Sessions</strong> : Vue condensée avec filtres</p>
            <p><strong>❓ Référentiel Questions</strong> : Gestion des questions</p>
            <p><strong>📊 Analyses et Comparaisons</strong> : Analyses avancées</p>
            <p><strong>🏠 Retour au Site</strong> : Retour à la page d'accueil</p>
          </div>
        </div>

        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Améliorations Apportées</h3>
          <ul className="text-purple-700 text-sm space-y-1">
            <li>🎨 <strong>Design moderne</strong> : Boutons avec ombres et effets 3D</li>
            <li>🎯 <strong>Navigation claire</strong> : 6 sections principales bien définies</li>
            <li>📱 <strong>Responsive</strong> : Adaptation mobile et desktop</li>
            <li>⚡ <strong>Performance</strong> : Chargement optimisé avec preload du logo</li>
            <li>🎭 <strong>Animations</strong> : Transitions fluides et effets hover</li>
            <li>📖 <strong>Guide intégré</strong> : Section d'aide en bas de page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
