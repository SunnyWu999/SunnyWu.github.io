export const FLIP_MS = 1100

/** A turn between two positions (a spread number for the menu; chapter + spread for the recipe book). */
export type Flip<T = number> = { dir: 1 | -1; from: T; to: T; done?: boolean }

/** Which position each half of the book shows while a leaf is in the air. */
export function flipBase<T>(flip: Flip<T> | null, current: T): { left: T; right: T } {
  if (!flip || flip.done) return { left: current, right: current }
  return flip.dir > 0 ? { left: flip.from, right: flip.to } : { left: flip.to, right: flip.from }
}
