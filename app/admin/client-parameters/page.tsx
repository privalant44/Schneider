'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2, Users, Settings } from 'lucide-react';
import { Client, RespondentParameter } from '@/lib/types';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function ClientParametersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [parameters, setParameters] = useState<RespondentParameter[]>([]);
  const [showParameterForm, setShowParameterForm] = useState(false);
  const [editingParameter, setEditingParameter] = useState<RespondentParameter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchParameters(selectedClient.id);
    } else {
      setParameters([]);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
      if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParameters = async (clientId: string) => {
    try {
      const response = await fetch(`/api/respondent-parameters?clientId=${clientId}`);
      const data = await response.json();
      setParameters(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const handleSaveParameter = async (parameterData: Partial<RespondentParameter>) => {
    if (!selectedClient) return;

    try {
      const url = '/api/respondent-parameters';
      const method = editingParameter ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parameterData,
          client_id: selectedClient.id,
          id: editingParameter?.id
        })
      });

      if (response.ok) {
        fetchParameters(selectedClient.id);
        setShowParameterForm(false);
        setEditingParameter(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDeleteParameter = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
      try {
        const response = await fetch(`/api/respondent-parameters?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok && selectedClient) {
          fetchParameters(selectedClient.id);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleEditParameter = (parameter: RespondentParameter) => {
    setEditingParameter(parameter);
    setShowParameterForm(true);
  };

  const handleCancelEdit = () => {
    setShowParameterForm(false);
    setEditingParameter(null);
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
            <h1 className="text-3xl font-bold text-gray-800">Paramètres par Client</h1>
            <p className="text-gray-600 mt-2">
              Configurez les paramètres de répondants spécifiques à chaque client
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sélection du client */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Clients
              </h2>
              
              <div className="space-y-2">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedClient?.id === client.id
                        ? 'bg-anima-blue text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm opacity-75">{client.industry}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gestion des paramètres */}
          <div className="lg:col-span-3">
            {selectedClient ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Paramètres pour {selectedClient.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {parameters.length} paramètre{parameters.length > 1 ? 's' : ''} configuré{parameters.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowParameterForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nouveau Paramètre
                  </button>
                </div>

                {/* Formulaire de création/édition */}
                {showParameterForm && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {editingParameter ? 'Modifier le paramètre' : 'Nouveau paramètre'}
                      </h3>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <ParameterForm
                      parameter={editingParameter}
                      onSave={handleSaveParameter}
                      onCancel={handleCancelEdit}
                    />
                  </div>
                )}

                {/* Liste des paramètres */}
                <div className="space-y-4">
                  {parameters.map((parameter) => (
                    <div key={parameter.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{parameter.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              parameter.required 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {parameter.required ? 'Requis' : 'Optionnel'}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {parameter.type}
                            </span>
                          </div>
                          
                          {parameter.options && parameter.options.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <strong>Options:</strong> {parameter.options.join(', ')}
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-500 mt-2">
                            Ordre: {parameter.order} • Créé le {new Date(parameter.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditParameter(parameter)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteParameter(parameter.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {parameters.length === 0 && (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paramètre configuré</h3>
                    <p className="text-gray-500 mb-4">
                      Configurez les paramètres de répondants spécifiques à ce client.
                    </p>
                    <button
                      onClick={() => setShowParameterForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Créer le premier paramètre
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client sélectionné</h3>
                <p className="text-gray-500">
                  Sélectionnez un client pour configurer ses paramètres de répondants.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant formulaire paramètre
function ParameterForm({ 
  parameter, 
  onSave, 
  onCancel 
}: { 
  parameter: RespondentParameter | null; 
  onSave: (data: Partial<RespondentParameter>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: parameter?.name || '',
    type: parameter?.type || 'text' as 'text' | 'select' | 'multiselect',
    options: parameter?.options || [],
    required: parameter?.required || false,
    order: parameter?.order || 1
  });

  const [newOption, setNewOption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du paramètre *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
            placeholder="Ex: Division, Domaine, Âge..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de paramètre
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'select' | 'multiselect' })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          >
            <option value="text">Texte libre</option>
            <option value="select">Sélection unique</option>
            <option value="multiselect">Sélection multiple</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordre d'affichage
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
            min="1"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="w-4 h-4 text-anima-blue border-gray-300 rounded focus:ring-anima-blue"
            />
            <span className="text-sm font-medium text-gray-700">Paramètre requis</span>
          </label>
        </div>
      </div>

      {(formData.type === 'select' || formData.type === 'multiselect') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options disponibles
          </label>
          
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 p-2 bg-gray-100 rounded">{option}</span>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Nouvelle option..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
              />
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

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
          className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
        >
          <Save className="w-4 h-4" />
          {parameter ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
