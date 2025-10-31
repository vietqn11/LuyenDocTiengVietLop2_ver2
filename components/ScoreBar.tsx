import React from 'react';

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  isOverall?: boolean;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, maxScore = 10, isOverall = false }) => {
  const percentage = (score / maxScore) * 100;

  const getColor = (s: number) => {
    if (s >= 8) return 'bg-green-500';
    if (s >= 5) return 'bg-yellow-400';
    return 'bg-red-500';
  };
  
  const colorClass = getColor(score);
  const textClass = colorClass.replace('bg-', 'text-');

  if (isOverall) {
    return (
      <div className="w-full bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-base font-bold text-blue-800">{label}</span>
          <span className={`text-xl font-extrabold ${textClass}`}>{score} / {maxScore}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3.5">
          <div 
            className={`${colorClass} h-3.5 rounded-full transition-all duration-700 ease-out`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-base font-semibold" style={{ color: 'var(--c-text-body)' }}>{label}</span>
        <span className={`text-base font-bold ${textClass}`}>{score} / {maxScore}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className={`${colorClass} h-2.5 rounded-full transition-all duration-700 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreBar;