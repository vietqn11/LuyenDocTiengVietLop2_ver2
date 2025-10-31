import React from 'react';

const BookSpinner: React.FC = () => {
    return (
        <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            className="text-blue-600"
        >
            <style>
                {`
                .spinner_book {
                    animation: spinner_book-turn 2s linear infinite;
                    transform-origin: 50% 50%;
                }
                @keyframes spinner_book-turn {
                    0% { transform: rotateY(0deg); }
                    25%, 75% { transform: rotateY(-180deg); }
                    100% { transform: rotateY(-360deg); }
                }
                `}
            </style>
            <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                <path d="M12 6.253v13m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" className="spinner_book" />
            </g>
        </svg>
    );
};

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    if (size === 'sm') {
        return (
            <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-blue-500`} role="status">
                <span className="sr-only">Loading...</span>
            </div>
        )
    }
    return <BookSpinner />;
};


export default Spinner;