'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Calendar, Building2, Brain, ArrowRight } from 'lucide-react';
import { QuestionnaireSession, Client, SessionResults, SessionComparison } from '@/lib/types';
import RadarChart from '@/app/components/RadarChart';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<QuestionnaireSession[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessionResults, setSessionResults] = useState<SessionResults[]>([]);
  const [selectedSession1, setSelectedSession1] = useState<string>('');
  const [selectedSession2, setSelectedSession2] = useState<string>('');
  const [comparison, setComparison] = useState<SessionComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsResponse, clientsResponse, resultsResponse] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/clients'),
        fetch('/api/session-comparisons')
      ]);

      const sessionsData = await sessionsResponse.json();
      const clientsData = await clientsResponse.json();
      const resultsData = await resultsResponse.json();

      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setSessionResults(Array.isArray(resultsData) ? resultsData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, initialiser avec des tableaux vides
      setSessions([]);
      setClients([]);
      setSessionResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSessions = async () => {
    if (!selectedSession1 || !selectedSession2) {
      alert('Veuillez sélectionner deux sessions à comparer');
      return;
    }

    if (selectedSession1 === selectedSession2) {
      alert('Veuillez sélectionner deux sessions différentes');
      return;
    }

    try {
      const response = await fetch(`/api/session-comparisons?session1Id=${selectedSession1}&session2Id=${selectedSession2}`);
      const comparisonData = await response.json();
      setComparison(comparisonData);
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  const getSessionName = (sessionId: string) => {
    const session = sessions?.find(s => s.id === sessionId);
    return session?.name || 'Session inconnue';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
      </div>
    );
  }

  // Vérification de sécurité pour éviter les erreurs
  if (!sessions || !clients || !sessionResults || 
      !Array.isArray(sessions) || !Array.isArray(clients) || !Array.isArray(sessionResults)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Analyses et Comparaisons
          </h1>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{clients?.length || 0}</h3>
                <p className="text-gray-600">Clients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{sessions?.length || 0}</h3>
                <p className="text-gray-600">Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {sessionResults && sessionResults.length > 0 ? sessionResults.reduce((sum, result) => sum + result.total_responses, 0) : 0}
                </h3>
                <p className="text-gray-600">Réponses totales</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{sessionResults?.length || 0}</h3>
                <p className="text-gray-600">Sessions analysées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analyse IA ChatGPT */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 mb-8 border border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Analyse Intelligente par IA
                </h2>
                <p className="text-gray-600">
                  Obtenez des insights avancés et des recommandations personnalisées
                </p>
              </div>
            </div>
            <a
              href="/admin/analytics/comparison"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Brain className="w-5 h-5" />
              Accéder à l'Analyse IA
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">📊 Analyse Comparative</h3>
              <p className="text-sm text-gray-600">
                Comparez deux sessions et obtenez une analyse détaillée de l'évolution de votre culture organisationnelle.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">📈 Analyse des Tendances</h3>
              <p className="text-sm text-gray-600">
                Découvrez les tendances et prédictions pour anticiper les évolutions de votre organisation.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">🎯 Recommandations</h3>
              <p className="text-sm text-gray-600">
                Recevez des recommandations stratégiques personnalisées pour améliorer votre culture.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">
                Powered by ChatGPT - Analyses intelligentes et recommandations actionables
              </span>
            </div>
          </div>
        </div>

        {/* Comparaison de sessions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Comparaison entre Sessions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Première session
              </label>
              <select
                value={selectedSession1}
                onChange={(e) => setSelectedSession1(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
              >
                <option value="">Sélectionner une session</option>
                {sessions?.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} - {getClientName(session.client_id)} ({new Date(session.start_date).toLocaleDateString('fr-FR')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deuxième session
              </label>
              <select
                value={selectedSession2}
                onChange={(e) => setSelectedSession2(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
              >
                <option value="">Sélectionner une session</option>
                {sessions?.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} - {getClientName(session.client_id)} ({new Date(session.start_date).toLocaleDateString('fr-FR')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCompareSessions}
            disabled={!selectedSession1 || !selectedSession2}
            className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BarChart3 className="w-5 h-5" />
            Comparer les sessions
          </button>

          {/* Résultats de la comparaison */}
          {comparison && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Résultats de la comparaison
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Évolution des cultures</h4>
                  <div className="space-y-2">
                    {comparison.evolution.map((evo) => (
                      <div key={evo.culture} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="font-medium">
                          {evo.culture === 'A' ? 'Contrôle' : 
                           evo.culture === 'B' ? 'Expertise' :
                           evo.culture === 'C' ? 'Collaboration' : 'Cultivation'}
                        </span>
                        <div className="flex items-center gap-2">
                          {evo.change_direction === 'increase' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {evo.change_direction === 'decrease' && <TrendingDown className="w-4 h-4 text-red-600" />}
                          <span className={`font-medium ${
                            evo.change_direction === 'increase' ? 'text-green-600' :
                            evo.change_direction === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {evo.change_percentage > 0 ? '+' : ''}{evo.change_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Évolution générale</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span>Total des réponses</span>
                      <span className={`font-medium ${
                        comparison.total_evolution.total_responses_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {comparison.total_evolution.total_responses_change > 0 ? '+' : ''}
                        {comparison.total_evolution.total_responses_change}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span>Taux de réponse</span>
                      <span className={`font-medium ${
                        comparison.total_evolution.response_rate_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {comparison.total_evolution.response_rate_change > 0 ? '+' : ''}
                        {comparison.total_evolution.response_rate_change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Résultats par session */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Résultats par Session
          </h2>
          
          {!sessionResults || sessionResults.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun résultat disponible</h3>
              <p className="text-gray-500">
                Les résultats apparaîtront ici une fois que des questionnaires auront été soumis.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sessionResults?.map((result) => {
                const session = sessions?.find(s => s.id === result.session_id);
                const client = session ? clients?.find(c => c.id === session.client_id) : null;
                
                return (
                  <div key={result.session_id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {session?.name || 'Session inconnue'}
                        </h3>
                        <p className="text-gray-600">
                          {client?.name || 'Client inconnu'} • {result.total_responses} réponses
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(result.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {/* Graphique radar */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Distribution des cultures</h4>
                      <div className="flex justify-center">
                        <RadarChart results={result.culture_distribution} />
                      </div>
                    </div>

                    {/* Détails des cultures */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {result.culture_distribution.map((culture) => (
                        <div key={culture.culture} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {culture.percentage}%
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {culture.culture === 'A' ? 'Contrôle' : 
                             culture.culture === 'B' ? 'Expertise' :
                             culture.culture === 'C' ? 'Collaboration' : 'Cultivation'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {culture.count} réponse{culture.count > 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Répartition par paramètres de répondants */}
                    {Object.keys(result.respondent_breakdown).some(key => {
                      const breakdown = result.respondent_breakdown[key as keyof typeof result.respondent_breakdown];
                      return breakdown && typeof breakdown === 'object' && Object.keys(breakdown).length > 0;
                    }) && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-3">Répartition des répondants</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(result.respondent_breakdown).map(([key, values]) => {
                            if (Object.keys(values).length === 0) return null;
                            
                            return (
                              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-medium text-gray-700 mb-2 capitalize">
                                  {key.replace('_', ' ')}
                                </h5>
                                <div className="space-y-1">
                                  {Object.entries(values).map(([value, count]) => (
                                    <div key={value} className="flex justify-between text-sm">
                                      <span className="text-gray-600">{value}</span>
                                      <span className="font-medium">{count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
