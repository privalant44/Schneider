'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Download, RefreshCw } from 'lucide-react';
import { CULTURE_TYPES, DomainAnalysis } from '@/lib/types';
import RadarChart from '@/app/components/RadarChart';

interface Result {
  culture: 'A' | 'B' | 'C' | 'D';
  count: number;
  percentage: number;
}

export default function ResultatsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [domainAnalysis, setDomainAnalysis] = useState<DomainAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchResults(true); // Toujours recalculer au chargement initial
  }, []);

  const fetchResults = async (forceRecalculate = false) => {
    try {
      if (forceRecalculate) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('sessionId') || localStorage.getItem('lastSessionId');
      const profileId = urlParams.get('profileId');
      
      if (!sessionId) {
        console.error('Aucun sessionId trouvé');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      let url = profileId 
        ? `/api/results?sessionId=${sessionId}&profileId=${profileId}`
        : `/api/results?sessionId=${sessionId}`;
      
      if (forceRecalculate && !profileId) {
        url += '&recalculate=true';
      }
      
      // Ajouter un timestamp pour éviter le cache
      url += `&t=${Date.now()}`;
      
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Résultats reçus:', data);
        const sortedResults = data.sort((a: any, b: any) => b.percentage - a.percentage);
        console.log('Résultats triés:', sortedResults);
        
        // Mettre à jour l'état directement
        setResults(sortedResults);
        setLastUpdate(new Date());
        
        // Récupérer les analyses par domaine seulement pour les sessions consolidées (sans profileId)
        if (!profileId) {
          try {
            const domainResponse = await fetch(`/api/domain-analysis?sessionId=${sessionId}&t=${Date.now()}`);
            if (domainResponse.ok) {
              const domainData = await domainResponse.json();
              setDomainAnalysis(domainData);
              console.log('Analyses par domaine reçues:', domainData);
            }
          } catch (domainError) {
            console.error('Erreur lors du chargement des analyses par domaine:', domainError);
          }
        }
      } else {
        console.error('Erreur lors du chargement des résultats:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des résultats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDominantCultures = () => {
    if (results.length === 0) {
      return { cultures: [], isMultiple: false };
    }

    const maxPercentage = Math.max(...results.map(r => r.percentage));
    const dominantCultures = results.filter(r => r.percentage === maxPercentage);
    
    return {
      cultures: dominantCultures,
      isMultiple: dominantCultures.length > 1
    };
  };

  const getCultureInfo = (letter: 'A' | 'B' | 'C' | 'D') => {
    return CULTURE_TYPES.find(c => c.letter === letter);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-anima-blue"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Aucun résultat trouvé</h2>
          <p className="text-gray-600 mb-6">Il semble qu'il n'y ait pas de réponses enregistrées pour cette session.</p>
        </div>
      </div>
    );
  }

  const dominantCulturesData = getDominantCultures();
  const { cultures: dominantCultures, isMultiple } = dominantCulturesData;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Log pour débugger l'affichage
  console.log('Rendu de la page - results:', results);
  console.log('Total des réponses affiché:', results.reduce((total, result) => total + result.count, 0));
  console.log('LastUpdate:', lastUpdate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Questionnaire Terminé !
            </h1>
            <p className="text-xl text-gray-600">
              {urlParams.get('profileId') ? 'Voici votre profil de culture d\'entreprise' : 'Voici les résultats consolidés de la session'}
            </p>
            {!urlParams.get('profileId') && (
              <div className="mt-2">
                <p className="text-lg text-gray-500">
                  Basé sur <span className="font-bold text-anima-blue text-xl">{results.reduce((total, result) => total + result.count, 0)}</span> réponses au total
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Dernière mise à jour: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'En cours...'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isMultiple ? 'Cultures dominantes' : 'Culture dominante'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dominantCultures.map((culture) => {
              const cultureInfo = getCultureInfo(culture.culture);
              return (
                <div key={culture.culture} className="text-center">
                  <div className={`w-16 h-16 ${cultureInfo?.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    <span className="text-white text-2xl font-bold">{culture.culture}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {cultureInfo?.name}
                  </h3>
                  <p className="text-3xl font-bold text-anima-blue">
                    {culture.percentage}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="mb-12">
          <RadarChart results={results} domainAnalysis={domainAnalysis} />
        </div>

        {/* Résultats détaillés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {results.map((result) => {
            const cultureInfo = getCultureInfo(result.culture);
            return (
              <div key={result.culture} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl font-bold text-anima-blue mb-2">
                  {result.percentage}%
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {cultureInfo?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {result.count} réponse{result.count > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Analyse par domaine */}
        {domainAnalysis && domainAnalysis.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Analyse par domaine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domainAnalysis.map((domain) => (
                <div key={domain.id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{domain.domaine}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Position radar: ({domain.radar_x.toFixed(2)}, {domain.radar_y.toFixed(2)})</div>
                    <div>Réponses: A={domain.count_a}, B={domain.count_b}, C={domain.count_c}, D={domain.count_d}</div>
                    <div>Total: {domain.total_responses} réponses</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => fetchResults(true)}
            disabled={refreshing}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              refreshing 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title="Actualiser les données"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <Download className="w-5 h-5" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}