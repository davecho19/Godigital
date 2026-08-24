import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  lightMode?: boolean;
}

/**
 * Official GoDi Logo Component
 * Replicates the official GoDi horizontal corporate logo:
 * - 3D Hexagonal MD Monogram in Navy & Brushed Silver
 * - "GoDi" Modern Geometric Typography
 * - "— TECNOLOGÍA QUE IMPULSA NEGOCIOS —" corporate slogan
 */
export function GodiOfficialLogo({
  size = "md",
  className = "",
  lightMode = false,
}: LogoProps) {
  const heightMap = {
    sm: "h-8 sm:h-9",
    md: "h-10 sm:h-12",
    lg: "h-12 sm:h-15",
    xl: "h-14 sm:h-18",
    "2xl": "h-18 sm:h-24",
  };

  const navyFill = lightMode ? "#FFFFFF" : "#072044";
  const navySecondary = lightMode ? "#E2E8F0" : "#041630";
  const textColor = lightMode ? "#FFFFFF" : "#072044";
  const subtitleColor = lightMode ? "#E2E8F0" : "#072044";
  const lineColor = lightMode ? "#CBD5E1" : "#072044";

  return (
    <div className={`inline-flex items-center justify-center select-none ${heightMap[size] || "h-12"} ${className}`}>
      <svg
        viewBox="0 0 980 230"
        className="h-full w-auto max-w-full drop-shadow-xs mx-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Silver / Polished Steel Metallic Gradient for Right Facet */}
          <linearGradient id="silverMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="35%" stopColor="#CBD5E1" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Deep Navy Gradient for Left Facet */}
          <linearGradient id="navyPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightMode ? "#FFFFFF" : "#0A2548"} />
            <stop offset="100%" stopColor={lightMode ? "#E2E8F0" : "#041630"} />
          </linearGradient>

          {/* Steel Texture Pattern for 'i' accent */}
          <linearGradient id="metalAccent" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>

        {/* ========================================================================= */}
        {/* 1. 3D HEXAGONAL MD MONOGRAM SHIELD (LEFT)                                 */}
        {/* ========================================================================= */}
        <g id="godi-hexagon-monogram" transform="translate(15, 10)">
          {/* Left Wing (M Shape in Deep Navy) */}
          <path
            d="M 85 5 
               L 15 45 
               L 15 125 
               L 65 155 
               L 65 95 
               L 85 110 
               L 105 95 
               L 105 155 
               L 155 125 
               L 155 45 
               L 85 5 Z"
            fill="none"
          />
          {/* Main Solid Navy Facets */}
          {/* Outer Left Column */}
          <path
            d="M 85 8 L 18 47 L 18 128 L 68 158 L 68 78 L 85 92 L 102 78 L 102 158 L 152 128 L 152 47 Z"
            fill="url(#navyPrimary)"
          />
          {/* Inner Sharp Notch & 3D bevels for Navy facet */}
          <path
            d="M 18 47 L 85 8 L 85 45 L 45 68 L 45 115 L 18 98 Z"
            fill={navySecondary}
            opacity="0.9"
          />
          <path
            d="M 45 68 L 85 92 L 68 158 L 18 128 L 18 98 L 45 115 Z"
            fill="url(#navyPrimary)"
          />

          {/* Right Faceted Hexagonal Shield Wing (Polished Metallic Silver) */}
          <path
            d="M 85 8 L 152 47 L 152 128 L 85 168 L 85 140 L 126 115 L 126 60 L 85 36 Z"
            fill="url(#silverMetallic)"
          />
          {/* Inner Silver Chamfer / Reflection Accent */}
          <path
            d="M 85 36 L 126 60 L 126 115 L 85 140 Z"
            fill="#B0B9C6"
            opacity="0.8"
          />
          <path
            d="M 98 52 L 120 65 L 120 110 L 98 123 Z"
            fill="#E8ECF1"
            opacity="0.6"
          />
        </g>

        {/* ========================================================================= */}
        {/* 2. "GoDi" MAIN WORDMARK                                                    */}
        {/* ========================================================================= */}
        <g id="godi-wordmark" transform="translate(230, 20)">
          {/* Letter 'G' */}
          <path
            d="M 130 55 
               C 130 35, 115 20, 80 20 
               L 40 20 
               C 15 20, 0 35, 0 65 
               L 0 85 
               C 0 115, 15 130, 40 130 
               L 80 130 
               C 115 130, 130 115, 130 85 
               L 130 65 
               L 65 65 
               L 65 85 
               L 95 85 
               L 95 95 
               C 95 105, 90 108, 75 108 
               L 45 108 
               C 32 108, 28 102, 28 90 
               L 28 60 
               C 28 48, 32 42, 45 42 
               L 75 42 
               C 90 42, 95 45, 95 55 
               Z"
            fill={navyFill}
          />

          {/* Letter 'o' */}
          <path
            d="M 270 65 
               C 270 42, 255 35, 230 35 
               L 190 35 
               C 165 35, 150 42, 150 65 
               L 150 100 
               C 150 123, 165 130, 190 130 
               L 230 130 
               C 255 130, 270 123, 270 100 
               Z 
               M 238 68 
               L 238 97 
               C 238 106, 232 110, 220 110 
               L 200 110 
               C 188 110, 182 106, 182 97 
               L 182 68 
               C 182 59, 188 55, 200 55 
               L 220 55 
               C 232 55, 238 59, 238 68 
               Z"
            fill={navyFill}
          />

          {/* Letter 'D' */}
          <path
            d="M 295 20 
               L 295 130 
               L 360 130 
               C 400 130, 425 112, 425 75 
               C 425 38, 400 20, 360 20 
               Z 
               M 328 44 
               L 355 44 
               C 380 44, 392 55, 392 75 
               C 392 95, 380 106, 355 106 
               L 328 106 
               Z"
            fill={navyFill}
          />

          {/* Letter 'i' (Stem + Metallic Dot) */}
          {/* Metallic Dot Accent */}
          <rect
            x="445"
            y="20"
            width="32"
            height="20"
            rx="2"
            fill="url(#metalAccent)"
          />
          {/* Lower Stem */}
          <rect
            x="445"
            y="50"
            width="32"
            height="80"
            rx="2"
            fill="url(#metalAccent)"
          />
        </g>

        {/* ========================================================================= */}
        {/* 3. SUBTITLE: "— TECNOLOGÍA QUE IMPULSA NEGOCIOS —"                         */}
        {/* ========================================================================= */}
        <g id="godi-subtitle" transform="translate(230, 195)">
          {/* Left Line */}
          <line
            x1="0"
            y1="-6"
            x2="35"
            y2="-6"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Subtitle Text */}
          <text
            x="50"
            y="0"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', 'SF Pro Display', sans-serif"
            fontWeight="800"
            fontSize="21"
            letterSpacing="3.5"
            fill={subtitleColor}
          >
            TECNOLOGÍA QUE IMPULSA NEGOCIOS
          </text>

          {/* Right Line */}
          <line
            x1="445"
            y1="-6"
            x2="480"
            y2="-6"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

// Backward compatibility & Named Exports
export function ConnectOfficialLogo(props: LogoProps) {
  return <GodiOfficialLogo {...props} />;
}

export function UpContaLogo(props: LogoProps) {
  return <GodiOfficialLogo {...props} />;
}

export function GodiLogo(props: LogoProps) {
  return <GodiOfficialLogo {...props} />;
}

export function DynamicBrandLogo({
  activeTab,
  size = "lg",
  className = "",
  lightMode = false,
}: {
  activeTab?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  lightMode?: boolean;
}) {
  return <GodiOfficialLogo size={size} className={className} lightMode={lightMode} />;
}

/**
 * ANF / Firmas Electrónicas.ec Logo Component
 */
export function AnfLogo({
  size = "md",
  className = "",
  lightMode = false,
}: LogoProps) {
  const heightMap = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-11",
    lg: "h-12 sm:h-14",
    xl: "h-16 sm:h-18",
    "2xl": "h-20 sm:h-22",
  };

  const navyColor = lightMode ? "#FFFFFF" : "#00407A";
  const goldColor = "#E5A900";

  return (
    <div className={`inline-flex items-center justify-center select-none ${heightMap[size] || "h-11"} ${className}`}>
      <svg
        viewBox="0 0 620 180"
        className="h-full w-auto max-w-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(15, 10)">
          <path d="M 25 35 L 25 15" stroke={navyColor} strokeWidth="6" strokeLinecap="round" />
          <rect x="20" y="5" width="10" height="10" fill={navyColor} />

          <path d="M 50 35 L 50 10 L 60 10" stroke={navyColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="60" y="5" width="10" height="10" fill={navyColor} />

          <path d="M 75 45 L 75 30 L 85 30" stroke={navyColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="85" y="25" width="10" height="10" fill={navyColor} />

          <path d="M 25 35 L 25 65 L 85 65 L 85 45" stroke={navyColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 35 L 50 75 L 70 75" stroke={navyColor} strokeWidth="7" strokeLinecap="round" />

          <path d="M 20 80 L 52 135 L 84 80 Z" fill={navyColor} />
          <path d="M 32 80 L 52 115 L 72 80 Z" fill="#002D57" />
        </g>

        <text
          x="125"
          y="72"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="68"
          fill={goldColor}
        >
          Firmas
        </text>

        <text
          x="125"
          y="132"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="62"
          letterSpacing="-1"
          fill={navyColor}
        >
          Electrónicas
        </text>

        <text
          x="500"
          y="132"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="36"
          fill={goldColor}
        >
          .ec
        </text>

        <g transform="translate(300, 140)">
          <rect x="0" y="0" width="180" height="34" rx="10" fill={navyColor} />
          <text
            x="15"
            y="23"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
            fontWeight="700"
            fontSize="18"
            fill="#FFFFFF"
          >
            by:
          </text>
          <text
            x="52"
            y="24"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
            fontWeight="900"
            fontSize="22"
            letterSpacing="-0.5"
            fill="#FFFFFF"
          >
            anfac
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Co-Brand Logo Component for Simulador Tab
 */
export function CoBrandLogo({
  size = "md",
  className = "",
  lightMode = false,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 sm:gap-4 ${className}`}>
      <GodiOfficialLogo size={size} lightMode={lightMode} />
      <div className={`h-8 w-[2px] rounded-full ${lightMode ? "bg-white/30" : "bg-slate-300"}`} />
      <AnfLogo size={size} lightMode={lightMode} />
    </div>
  );
}
