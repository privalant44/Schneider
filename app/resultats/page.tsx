'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { CULTURE_TYPES } from '@/lib/types';
import RadarChart from '@/app/components/RadarChart';

interface Result {
  culture: 'A' | 'B' | 'C' | 'D';
  count: number;
  percentage: number;
}

export default function ResultatsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Récupérer le sessionId depuis l'URL ou le localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('sessionId') || localStorage.getItem('lastSessionId');
      
      if (!sessionId) {
        console.error('Aucun sessionId trouvé');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/results?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Résultats reçus:', data);
        // Trier les résultats par pourcentage décroissant
        const sortedResults = data.sort((a: any, b: any) => b.percentage - a.percentage);
        console.log('Résultats triés:', sortedResults);
        setResults(sortedResults);
      } else {
        console.error('Erreur lors du chargement des résultats:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des résultats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDominantCultures = () => {
    if (results.length === 0) {
      return { cultures: [], isMultiple: false };
    }
    
    // Trouver le pourcentage maximum
    const maxPercentage = Math.max(...results.map(r => r.percentage));
    
    // Trouver toutes les cultures avec ce pourcentage maximum
    const dominantCultures = results.filter(r => r.percentage === maxPercentage);
    
    return {
      cultures: dominantCultures,
      isMultiple: dominantCultures.length > 1
    };
  };

  const getCultureInfo = (letter: 'A' | 'B' | 'C' | 'D') => {
    const info = CULTURE_TYPES.find(c => c.letter === letter);
    console.log('Recherche culture pour lettre:', letter, 'Trouvé:', info);
    return info;
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
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const dominantCulturesData = getDominantCultures();
  const { cultures: dominantCultures, isMultiple } = dominantCulturesData;
  
  console.log('Cultures dominantes:', dominantCultures);
  console.log('Plusieurs cultures dominantes:', isMultiple);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Questionnaire Terminé !
            </h1>
            <p className="text-xl text-gray-600">
              Voici votre profil de culture d'entreprise
            </p>
          </div>
        </div>

        {/* Culture(s) dominante(s) */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isMultiple ? 'Vos cultures dominantes' : 'Votre culture dominante'}
          </h2>
          
          {isMultiple ? (
            // Affichage pour plusieurs cultures dominantes
            <div className="text-center">
              <div className="flex justify-center gap-4 mb-6">
                {dominantCultures.map((culture) => {
                  const cultureInfo = getCultureInfo(culture.culture);
                  return (
                    <div key={culture.culture} className="flex flex-col items-center">
                      <div 
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-xl mb-2"
                        style={{
                          backgroundColor: culture.culture === 'A' ? '#ef4444' : 
                                         culture.culture === 'B' ? '#eab308' :
                                         culture.culture === 'C' ? '#3b82f6' :
                                         culture.culture === 'D' ? '#22c55e' : '#6b7280'
                        }}
                      >
                        {culture.culture}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {cultureInfo?.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-lg text-gray-600 mb-4">
                {dominantCultures[0]?.percentage || 0}% de vos réponses pour chaque culture
              </p>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Vous avez un profil équilibré entre {dominantCultures.map((c, i) => {
                  const info = getCultureInfo(c.culture);
                  return i === dominantCultures.length - 1 ? 
                    (dominantCultures.length > 1 ? ` et ${info?.name}` : info?.name) : 
                    `${info?.name}${i < dominantCultures.length - 2 ? ', ' : ''}`;
                }).join('')}.
              </p>
            </div>
          ) : (
            // Affichage pour une seule culture dominante
            <div className="text-center">
              {dominantCultures.length > 0 && (() => {
                const dominantCulture = dominantCultures[0];
                const dominantCultureInfo = getCultureInfo(dominantCulture.culture);
                return (
                  <>
                    <div 
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full text-white font-bold text-2xl mb-4"
                      style={{
                        backgroundColor: dominantCulture.culture === 'A' ? '#ef4444' : 
                                       dominantCulture.culture === 'B' ? '#eab308' :
                                       dominantCulture.culture === 'C' ? '#3b82f6' :
                                       dominantCulture.culture === 'D' ? '#22c55e' : '#6b7280'
                      }}
                    >
                      {dominantCulture.culture}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {dominantCultureInfo?.name || 'Culture inconnue'}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      {dominantCulture.percentage}% de vos réponses
                    </p>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                      {dominantCultureInfo?.description || 'Aucune description disponible'}
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Graphique radar */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Profil de culture d'entreprise
          </h2>
          
          <div className="flex justify-center mb-8">
            <RadarChart results={results} />
          </div>
        </div>

        {/* Détail des résultats avec jauges */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Répartition détaillée
          </h2>
          
          <div className="space-y-4">
            {results.map((result) => {
              const cultureInfo = getCultureInfo(result.culture);
              console.log('Culture:', result.culture, 'Info:', cultureInfo, 'Percentage:', result.percentage, 'Width style:', `${result.percentage}%`);
              
              return (
                <div key={result.culture} className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      backgroundColor: result.culture === 'A' ? '#ef4444' : 
                                     result.culture === 'B' ? '#eab308' :
                                     result.culture === 'C' ? '#3b82f6' :
                                     result.culture === 'D' ? '#22c55e' : '#6b7280'
                    }}
                  >
                    {result.culture}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-800">{cultureInfo?.name || 'Culture inconnue'}</span>
                      <span className="text-gray-600">{result.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${result.percentage}%`,
                          backgroundColor: result.culture === 'A' ? '#ef4444' : 
                                         result.culture === 'B' ? '#eab308' :
                                         result.culture === 'C' ? '#3b82f6' :
                                         result.culture === 'D' ? '#22c55e' : '#6b7280'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-anima-blue text-white rounded-lg hover:bg-anima-dark-blue transition-colors"
          >
            <Download className="w-5 h-5" />
            Télécharger les résultats
          </button>
        </div>
      </div>
    </div>
  );
}
