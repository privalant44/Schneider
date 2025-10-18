'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ResultsPage() {
  const [results, setResults] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId) {
      fetchResults(sessionId);
    } else {
      setError('ID de session manquant');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchResults = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/session-results?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setSession(data.session);
      } else {
        setError('Erreur lors du chargement des résultats');
      }
    } catch (error) {
      setError('Erreur lors du chargement des résultats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Aucun résultat</h2>
          <p className="text-gray-600 mb-4">Aucun résultat trouvé pour cette session.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-8">
            <Image
              src="/logo-anima-neo.svg"
              alt="Logo Anima"
              width={200}
              height={80}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Résultats du Questionnaire
          </h1>
          <p className="text-xl text-gray-600">
            {session?.name || 'Session de questionnaire'}
          </p>
        </div>

        {/* Statistiques générales */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistiques Générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-anima-blue mb-2">
                {results.total_responses}
              </div>
              <div className="text-gray-600">Réponses totales</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {session?.name || 'N/A'}
              </div>
              <div className="text-gray-600">Nom de la session</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {new Date(results.created_at).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-gray-600">Date de calcul</div>
            </div>
          </div>
        </div>

        {/* Distribution des cultures */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Distribution des Cultures</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.culture_distribution.map((culture: any, index: number) => (
              <div key={culture.culture} className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                     style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index] }}>
                  {culture.culture}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {culture.percentage}%
                </div>
                <div className="text-gray-600 mb-1">
                  {culture.count} réponse{culture.count > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">
                  {culture.culture === 'A' && 'Contrôle'}
                  {culture.culture === 'B' && 'Expertise'}
                  {culture.culture === 'C' && 'Collaboration'}
                  {culture.culture === 'D' && 'Cultivation'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par paramètres */}
        {results.respondent_breakdown && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Répartition des Répondants</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(results.respondent_breakdown).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 capitalize">
                    {key.replace('_', ' ')}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(value).map(([param, count]: [string, any]) => (
                      <div key={param} className="flex justify-between items-center">
                        <span className="text-gray-600">{param}</span>
                        <span className="font-semibold text-gray-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors mr-4"
          >
            Retour à l'accueil
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Imprimer les résultats
          </button>
        </div>
      </div>
    </div>
  );
}
