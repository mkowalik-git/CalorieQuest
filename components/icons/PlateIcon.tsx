import React from 'react';

export const PlateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.18a14.98 14.98 0 00-3.72 2.18m15.74 7.42a14.98 14.98 0 00-12.12 6.16M3.4 15.91a14.98 14.98 0 00-2.18 3.72"
    />
  </svg>
);
