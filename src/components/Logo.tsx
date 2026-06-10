import React from 'react';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer C-shape container / Circular vibe */}
      <path
        d="M160 50C145 30 120 20 95 20C45 20 10 55 10 110C10 165 45 200 95 200C130 200 160 180 170 150"
        stroke="url(#greenGradient)"
        strokeWidth="15"
        strokeLinecap="round"
      />

      {/* Leaves on the left */}
      <path
        d="M20 110C5 125 5 150 25 165C45 180 65 170 80 150C65 140 50 120 45 100C35 100 25 105 20 110Z"
        fill="#4CAF50"
      />
      <path
        d="M40 130C30 140 30 160 45 175C60 190 85 185 100 165C85 155 75 145 70 130C60 125 50 125 40 130Z"
        fill="#2E7D32"
      />

      {/* Mountains inside */}
      <path
        d="M60 120L95 70L130 120H60Z"
        fill="#81C784"
      />
      <path
        d="M100 120L135 60L170 120H100Z"
        fill="#455A64"
        opacity="0.8"
      />

      {/* Pine Trees */}
      <path d="M75 120L85 100L95 120H75Z" fill="#1B5E20" />
      <path d="M90 120L100 105L110 120H90Z" fill="#1B5E20" />
      <path d="M105 120L115 110L125 120H105Z" fill="#1B5E20" />

      {/* River */}
      <path
        d="M85 120C100 140 130 140 160 180"
        stroke="#2196F3"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bird */}
      <path
        d="M175 40C180 42 185 45 190 40C185 50 180 55 175 52C170 55 165 50 160 40C165 45 170 42 175 40Z"
        fill="#263238"
      />

      <defs>
        <linearGradient id="greenGradient" x1="10" y1="20" x2="170" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E7D32" />
          <stop offset="1" stopColor="#81C784" />
        </linearGradient>
      </defs>
    </svg>
  );
};
