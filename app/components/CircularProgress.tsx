'use client';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function CircularProgress({ 
  value, 
  max, 
  size = 40, 
  strokeWidth = 4,
  className = ""
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const percentage = Math.round((value / max) * 100);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-300 ${
            percentage >= 100 
              ? 'text-green-500' 
              : percentage >= 75 
                ? 'text-blue-500' 
                : percentage >= 50 
                  ? 'text-yellow-500' 
                  : 'text-red-500'
          }`}
        />
      </svg>
      {/* Texte au centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
