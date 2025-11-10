import React from 'react';

interface WaterGlassProps {
  percentage: number;
}

export const WaterGlass: React.FC<WaterGlassProps> = ({ percentage }) => {
  // Clamp percentage between 0 and 100
  const fillPercentage = Math.min(Math.max(percentage, 0), 100);

  // SVG viewbox dimensions
  const viewBoxHeight = 150;

  // The path for a standard tumbler glass shape
  const glassPath = "M25,5 L15,145 H85 L75,5 Z";
  
  return (
    // Control the size of the component here
    <div className="w-28 h-40"> 
      <svg width="100%" height="100%" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" /> 
            <stop offset="100%" stopColor="#2563eb" /> 
          </linearGradient>
          <clipPath id="glassClip">
            <path d={glassPath} />
          </clipPath>
        </defs>
        
        {/* Water fill, clipped to the glass shape. */}
        <g clipPath="url(#glassClip)">
          <rect
            x="0"
            // Start the rectangle below the viewbox and translate it up into view
            y={viewBoxHeight}
            width="100"
            height={viewBoxHeight}
            fill="url(#waterGradient)"
            // Animate the transform property for the fill effect
            style={{
              transform: `translateY(-${fillPercentage * (viewBoxHeight/100)}px)`,
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </g>

        {/* The glass outline and subtle fill */}
        <path 
            d={glassPath}
            stroke="#9ca3af" // gray-400
            strokeWidth="3"
            fill="#e5e7eb" // gray-200
            fillOpacity="0.1"
        />
        {/* A simple highlight/glare on the side of the glass */}
         <path 
            d="M72,15 L65,135"
            stroke="white"
            strokeWidth="2.5"
            strokeOpacity="0.4"
            fill="none"
        />
      </svg>
    </div>
  );
};