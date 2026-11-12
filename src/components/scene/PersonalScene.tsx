import { useEffect } from 'react'
import { SectionPanel } from '../SectionPanel'

function DishPlate({ x, y, width, height, fill = '#fbf6ef' }: { x: number; y: number; width: number; height: number; fill?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx={width / 2} cy={height / 2 + 12} rx={width / 2 - 6} ry={height / 2 - 10} fill={fill} opacity={0.9} />
      <ellipse cx={width / 2} cy={height / 2 + 6} rx={width / 2 - 14} ry={height / 2 - 14} fill="#f3efe8" />
      <ellipse cx={width / 2} cy={height / 2} rx={width / 2 - 18} ry={height / 2 - 18} fill="#f9f1e3" stroke="#d7c2a4" strokeWidth="2" />
    </g>
  )
}

const dishes = [
  { id: 'cocktails', title: 'Cocktails', x: 95, y: 420 },
  { id: 'cake', title: 'Cake', x: 290, y: 400 },
  { id: 'travel', title: 'Travel', x: 490, y: 418 },
  { id: 'comfort', title: 'Comfort', x: 675, y: 410 },
  { id: 'macarons', title: 'Macarons', x: 845, y: 410 },
  { id: 'fortunes', title: 'Fortunes', x: 1035, y: 420 },
  { id: 'seat', title: 'Seat', x: 1195, y: 430 },
] as const

interface PersonalSceneProps {
  activeHash?: string
  onOpenDish: (dishId: string) => void
  onClose: () => void
}

