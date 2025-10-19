'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, X, Calendar, Users, Link, Eye, Copy, BarChart3, QrCode } from 'lucide-react';
import { Client, QuestionnaireSession } from '@/lib/types';
import AdminNavigation from '@/app/components/AdminNavigation';
import CircularProgress from '@/app/components/CircularProgress';
import QRCodeDisplay from '@/app/components/QRCodeDisplay';

interface SessionWithStats extends QuestionnaireSession {
  client_name: string;
  response_count: number;
  status: string;
  start_date_formatted: string;
  end_date_formatted: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionWithStats | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    clientId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les clients
      const clientsResponse = await fetch('/api/clients');
      const clientsData = await clientsResponse.json();
      setClients(clientsData);
      
      // Récupérer les sessions avec filtres
      const params = new URLSearchParams();
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const sessionsResponse = await fetch(`/api/sessions-with-stats?${params.toString()}`);
      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Erreur lors de la suppression de la session');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la session');
    }
  };

  const handleCreateSession = async (sessionData: Partial<QuestionnaireSession>) => {
    try {
      const url = editingSession ? `/api/sessions/${editingSession.id}` : '/api/sessions';
      const method = editingSession ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        fetchData();
        setShowSessionForm(false);
        setEditingSession(null);
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la sauvegarde de la session: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
      alert('Erreur lors de la sauvegarde de la session');
    }
  };

  const copyShortUrl = (shortUrl: string) => {
    const fullUrl = `${window.location.origin}/questionnaire/${shortUrl}`;
    navigator.clipboard.writeText(fullUrl);
    alert('URL copiée dans le presse-papiers !');
  };

  const viewResults = (sessionId: string) => {
    window.open(`/resultats?sessionId=${sessionId}`, '_blank');
  };

  const showQRCodeModal = (shortUrl: string) => {
    const fullUrl = `${window.location.origin}/questionnaire/${shortUrl}`;
    setShowQRCode(fullUrl);
  };

  const editSession = (session: SessionWithStats) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const clearFilters = () => {
    setFilters({
      clientId: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Sessions</h1>
            <p className="text-gray-600 mt-2">
              {sessions.length} session{sessions.length > 1 ? 's' : ''} trouvée{sessions.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>
            
            <button
              onClick={() => setShowSessionForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Session
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filtres</h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
                Effacer
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <select
                  value={filters.clientId}
                  onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                >
                  <option value="">Tous les clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tableau des sessions */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date fin
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL courte
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.description}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'Actif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.client_name}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.start_date_formatted}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.end_date_formatted}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-3">
                        <CircularProgress 
                          value={session.response_count} 
                          max={session.planned_participants || 100}
                          size={32}
                          strokeWidth={3}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{session.response_count}</span>
                          <span className="text-xs text-gray-500">
                            {session.planned_participants ? `sur ${session.planned_participants}` : 'répondants'}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {session.short_url}
                        </code>
                        <button
                          onClick={() => copyShortUrl(session.short_url)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copier l'URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => showQRCodeModal(session.short_url)}
                          className="text-green-600 hover:text-green-800"
                          title="Afficher le QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editSession(session)}
                          className="text-green-600 hover:text-green-900"
                          title="Éditer la session"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => viewResults(session.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Voir les résultats"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => window.open(`/questionnaire/${session.short_url}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Tester le questionnaire"
                        >
                          <Link className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
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
          
          {sessions.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session trouvée</h3>
              <p className="text-gray-500">
                {Object.values(filters).some(f => f) 
                  ? 'Aucune session ne correspond aux filtres sélectionnés.'
                  : 'Créez votre première session de questionnaire.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de création de session */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingSession ? 'Modifier la Session' : 'Nouvelle Session'}
            </h2>
            <SessionForm
              clients={clients}
              session={editingSession}
              onSave={handleCreateSession}
              onCancel={() => {
                setShowSessionForm(false);
                setEditingSession(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">QR Code du Questionnaire</h3>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center">
              <QRCodeDisplay url={showQRCode} size={250} />
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">URL complète :</p>
                <code className="text-xs text-blue-600 break-all">{showQRCode}</code>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showQRCode);
                  alert('URL copiée dans le presse-papiers !');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copier l'URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant formulaire de session
function SessionForm({ 
  clients, 
  session,
  onSave, 
  onCancel 
}: { 
  clients: Client[]; 
  session?: SessionWithStats | null;
  onSave: (data: Partial<QuestionnaireSession>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    client_id: session?.client_id || '',
    name: session?.name || '',
    description: session?.description || '',
    start_date: session?.start_date || new Date().toISOString().split('T')[0],
    end_date: session?.end_date || '',
    is_active: session?.is_active ?? true,
    planned_participants: session?.planned_participants || undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.client_id && formData.name.trim()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client *
        </label>
        <select
          value={formData.client_id}
          onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          required
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de la session *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          placeholder="Ex: Questionnaire Q1 2024"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          rows={3}
          placeholder="Description de la session..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de début *
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de fin
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de participants prévus
        </label>
        <input
          type="number"
          value={formData.planned_participants || ''}
          onChange={(e) => setFormData({ ...formData, planned_participants: parseInt(e.target.value) || undefined })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          placeholder="Ex: 50"
          min="1"
        />
        <p className="text-sm text-gray-500 mt-1">
          Optionnel - utilisé pour la jauge de progression
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
          Session active (peut recevoir des réponses)
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Créer la session
        </button>
      </div>
    </form>
  );
}
