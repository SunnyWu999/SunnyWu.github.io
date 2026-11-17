import './game.css'

/* A little burst of golden sparkles at a screen position (clicks, discoveries, caught treasures). */

type Options = { count?: number; spread?: number; hue?: 'gold' | 'blue' }

export function burstAt(x: number, y: number, { count = 14, spread = 90, hue = 'gold' }: Options = {}) {
  if (typeof document === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let index = 0; index < count; index += 1) {
    const dot = document.createElement('span')
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.6
    const distance = spread * (0.5 + Math.random() * 0.8)
    dot.className = `spark spark--${hue}`
    dot.style.left = `${x}px`
    dot.style.top = `${y}px`
    dot.style.setProperty('--dx', `${Math.cos(angle) * distance}px`)
    dot.style.setProperty('--dy', `${Math.sin(angle) * distance - 20}px`)
    dot.style.setProperty('--size', `${4 + Math.random() * 7}px`)
    dot.style.animationDelay = `${Math.random() * 80}ms`
    document.body.appendChild(dot)
    window.setTimeout(() => dot.remove(), 1100)
  }
}
