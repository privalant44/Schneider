'use client';

import { useState, useEffect } from 'react';
import { AnalysisAxis } from '@/lib/types';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function AnalysisAxesPage() {
  const [axes, setAxes] = useState<AnalysisAxis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAxis, setEditingAxis] = useState<AnalysisAxis | null>(null);

  useEffect(() => {
    fetchAxes();
  }, []);

  const fetchAxes = async () => {
    try {
      const response = await fetch('/api/analysis-axes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAxes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des axes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAxis = async (axisData: Partial<AnalysisAxis>) => {
    try {
      const url = '/api/analysis-axes';
      const method = editingAxis ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...axisData,
          id: editingAxis?.id
        })
      });

      if (response.ok) {
        fetchAxes();
        setShowForm(false);
        setEditingAxis(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'axe:', error);
    }
  };

  const handleDeleteAxis = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet axe d\'analyse ?')) {
      try {
        const response = await fetch(`/api/analysis-axes?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAxes();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'axe:', error);
      }
    }
  };

  const handleEditAxis = (axis: AnalysisAxis) => {
    setEditingAxis(axis);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingAxis(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Chargement des axes d'analyse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Axes d'Analyse par Défaut
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvel Axe
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Axes d'Analyse Disponibles ({axes.length})
          </h2>

          {axes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">Aucun axe d'analyse configuré.</p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Créer le premier axe
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {axes.map((axis) => (
                <div key={axis.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{axis.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          axis.category === 'organizational' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {axis.category === 'organizational' ? 'Organisationnel' : 'Démographique'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {axis.type === 'text' ? 'Texte libre' : 
                           axis.type === 'select' ? 'Choix unique' : 'Choix multiple'}
                        </span>
                        {axis.required && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Obligatoire
                          </span>
                        )}
                      </div>
                      {axis.options && axis.options.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Options :</p>
                          <div className="flex flex-wrap gap-1">
                            {axis.options.map((option, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditAxis(axis)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAxis(axis.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingAxis ? 'Modifier l\'Axe' : 'Nouvel Axe d\'Analyse'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <AxisForm
                axis={editingAxis}
                onSave={handleSaveAxis}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant formulaire pour les axes
function AxisForm({ 
  axis, 
  onSave, 
  onCancel 
}: { 
  axis: AnalysisAxis | null; 
  onSave: (data: Partial<AnalysisAxis>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: axis?.name || '',
    category: axis?.category || 'organizational',
    type: axis?.type || 'text',
    required: axis?.required || false,
    options: axis?.options || []
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'axe *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          placeholder="Ex: Direction, Équipe, Ancienneté..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as 'organizational' | 'demographic' })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
        >
          <option value="organizational">Organisationnel</option>
          <option value="demographic">Démographique</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de réponse
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'select' | 'multiselect' })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
        >
          <option value="text">Texte libre</option>
          <option value="select">Choix unique</option>
          <option value="multiselect">Choix multiple</option>
        </select>
      </div>

      {(formData.type === 'select' || formData.type === 'multiselect') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options de choix
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                placeholder="Ajouter une option..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
              />
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
              >
                Ajouter
              </button>
            </div>
            {formData.options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.options.map((option, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {option}
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          checked={formData.required}
          onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
          className="w-4 h-4 text-anima-blue border-gray-300 rounded focus:ring-anima-blue"
        />
        <label htmlFor="required" className="ml-2 text-sm text-gray-700">
          Réponse obligatoire
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
          className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
        >
          <Save className="w-4 h-4 inline mr-2" />
          {axis ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}