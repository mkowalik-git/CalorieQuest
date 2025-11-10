import React, { useMemo } from 'react';

export const Confetti: React.FC = () => {
    const confetti = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            const style: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
            };
            const color = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-brand'][Math.floor(Math.random() * 4)];
            return <div key={i} className={`confetti-piece ${color}`} style={style}></div>;
        });
    }, []);

    return <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-50">{confetti}</div>;
};