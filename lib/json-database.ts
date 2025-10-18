import fs from 'fs';
import path from 'path';
import { 
  Client, 
  QuestionnaireSession, 
  RespondentProfile, 
  SessionResponse, 
  SessionResults, 
  RespondentParameter,
  SessionComparison,
  AnalysisAxis,
  ClientAnalysisAxis
} from './types';

// Chemins des fichiers JSON
const DATA_DIR = path.join(process.cwd(), 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const RESPONDENT_PROFILES_FILE = path.join(DATA_DIR, 'respondent-profiles.json');
const SESSION_RESPONSES_FILE = path.join(DATA_DIR, 'session-responses.json');
const SESSION_RESULTS_FILE = path.join(DATA_DIR, 'session-results.json');
const RESPONDENT_PARAMETERS_FILE = path.join(DATA_DIR, 'respondent-parameters.json');
const ANALYSIS_AXES_FILE = path.join(DATA_DIR, 'analysis-axes.json');
const CLIENT_ANALYSIS_AXES_FILE = path.join(DATA_DIR, 'client-analysis-axes.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Interface pour les questions (compatible avec l'ancien système)
interface Question {
  id: number;
  question_text: string;
  text_a: string;
  text_b: string;
  text_c: string;
  text_d: string;
  image_a: string;
  image_b: string;
  image_c: string;
  image_d: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Setting {
  key: string;
  value: string;
}

// Variables globales pour le cache
let clients: Client[] = [];
let questionnaireSessions: QuestionnaireSession[] = [];
let respondentProfiles: RespondentProfile[] = [];
let sessionResponses: SessionResponse[] = [];
let sessionResults: SessionResults[] = [];
let respondentParameters: RespondentParameter[] = [];
let analysisAxes: AnalysisAxis[] = [];
let clientAnalysisAxes: ClientAnalysisAxis[] = [];
let questions: Question[] = [];
let settings: Setting[] = [];
let nextId = 1;

// Fonction pour s'assurer que le dossier data existe
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Fonction pour lire un fichier JSON
function readJsonFile<T>(filePath: string, defaultValue: T[]): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error);
  }
  return defaultValue;
}

// Fonction pour écrire un fichier JSON
function writeJsonFile<T>(filePath: string, data: T[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Erreur lors de l'écriture de ${filePath}:`, error);
  }
}

// Fonction pour charger toutes les données
function loadAllData() {
  clients = readJsonFile(CLIENTS_FILE, []);
  questionnaireSessions = readJsonFile(SESSIONS_FILE, []);
  respondentProfiles = readJsonFile(RESPONDENT_PROFILES_FILE, []);
  sessionResponses = readJsonFile(SESSION_RESPONSES_FILE, []);
  sessionResults = readJsonFile(SESSION_RESULTS_FILE, []);
  respondentParameters = readJsonFile(RESPONDENT_PARAMETERS_FILE, []);
  analysisAxes = readJsonFile(ANALYSIS_AXES_FILE, []);
  clientAnalysisAxes = readJsonFile(CLIENT_ANALYSIS_AXES_FILE, []);
  questions = readJsonFile(QUESTIONS_FILE, []);
  settings = readJsonFile(SETTINGS_FILE, []);
  
  // Calculer le prochain ID
  const allIds = [
    ...clients.map(c => parseInt(c.id.split('_')[1]) || 0),
    ...questionnaireSessions.map(s => parseInt(s.id.split('_')[1]) || 0),
    ...respondentProfiles.map(p => parseInt(p.id.split('_')[1]) || 0),
    ...sessionResponses.map(r => r.id),
    ...questions.map(q => q.id)
  ];
  nextId = Math.max(...allIds, 0) + 1;
}