function PersonalScene({ activeHash, onOpenDish, onClose }: PersonalSceneProps) {
  const selectedDish = dishes.find((dish) => dish.id === activeHash)

  useEffect(() => {
    if (!selectedDish) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDish, onClose])

  return (
    <div className="personal-scene" aria-live="polite">
      <svg viewBox="0 0 1400 900" role="img" aria-label="Sunny personal scene with a table and dishes" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#bfe9ff" />
            <stop offset="55%" stopColor="#dff6ff" />
            <stop offset="100%" stopColor="#f7e8c5" />
          </linearGradient>
          <linearGradient id="mountainShade" x1="0" x2="1">
            <stop offset="0%" stopColor="#d4e7f4" />
            <stop offset="100%" stopColor="#7d9ab0" />
          </linearGradient>
          <linearGradient id="tableWood" x1="0" x2="1">
            <stop offset="0%" stopColor="#d19c65" />
            <stop offset="55%" stopColor="#b97d4e" />
            <stop offset="100%" stopColor="#8c5938" />
          </linearGradient>
        </defs>

        <rect width="1400" height="900" fill="url(#sky)" />
        <circle cx="1120" cy="150" r="80" fill="#ffe69b" opacity="0.9" />
        <g opacity="0.75" fill="#ffffff">
          <circle cx="180" cy="120" r="22" />
          <circle cx="210" cy="110" r="18" />
          <circle cx="232" cy="125" r="20" />
          <circle cx="1010" cy="110" r="18" />
          <circle cx="1036" cy="100" r="21" />
          <circle cx="1060" cy="118" r="16" />
        </g>

        <path d="M0 420 L220 300 L380 420 L560 260 L760 420 L920 280 L1115 430 L1400 360 L1400 900 L0 900 Z" fill="url(#mountainShade)" opacity="0.88" />
        <path d="M0 480 L160 370 L280 480 L420 315 L620 480 L760 340 L920 470 L1100 350 L1400 470 L1400 900 L0 900 Z" fill="#7e97ae" opacity="0.8" />

        <rect x="0" y="520" width="1400" height="350" fill="#d7ae75" opacity="0.75" />
        <path d="M0 560 L1400 500 L1400 900 L0 900 Z" fill="#c98a4f" opacity="0.9" />

        <path d="M80 620 L1320 620 L1250 760 L150 760 Z" fill="url(#tableWood)" />
        <path d="M120 620 L1280 620 L1170 680 L250 680 Z" fill="#9a643c" opacity="0.82" />

        <g>
          <DishPlate x={120} y={480} width={140} height={100} />
          <g transform="translate(123, 530)">
            <rect x="10" y="0" width="20" height="30" rx="7" fill="#e9d5b4" />
            <rect x="20" y="5" width="20" height="30" rx="7" fill="#d4b89d" />
            <path d="M0 30 C16 18, 28 18, 50 30 L45 48 C32 44, 18 44, 0 48 Z" fill="#f8d58a" opacity="0.9" />
            <path d="M12 30 C18 18, 34 18, 40 30" stroke="#d4a03d" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>

          <DishPlate x={300} y={470} width={170} height={120} />
          <g transform="translate(324, 505)">
            <ellipse cx="70" cy="34" rx="60" ry="24" fill="#f3d7c4" />
            <ellipse cx="68" cy="28" rx="53" ry="18" fill="#f9d4b0" />
            <path d="M46 28 L58 6 L67 28 Z" fill="#d7995d" />
            <path d="M70 28 L84 10 L92 26 Z" fill="#c17845" />
            <path d="M52 36 L82 36" stroke="#b55a34" strokeWidth="3" strokeLinecap="round" />
            <g fill="#f8b34a">
              <path d="M58 42 L66 22 L72 42 Z" />
              <path d="M78 42 L86 22 L92 42 Z" />
              <path d="M42 42 L50 24 L58 42 Z" />
            </g>
          </g>

          <DishPlate x={500} y={485} width={165} height={105} />
          <g transform="translate(520, 500)">
            <rect x="4" y="8" width="92" height="56" rx="10" fill="#c97d52" />
            <path d="M12 18 L34 12 L52 20 L70 12 L92 20" fill="none" stroke="#f2d3a7" strokeWidth="3" />
            <path d="M18 38 L24 20 L32 38 L40 18 L48 38 L58 18 L66 38 L76 20 L84 38" fill="none" stroke="#f9f0d7" strokeWidth="3" strokeLinecap="round" />
            <circle cx="28" cy="30" r="6" fill="#d4b0a4" />
            <circle cx="52" cy="26" r="7" fill="#d7ac57" />
            <circle cx="74" cy="32" r="6" fill="#7aa7a5" />
          </g>

          <DishPlate x={680} y={478} width={170} height={112} />
          <g transform="translate(707, 510)">
            <path d="M18 40 C28 15, 52 14, 58 38 C74 38, 80 44, 80 58 C34 71, 30 64, 18 58 Z" fill="#f7d7a2" />
            <path d="M32 20 C38 10, 51 8, 58 18" stroke="#d88f4a" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="38" cy="39" r="10" fill="#d07844" />
            <circle cx="62" cy="40" r="9" fill="#8e4c37" />
            <circle cx="50" cy="54" r="8" fill="#7d92b0" />
          </g>

          <DishPlate x={850} y={468} width={180} height={120} />
          <g transform="translate(874, 500)">
            <g fill="#f0d5d3">
              <ellipse cx="18" cy="26" rx="18" ry="12" />
              <ellipse cx="42" cy="18" rx="18" ry="12" />
              <ellipse cx="70" cy="26" rx="18" ry="12" />
              <ellipse cx="96" cy="20" rx="18" ry="12" />
              <ellipse cx="58" cy="42" rx="18" ry="12" />
            </g>
            <g fill="#c17e81">
              <ellipse cx="18" cy="26" rx="12" ry="7" />
              <ellipse cx="42" cy="18" rx="12" ry="7" />
              <ellipse cx="70" cy="26" rx="12" ry="7" />
              <ellipse cx="96" cy="20" rx="12" ry="7" />
              <ellipse cx="58" cy="42" rx="12" ry="7" />
            </g>
          </g>

          <DishPlate x={1030} y={478} width={170} height={110} />
          <g transform="translate(1052, 498)">
            <path d="M12 38 C18 18, 40 8, 58 14 C78 22, 96 36, 92 52 C86 66, 24 66, 16 54 C12 50, 10 44, 12 38 Z" fill="#f6d7a3" />
            <path d="M18 44 C24 34, 50 28, 72 36 C76 44, 72 58, 62 60" fill="#f1b759" opacity="0.85" />
            <path d="M20 20 C34 8, 52 8, 64 18" stroke="#d19652" strokeWidth="3" fill="none" strokeLinecap="round" />
            <g fill="#fff6d8">
              <path d="M36 16 L54 8 L44 20 Z" />
              <path d="M50 18 L62 12 L56 26 Z" />
            </g>
          </g>

          <g transform="translate(1175, 505)">
            <rect x="15" y="0" width="28" height="55" rx="10" fill="#d3b699" />
            <rect x="0" y="44" width="60" height="28" rx="14" fill="#e7d8bf" />
            <rect x="10" y="48" width="40" height="18" rx="7" fill="#fffaf1" />
            <text x="30" y="62" textAnchor="middle" fontSize="11" fill="#8d5e3e" fontFamily="sans-serif">Seat</text>
          </g>
        </g>

        <g>
          <ellipse cx="700" cy="678" rx="430" ry="56" fill="#cf8e56" opacity="0.22" />
          <ellipse cx="700" cy="665" rx="430" ry="42" fill="#7d4a33" opacity="0.15" />
        </g>

        <g transform="translate(565, 315)">
          <ellipse cx="150" cy="135" rx="112" ry="90" fill="#f7f5f3" opacity="0.9" stroke="#d8d2c8" strokeWidth="3" />
          <ellipse cx="150" cy="125" rx="90" ry="66" fill="#f4ebdd" stroke="#d5b190" strokeWidth="2" />
          <ellipse cx="150" cy="119" rx="62" ry="46" fill="#ffe1ad" opacity="0.9" />
          <ellipse cx="150" cy="116" rx="42" ry="30" fill="#f4c96c" />
          <path d="M128 88 C142 60, 167 60, 182 90" fill="none" stroke="#d2a74f" strokeWidth="5" strokeLinecap="round" />
          <circle cx="150" cy="116" r="10" fill="#f3a65a" opacity="0.9" />
        </g>
      </svg>

      {dishes.map((dish) => (
        <button
          key={dish.id}
          type="button"
          className="dish-button"
          style={{ left: `${dish.x}px`, top: `${dish.y}px` }}
          onClick={() => onOpenDish(dish.id)}
          aria-label={`Open ${dish.title}`}
        >
          <span>{dish.title}</span>
        </button>
      ))}

      <SectionPanel title={selectedDish?.title ?? 'Section'} isOpen={Boolean(selectedDish)} onClose={onClose} />
    </div>
  )
}

export default PersonalScene
