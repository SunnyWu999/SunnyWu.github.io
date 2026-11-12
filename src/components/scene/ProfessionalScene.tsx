function ProfessionalScene() {
  return (
    <svg viewBox="0 0 1400 900" role="img" aria-label="Professional evening dining scene with snow outside the window" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="professionalSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2c3b59" />
          <stop offset="48%" stopColor="#8690a5" />
          <stop offset="100%" stopColor="#d4b18c" />
        </linearGradient>
        <linearGradient id="duskGlass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(250,243,231,0.9)" />
          <stop offset="100%" stopColor="rgba(121,156,194,0.5)" />
        </linearGradient>
      </defs>

      <rect width="1400" height="900" fill="#f2eee9" />

      <g>
        <rect x="90" y="90" width="620" height="420" rx="12" fill="url(#professionalSky)" />
        <rect x="110" y="110" width="580" height="380" rx="8" fill="#283b58" opacity="0.7" />
        <path d="M110 405 L220 290 L310 420 L395 275 L520 420 L640 305 L690 405 L690 490 L110 490 Z" fill="#dfe8f3" opacity="0.8" />
        <path d="M110 430 L170 365 L260 430 L360 335 L470 430 L580 335 L640 430 L690 430 L690 490 L110 490 Z" fill="#aab8c8" opacity="0.7" />
        <g opacity="0.8">
          <circle cx="610" cy="150" r="18" fill="#f5d2a1" />
          <circle cx="628" cy="150" r="24" fill="#f3c88d" opacity="0.5" />
        </g>
        <rect x="96" y="96" width="620" height="420" rx="14" fill="none" stroke="#d7c1a8" strokeWidth="3" />
      </g>

      <g>
        <ellipse cx="700" cy="710" rx="540" ry="140" fill="#c2b19a" opacity="0.28" />
        <path d="M120 560 L1280 560 L1200 820 L200 820 Z" fill="#f7f3ef" />
        <path d="M180 560 L1220 560 L1130 810 L260 810 Z" fill="#fbf9f7" opacity="0.8" />
        <path d="M170 630 L1230 630" stroke="#d8d0c8" strokeWidth="3" opacity="0.7" />
        <path d="M245 560 L245 820" stroke="#d8d0c8" strokeWidth="2" opacity="0.4" />
        <path d="M1150 560 L1150 820" stroke="#d8d0c8" strokeWidth="2" opacity="0.4" />
      </g>

      <g fill="rgba(191, 219, 255, 0.52)">
        <path d="M300 610 L326 560 L360 610 Z" />
        <path d="M360 610 L388 548 L426 610 Z" />
        <path d="M470 610 L500 560 L535 610 Z" />
        <path d="M560 610 L596 545 L632 610 Z" />
        <path d="M830 610 L867 548 L908 610 Z" />
        <path d="M930 610 L966 558 L1002 610 Z" />
      </g>

      <g>
        <rect x="990" y="310" width="160" height="210" rx="7" fill="#f2ebe4" stroke="#c3b9af" strokeWidth="2" />
        <rect x="1006" y="332" width="128" height="168" rx="4" fill="#faf6f3" />
        <text x="1070" y="370" textAnchor="middle" fill="#2a241f" fontSize="18" fontFamily="Georgia, serif" letterSpacing="2">MENU</text>
        <line x1="1018" y1="390" x2="1120" y2="390" stroke="#3a2f28" strokeWidth="1.2" />
        <text x="1070" y="430" textAnchor="middle" fill="#2a241f" fontSize="13" fontFamily="Georgia, serif">Amuse-Bouche</text>
        <text x="1070" y="456" textAnchor="middle" fill="#2a241f" fontSize="13" fontFamily="Georgia, serif">Velvet Scallop</text>
        <text x="1070" y="500" textAnchor="middle" fill="#2a241f" fontSize="12" fontFamily="Georgia, serif">Request the check</text>
      </g>

      <g transform="translate(565, 305)">
        <ellipse cx="150" cy="135" rx="112" ry="90" fill="#f9f7f4" opacity="0.95" stroke="#d7d6d2" strokeWidth="3" />
        <ellipse cx="150" cy="125" rx="90" ry="66" fill="#f3f0eb" stroke="#d6c7b5" strokeWidth="2" />
        <ellipse cx="150" cy="119" rx="62" ry="46" fill="#ffe2b2" opacity="0.9" />
        <ellipse cx="150" cy="116" rx="42" ry="30" fill="#f6c56c" />
        <path d="M128 88 C142 60, 167 60, 182 90" fill="none" stroke="#d4a24c" strokeWidth="5" strokeLinecap="round" />
        <circle cx="150" cy="116" r="10" fill="#f0a660" opacity="0.9" />
      </g>

      <g opacity="0.9">
        <path d="M230 620 L245 565 L260 620 Z" fill="#dfd9d1" />
        <path d="M325 620 L340 540 L356 620 Z" fill="#e5eaef" />
        <path d="M1020 620 L1035 560 L1052 620 Z" fill="#dfe8ef" />
        <path d="M1110 620 L1126 536 L1142 620 Z" fill="#dfe7ea" />
      </g>

      <g fill="#f3efe9" opacity="0.9">
        <ellipse cx="920" cy="620" rx="44" ry="26" />
        <ellipse cx="980" cy="620" rx="44" ry="26" />
      </g>

      <g>
        <circle cx="300" cy="545" r="18" fill="#f8ddb2" opacity="0.7" />
        <circle cx="300" cy="545" r="6" fill="#f7cf8a" />
        <circle cx="1010" cy="545" r="18" fill="#f8ddb2" opacity="0.7" />
        <circle cx="1010" cy="545" r="6" fill="#f7cf8a" />
      </g>
    </svg>
  )
}

export default ProfessionalScene