// Fonction pour sauvegarder toutes les données
function saveAllData() {
  writeJsonFile(CLIENTS_FILE, clients);
  writeJsonFile(SESSIONS_FILE, questionnaireSessions);
  writeJsonFile(RESPONDENT_PROFILES_FILE, respondentProfiles);
  writeJsonFile(SESSION_RESPONSES_FILE, sessionResponses);
  writeJsonFile(SESSION_RESULTS_FILE, sessionResults);
  writeJsonFile(RESPONDENT_PARAMETERS_FILE, respondentParameters);
  writeJsonFile(ANALYSIS_AXES_FILE, analysisAxes);
  writeJsonFile(CLIENT_ANALYSIS_AXES_FILE, clientAnalysisAxes);
  writeJsonFile(QUESTIONS_FILE, questions);
  writeJsonFile(SETTINGS_FILE, settings);
}

// Initialiser les données par défaut si nécessaire
function initDefaultData() {
  if (questions.length === 0) {
    questions = [
      {
        id: 1,
        question_text: 'Comment préférez-vous organiser votre travail ?',
        text_a: 'Je préfère un contrôle strict et des procédures claires',
        text_b: 'Je me base sur mon expertise et mes connaissances',
        text_c: 'Je privilégie la collaboration et le travail d\'équipe',
        text_d: 'Je favorise le développement et l\'apprentissage continu',
        image_a: '/images/control.svg',
        image_b: '/images/expertise.svg',
        image_c: '/images/collaboration.svg',
        image_d: '/images/cultivation.svg',
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        question_text: 'Quelle approche privilégiez-vous pour résoudre les problèmes ?',
        text_a: 'J\'applique des méthodes structurées et des protocoles',
        text_b: 'Je m\'appuie sur mon expérience et mes compétences techniques',
        text_c: 'Je consulte l\'équipe et cherche des solutions collectives',
        text_d: 'J\'explore de nouvelles approches et j\'apprends en cours de route',
        image_a: '/images/control.svg',
        image_b: '/images/expertise.svg',
        image_c: '/images/collaboration.svg',
        image_d: '/images/cultivation.svg',
        order_index: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        question_text: 'Comment préférez-vous communiquer avec vos collègues ?',
        text_a: 'Je communique de manière formelle et hiérarchique',
        text_b: 'Je partage mes connaissances et mon expertise',
        text_c: 'Je favorise les échanges ouverts et la discussion',
        text_d: 'Je privilégie l\'écoute et l\'apprentissage mutuel',
        image_a: '/images/control.svg',
        image_b: '/images/expertise.svg',
        image_c: '/images/collaboration.svg',
        image_d: '/images/cultivation.svg',
        order_index: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        question_text: 'Quel type d\'environnement de travail vous motive le plus ?',
        text_a: 'Un environnement structuré avec des règles claires',
        text_b: 'Un environnement où je peux utiliser mon expertise',
        text_c: 'Un environnement collaboratif et convivial',
        text_d: 'Un environnement d\'apprentissage et de développement',
        image_a: '/images/control.svg',
        image_b: '/images/expertise.svg',
        image_c: '/images/collaboration.svg',
        image_d: '/images/cultivation.svg',
        order_index: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        question_text: 'Comment abordez-vous l\'apprentissage de nouvelles compétences ?',
        text_a: 'Je préfère des méthodes d\'apprentissage structurées et formelles',
        text_b: 'Je me base sur mon expérience existante pour apprendre',
        text_c: 'J\'apprends mieux en collaborant avec d\'autres personnes',
        text_d: 'J\'aime explorer et expérimenter de nouvelles approches',
        image_a: '/images/control.svg',
        image_b: '/images/expertise.svg',
        image_c: '/images/collaboration.svg',
        image_d: '/images/cultivation.svg',
        order_index: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    nextId = 6;
  }

  if (analysisAxes.length === 0) {
    analysisAxes = [
      {
        id: 'axis_1',
        name: 'Direction',
        type: 'select',
        options: ['Direction Générale', 'Direction Commerciale', 'Direction Technique', 'Direction RH', 'Direction Financière'],
        required: false,
        order: 1,
        category: 'organizational',
        created_at: new Date().toISOString()
      },
      {
        id: 'axis_2',
        name: 'Entité',
        type: 'text',
        options: [],
        required: false,
        order: 2,
        category: 'organizational',
        created_at: new Date().toISOString()
      },
      {
        id: 'axis_3',
        name: 'Domaine',
        type: 'select',
        options: ['IT', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'R&D'],
        required: false,
        order: 3,
        category: 'organizational',
        created_at: new Date().toISOString()
      },
      {
        id: 'axis_4',
        name: 'Équipe',
        type: 'text',
        options: [],
        required: false,
        order: 4,
        category: 'organizational',
        created_at: new Date().toISOString()
      },
      {
        id: 'axis_5',
        name: 'Sexe',
        type: 'select',
        options: ['Homme', 'Femme', 'Autre', 'Préfère ne pas dire'],
        required: false,
        order: 5,
        category: 'demographic',
        created_at: new Date().toISOString()
      },
      {
        id: 'axis_6',
        name: 'Tranche d\'âge',
        type: 'select',
        options: ['18-25 ans', '26-35 ans', '36-45 ans', '46-55 ans', '56-65 ans', '65+ ans'],
        required: false,
        order: 6,
        category: 'demographic',
        created_at: new Date().toISOString()
      },
      {
        id: 'axis_7',
        name: 'Ancienneté',
        type: 'select',
        options: ['Moins de 1 an', '1-3 ans', '3-5 ans', '5-10 ans', '10-15 ans', 'Plus de 15 ans'],
        required: false,
        order: 7,
        category: 'demographic',
        created_at: new Date().toISOString()
      }
    ];
  }

  if (settings.length === 0) {
    settings = [
      { key: 'welcome_text', value: 'Bienvenue dans le questionnaire de cartographie de culture d\'entreprise Schneider. Ce questionnaire vous permettra de découvrir les 4 typologies de culture : collaboration, contrôle, expertise et cultivation.' },
      { key: 'company_logo', value: '/logo-anima-neo.svg' }
    ];
  }
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
  saveAllData();
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
    saveAllData();
    return clients[index];
  }
  return null;
}

export function deleteClient(id: string): boolean {
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients.splice(index, 1);
    saveAllData();
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

function generateShortUrl(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
  saveAllData();
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
    saveAllData();
    return questionnaireSessions[index];
  }
  return null;
}

export function deleteQuestionnaireSession(id: string): boolean {
  const index = questionnaireSessions.findIndex(s => s.id === id);
  if (index !== -1) {
    questionnaireSessions.splice(index, 1);
    saveAllData();
    return true;
  }
  return false;
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
  saveAllData();
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
  saveAllData();
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
  
  saveAllData();
  return results;
}

export function getSessionResults(sessionId: string): SessionResults | null {
  return sessionResults.find(r => r.session_id === sessionId) || null;
}

export function getAllSessionResults(): SessionResults[] {
  return sessionResults;
}

// ===== FONCTIONS POUR LA GESTION DES PARAMÈTRES DE RÉPONDANTS =====

export function getRespondentParameters(clientId?: string): RespondentParameter[] {
  let params = respondentParameters;
  if (clientId) {
    params = params.filter(p => p.client_id === clientId);
  }
  return params.sort((a, b) => a.order - b.order);
}

export function createRespondentParameter(parameterData: Omit<RespondentParameter, 'id' | 'created_at'>): RespondentParameter {
  const now = new Date().toISOString();
  const newParameter: RespondentParameter = {
    ...parameterData,
    id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: now
  };
  respondentParameters.push(newParameter);
  saveAllData();
  return newParameter;
}

export function updateRespondentParameter(id: string, parameterData: Partial<Omit<RespondentParameter, 'id' | 'created_at'>>): RespondentParameter | null {
  const index = respondentParameters.findIndex(p => p.id === id);
  if (index !== -1) {
    respondentParameters[index] = { ...respondentParameters[index], ...parameterData };
    saveAllData();
    return respondentParameters[index];
  }
  return null;
}

export function deleteRespondentParameter(id: string): boolean {
  const index = respondentParameters.findIndex(p => p.id === id);
  if (index !== -1) {
    respondentParameters.splice(index, 1);
    saveAllData();
    return true;
  }
  return false;
}

export function deleteRespondentParametersByClient(clientId: string): boolean {
  const initialLength = respondentParameters.length;
  respondentParameters = respondentParameters.filter(p => p.client_id !== clientId);
  if (respondentParameters.length !== initialLength) {
    saveAllData();
    return true;
  }
  return false;
}

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

// ===== FONCTIONS POUR LA GESTION DES QUESTIONS (COMPATIBILITÉ) =====

export function getQuestions(): Question[] {
  return questions.sort((a, b) => a.order_index - b.order_index);
}

export function getQuestion(id: number): Question | null {
  return questions.find(q => q.id === id) || null;
}

export function addQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Question {
  const now = new Date().toISOString();
  const newQuestion: Question = { 
    ...question, 
    id: nextId++,
    created_at: now,
    updated_at: now
  };
  questions.push(newQuestion);
  saveAllData();
  return newQuestion;
}

export function updateQuestion(id: number, question: Partial<Omit<Question, 'id' | 'created_at'>>): Question | null {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { 
      ...questions[index], 
      ...question,
      updated_at: new Date().toISOString()
    };
    saveAllData();
    return questions[index];
  }
  return null;
}

