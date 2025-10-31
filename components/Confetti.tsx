import React, { useEffect, useState } from 'react';

const Confetti: React.FC = () => {
  // FIX: Use React.ReactElement instead of JSX.Element for better type safety and to avoid namespace issues.
  const [pieces, setPieces] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 50 }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
        backgroundColor: ['#FBBF24', '#EC4899', '#3B82F6', '#10B981'][Math.floor(Math.random() * 4)],
      };
      return <div key={i} className="confetti" style={style}></div>;
    });
    setPieces(newPieces);
  }, []);

  return <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">{pieces}</div>;
};

export default Confetti;