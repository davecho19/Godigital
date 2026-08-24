import React from "react";

export const UpContaMascot: React.FC<{ className?: string }> = ({ className = "w-48 h-52" }) => {
  return (
    <svg
      viewBox="0 0 300 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Upward Dark Blue/Teal Arrow on top left */}
      <path
        d="M 90 90 L 90 25 L 50 70 L 75 70 L 75 90 Z"
        fill="#0B2545"
        stroke="#0B2545"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <polygon
        points="90,15 45,70 70,70 70,120 110,120 110,70 135,70"
        fill="#0B2545"
        stroke="#0B2545"
        strokeWidth="2"
      />

      {/* Legs & Shoes */}
      {/* Left Leg */}
      <path d="M 115 220 L 105 270" stroke="#0B2545" strokeWidth="8" strokeLinecap="round" />
      {/* Right Leg */}
      <path d="M 185 220 L 195 270" stroke="#0B2545" strokeWidth="8" strokeLinecap="round" />

      {/* Shoes */}
      {/* Left Shoe */}
      <path
        d="M 80 270 C 80 255, 125 255, 125 270 C 125 282, 80 282, 80 270 Z"
        fill="#FFFFFF"
        stroke="#0B2545"
        strokeWidth="4"
      />
      <path d="M 85 270 C 85 265, 120 265, 120 270" stroke="#0B2545" strokeWidth="2" fill="none" />

      {/* Right Shoe */}
      <path
        d="M 175 270 C 175 255, 220 255, 220 270 C 220 282, 175 282, 175 270 Z"
        fill="#FFFFFF"
        stroke="#0B2545"
        strokeWidth="4"
      />
      <path d="M 180 270 C 180 265, 215 265, 215 270" stroke="#0B2545" strokeWidth="2" fill="none" />

      {/* Arms & Hands */}
      {/* Left Arm & Glove */}
      <path d="M 85 170 Q 55 190, 75 220" stroke="#0B2545" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Left Glove */}
      <circle cx="75" cy="225" r="14" fill="#FFFFFF" stroke="#0B2545" strokeWidth="4" />
      <path d="M 65 220 C 60 225, 60 230, 68 232" stroke="#0B2545" strokeWidth="3" fill="none" />

      {/* Right Arm & Pointing Glove Hand */}
      <path d="M 215 160 Q 235 140, 240 120" stroke="#0B2545" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Right Glove with Index Finger pointing UP */}
      <g transform="translate(230, 95)">
        {/* Palm */}
        <circle cx="12" cy="25" r="12" fill="#FFFFFF" stroke="#0B2545" strokeWidth="4" />
        {/* Pointing Index Finger */}
        <path d="M 12 25 L 12 2 C 12 -4, 2 -4, 2 2 L 2 25" fill="#FFFFFF" stroke="#0B2545" strokeWidth="4" />
        {/* Folded fingers */}
        <path d="M 12 20 Q 22 20, 20 28" stroke="#0B2545" strokeWidth="3" fill="none" />
      </g>

      {/* Main "U" Character Body */}
      <path
        d="M 90 100 L 90 160 C 90 220, 210 220, 210 160 L 210 100 L 250 100 L 250 165 C 250 255, 50 255, 50 165 L 50 100 Z"
        fill="#F26522"
        stroke="#0B2545"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Face Features on the U Body */}
      {/* Left Big Open Eye */}
      <circle cx="118" cy="148" r="22" fill="#FFFFFF" stroke="#0B2545" strokeWidth="4" />
      <circle cx="118" cy="148" r="11" fill="#0B2545" />
      <circle cx="122" cy="144" r="4" fill="#FFFFFF" />

      {/* Right Winking Eye */}
      <path
        d="M 172 138 Q 188 155, 204 138"
        stroke="#0B2545"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Eyelashes */}
      <line x1="202" y1="138" x2="210" y2="132" stroke="#0B2545" strokeWidth="3" strokeLinecap="round" />
      <line x1="174" y1="138" x2="166" y2="132" stroke="#0B2545" strokeWidth="3" strokeLinecap="round" />

      {/* Smile */}
      <path
        d="M 130 180 Q 150 202, 175 180"
        stroke="#0B2545"
        strokeWidth="5"
        strokeLinecap="round"
        fill="#FFFFFF"
      />
      <path
        d="M 130 180 Q 150 202, 175 180 Z"
        fill="#0B2545"
      />
      {/* Tongue inside smile */}
      <path
        d="M 142 192 Q 152 182, 163 192 Z"
        fill="#F26522"
      />
    </svg>
  );
};
