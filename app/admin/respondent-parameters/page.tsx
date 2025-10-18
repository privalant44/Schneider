'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical, Settings } from 'lucide-react';
import { RespondentParameter } from '@/lib/types';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function RespondentParametersPage() {
  const [parameters, setParameters] = useState<RespondentParameter[]>([]);
  const [showParameterForm, setShowParameterForm] = useState(false);
  const [editingParameter, setEditingParameter] = useState<RespondentParameter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const response = await fetch('/api/respondent-parameters');
      const data = await response.json();
      setParameters(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveParameter = async (parameterData: Partial<RespondentParameter>) => {
    try {
      const url = '/api/respondent-parameters';
      const method = editingParameter ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parameterData,
          id: editingParameter?.id
        })
      });

      if (response.ok) {
        fetchParameters();
        setShowParameterForm(false);
        setEditingParameter(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du paramètre:', error);
    }
  };

  const handleDeleteParameter = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
      try {
        const response = await fetch(`/api/respondent-parameters?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchParameters();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du paramètre:', error);
      }
    }
  };

  const moveParameter = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = parameters.findIndex(p => p.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= parameters.length) return;

    const newParameters = [...parameters];
    [newParameters[currentIndex], newParameters[newIndex]] = [newParameters[newIndex], newParameters[currentIndex]];

    // Mettre à jour les ordres
    newParameters.forEach((param, index) => {
      param.order = index + 1;
    });

    setParameters(newParameters);

    // Sauvegarder les nouveaux ordres
    try {
      await Promise.all(newParameters.map(param => 
        fetch('/api/respondent-parameters', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: param.id,
            order: param.order
          })
        })
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des ordres:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
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
            Paramètres de Répondants
          </h1>
          <button
            onClick={() => {
              setEditingParameter(null);
              setShowParameterForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Paramètre
          </button>
        </div>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Paramètres de Répondants</h3>
              <p className="text-blue-700 text-sm">
                Configurez les informations que vous souhaitez collecter auprès des répondants 
                (division, domaine, tranche d'âge, sexe, ancienneté, etc.). Ces paramètres 
                permettront d'analyser plus finement les résultats du questionnaire.
              </p>
            </div>
          </div>
        </div>

        {/* Liste des paramètres */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Paramètres configurés ({parameters.length})
          </h2>
          
          {parameters.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun paramètre configuré</h3>
              <p className="text-gray-500 mb-4">
                Commencez par ajouter des paramètres pour collecter des informations sur vos répondants.
              </p>
              <button
                onClick={() => {
                  setEditingParameter(null);
                  setShowParameterForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Ajouter le premier paramètre
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {parameters.map((parameter, index) => (
                <div key={parameter.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveParameter(parameter.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <GripVertical className="w-4 h-4 rotate-90" />
                        </button>
                        <button
                          onClick={() => moveParameter(parameter.id, 'down')}
                          disabled={index === parameters.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <GripVertical className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">{parameter.name}</h3>
                          <span className="bg-anima-blue text-white px-2 py-1 rounded text-xs font-bold">
                            {parameter.order}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            parameter.required 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {parameter.required ? 'Requis' : 'Optionnel'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            parameter.type === 'text' 
                              ? 'bg-blue-100 text-blue-800'
                              : parameter.type === 'select'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {parameter.type === 'text' ? 'Texte' : 
                             parameter.type === 'select' ? 'Sélection' : 'Multi-sélection'}
                          </span>
                        </div>
                        
                        {parameter.options && parameter.options.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Options :</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parameter.options.map((option, idx) => (
                                <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingParameter(parameter);
                          setShowParameterForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteParameter(parameter.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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

        {/* Formulaire de paramètre */}
        {showParameterForm && (
          <ParameterForm
            parameter={editingParameter}
            onSave={handleSaveParameter}
            onCancel={() => {
              setShowParameterForm(false);
              setEditingParameter(null);
            }}
            maxOrder={parameters.length}
          />
        )}
      </div>
    </div>
  );
}

// Composant formulaire de paramètre
function ParameterForm({ 
  parameter, 
  onSave, 
  onCancel,
  maxOrder
}: { 
  parameter: RespondentParameter | null;
  onSave: (data: Partial<RespondentParameter>) => void;
  onCancel: () => void;
  maxOrder: number;
}) {
  const [formData, setFormData] = useState({
    name: parameter?.name || '',
    type: parameter?.type || 'text' as 'text' | 'select' | 'multiselect',
    options: parameter?.options || [] as string[],
    required: parameter?.required !== undefined ? parameter.required : false,
    order: parameter?.order || maxOrder + 1
  });

  const [newOption, setNewOption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {parameter ? 'Modifier le paramètre' : 'Nouveau paramètre'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du paramètre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
              placeholder="ex: Division, Domaine, Tranche d'âge..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de paramètre *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                type: e.target.value as 'text' | 'select' | 'multiselect',
                options: e.target.value === 'text' ? [] : formData.options
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
              required
            >
              <option value="text">Texte libre</option>
              <option value="select">Sélection unique</option>
              <option value="multiselect">Sélection multiple</option>
            </select>
          </div>

          {(formData.type === 'select' || formData.type === 'multiselect') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options disponibles
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                    placeholder="Ajouter une option..."
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-3 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.options.map((option, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                      >
                        {option}
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-800"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="w-4 h-4 text-anima-blue border-gray-300 rounded focus:ring-anima-blue"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700">
              Paramètre requis
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
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
              <Save className="w-5 h-5" />
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
