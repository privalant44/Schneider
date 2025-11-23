// Simulation de base de données en mémoire

import { 
  Client, 
  QuestionnaireSession, 
  RespondentProfile, 
  SessionResponse, 
  SessionResults, 
  SessionComparison 
} from './types';

interface Question {
  id: number;
  question_text: string;
  image_a: string;
  image_b: string;
  image_c: string;
  image_d: string;
  order_index: number;
}

interface Response {
  id: number;
  session_id: string;
  question_id: number;
  answer: string;
  created_at: string;
}

interface Session {
  id: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

interface Setting {
  key: string;
  value: string;
}

// Données en mémoire
let questions: Question[] = [];
let responses: Response[] = [];
let sessions: Session[] = [];
let settings: Setting[] = [];
let clients: Client[] = [];
let questionnaireSessions: QuestionnaireSession[] = [];
let respondentProfiles: RespondentProfile[] = [];
let sessionResponses: SessionResponse[] = [];
let sessionResults: SessionResults[] = [];
let nextId = 1;

// Initialiser les données par défaut
export function initDatabase() {
  // Paramètres par défaut
  settings = [
    { key: 'welcome_text', value: 'Bienvenue dans le questionnaire de cartographie de culture d\'entreprise Schneider. Ce questionnaire vous permettra de découvrir les 4 typologies de culture : collaboration, contrôle, expertise et cultivation.' },
    { key: 'company_logo', value: '/logo-anima-neo.svg' }
  ];

  // Questions par défaut
  questions = [
    {
      id: 1,
      question_text: 'Comment préférez-vous organiser votre travail ?',
      image_a: '/images/control.svg',
      image_b: '/images/expertise.svg',
      image_c: '/images/collaboration.svg',
      image_d: '/images/cultivation.svg',
      order_index: 1
    },
    {
      id: 2,
      question_text: 'Quelle approche privilégiez-vous pour résoudre les problèmes ?',
      image_a: '/images/control.svg',
      image_b: '/images/expertise.svg',
      image_c: '/images/collaboration.svg',
      image_d: '/images/cultivation.svg',
      order_index: 2
    },
    {
      id: 3,
      question_text: 'Comment préférez-vous communiquer avec vos collègues ?',
      image_a: '/images/control.svg',
      image_b: '/images/expertise.svg',
      image_c: '/images/collaboration.svg',
      image_d: '/images/cultivation.svg',
      order_index: 3
    },
    {
      id: 4,
      question_text: 'Quel type d\'environnement de travail vous motive le plus ?',
      image_a: '/images/control.svg',
      image_b: '/images/expertise.svg',
      image_c: '/images/collaboration.svg',
      image_d: '/images/cultivation.svg',
      order_index: 4
    },
    {
      id: 5,
      question_text: 'Comment abordez-vous l\'apprentissage de nouvelles compétences ?',
      image_a: '/images/control.svg',
      image_b: '/images/expertise.svg',
      image_c: '/images/collaboration.svg',
      image_d: '/images/cultivation.svg',
      order_index: 5
    }
  ];

  nextId = 6;
}

// Fonctions d'accès aux données
export function getSettings() {
  return settings;
}

export function getSetting(key: string) {
  return settings.find(s => s.key === key)?.value;
}

export function setSetting(key: string, value: string) {
  const existing = settings.find(s => s.key === key);
  if (existing) {
    existing.value = value;
  } else {
    settings.push({ key, value });
  }
}

export function getQuestions() {
  return questions.sort((a, b) => a.order_index - b.order_index);
}

export function getQuestion(id: number) {
  return questions.find(q => q.id === id);
}

export function addQuestion(question: Omit<Question, 'id'>) {
  const newQuestion = { ...question, id: nextId++ };
  questions.push(newQuestion);
  return newQuestion;
}

export function updateQuestion(id: number, question: Partial<Omit<Question, 'id'>>) {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...question };
    return questions[index];
  }
  return null;
}

export function deleteQuestion(id: number) {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions.splice(index, 1);
    return true;
  }
  return false;
}

export function getResponses(sessionId: string) {
  return responses.filter(r => r.session_id === sessionId);
}

export function addResponse(sessionId: string, questionId: number, answer: string) {
  const response = {
    id: nextId++,
    session_id: sessionId,
    question_id: questionId,
    answer,
    created_at: new Date().toISOString()
  };
  responses.push(response);
  return response;
}

export function createSession() {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const session = {
    id: sessionId,
    completed: false,
    created_at: new Date().toISOString()
  };
  sessions.push(session);
  return session;
}

export function createSessionWithId(sessionId: string) {
  const session = {
    id: sessionId,
    completed: false,
    created_at: new Date().toISOString()
  };
  sessions.push(session);
  return session;
}

export function completeSession(sessionId: string) {
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.completed = true;
    session.completed_at = new Date().toISOString();
  }
  return session;
}

export function getSession(sessionId: string) {
  return sessions.find(s => s.id === sessionId);
}

