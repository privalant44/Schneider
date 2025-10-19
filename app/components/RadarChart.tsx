'use client';

import { CULTURE_TYPES, DomainAnalysis } from '@/lib/types';

interface RadarResult {
  culture: 'A' | 'B' | 'C' | 'D';
  count: number;
  percentage: number;
}

interface RadarChartProps {
  results: RadarResult[];
  domainAnalysis?: DomainAnalysis[];
}

export default function RadarChart({ results, domainAnalysis = [] }: RadarChartProps) {
  const size = 1200; // Agrandi de 800 à 1200
  const center = size / 2;
  const radius = 420; // Agrandi de 280 à 420
  
  // Vérification de sécurité pour éviter les erreurs
  if (!results || !Array.isArray(results)) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }
  
  // Créer un objet pour faciliter l'accès aux résultats
  const resultsMap = results.reduce((acc, result) => {
    acc[result.culture] = result;
    return acc;
  }, {} as Record<string, RadarResult>);

  // Coordonnées des 4 quadrants selon la logique Excel
  // Existant-Processus (haut-droite) = Contrôle
  // Evolution-Processus (bas-droite) = Expertise  
  // Existant-Individus (haut-gauche) = Collaboration
  // Evolution-Individus (bas-gauche) = Cultivation
  const quadrants = [
    { 
      culture: 'A', 
      name: 'Contrôle', 
      angle: 45,  // Haut-droite (Existant-Processus)
      color: '#ef4444',
      image: '/images/control.svg'
    },
    { 
      culture: 'B', 
      name: 'Expertise', 
      angle: 135, // Bas-droite (Evolution-Processus)
      color: '#eab308',
      image: '/images/expertise.svg'
    },
    { 
      culture: 'C', 
      name: 'Collaboration', 
      angle: -45, // Haut-gauche (Existant-Individus)
      color: '#3b82f6',
      image: '/images/collaboration.svg'
    },
    { 
      culture: 'D', 
      name: 'Cultivation', 
      angle: -135, // Bas-gauche (Evolution-Individus)
      color: '#22c55e',
      image: '/images/cultivation.svg'
    }
  ];

  // Fonction pour convertir les coordonnées polaires en coordonnées cartésiennes
  const polarToCartesian = (angle: number, distance: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + distance * Math.cos(radians),
      y: center + distance * Math.sin(radians)
    };
  };

  // Créer les lignes de grille octogonales concentriques
  const gridLines = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => {
    // Créer un octogone avec 8 points (4 axes + 4 diagonales)
    const octagonPoints = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) - 90; // Commencer à -90° (haut)
      const coords = polarToCartesian(angle, radius * scale);
      octagonPoints.push(`${coords.x},${coords.y}`);
    }
    return (
      <polygon
        key={index}
        points={octagonPoints.join(' ')}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    );
  });

  // Créer les 4 axes principaux
  const mainAxes = [
    { angle: -90, label: 'Existant' },   // Haut
    { angle: 0, label: 'Processus' },    // Droite
    { angle: 90, label: 'Evolution' },   // Bas
    { angle: 180, label: 'Individus' }   // Gauche
  ];

  const axes = mainAxes.map((axis, index) => {
    const coords = polarToCartesian(axis.angle, radius);
    return (
      <line
        key={index}
        x1={center}
        y1={center}
        x2={coords.x}
        y2={coords.y}
        stroke="#d1d5db"
        strokeWidth="2"
      />
    );
  });

  // Créer les aires carrées proportionnelles pour chaque culture
  const cultureAreas = quadrants.map((quadrant) => {
    const result = resultsMap[quadrant.culture];
    console.log(`Culture ${quadrant.culture}:`, result);
    
    if (!result || result.percentage === 0) {
      console.log(`Pas d'aire pour ${quadrant.culture} - pourcentage:`, result?.percentage);
      return null;
    }

    const scale = result.percentage / 100;
    const squareSize = radius * scale; // Taille du carré basée sur le pourcentage
    
    console.log(`Carré pour ${quadrant.culture}: scale=${scale}, size=${squareSize}, percentage=${result.percentage}%`);
    
    // Calculer la position du carré selon le quadrant (démarre du centre)
    let x, y;
    
    switch (quadrant.culture) {
      case 'A': // Contrôle - haut à droite
        x = center; // Démarre du centre
        y = center - squareSize; // S'étend vers le haut
        break;
      case 'B': // Expertise - bas à droite
        x = center; // Démarre du centre
        y = center; // S'étend vers le bas
        break;
      case 'C': // Collaboration - haut à gauche
        x = center - squareSize; // S'étend vers la gauche
        y = center - squareSize; // S'étend vers le haut
        break;
      case 'D': // Cultivation - bas à gauche
        x = center - squareSize; // S'étend vers la gauche
        y = center; // S'étend vers le bas
        break;
      default:
        x = center;
        y = center;
    }

    console.log(`Position carré ${quadrant.culture}: x=${x}, y=${y}, size=${squareSize}`);

    return (
      <rect
        key={quadrant.culture}
        x={x}
        y={y}
        width={squareSize}
        height={squareSize}
        fill={quadrant.color}
        fillOpacity="0.6"
        stroke={quadrant.color}
        strokeWidth="1"
      />
    );
  });

  // Créer les labels des axes (positionnés aux extrémités)
  const axisLabels = mainAxes.map((axis, index) => {
    const coords = polarToCartesian(axis.angle, radius + 120); // Plus éloigné
    return {
      text: axis.label,
      x: coords.x,
      y: coords.y,
      angle: 0 // Toujours horizontal
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="border border-gray-200 rounded-lg bg-white">
        {/* Grille de fond */}
        {gridLines}
        
        {/* Axes */}
        {axes}
        
        {/* Aires des cultures */}
        {cultureAreas}
        
        {/* Labels des axes */}
        {axisLabels.map((label, index) => (
          <text
            key={index}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium text-gray-600"
            transform={`rotate(${label.angle} ${label.x} ${label.y})`}
          >
            {label.text}
          </text>
        ))}
        
        {/* Points par domaine (seulement si domainAnalysis est fourni) */}
        {domainAnalysis && domainAnalysis.length > 0 && domainAnalysis.map((domain) => {
          // Convertir les coordonnées radar (X, Y) en position sur le graphique
          // X et Y sont normalisés entre -1 et 1, on les convertit en position sur le radar
          const x = center + (domain.radar_x * radius * 0.8); // 0.8 pour laisser de la marge
          const y = center - (domain.radar_y * radius * 0.8); // Inverser Y car SVG a Y vers le bas
          
          return (
            <g key={domain.id}>
              {/* Point du domaine */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="#8b5cf6"
                stroke="#ffffff"
                strokeWidth="4"
                className="drop-shadow-sm"
              />
              
              {/* Label du domaine */}
              <text
                x={x}
                y={y - 30}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-base font-medium text-purple-700 fill-current"
              >
                {domain.domaine}
              </text>
            </g>
          );
        })}

        {/* Labels des cultures et pourcentages */}
        {quadrants.map((quadrant) => {
          const result = resultsMap[quadrant.culture];
          const percentage = result ? result.percentage : 0;
          
          // Position du label vers les extrémités selon le quadrant
          let labelX, labelY;
          
          switch (quadrant.culture) {
            case 'A': // Contrôle - haut à droite
              labelX = center + radius * 0.7; // Plus vers la droite
              labelY = center - radius * 0.7; // Plus vers le haut
              break;
            case 'B': // Expertise - bas à droite
              labelX = center + radius * 0.7; // Plus vers la droite
              labelY = center + radius * 0.7; // Plus vers le bas
              break;
            case 'C': // Collaboration - haut à gauche
              labelX = center - radius * 0.7; // Plus vers la gauche
              labelY = center - radius * 0.7; // Plus vers le haut
              break;
            case 'D': // Cultivation - bas à gauche
              labelX = center - radius * 0.7; // Plus vers la gauche
              labelY = center + radius * 0.7; // Plus vers le bas
              break;
            default:
              labelX = center;
              labelY = center;
          }
          
          return (
            <g key={quadrant.culture}>
              {/* Nom de la culture */}
              <text
                x={labelX}
                y={labelY - 18}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg font-bold text-gray-800"
              >
                {quadrant.name}
              </text>
              
              {/* Pourcentage */}
              <text
                x={labelX}
                y={labelY + 24}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold text-gray-900"
              >
                {percentage}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
