'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Users, Calendar, Building2 } from 'lucide-react';
import { QuestionnaireSession, SessionResults } from '@/lib/types';
import RadarChart from '@/app/components/RadarChart';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function SessionAnalysisPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<QuestionnaireSession | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      // Récupérer les données de la session
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setSession(sessionData);
      }

      // Récupérer les résultats consolidés
      const resultsResponse = await fetch(`/api/results?sessionId=${sessionId}`);
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setResults(resultsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse-session-${sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Chargement de l'analyse...</p>
      </div>
    );
  }

  if (!session || !results) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Session non trouvée ou aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Analyse Consolidée
              </h1>
              <p className="text-gray-600 mt-2">{session.name}</p>
            </div>
          </div>
          
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>

        {/* Informations de la session */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Informations de la Session
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-semibold text-gray-800">{session.client_id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Répondants</p>
                <p className="font-semibold text-gray-800">{results.total_responses}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Période</p>
                <p className="font-semibold text-gray-800">
                  {new Date(session.start_date).toLocaleDateString('fr-FR')}
                  {session.end_date && ` - ${new Date(session.end_date).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique radar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Distribution des Cultures
          </h2>
          
          <div className="flex justify-center">
            <RadarChart data={results.culture_distribution} />
          </div>
        </div>

        {/* Tableau détaillé */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Résultats Détaillés
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Culture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Réponses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pourcentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barre de progression
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.culture_distribution.map((culture) => (
                  <tr key={culture.culture} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                        culture.culture === 'A' ? 'bg-red-500' :
                        culture.culture === 'B' ? 'bg-yellow-500' :
                        culture.culture === 'C' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {culture.culture}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {culture.culture === 'A' ? 'Contrôle' :
                       culture.culture === 'B' ? 'Expertise' :
                       culture.culture === 'C' ? 'Collaboration' : 'Cultivation'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {culture.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {culture.percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            culture.culture === 'A' ? 'bg-red-500' :
                            culture.culture === 'B' ? 'bg-yellow-500' :
                            culture.culture === 'C' ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${culture.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