export function deleteQuestion(id: number): boolean {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions.splice(index, 1);
    saveAllData();
    return true;
  }
  return false;
}

// ===== FONCTIONS POUR LA GESTION DES AXES D'ANALYSE =====

export function getAnalysisAxes(): AnalysisAxis[] {
  return analysisAxes.sort((a, b) => a.order - b.order);
}

export function getAnalysisAxis(id: string): AnalysisAxis | null {
  return analysisAxes.find(axis => axis.id === id) || null;
}

export function addAnalysisAxis(axis: Omit<AnalysisAxis, 'id' | 'created_at'>): AnalysisAxis {
  const now = new Date().toISOString();
  const newAxis: AnalysisAxis = {
    ...axis,
    id: `axis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: now
  };
  analysisAxes.push(newAxis);
  saveAllData();
  return newAxis;
}

export function updateAnalysisAxis(id: string, axis: Partial<Omit<AnalysisAxis, 'id' | 'created_at'>>): AnalysisAxis | null {
  const index = analysisAxes.findIndex(a => a.id === id);
  if (index !== -1) {
    analysisAxes[index] = { ...analysisAxes[index], ...axis };
    saveAllData();
    return analysisAxes[index];
  }
  return null;
}

export function deleteAnalysisAxis(id: string): boolean {
  const index = analysisAxes.findIndex(a => a.id === id);
  if (index !== -1) {
    analysisAxes.splice(index, 1);
    // Supprimer aussi les associations client
    clientAnalysisAxes = clientAnalysisAxes.filter(ca => ca.axis_id !== id);
    saveAllData();
    return true;
  }
  return false;
}

// ===== FONCTIONS POUR LA GESTION DES AXES D'ANALYSE PAR CLIENT =====

export function getClientAnalysisAxes(clientId: string): ClientAnalysisAxis[] {
  return clientAnalysisAxes
    .filter(ca => ca.client_id === clientId)
    .sort((a, b) => a.order - b.order);
}

export function getEnabledAnalysisAxesForClient(clientId: string): AnalysisAxis[] {
  const enabledAxisIds = clientAnalysisAxes
    .filter(ca => ca.client_id === clientId && ca.is_enabled)
    .sort((a, b) => a.order - b.order)
    .map(ca => ca.axis_id);
  
  return analysisAxes
    .filter(axis => enabledAxisIds.includes(axis.id))
    .sort((a, b) => {
      const orderA = clientAnalysisAxes.find(ca => ca.axis_id === a.id && ca.client_id === clientId)?.order || 0;
      const orderB = clientAnalysisAxes.find(ca => ca.axis_id === b.id && ca.client_id === clientId)?.order || 0;
      return orderA - orderB;
    });
}

export function setClientAnalysisAxes(clientId: string, axisIds: string[]): void {
  // Supprimer les anciennes associations
  clientAnalysisAxes = clientAnalysisAxes.filter(ca => ca.client_id !== clientId);
  
  // Ajouter les nouvelles associations
  axisIds.forEach((axisId, index) => {
    clientAnalysisAxes.push({
      id: `client_axis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_id: clientId,
      axis_id: axisId,
      is_enabled: true,
      order: index + 1,
      created_at: new Date().toISOString()
    });
  });
  
  saveAllData();
}

