'use client';

import { useState, useEffect } from 'react';
import { Database, Trash2, Eye, RefreshCw, AlertTriangle, Table, Download } from 'lucide-react';
import AdminNavigation from '@/app/components/AdminNavigation';

interface DatabaseStats {
  clients: number;
  sessions: number;
  questions: number;
  respondentProfiles: number;
  sessionResults: number;
  analysisAxes: number;
  clientSpecificAxes: number;
}

interface SessionData {
  id: string;
  name: string;
  client_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  short_url: string;
  created_at: string;
  response_count?: number;
}

export default function DatabasePage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showRawDataModal, setShowRawDataModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, sessionsResponse] = await Promise.all([
        fetch('/api/database/stats'),
        fetch('/api/sessions')
      ]);

      const statsData = await statsResponse.json();
      const sessionsData = await sessionsResponse.json();

      setStats(statsData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Recharger les données
        await fetchData();
        setShowDeleteModal(false);
        setSessionToDelete(null);
      } else {
        console.error('Erreur lors de la suppression de la session');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const confirmDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const handleViewRawData = async (table: string) => {
    try {
      const response = await fetch(`/api/database/raw?table=${table}`);
      const data = await response.json();
      setRawData(data);
      setSelectedTable(table);
      setShowRawDataModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des données brutes:', error);
    }
  };

  const downloadRawData = () => {
    if (!rawData) return;
    
    const dataStr = JSON.stringify(rawData.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rawData.table}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
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
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Base de Données</h1>
              <p className="text-gray-600">Visualisation et gestion des données</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.clients}</h3>
                  <p className="text-gray-600">Clients</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.sessions}</h3>
                  <p className="text-gray-600">Sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.questions}</h3>
                  <p className="text-gray-600">Questions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Database className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.respondentProfiles}</h3>
                  <p className="text-gray-600">Profils</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accès aux données brutes */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Données Brutes</h2>
            <p className="text-sm text-gray-500">Visualiser et télécharger les données de chaque table</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Clients', table: 'clients', icon: '👥', color: 'bg-blue-100 text-blue-600' },
              { name: 'Sessions', table: 'sessions', icon: '📅', color: 'bg-green-100 text-green-600' },
              { name: 'Questions', table: 'questions', icon: '❓', color: 'bg-purple-100 text-purple-600' },
              { name: 'Profils Répondants', table: 'respondent-profiles', icon: '👤', color: 'bg-orange-100 text-orange-600' },
              { name: 'Réponses Sessions', table: 'session-responses', icon: '💬', color: 'bg-cyan-100 text-cyan-600' },
              { name: 'Résultats Sessions', table: 'session-results', icon: '📊', color: 'bg-pink-100 text-pink-600' },
              { name: 'Axes d\'Analyse', table: 'analysis-axes', icon: '🎯', color: 'bg-indigo-100 text-indigo-600' },
              { name: 'Axes Spécifiques', table: 'client-specific-axes', icon: '⚙️', color: 'bg-gray-100 text-gray-600' },
              { name: 'Paramètres', table: 'settings', icon: '🔧', color: 'bg-yellow-100 text-yellow-600' }
            ].map((item) => (
              <button
                key={item.table}
                onClick={() => handleViewRawData(item.table)}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">Voir les données</p>
                </div>
                <Table className="w-5 h-5 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Table des sessions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Sessions</h2>
            <div className="text-sm text-gray-500">
              {sessions.length} session{sessions.length > 1 ? 's' : ''}
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune session</h3>
              <p className="text-gray-500">Aucune session n'a été créée pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réponses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{session.name}</div>
                        <div className="text-sm text-gray-500">ID: {session.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.client_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(session.start_date).toLocaleDateString('fr-FR')}</div>
                        <div className="text-gray-500">au {new Date(session.end_date).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {session.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.response_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSession(session.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(session.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Supprimer la session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Confirmer la suppression</h3>
                <p className="text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cette session ? 
              Toutes les données associées (réponses, profils, résultats) seront également supprimées.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des données brutes */}
      {showRawDataModal && rawData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Données brutes - {selectedTable}
                </h3>
                <p className="text-sm text-gray-500">
                  {rawData.count} enregistrement{rawData.count > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadRawData}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger JSON
                </button>
                <button
                  onClick={() => {
                    setShowRawDataModal(false);
                    setSelectedTable(null);
                    setRawData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
              <pre className="p-4 text-sm bg-gray-50 overflow-auto max-h-96">
                {JSON.stringify(rawData.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
