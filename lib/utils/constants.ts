/**
 * Constantes de l'application
 */

// Configuration de l'application
export const APP_CONFIG = {
  NAME: 'Questionnaire Schneider',
  VERSION: '1.0.0',
  DESCRIPTION: 'Application de questionnaire pour l\'analyse de culture d\'entreprise',
  AUTHOR: 'Schneider Electric',
} as const;

// Limites et contraintes
export const LIMITS = {
  MAX_QUESTIONS_PER_SESSION: 50,
  MAX_RESPONSES_PER_SESSION: 1000,
  MAX_QUESTION_TEXT_LENGTH: 500,
  MAX_DOMAIN_LENGTH: 50,
  MAX_CLIENT_NAME_LENGTH: 100,
  MAX_SESSION_NAME_LENGTH: 100,
  MIN_QUESTION_TEXT_LENGTH: 10,
  MIN_DOMAIN_LENGTH: 2,
  MIN_NAME_LENGTH: 2,
} as const;

// Types de culture
export const CULTURE_TYPES = {
  A: {
    name: 'Contrôle',
    description: 'Culture orientée contrôle et processus',
    color: '#ef4444',
    position: 'haut-droite'
  },
  B: {
    name: 'Expertise',
    description: 'Culture orientée expertise et évolution',
    color: '#eab308',
    position: 'bas-droite'
  },
  C: {
    name: 'Collaboration',
    description: 'Culture orientée collaboration et individus',
    color: '#3b82f6',
    position: 'haut-gauche'
  },
  D: {
    name: 'Cultivation',
    description: 'Culture orientée cultivation et développement',
    color: '#22c55e',
    position: 'bas-gauche'
  }
} as const;

// Réponses possibles
export const ANSWER_OPTIONS = ['A', 'B', 'C', 'D'] as const;

// Statuts de session
export const SESSION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const;

// Types de fichiers autorisés
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Données de validation invalides',
  NOT_FOUND: 'Ressource non trouvée',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',
  CONFLICT: 'Conflit de données',
  INTERNAL_ERROR: 'Erreur interne du serveur',
  INVALID_SESSION_ID: 'ID de session invalide',
  INVALID_QUESTION_ID: 'ID de question invalide',
  INVALID_CLIENT_ID: 'ID de client invalide',
  SESSION_NOT_FOUND: 'Session non trouvée',
  QUESTION_NOT_FOUND: 'Question non trouvée',
  CLIENT_NOT_FOUND: 'Client non trouvé',
  INVALID_ANSWER: 'Réponse invalide (doit être A, B, C ou D)',
  MISSING_REQUIRED_FIELD: 'Champ requis manquant',
  FILE_TOO_LARGE: 'Fichier trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier non autorisé',
} as const;

// Messages de succès standardisés
export const SUCCESS_MESSAGES = {
  SESSION_CREATED: 'Session créée avec succès',
  SESSION_UPDATED: 'Session mise à jour avec succès',
  SESSION_DELETED: 'Session supprimée avec succès',
  QUESTION_CREATED: 'Question créée avec succès',
  QUESTION_UPDATED: 'Question mise à jour avec succès',
  QUESTION_DELETED: 'Question supprimée avec succès',
  CLIENT_CREATED: 'Client créé avec succès',
  CLIENT_UPDATED: 'Client mis à jour avec succès',
  CLIENT_DELETED: 'Client supprimé avec succès',
  RESPONSE_SUBMITTED: 'Réponse soumise avec succès',
  FILE_UPLOADED: 'Fichier uploadé avec succès',
} as const;

// Configuration du radar
export const RADAR_CONFIG = {
  SIZE: 1200,
  RADIUS: 420,
  POINT_RADIUS: 12,
  POINT_STROKE_WIDTH: 4,
  LABEL_OFFSET: 30,
  AXIS_LABEL_OFFSET: 120,
} as const;

// Configuration de la base de données
export const DATABASE_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24h en ms
} as const;

// Configuration des URLs courtes
export const SHORT_URL_CONFIG = {
  LENGTH: 8,
  CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  MAX_ATTEMPTS: 10,
} as const;