export function calculateResults(sessionId: string) {
  const userResponses = getResponses(sessionId);
  const totalQuestions = userResponses.length;
  
  console.log('Calcul des résultats pour sessionId:', sessionId);
  console.log('Réponses utilisateur:', userResponses);
  console.log('Total questions:', totalQuestions);
  
  if (totalQuestions === 0) {
    return [];
  }
  
  // Compter les réponses par culture
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  userResponses.forEach(response => {
    console.log('Réponse:', response.answer, 'pour question:', response.question_id);
    counts[response.answer as keyof typeof counts]++;
  });
  
  console.log('Comptes par culture:', counts);
  
  // Calculer les pourcentages et retourner toutes les cultures (même avec 0%)
  const results = Object.entries(counts).map(([culture, count]) => ({
    culture: culture as 'A' | 'B' | 'C' | 'D',
    count,
    percentage: Math.round((count / totalQuestions) * 100)
  }));
  
  console.log('Résultats finaux:', results);
  return results;
}

// ===== FONCTIONS POUR LA GESTION DES CLIENTS =====

export function getClients(): Client[] {
  return clients.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getClient(id: string): Client | null {
  return clients.find(c => c.id === id) || null;
}

export function createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Client {
  const now = new Date().toISOString();
  const newClient: Client = {
    ...clientData,
    id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: now,
    updated_at: now
  };
  clients.push(newClient);
  return newClient;
}

export function updateClient(id: string, clientData: Partial<Omit<Client, 'id' | 'created_at'>>): Client | null {
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = { 
      ...clients[index], 
      ...clientData, 
      updated_at: new Date().toISOString() 
    };
    return clients[index];
  }
  return null;
}

export function deleteClient(id: string): boolean {
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients.splice(index, 1);
    return true;
  }
  return false;
}

// ===== FONCTIONS POUR LA GESTION DES SESSIONS DE QUESTIONNAIRE =====

