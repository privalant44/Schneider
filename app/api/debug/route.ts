import { NextResponse } from 'next/server';
import { getDatabaseStatus, getQuestions, getClients, getQuestionnaireSessions, getShortUrlDiagnostics } from '@/lib/json-database';

export async function GET() {
  try {
    const status = getDatabaseStatus();
    const questions = getQuestions();
    const clients = getClients();
    const sessions = getQuestionnaireSessions();
    const shortUrlDiagnostics = getShortUrlDiagnostics();
    
    return NextResponse.json({
      status,
      shortUrlDiagnostics,
      sampleData: {
        questions: questions.slice(0, 2), // Premières 2 questions
        clients: clients.slice(0, 2), // Premiers 2 clients
        sessions: sessions.slice(0, 2) // Premières 2 sessions
      }
    });
  } catch (error) {
    console.error('Erreur lors du diagnostic:', error);
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic', details: error },
      { status: 500 }
    );
  }
}
