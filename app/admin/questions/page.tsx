'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { Question } from '@/lib/types';
import ImageUpload from '@/app/components/ImageUpload';
import Image from 'next/image';
import AdminNavigation from '@/app/components/AdminNavigation';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (questionData: Partial<Question>) => {
    try {
      const url = '/api/questions';
      const method = editingQuestion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questionData,
          id: editingQuestion?.id
        })
      });

      if (response.ok) {
        fetchQuestions();
        setShowQuestionForm(false);
        setEditingQuestion(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        const response = await fetch(`/api/questions?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchQuestions();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleCancelEdit = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
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
            <h1 className="text-3xl font-bold text-gray-800">Référentiel Questions</h1>
            <p className="text-gray-600 mt-2">
              {questions.length} question{questions.length > 1 ? 's' : ''} dans le référentiel
            </p>
          </div>
          
          <button
            onClick={() => setShowQuestionForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Question
          </button>
        </div>

        {/* Formulaire de création/édition de question */}
        {showQuestionForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <QuestionForm
              question={editingQuestion}
              onSave={handleSaveQuestion}
              onCancel={handleCancelEdit}
            />
          </div>
        )}

        {/* Liste des questions */}
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-anima-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                        Question {question.order_index}
                      </span>
                      {question.domaine && (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {question.domaine}
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-gray-800 mb-4">{question.question_text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options de réponse */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const textKey = `text_${letter.toLowerCase()}` as keyof Question;
                    const imageKey = `image_${letter.toLowerCase()}` as keyof Question;
                    const text = question[textKey] as string;
                    const imageUrl = question[imageKey] as string;
                    
                    return (
                      <div key={letter} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-6 h-6 bg-anima-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {letter}
                          </span>
                          <h5 className="font-semibold text-gray-800">Option {letter}</h5>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Texte :</p>
                            <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                              {text || 'Aucun texte défini'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Image :</p>
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={`Option ${letter}`}
                                width={100}
                                height={60}
                                className="border border-gray-200 rounded object-cover"
                              />
                            ) : (
                              <div className="bg-gray-100 rounded p-4 text-center text-gray-400">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                                <span className="text-xs">Aucune image</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Créée le {new Date(question.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune question dans le référentiel</h3>
            <p className="text-gray-500 mb-6">
              Commencez par créer votre première question pour construire votre référentiel.
            </p>
            <button
              onClick={() => setShowQuestionForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Créer la première question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant formulaire question
function QuestionForm({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question: Question | null; 
  onSave: (data: Partial<Question>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    text_a: question?.text_a || '',
    image_a: question?.image_a || '',
    text_b: question?.text_b || '',
    image_b: question?.image_b || '',
    text_c: question?.text_c || '',
    image_c: question?.image_c || '',
    text_d: question?.text_d || '',
    image_d: question?.image_d || '',
    order_index: question?.order_index || 1,
    domaine: question?.domaine || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.question_text.trim()) {
      onSave(formData);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texte de la question *
        </label>
        <textarea
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          rows={3}
          placeholder="Posez votre question ici..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Domaine *
        </label>
        <input
          type="text"
          value={formData.domaine}
          onChange={(e) => setFormData({ ...formData, domaine: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          placeholder="Ex: Organisation du travail, Communication, etc."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ordre d'affichage
        </label>
        <input
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
          min="1"
        />
      </div>

      {/* Options de réponse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Options de réponse
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['A', 'B', 'C', 'D'] as const).map((option) => {
            const textKey = `text_${option.toLowerCase()}` as keyof typeof formData;
            const imageKey = `image_${option.toLowerCase()}` as keyof typeof formData;
            const currentText = formData[textKey] as string;
            const currentImage = formData[imageKey] as string;
            
            return (
              <div key={option} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-anima-blue text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {option}
                  </span>
                  Option {option}
                </h4>
                
                <div className="space-y-4">
                  {/* Texte de l'option */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte de l'option {option} *
                    </label>
                    <textarea
                      value={currentText}
                      onChange={(e) => setFormData({ ...formData, [textKey]: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                      rows={2}
                      placeholder={`Décrivez l'option ${option}...`}
                      required
                    />
                  </div>
                  
                  {/* Image de l'option */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image de l'option {option}
                    </label>
                    <ImageUpload
                      value={currentImage}
                      onChange={(url) => setFormData({ ...formData, [imageKey]: url })}
                      placeholder={`Cliquez pour uploader une image pour l'option ${option}...`}
                    />
                    {currentImage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                        <Image
                          src={currentImage}
                          alt={`Aperçu option ${option}`}
                          width={120}
                          height={80}
                          className="border border-gray-200 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
          {question ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
