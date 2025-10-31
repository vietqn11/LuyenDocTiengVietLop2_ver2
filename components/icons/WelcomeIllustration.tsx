import React from 'react';

const WelcomeIllustration: React.FC = () => (
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(100 100)">
        {/* Sun */}
        <circle cx="60" cy="-60" r="20" fill="#FBBF24" />

        {/* Cloud */}
        <path d="M -80 -40 C -90 -60, -60 -70, -50 -50 C -40 -70, -10 -60, -20 -40 Z" fill="#E0F2FE" />

        {/* Child */}
        <g transform="translate(0, 30)">
            {/* Body */}
            <rect x="-15" y="-10" width="30" height="30" rx="15" fill="#3B82F6" />
            {/* Head */}
            <circle cx="0" cy="-25" r="15" fill="#FFDAB9" />
            {/* Hair */}
            <path d="M -10 -40 Q 0 -50, 10 -40 Q 15 -30, -15 -30 Z" fill="#4A2311" />
            {/* Eyes */}
            <circle cx="-5" cy="-27" r="1.5" fill="#4A2311" />
            <circle cx="5" cy="-27" r="1.5" fill="#4A2311" />
            {/* Smile */}
            <path d="M -5 -20 Q 0 -15, 5 -20" stroke="#4A2311" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
        
        {/* Book */}
        <g transform="translate(0, 45) rotate(15)">
             <path d="M -25 -15 L 0 -20 L 0 15 L -25 10 Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
             <path d="M 0 -20 L 25 -15 L 25 10 L 0 15 Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
             <line x1="-20" y1="-8" x2="-5" y2="-10" stroke="#94A3B8" strokeWidth="0.8" />
             <line x1="-20" y1="-3" x2="-5" y2="-5" stroke="#94A3B8" strokeWidth="0.8" />
             <line x1="-20" y1="2" x2="-5" y2="0" stroke="#94A3B8" strokeWidth="0.8" />
             <line x1="5" y1="-10" x2="20" y2="-8" stroke="#94A3B8" strokeWidth="0.8" />
             <line x1="5" y1="-5" x2="20" y2="-3" stroke="#94A3B8" strokeWidth="0.8" />
             <line x1="5" y1="0" x2="20" y2="2" stroke="#94A3B8" strokeWidth="0.8" />
        </g>

        {/* Ground */}
        <path d="M -100 50 Q 0 40, 100 50 L 100 100 L -100 100 Z" fill="#4ADE80" />
    </g>
</svg>
);

export default WelcomeIllustration;
