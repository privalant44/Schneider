'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Loader2, Download, RefreshCw } from 'lucide-react';
import { QuestionnaireSession, SessionResults } from '@/lib/types';
import AdminNavigation from '@/app/components/AdminNavigation';

interface AnalysisResult {
  success: boolean;
  analysis: string;
  metadata: {
    session1Id: string;
    session2Id: string;
    analysisType: string;
    timestamp: string;
  };
}

export default function ComparisonAnalysisPage() {
  const [sessions, setSessions] = useState<QuestionnaireSession[]>([]);
  const [session1, setSession1] = useState<string>('');
  const [session2, setSession2] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<string>('comparison');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  };

  const runAnalysis = async () => {
    if (!session1 || !session2) {
      setError('Veuillez sélectionner deux sessions à comparer');
      return;
    }

    if (session1 === session2) {
      setError('Veuillez sélectionner deux sessions différentes');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/chatgpt-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session1Id: session1,
          session2Id: session2,
          analysisType
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data);
      } else {
        setError(data.error || 'Erreur lors de l\'analyse');
      }
    } catch (error) {
      setError('Erreur de connexion lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalysis = () => {
    if (!analysisResult) return;
    
    const content = `# Analyse Comparative - ${analysisResult.metadata.analysisType}
    
**Sessions comparées :**
- Session 1 : ${sessions.find(s => s.id === analysisResult.metadata.session1Id)?.name}
- Session 2 : ${sessions.find(s => s.id === analysisResult.metadata.session2Id)?.name}

**Date d'analyse :** ${new Date(analysisResult.metadata.timestamp).toLocaleString('fr-FR')}

---

${analysisResult.analysis}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse-comparative-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSessionName = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session ? `${session.name} (${new Date(session.start_date).toLocaleDateString('fr-FR')})` : 'Session inconnue';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux Analyses
            </a>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Analyse Comparative IA
              </h1>
              <p className="text-gray-600 mt-2">
                Analysez et comparez vos sessions avec l'intelligence artificielle
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Configuration de l'Analyse
            </h2>

            <div className="space-y-6">
              {/* Sélection des sessions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Première session à analyser
                </label>
                <select
                  value={session1}
                  onChange={(e) => setSession1(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                >
                  <option value="">Sélectionner une session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({new Date(session.start_date).toLocaleDateString('fr-FR')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deuxième session à analyser
                </label>
                <select
                  value={session2}
                  onChange={(e) => setSession2(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                >
                  <option value="">Sélectionner une session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({new Date(session.start_date).toLocaleDateString('fr-FR')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type d'analyse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'analyse
                </label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-anima-blue focus:border-transparent"
                >
                  <option value="comparison">Analyse comparative</option>
                  <option value="trends">Analyse des tendances</option>
                  <option value="recommendations">Recommandations stratégiques</option>
                </select>
              </div>

              {/* Bouton d'analyse */}
              <button
                onClick={runAnalysis}
                disabled={loading || !session1 || !session2}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Lancer l'analyse IA
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Résultats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Résultats de l'Analyse
              </h2>
              {analysisResult && (
                <button
                  onClick={exportAnalysis}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              )}
            </div>

            {analysisResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Sessions analysées :</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {getSessionName(analysisResult.metadata.session1Id)}</li>
                    <li>• {getSessionName(analysisResult.metadata.session2Id)}</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    Analyse générée le {new Date(analysisResult.metadata.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {analysisResult.analysis}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Sélectionnez deux sessions et lancez l'analyse pour voir les résultats
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
