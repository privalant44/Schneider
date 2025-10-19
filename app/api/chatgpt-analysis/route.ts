import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionResults, getQuestionnaireSession } from '@/lib/json-database';

// Initialiser OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { session1Id, session2Id, analysisType } = await request.json();
    
    if (!session1Id || !session2Id) {
      return NextResponse.json(
        { error: 'Les IDs des deux sessions sont requis' },
        { status: 400 }
      );
    }

    // Récupérer les données des sessions
    const session1 = getQuestionnaireSession(session1Id);
    const session2 = getQuestionnaireSession(session2Id);
    const results1 = getSessionResults(session1Id);
    const results2 = getSessionResults(session2Id);

    if (!session1 || !session2 || !results1 || !results2) {
      return NextResponse.json(
        { error: 'Une ou plusieurs sessions non trouvées' },
        { status: 404 }
      );
    }

    // Préparer les données pour ChatGPT
    const analysisData = {
      session1: {
        name: session1.name,
        startDate: session1.start_date,
        endDate: session1.end_date,
        totalResponses: results1.total_responses,
        cultureDistribution: results1.culture_distribution
      },
      session2: {
        name: session2.name,
        startDate: session2.start_date,
        endDate: session2.end_date,
        totalResponses: results2.total_responses,
        cultureDistribution: results2.culture_distribution
      }
    };

    // Créer le prompt pour ChatGPT
    const prompt = createAnalysisPrompt(analysisData, analysisType);

    // Appeler ChatGPT
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse de culture organisationnelle et en questionnaires de type Schneider. Tu analyses les résultats de questionnaires pour fournir des insights pertinents et actionables.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const analysis = completion.choices[0]?.message?.content;

    if (!analysis) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération de l\'analyse' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        session1Id,
        session2Id,
        analysisType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'analyse ChatGPT:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Clé API OpenAI manquante ou invalide' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse ChatGPT' },
      { status: 500 }
    );
  }
}

function createAnalysisPrompt(data: any, analysisType: string): string {
  const basePrompt = `
Analyse les résultats de ces deux sessions de questionnaire de culture organisationnelle Schneider :

**SESSION 1 - ${data.session1.name}**
- Période : ${data.session1.startDate} ${data.session1.endDate ? `à ${data.session1.endDate}` : '(en cours)'}
- Nombre de répondants : ${data.session1.totalResponses}
- Distribution des cultures :
  - Contrôle (A) : ${data.session1.cultureDistribution.find((c: any) => c.culture === 'A')?.percentage || 0}%
  - Expertise (B) : ${data.session1.cultureDistribution.find((c: any) => c.culture === 'B')?.percentage || 0}%
  - Collaboration (C) : ${data.session1.cultureDistribution.find((c: any) => c.culture === 'C')?.percentage || 0}%
  - Cultivation (D) : ${data.session1.cultureDistribution.find((c: any) => c.culture === 'D')?.percentage || 0}%

**SESSION 2 - ${data.session2.name}**
- Période : ${data.session2.startDate} ${data.session2.endDate ? `à ${data.session2.endDate}` : '(en cours)'}
- Nombre de répondants : ${data.session2.totalResponses}
- Distribution des cultures :
  - Contrôle (A) : ${data.session2.cultureDistribution.find((c: any) => c.culture === 'A')?.percentage || 0}%
  - Expertise (B) : ${data.session2.cultureDistribution.find((c: any) => c.culture === 'B')?.percentage || 0}%
  - Collaboration (C) : ${data.session2.cultureDistribution.find((c: any) => c.culture === 'C')?.percentage || 0}%
  - Cultivation (D) : ${data.session2.cultureDistribution.find((c: any) => c.culture === 'D')?.percentage || 0}%

`;

  const analysisInstructions = {
    'comparison': `
Fournis une analyse comparative détaillée incluant :
1. **Évolution générale** : Comment la culture organisationnelle a-t-elle évolué ?
2. **Points forts et faiblesses** : Quelles cultures dominent et pourquoi ?
3. **Recommandations** : Que suggères-tu pour améliorer la culture ?
4. **Actions prioritaires** : Quelles sont les 3 actions les plus importantes à mettre en place ?
`,
    'trends': `
Analyse les tendances et évolutions :
1. **Tendances observées** : Quels changements majeurs vois-tu ?
2. **Causes probables** : Qu'est-ce qui pourrait expliquer ces évolutions ?
3. **Impact organisationnel** : Quelles sont les implications pour l'organisation ?
4. **Prédictions** : Où va la culture organisationnelle selon toi ?
`,
    'recommendations': `
Fournis des recommandations stratégiques :
1. **Diagnostic** : Quel est l'état actuel de la culture ?
2. **Objectifs** : Vers quelle culture l'organisation devrait-elle tendre ?
3. **Plan d'action** : Quelles étapes concrètes proposer ?
4. **Métriques de suivi** : Comment mesurer les progrès ?
`
  };

  return basePrompt + (analysisInstructions[analysisType as keyof typeof analysisInstructions] || analysisInstructions.comparison);
}
