'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, User, Building2, Calendar } from 'lucide-react';
import { Question, RandomizedOption, QuestionnaireSession, Client, AnalysisAxis } from '@/lib/types';

export default function QuestionnaireShortUrlPage({ params }: { params: { shortUrl: string } }) {
  const [session, setSession] = useState<QuestionnaireSession | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [analysisAxes, setAnalysisAxes] = useState<AnalysisAxis[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<'welcome' | 'axes' | 'questions' | 'complete'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [respondentData, setRespondentData] = useState<Record<string, string | string[]>>({});
  const [axisResponses, setAxisResponses] = useState<Record<string, string | string[]>>({});
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


      // Récupérer les paramètres de l'application
      const settingsResponse = await fetch('/api/settings');
      const settingsData = await settingsResponse.json();
      setSettings(settingsData);

      // Récupérer les axes d'analyse figés de cette session
      const sessionAxesResponse = await fetch(`/api/sessions/${sessionData.id}/analysis-axes`);
      const sessionAxes = await sessionAxesResponse.json();
      setAnalysisAxes(sessionAxes);

      // Randomiser les options pour chaque question
      const randomized: Record<number, RandomizedOption[]> = {};
      questionsData.forEach((question: Question) => {
        randomized[question.id] = randomizeOptions(question);
      });
      setRandomizedOptions(randomized);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      console.error('Détails de l\'erreur:', error);
      setError(`Erreur lors du chargement du questionnaire: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'welcome') {
      if (analysisAxes.length > 0) {
        setCurrentStep('axes');
      } else {
        setCurrentStep('questions');
      }
    } else if (currentStep === 'axes') {
      setCurrentStep('questions');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'questions') {
      if (analysisAxes.length > 0) {
        setCurrentStep('axes');
      } else {
        setCurrentStep('welcome');
      }
    } else if (currentStep === 'axes') {
      setCurrentStep('welcome');
    }
  };

  const handleAxisResponse = (axisId: string, value: string | string[]) => {
    setAxisResponses(prev => ({
      ...prev,
      [axisId]: value
    }));
  };

  const randomizeOptions = (question: Question): RandomizedOption[] => {
    const options: RandomizedOption[] = [
      { id: 'option-1', imageUrl: question.image_a, text: question.text_a, originalLetter: 'A' },
      { id: 'option-2', imageUrl: question.image_b, text: question.text_b, originalLetter: 'B' },
      { id: 'option-3', imageUrl: question.image_c, text: question.text_c, originalLetter: 'C' },
      { id: 'option-4', imageUrl: question.image_d, text: question.text_d, originalLetter: 'D' }
    ];

    // Mélanger les options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
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
        axis_responses: axisResponses,
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
        const profileData = await profileResponse.json();
        console.log('Profil de répondant créé avec succès:', profileData);
        router.push(`/resultats?sessionId=${session.id}&profileId=${profileData.id}`);
      } else {
        const errorData = await profileResponse.json();
        console.error('Erreur lors de la création du profil:', errorData);
        alert('Erreur lors de l\'envoi des réponses. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de l\'envoi des réponses. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
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

  // Rendu selon l'étape actuelle
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'axes':
        return renderAxesStep();
      case 'questions':
        return renderQuestionsStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  const renderWelcomeStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Nouveau header centré */}
        <div className="text-center mb-8">
          {/* Titre principal */}
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Le diagnostic culturel d'entreprise
          </h1>
          
          {/* By avec logo Anima Néo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-lg text-gray-600 font-homemade">
              By
            </span>
            {settings.company_logo && (
              <div className="relative w-16 h-16">
                <Image
                  src={settings.company_logo}
                  alt="Anima Néo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Logo ou nom du client */}
          <div className="mb-6">
            {client?.logo ? (
              <div className="flex justify-center">
                <div className="relative w-28 h-28">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ) : (
              <h2 className="text-2xl font-semibold text-gray-700">{client?.name}</h2>
            )}
          </div>
          
          {/* Nom de la session */}
          <h3 className="text-xl text-gray-600">{session?.name}</h3>
        </div>

        {/* Texte de bienvenue paramétrable */}
        {settings.welcome_text && (
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {settings.welcome_text}
            </p>
          </div>
        )}

        {/* Description de la session */}
        {session?.description && (
          <div className="mb-8">
            <p className="text-base text-gray-600 text-center">
              {session.description}
            </p>
          </div>
        )}

        {/* Encart à propos du questionnaire */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">
            À propos de ce questionnaire
          </h3>
          <div className="text-center text-blue-700">
            <p className="text-lg font-medium">
              {questions.length} questions • 5-10 minutes
            </p>
            <p className="text-sm mt-2">
              Les réponses sont anonymes et confidentielles
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Instructions
          </h3>
          <div className="text-left space-y-2 text-gray-700">
            <p>• Prenez le temps de réfléchir à chaque question</p>
            <p>• Il n'y a pas de bonnes ou mauvaises réponses</p>
            <p>• Répondez selon votre expérience personnelle</p>
            <p>• Choisissez la réponse la plus représentative en cas d'hésitations</p>
            <p>• Vous pouvez naviguer entre les questions si nécessaire</p>
          </div>
        </div>

        {/* Bouton de démarrage */}
        <div className="flex justify-center">
          <button
            onClick={handleNextStep}
            className="px-12 py-4 bg-anima-blue text-white text-xl font-semibold rounded-lg hover:bg-anima-dark-blue transition-colors shadow-lg"
          >
            Commencer le questionnaire
          </button>
        </div>
      </div>
    </div>
  );

  const renderAxesStep = () => {
    const currentAxis = analysisAxes[currentAxisIndex];
    const isLastAxis = currentAxisIndex === analysisAxes.length - 1;
    const isFirstAxis = currentAxisIndex === 0;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Informations sur votre profil
            </h2>
            <p className="text-gray-600">
              Question {currentAxisIndex + 1} sur {analysisAxes.length}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {currentAxis.name}
              {currentAxis.required && <span className="text-red-500 ml-1">*</span>}
            </h3>

            {currentAxis.type === 'text' ? (
              <input
                type="text"
                value={axisResponses[currentAxis.id] as string || ''}
                onChange={(e) => handleAxisResponse(currentAxis.id, e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent text-lg"
                placeholder={`Votre ${currentAxis.name.toLowerCase()}`}
                required={currentAxis.required}
              />
            ) : (
              <div className="space-y-3">
                {currentAxis.options?.map((option, index) => (
                  <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type={currentAxis.type === 'multiselect' ? 'checkbox' : 'radio'}
                      name={currentAxis.id}
                      value={option}
                      checked={
                        currentAxis.type === 'multiselect'
                          ? (axisResponses[currentAxis.id] as string[] || []).includes(option)
                          : axisResponses[currentAxis.id] === option
                      }
                      onChange={(e) => {
                        if (currentAxis.type === 'multiselect') {
                          const currentValues = (axisResponses[currentAxis.id] as string[] || []);
                          const newValues = e.target.checked
                            ? [...currentValues, option]
                            : currentValues.filter(v => v !== option);
                          handleAxisResponse(currentAxis.id, newValues);
                        } else {
                          handleAxisResponse(currentAxis.id, option);
                        }
                      }}
                      className="mr-3 h-4 w-4 text-anima-blue"
                      required={currentAxis.required}
                    />
                    <span className="text-lg">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            {!isFirstAxis && (
              <button
                onClick={() => {
                  setCurrentAxisIndex(currentAxisIndex - 1);
                }}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Précédent
              </button>
            )}
            {isFirstAxis && <div></div>}

            <button
              onClick={() => {
                if (isLastAxis) {
                  setCurrentStep('questions');
                } else {
                  setCurrentAxisIndex(currentAxisIndex + 1);
                }
              }}
              disabled={currentAxis.required && !axisResponses[currentAxis.id]}
              className="flex items-center gap-2 px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastAxis ? 'Commencer le questionnaire' : 'Suivant'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionsStep = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-anima-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">
              {currentQuestion.question_text}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {randomizedOptions[currentQuestion.id]?.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.originalLetter }))}
                  className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                    answers[currentQuestion.id] === option.originalLetter
                      ? 'border-anima-blue bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {option.imageUrl && (
                      <div className="flex-shrink-0">
                        <Image
                          src={option.imageUrl}
                          alt={`Option ${option.originalLetter}`}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-anima-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {option.originalLetter}
                        </span>
                        {answers[currentQuestion.id] === option.originalLetter && (
                          <Check className="w-5 h-5 text-anima-blue" />
                        )}
                      </div>
                      <p className="text-gray-700">{option.text}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            {!isFirstQuestion && (
              <button
                onClick={() => {
                  if (analysisAxes.length > 0) {
                    setCurrentStep('axes');
                    setCurrentAxisIndex(analysisAxes.length - 1);
                  } else {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Précédent
              </button>
            )}
            {isFirstQuestion && <div></div>}

            <button
              onClick={() => {
                if (isLastQuestion) {
                  setCurrentStep('complete');
                } else {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                }
              }}
              disabled={!answers[currentQuestion.id]}
              className="flex items-center gap-2 px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? 'Terminer' : 'Suivant'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCompleteStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Questionnaire terminé !
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Merci d'avoir pris le temps de répondre à ce questionnaire.
            Vos réponses ont été enregistrées avec succès.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {submitting ? 'Envoi en cours...' : 'Confirmer et envoyer'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec informations de la session */}
        <div className="mb-8">
          <div className="flex justify-end items-center mb-4">
            <div className="text-sm text-gray-600">
              {currentStep === 'welcome' && 'Bienvenue'}
              {currentStep === 'axes' && `Profil - Question ${currentAxisIndex + 1} sur ${analysisAxes.length}`}
              {currentStep === 'questions' && `Question ${currentQuestionIndex + 1} sur ${questions.length}`}
              {currentStep === 'complete' && 'Terminé'}
            </div>
          </div>
        </div>

        {/* Contenu principal selon l'étape */}
        {renderCurrentStep()}
      </div>
    </div>
  );
}