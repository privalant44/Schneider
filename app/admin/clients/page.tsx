'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2 } from 'lucide-react';
import { Client } from '@/lib/types';
import ImageUpload from '@/app/components/ImageUpload';
import Image from 'next/image';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      const url = '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientData,
          id: editingClient?.id
        })
      });

      if (response.ok) {
        fetchClients();
        setShowClientForm(false);
        setEditingClient(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ? Toutes ses sessions seront également supprimées.')) {
      try {
        const response = await fetch(`/api/clients?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchClients();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
      }
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleCancelEdit = () => {
    setShowClientForm(false);
    setEditingClient(null);
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
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Clients</h1>
            <p className="text-gray-600 mt-2">
              {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => setShowClientForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Client
          </button>
        </div>

        {/* Formulaire de création/édition de client */}
        {showClientForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <ClientForm
              client={editingClient}
              onSave={handleSaveClient}
              onCancel={handleCancelEdit}
            />
          </div>
        )}

        {/* Liste des clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-anima-blue rounded-lg flex items-center justify-center">
                    {client.logo ? (
                      <Image
                        src={client.logo}
                        alt={client.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.industry}</p>
                  </div>
                </div>

                {client.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {client.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Créé le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client enregistré</h3>
            <p className="text-gray-500 mb-6">
              Commencez par créer votre premier client pour organiser vos questionnaires.
            </p>
            <button
              onClick={() => setShowClientForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Créer le premier client
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant formulaire client
function ClientForm({ 
  client, 
  onSave, 
  onCancel 
}: { 
  client: Client | null; 
  onSave: (data: Partial<Client>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    description: client?.description || '',
    industry: client?.industry || '',
    logo: client?.logo || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, logo: url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du client *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
            placeholder="Nom de l'entreprise"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secteur d'activité
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
            placeholder="Ex: Technologie, Finance, Santé..."
          />
        </div>
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
          placeholder="Description du client et de ses besoins..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo
        </label>
        <ImageUpload
          onImageUpload={handleImageUpload}
          currentImage={formData.logo}
        />
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
          className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
        >
          <Save className="w-4 h-4" />
          {client ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}