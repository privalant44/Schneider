'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, User, Building2, Calendar } from 'lucide-react';
import { Question, RandomizedOption, RespondentParameter, QuestionnaireSession, Client } from '@/lib/types';

export default function QuestionnaireShortUrlPage({ params }: { params: { shortUrl: string } }) {
  const [session, setSession] = useState<QuestionnaireSession | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [parameters, setParameters] = useState<RespondentParameter[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [respondentData, setRespondentData] = useState<Record<string, string | string[]>>({});
  const [randomizedOptions, setRandomizedOptions] = useState<Record<number, RandomizedOption[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (params.shortUrl) {
      fetchSessionData();
    }
  }, [params.shortUrl]);

  const fetchSessionData = async () => {
    try {
      // Récupérer les informations de la session
      const sessionResponse = await fetch(`/api/short-url?shortUrl=${params.shortUrl}`);
      if (!sessionResponse.ok) {
        setError('Session non trouvée ou expirée');
        setLoading(false);
        return;
      }
      
      const sessionData = await sessionResponse.json();
      console.log('Données de session reçues:', sessionData);
      setSession(sessionData);

      // Vérifier si la session est active
      if (!sessionData.isActive) {
        setError('Cette session de questionnaire n\'est plus active');
        setLoading(false);
        return;
      }

      // Vérifier les dates
      const now = new Date();
      const startDate = new Date(sessionData.startDate);
      const endDate = sessionData.endDate ? new Date(sessionData.endDate) : null;

      if (now < startDate) {
        setError('Cette session de questionnaire n\'a pas encore commencé');
        setLoading(false);
        return;
      }

      if (endDate && now > endDate) {
        setError('Cette session de questionnaire est terminée');
        setLoading(false);
        return;
      }

      // Récupérer les données du client
      const clientResponse = await fetch(`/api/clients`);
      const clients = await clientResponse.json();
      const clientData = clients.find((c: Client) => c.id === sessionData.clientId);
      setClient(clientData);

      // Récupérer les questions
      const questionsResponse = await fetch('/api/questions');
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData);

      // Récupérer les paramètres de répondants
      const parametersResponse = await fetch('/api/respondent-parameters');
      const parametersData = await parametersResponse.json();
      setParameters(parametersData);

      // Randomiser les options pour chaque question
      const randomized: Record<number, RandomizedOption[]> = {};
      questionsData.forEach((question: Question) => {
        randomized[question.id] = randomizeOptions(question);
      });
      setRandomizedOptions(randomized);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement du questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const randomizeOptions = (question: Question): RandomizedOption[] => {
    const options: RandomizedOption[] = [
      { id: 'option-1', imageUrl: question.image_a, text: question.text_a, originalLetter: 'A' },
      { id: 'option-2', imageUrl: question.image_b, text: question.text_b, originalLetter: 'B' },
      { id: 'option-3', imageUrl: question.image_c, text: question.text_c, originalLetter: 'C' },
      { id: 'option-4', imageUrl: question.image_d, text: question.text_d, originalLetter: 'D' }
    ];
    
    // Mélanger l'ordre des options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  };

  const handleAnswerSelect = (originalLetter: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: originalLetter
    }));
  };

  const handleParameterChange = (parameterId: string, value: string | string[]) => {
    setRespondentData(prev => ({
      ...prev,
      [parameterId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!session?.id) {
        console.error('Session ID manquant:', session);
        alert('Erreur: Session non trouvée. Veuillez réessayer.');
        setSubmitting(false);
        return;
      }

      const submitData = {
        session_id: session.id,
        ...respondentData,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          answer
        }))
      };

      console.log('Données envoyées:', submitData);

      // Créer le profil de répondant
      const profileResponse = await fetch('/api/respondent-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (profileResponse.ok) {
        alert('Questionnaire soumis avec succès ! Merci pour votre participation.');
        router.push(`/resultats?sessionId=${session.id}`);
      } else {
        const errorData = await profileResponse.json();
        console.error('Erreur lors de la soumission:', profileResponse.status, errorData);
        alert(`Erreur lors de la soumission du questionnaire: ${errorData.error || 'Erreur inconnue'}. Veuillez réessayer.`);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission du questionnaire. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return currentQuestion && answers[currentQuestion.id] !== undefined;
  };

  const getProgressPercentage = () => {
    const totalSteps = parameters.length + questions.length;
    const currentStep = parameters.length + currentQuestionIndex + 1;
    return (currentStep / totalSteps) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!session || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Session non trouvée</h2>
          <p className="text-gray-600 mb-4">Cette session de questionnaire n'existe pas.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = Object.keys(answers).length === questions.length;
  const allRequiredParametersFilled = parameters
    .filter(p => p.required)
    .every(p => respondentData[p.id] && (Array.isArray(respondentData[p.id]) ? (respondentData[p.id] as string[]).length > 0 : true));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec informations de la session */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à l'accueil
            </button>
            <div className="text-sm text-gray-600">
              {currentQuestionIndex < parameters.length 
                ? `Étape ${currentQuestionIndex + 1} sur ${parameters.length + questions.length}`
                : `Question ${currentQuestionIndex - parameters.length + 1} sur ${questions.length}`
              }
            </div>
          </div>
          
          {/* Informations de la session */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {client.logo && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{session.name}</h1>
                <p className="text-gray-600">{client.name}</p>
                {session.description && (
                  <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                )}
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-anima-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Étape actuelle */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {currentQuestionIndex < parameters.length ? (
            // Formulaire des paramètres de répondant
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Informations personnelles
              </h2>
              
              <div className="max-w-md mx-auto">
                {(() => {
                  const currentParameter = parameters[currentQuestionIndex];
                  return (
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-4">
                        {currentParameter.name}
                        {currentParameter.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {currentParameter.type === 'text' && (
                        <input
                          type="text"
                          value={respondentData[currentParameter.id] as string || ''}
                          onChange={(e) => handleParameterChange(currentParameter.id, e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent text-lg"
                          placeholder={`Saisissez votre ${currentParameter.name.toLowerCase()}`}
                          required={currentParameter.required}
                        />
                      )}
                      
                      {currentParameter.type === 'select' && (
                        <select
                          value={respondentData[currentParameter.id] as string || ''}
                          onChange={(e) => handleParameterChange(currentParameter.id, e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent text-lg"
                          required={currentParameter.required}
                        >
                          <option value="">Sélectionnez une option</option>
                          {currentParameter.options?.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {currentParameter.type === 'multiselect' && (
                        <div className="space-y-2">
                          {currentParameter.options?.map((option, index) => (
                            <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(respondentData[currentParameter.id] as string[] || []).includes(option)}
                                onChange={(e) => {
                                  const currentValues = respondentData[currentParameter.id] as string[] || [];
                                  const newValues = e.target.checked
                                    ? [...currentValues, option]
                                    : currentValues.filter(v => v !== option);
                                  handleParameterChange(currentParameter.id, newValues);
                                }}
                                className="w-4 h-4 text-anima-blue border-gray-300 rounded focus:ring-anima-blue"
                              />
                              <span className="text-lg">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            // Questions du questionnaire
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                {currentQuestion.question_text}
              </h2>

              {/* Options de réponse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {randomizedOptions[currentQuestion.id]?.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === option.originalLetter;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.originalLetter)}
                      className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-anima-blue bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Image de l'option */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                            <Image
                              src={option.imageUrl || '/placeholder-image.jpg'}
                              alt={`Option ${option.originalLetter}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* Contenu de l'option */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                              isSelected ? 'bg-anima-blue' : 'bg-gray-400'
                            }`}>
                              {isSelected ? <Check className="w-5 h-5" /> : option.originalLetter}
                            </div>
                            <span className="font-semibold text-gray-800">Option {option.originalLetter}</span>
                          </div>
                          
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {option.text || 'Aucune description disponible'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Précédent
          </button>

          {currentQuestionIndex === parameters.length + questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || !allRequiredParametersFilled || submitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Soumission...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Terminer le questionnaire
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                currentQuestionIndex < parameters.length 
                  ? !respondentData[parameters[currentQuestionIndex].id] && parameters[currentQuestionIndex].required
                  : !isCurrentQuestionAnswered()
              }
              className="flex items-center gap-2 px-6 py-3 bg-anima-blue text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-anima-dark-blue transition-colors"
            >
              Suivant
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