export function deleteClientAnalysisAxes(clientId: string): void {
  clientAnalysisAxes = clientAnalysisAxes.filter(ca => ca.client_id !== clientId);
  saveAllData();
}

// ===== FONCTIONS POUR LA GESTION DES PARAMÈTRES (COMPATIBILITÉ) =====

export function getSettings(): Setting[] {
  return settings;
}

export function getSetting(key: string): string | undefined {
  return settings.find(s => s.key === key)?.value;
}

export function setSetting(key: string, value: string): void {
  const existing = settings.find(s => s.key === key);
  if (existing) {
    existing.value = value;
  } else {
    settings.push({ key, value });
  }
  saveAllData();
}

// ===== FONCTIONS POUR L'ANCIEN SYSTÈME (COMPATIBILITÉ) =====

export function createSession() {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const session = {
    id: sessionId,
    completed: false,
    created_at: new Date().toISOString()
  };
  // Note: Les anciennes sessions ne sont pas sauvegardées en JSON
  return session;
}

export function createSessionWithId(sessionId: string) {
  const session = {
    id: sessionId,
    completed: false,
    created_at: new Date().toISOString()
  };
  // Note: Les anciennes sessions ne sont pas sauvegardées en JSON
  return session;
}

export function addResponse(sessionId: string, questionId: number, answer: string) {
  const response = {
    id: nextId++,
    session_id: sessionId,
    question_id: questionId,
    answer,
    created_at: new Date().toISOString()
  };
  // Note: Les anciennes réponses ne sont pas sauvegardées en JSON
  return response;
}

