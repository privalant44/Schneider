'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Settings, Building2, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { AnalysisAxis } from '@/lib/types';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function AnalysisAxesPage() {
  const [axes, setAxes] = useState<AnalysisAxis[]>([]);
  const [showAxisForm, setShowAxisForm] = useState(false);
  const [editingAxis, setEditingAxis] = useState<AnalysisAxis | null>(null);
  const [newAxisData, setNewAxisData] = useState<Partial<AnalysisAxis>>({
    name: '',
    type: 'text',
    options: [],
    required: false,
    order: 0,
    category: 'organizational',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAxes();
  }, []);

  const fetchAxes = async () => {
    try {
      const response = await fetch('/api/analysis-axes');
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
        setShowAxisForm(false);
        setEditingAxis(null);
        setNewAxisData({ name: '', type: 'text', options: [], required: false, order: 0, category: 'organizational' });
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la sauvegarde de l'axe: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l'axe:', error);
      alert('Erreur lors de la sauvegarde de l'axe.');
    }
  };

  const handleDeleteAxis = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet axe ? Il sera retiré de tous les clients qui l\'utilisent.')) {
      try {
        const response = await fetch(`/api/analysis-axes?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAxes();
        } else {
          console.error('Erreur lors de la suppression de l\'axe:', await response.json());
          alert('Erreur lors de la suppression de l\'axe.');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'axe:', error);
        alert('Erreur lors de la suppression de l\'axe.');
      }
    }
  };

  const startEditAxis = (axis: AnalysisAxis) => {
    setEditingAxis(axis);
    setNewAxisData(axis);
    setShowAxisForm(true);
  };

  const handleAddOption = () => {
    setNewAxisData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewAxisData(prev => {
      const newOptions = [...(prev.options || [])];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleRemoveOption = (index: number) => {
    setNewAxisData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
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
        <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
          <Settings className="w-10 h-10 mr-3 text-blue-600" />
          Axes d'Analyse par Défaut
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">Axes d'Analyse Disponibles</h2>
              <p className="text-gray-600 mt-2">
                Configurez les axes d'analyse par défaut qui seront disponibles pour tous les clients.
                Les clients pourront ensuite choisir quels axes activer pour leurs questionnaires.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAxis(null);
                setNewAxisData({ 
                  name: '', 
                  type: 'text', 
                  options: [], 
                  required: false, 
                  order: axes.length + 1,
                  category: 'organizational'
                });
                setShowAxisForm(true);
              }}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un Axe
            </button>
          </div>

          {axes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg mb-4">Aucun axe d'analyse configuré pour le moment.</p>
              <button
                onClick={() => {
                  setEditingAxis(null);
                  setNewAxisData({ 
                    name: '', 
                    type: 'text', 
                    options: [], 
                    required: false, 
                    order: 1,
                    category: 'organizational'
                  });
                  setShowAxisForm(true);
                }}
                className="flex items-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter le premier Axe
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {axes
                .sort((a, b) => a.order - b.order)
                .map((axis) => (
                  <div key={axis.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {axis.order}
                          </span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{axis.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
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
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">Options :</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {axis.options.map((option, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      {option}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditAxis(axis)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAxis(axis.id)}
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
          )}
        </div>

        {showAxisForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingAxis ? 'Modifier l\'Axe d\'Analyse' : 'Ajouter un Nouvel Axe d\'Analyse'}
              </h2>
              <AxisForm
                axis={editingAxis}
                onSave={handleSaveAxis}
                onCancel={() => setShowAxisForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
    type: axis?.type || 'text',
    options: axis?.options || [],
    required: axis?.required || false,
    order: axis?.order || 1,
    category: axis?.category || 'organizational'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
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
          placeholder="Ex: Direction, Entité, Âge, Ancienneté..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie *
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as 'organizational' | 'demographic' })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
        >
          <option value="organizational">Organisationnel (Direction, Entité, Domaine, Équipe)</option>
          <option value="demographic">Démographique (Sexe, Âge, Ancienneté, etc.)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de réponse *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'select' | 'multiselect', options: e.target.value === 'text' ? [] : formData.options })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
        >
          <option value="text">Texte libre</option>
          <option value="select">Liste de sélection (choix unique)</option>
          <option value="multiselect">Liste de sélection (choix multiple)</option>
        </select>
      </div>

      {(formData.type === 'select' || formData.type === 'multiselect') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une option
            </button>
          </div>
        </div>
      )}

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
        <input
          type="checkbox"
          id="required"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={formData.required}
          onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
        />
        <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
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
          className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {axis ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
