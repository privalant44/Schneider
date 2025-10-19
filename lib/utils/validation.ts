/**
 * Utilitaires de validation pour l'application
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valide un email
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Format d\'email invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un nom (non vide, caractères autorisés)
 */
export function validateName(name: string, fieldName: string = 'Nom'): ValidationResult {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push(`${fieldName} requis`);
  } else if (name.trim().length < 2) {
    errors.push(`${fieldName} doit contenir au moins 2 caractères`);
  } else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(name.trim())) {
    errors.push(`${fieldName} contient des caractères non autorisés`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un ID de session
 */
export function validateSessionId(sessionId: string): ValidationResult {
  const errors: string[] = [];
  
  if (!sessionId) {
    errors.push('ID de session requis');
  } else if (!/^session_\d+_[a-z0-9]+$/.test(sessionId)) {
    errors.push('Format d\'ID de session invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un domaine
 */
export function validateDomain(domain: string): ValidationResult {
  const errors: string[] = [];
  
  if (!domain || domain.trim().length === 0) {
    errors.push('Domaine requis');
  } else if (domain.trim().length < 2) {
    errors.push('Domaine doit contenir au moins 2 caractères');
  } else if (domain.trim().length > 50) {
    errors.push('Domaine ne peut pas dépasser 50 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide une réponse de question (A, B, C, D)
 */
export function validateAnswer(answer: string): ValidationResult {
  const errors: string[] = [];
  
  if (!answer) {
    errors.push('Réponse requise');
  } else if (!['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
    errors.push('Réponse doit être A, B, C ou D');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un texte de question
 */
export function validateQuestionText(text: string): ValidationResult {
  const errors: string[] = [];
  
  if (!text || text.trim().length === 0) {
    errors.push('Texte de question requis');
  } else if (text.trim().length < 10) {
    errors.push('Question doit contenir au moins 10 caractères');
  } else if (text.trim().length > 500) {
    errors.push('Question ne peut pas dépasser 500 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un ordre d'affichage
 */
export function validateOrderIndex(order: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof order !== 'number' || isNaN(order)) {
    errors.push('Ordre doit être un nombre');
  } else if (order < 1) {
    errors.push('Ordre doit être supérieur à 0');
  } else if (order > 1000) {
    errors.push('Ordre ne peut pas dépasser 1000');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