export function getQuestionnaireSessions(clientId?: string): QuestionnaireSession[] {
  let sessions = questionnaireSessions;
  if (clientId) {
    sessions = sessions.filter(s => s.client_id === clientId);
  }
  return sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getQuestionnaireSession(id: string): QuestionnaireSession | null {
  return questionnaireSessions.find(s => s.id === id) || null;
}

export function createQuestionnaireSession(sessionData: Omit<QuestionnaireSession, 'id' | 'created_at' | 'updated_at' | 'short_url'>): QuestionnaireSession {
  const now = new Date().toISOString();
  const shortUrl = generateShortUrl();
  const newSession: QuestionnaireSession = {
    ...sessionData,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    short_url: shortUrl,
    created_at: now,
    updated_at: now
  };
  questionnaireSessions.push(newSession);
  return newSession;
}

export function updateQuestionnaireSession(id: string, sessionData: Partial<Omit<QuestionnaireSession, 'id' | 'created_at'>>): QuestionnaireSession | null {
  const index = questionnaireSessions.findIndex(s => s.id === id);
  if (index !== -1) {
    questionnaireSessions[index] = { 
      ...questionnaireSessions[index], 
      ...sessionData, 
      updated_at: new Date().toISOString() 
    };
    return questionnaireSessions[index];
  }
  return null;
}

export function deleteQuestionnaireSession(id: string): boolean {
  const index = questionnaireSessions.findIndex(s => s.id === id);
  if (index !== -1) {
    questionnaireSessions.splice(index, 1);
    return true;
  }
  return false;
}

function generateShortUrl(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ===== FONCTIONS POUR LA GESTION DES PROFILS DE RÉPONDANTS =====

export function createRespondentProfile(profileData: Omit<RespondentProfile, 'id' | 'created_at'>): RespondentProfile {
  const now = new Date().toISOString();
  const newProfile: RespondentProfile = {
    ...profileData,
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: now
  };
  respondentProfiles.push(newProfile);
  return newProfile;
}

export function getRespondentProfile(id: string): RespondentProfile | null {
  return respondentProfiles.find(p => p.id === id) || null;
}

export function getRespondentProfilesBySession(sessionId: string): RespondentProfile[] {
  return respondentProfiles.filter(p => p.session_id === sessionId);
}

// ===== FONCTIONS POUR LA GESTION DES RÉPONSES DE SESSION =====

export function addSessionResponse(responseData: Omit<SessionResponse, 'id' | 'created_at'>): SessionResponse {
  const now = new Date().toISOString();
  const newResponse: SessionResponse = {
    ...responseData,
    id: nextId++,
    created_at: now
  };
  sessionResponses.push(newResponse);
  return newResponse;
}

export function getSessionResponses(sessionId: string): SessionResponse[] {
  return sessionResponses.filter(r => r.session_id === sessionId);
}

export function getSessionResponsesByProfile(profileId: string): SessionResponse[] {
  return sessionResponses.filter(r => r.respondent_profile_id === profileId);
}

// ===== FONCTIONS POUR LA GESTION DES RÉSULTATS DE SESSION =====

export function calculateSessionResults(sessionId: string): SessionResults {
  const responses = getSessionResponses(sessionId);
  const profiles = getRespondentProfilesBySession(sessionId);
  
  // Calculer la distribution des cultures
  const cultureCounts = { A: 0, B: 0, C: 0, D: 0 };
  responses.forEach(response => {
    cultureCounts[response.answer]++;
  });
  
  const totalResponses = responses.length;
  const cultureDistribution = Object.entries(cultureCounts).map(([culture, count]) => ({
    culture: culture as 'A' | 'B' | 'C' | 'D',
    count,
    percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
  }));
  
  // Calculer la répartition par paramètres de répondants
  const respondentBreakdown = {
    division: {} as Record<string, number>,
    domain: {} as Record<string, number>,
    age_range: {} as Record<string, number>,
    gender: {} as Record<string, number>,
    seniority: {} as Record<string, number>
  };
  
  profiles.forEach(profile => {
    if (profile.division) {
      respondentBreakdown.division[profile.division] = (respondentBreakdown.division[profile.division] || 0) + 1;
    }
    if (profile.domain) {
      respondentBreakdown.domain[profile.domain] = (respondentBreakdown.domain[profile.domain] || 0) + 1;
    }
    if (profile.age_range) {
      respondentBreakdown.age_range[profile.age_range] = (respondentBreakdown.age_range[profile.age_range] || 0) + 1;
    }
    if (profile.gender) {
      respondentBreakdown.gender[profile.gender] = (respondentBreakdown.gender[profile.gender] || 0) + 1;
    }
    if (profile.seniority) {
      respondentBreakdown.seniority[profile.seniority] = (respondentBreakdown.seniority[profile.seniority] || 0) + 1;
    }
  });
  
  const results: SessionResults = {
    session_id: sessionId,
    total_responses: totalResponses,
    culture_distribution: cultureDistribution,
    respondent_breakdown: respondentBreakdown,
    created_at: new Date().toISOString()
  };
  
  // Sauvegarder les résultats
  const existingIndex = sessionResults.findIndex(r => r.session_id === sessionId);
  if (existingIndex !== -1) {
    sessionResults[existingIndex] = results;
  } else {
    sessionResults.push(results);
  }
  
  return results;
}

export function getSessionResults(sessionId: string): SessionResults | null {
  return sessionResults.find(r => r.session_id === sessionId) || null;
}

export function getAllSessionResults(): SessionResults[] {
  return sessionResults;
}

// ===== FONCTIONS POUR LA GESTION DES PARAMÈTRES DE RÉPONDANTS =====
// Note: Ces fonctions ont été supprimées car elles ne sont plus utilisées
// Les paramètres de répondants sont maintenant gérés via AnalysisAxis et RespondentProfile

// ===== FONCTIONS POUR LES COMPARAISONS ENTRE SESSIONS =====

export function compareSessions(session1Id: string, session2Id: string): SessionComparison | null {
  const results1 = getSessionResults(session1Id);
  const results2 = getSessionResults(session2Id);
  
  if (!results1 || !results2) {
    return null;
  }
  
  const evolution = results1.culture_distribution.map(culture1 => {
    const culture2 = results2.culture_distribution.find(c => c.culture === culture1.culture);
    const changePercentage = culture2 ? culture2.percentage - culture1.percentage : -culture1.percentage;
    
    let changeDirection: 'increase' | 'decrease' | 'stable' = 'stable';
    if (changePercentage > 2) changeDirection = 'increase';
    else if (changePercentage < -2) changeDirection = 'decrease';
    
    return {
      culture: culture1.culture,
      change_percentage: changePercentage,
      change_direction: changeDirection
    };
  });
  
  const totalEvolution = {
    total_responses_change: results2.total_responses - results1.total_responses,
    response_rate_change: results2.total_responses > 0 && results1.total_responses > 0 
      ? ((results2.total_responses - results1.total_responses) / results1.total_responses) * 100 
      : 0
  };
  
  return {
    session1_id: session1Id,
    session2_id: session2Id,
    evolution,
    total_evolution: totalEvolution
  };
}

// Fonction de diagnostic pour vérifier l'état de la base de données
export function getDatabaseStatus() {
  return {
    questions: questions.length,
    clients: clients.length,
    sessions: sessions.length,
    questionnaireSessions: questionnaireSessions.length,
    respondentProfiles: respondentProfiles.length,
    sessionResponses: sessionResponses.length,
    sessionResults: sessionResults.length,
    nextId: nextId
  };
}

// Fonction de diagnostic spécifique pour les URLs courtes
export function getShortUrlDiagnostics() {
  const sessionsWithShortUrls = questionnaireSessions.filter(s => s.short_url);
  const sessionsWithoutShortUrls = questionnaireSessions.filter(s => !s.short_url);
  
  return {
    totalSessions: questionnaireSessions.length,
    sessionsWithShortUrls: sessionsWithShortUrls.length,
    sessionsWithoutShortUrls: sessionsWithoutShortUrls.length,
    shortUrls: sessionsWithShortUrls.map(s => ({
      id: s.id,
      shortUrl: s.short_url,
      name: s.name,
      isActive: s.is_active
    })),
    sessionsWithoutShortUrlsList: sessionsWithoutShortUrls.map(s => ({
      id: s.id,
      name: s.name,
      isActive: s.is_active
    }))
  };
}

// Initialiser la base de données
initDatabase();
