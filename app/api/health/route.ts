import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { APP_CONFIG } from '@/lib/utils/constants';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_CONFIG.VERSION,
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: await checkDatabaseHealth(),
        filesystem: await checkFilesystemHealth(),
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    logger.info('Health check performed', { status: healthCheck.status });

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    logger.error('Health check failed', {}, error as Error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

async function checkDatabaseHealth(): Promise<{ status: string; details?: string }> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    if (!fs.existsSync(dataDir)) {
      return { status: 'unhealthy', details: 'Data directory does not exist' };
    }

    // Vérifier que les fichiers de base de données sont accessibles
    const requiredFiles = [
      'clients.json',
      'sessions.json',
      'questions.json',
      'respondent-profiles.json',
      'session-responses.json',
      'session-results.json',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        return { status: 'unhealthy', details: `Missing required file: ${file}` };
      }
      
      // Vérifier que le fichier est lisible
      try {
        fs.readFileSync(filePath, 'utf8');
      } catch (error) {
        return { status: 'unhealthy', details: `Cannot read file: ${file}` };
      }
    }

    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', details: (error as Error).message };
  }
}

async function checkFilesystemHealth(): Promise<{ status: string; details?: string }> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Vérifier les permissions d'écriture
    const testFile = path.join(dataDir, '.health-check');
    fs.writeFileSync(testFile, 'health check');
    fs.unlinkSync(testFile);
    
    // Vérifier le dossier uploads
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', details: (error as Error).message };
  }
}
