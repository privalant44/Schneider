export interface Question {
  id: number;
  question_text: string;
  // Option A
  text_a: string;
  image_a: string;
  // Option B
  text_b: string;
  image_b: string;
  // Option C
  text_c: string;
  image_c: string;
  // Option D
  text_d: string;
  image_d: string;
  order_index: number;
  domaine: string;
  created_at: string;
  updated_at: string;
}

export interface RandomizedOption {
  id: string;
  imageUrl: string;
  text: string;
  originalLetter: 'A' | 'B' | 'C' | 'D';
}

export interface Answer {
  id: number;
  session_id: string;
  question_id: number;
  answer: 'A' | 'B' | 'C' | 'D';
  created_at: string;
}

export interface Session {
  id: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

export interface Settings {
  welcome_text: string;
  company_logo: string;
}

export interface CultureType {
  letter: 'A' | 'B' | 'C' | 'D';
  name: string;
  description: string;
  color: string;
}

export const CULTURE_TYPES: CultureType[] = [
  {
    letter: 'A',
    name: 'Contrôle',
    description: 'Culture orientée vers la structure, les processus et la hiérarchie',
    color: 'bg-red-500'
  },
  {
    letter: 'B',
    name: 'Expertise',
    description: 'Culture orientée vers la compétence technique et l\'innovation',
    color: 'bg-yellow-500'
  },
  {
    letter: 'C',
    name: 'Collaboration',
    description: 'Culture orientée vers le travail d\'équipe et la coopération',
    color: 'bg-blue-500'
  },
  {
    letter: 'D',
    name: 'Cultivation',
    description: 'Culture orientée vers le développement personnel et l\'apprentissage',
    color: 'bg-green-500'
  }
];

// Nouveaux types pour le système multi-clients
export interface Client {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export interface RespondentProfile {
  id: string;
  session_id: string;
  // Réponses aux axes d'analyse (clé = axis_id, valeur = réponse)
  axis_responses: Record<string, string | string[]>;
  // Propriétés démographiques
  division?: string;
  domain?: string;
  age_range?: string;
  gender?: string;
  seniority?: string;
  created_at: string;
}

export interface DomainAnalysis {
  id: string;
  session_id: string;
  domaine: string;
  // Calculs radar
  radar_x: number; // (A + B - C - D) / total
  radar_y: number; // (A - B + C - D) / total
  // Détails des réponses
  count_a: number;
  count_b: number;
  count_c: number;
  count_d: number;
  total_responses: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireSession {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  short_url?: string;
  planned_participants?: number;
  // Axes d'analyse figés au moment de la création de la session
  frozen_analysis_axes: AnalysisAxis[];
  created_at: string;
  updated_at: string;
}

export interface SessionResponse {
  id: number;
  session_id: string;
  respondent_profile_id: string;
  question_id: number;
  answer: 'A' | 'B' | 'C' | 'D';
  created_at: string;
}

export interface SessionResults {
  session_id: string;
  total_responses: number;
  culture_distribution: {
    culture: 'A' | 'B' | 'C' | 'D';
    count: number;
    percentage: number;
  }[];
  respondent_breakdown: {
    division?: Record<string, number>;
    domain?: Record<string, number>;
    age_range?: Record<string, number>;
    gender?: Record<string, number>;
    seniority?: Record<string, number>;
  };
  created_at: string;
}

// Types pour les paramètres de répondants (spécifiques par client)
// Types pour les axes d'analyse
export interface AnalysisAxis {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  order: number;
  category: 'organizational' | 'demographic'; // Axes organisationnels ou démographiques
  created_at: string;
}

export interface ClientAnalysisAxis {
  id: string;
  client_id: string;
  axis_id: string;
  is_enabled: boolean;
  order: number;
  created_at: string;
}

// Type pour les axes spécifiques aux clients (copie des axes par défaut)
export interface ClientSpecificAxis extends AnalysisAxis {
  client_id: string;
}


// Types pour les comparaisons entre sessions
export interface SessionComparison {
  session1_id: string;
  session2_id: string;
  evolution: {
    culture: 'A' | 'B' | 'C' | 'D';
    change_percentage: number;
    change_direction: 'increase' | 'decrease' | 'stable';
  }[];
  total_evolution: {
    total_responses_change: number;
    response_rate_change: number;
  };
}