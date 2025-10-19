/**
 * Système de logging centralisé
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;

  constructor(level?: LogLevel) {
    if (level !== undefined) {
      this.currentLevel = level;
    } else if (process.env.NODE_ENV === 'development') {
      this.currentLevel = LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    
    let formattedMessage = `[${timestamp}] ${levelName}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formattedMessage += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
      if (error.stack) {
        formattedMessage += ` | Stack: ${error.stack}`;
      }
    }
    
    return formattedMessage;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context, error);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
}

// Instance singleton
export const logger = new Logger();

// Fonctions utilitaires pour les cas d'usage courants
export const logApiRequest = (method: string, url: string, context?: Record<string, any>) => {
  logger.info(`API Request: ${method} ${url}`, context);
};

export const logApiResponse = (method: string, url: string, statusCode: number, context?: Record<string, any>) => {
  if (statusCode >= 400) {
    logger.error(`API Response: ${method} ${url} - ${statusCode}`, context);
  } else {
    logger.info(`API Response: ${method} ${url} - ${statusCode}`, context);
  }
};

export const logDatabaseOperation = (operation: string, table: string, context?: Record<string, any>) => {
  logger.debug(`Database: ${operation} on ${table}`, context);
};

export const logUserAction = (action: string, userId?: string, context?: Record<string, any>) => {
  logger.info(`User Action: ${action}`, { userId, ...context });
};