export function getResponses(sessionId: string) {
  // Note: Les anciennes réponses ne sont pas sauvegardées en JSON
  return [];
}

export function completeSession(sessionId: string) {
  // Note: Les anciennes sessions ne sont pas sauvegardées en JSON
  return null;
}

export function getSession(sessionId: string) {
  // Note: Les anciennes sessions ne sont pas sauvegardées en JSON
  return null;
}

export function calculateResults(sessionId: string) {
  // Note: Les anciens résultats ne sont pas sauvegardés en JSON
  return [];
}

// ===== FONCTIONS DE DIAGNOSTIC =====

export function getDatabaseStatus() {
  return {
    questions: questions.length,
    clients: clients.length,
    sessions: 0, // Anciennes sessions
    questionnaireSessions: questionnaireSessions.length,
    respondentProfiles: respondentProfiles.length,
    sessionResponses: sessionResponses.length,
    sessionResults: sessionResults.length,
    respondentParameters: respondentParameters.length,
    nextId: nextId
  };
}

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
    sessionsWithoutShortUrls: sessionsWithoutShortUrls.map(s => ({
      id: s.id,
      name: s.name,
      isActive: s.is_active
    }))
  };
}

// Initialiser la base de données
loadAllData();
initDefaultData();
saveAllData();
