import { useSyncExternalStore } from 'react'
import puzzleData from '../data/puzzle.json'
import storyData from '../data/my-story.json'

/*
  Wonderland progress. Everything you can do in the game earns points:
  tasting dishes, catching treasures in the fall, solving photo puzzles, reading story
  chapters, catching fireflies and leaving a note. Saved in localStorage; no backend needed.
*/

export const DISH_IDS = ['cake', 'cocktails', 'travel-board', 'comfort', 'macarons', 'fortune-cookies', 'seat'] as const

export const TREASURES = [
  { id: 'pocket-watch', name: 'Pocket Watch', note: '“I’m late, I’m late!”', image: 'images/scene/transition/pocket-watch.webp' },
  { id: 'teacup', name: 'Mismatched Teacup', note: 'It is always tea-time.', image: 'images/scene/transition/teacup.webp' },
  { id: 'golden-key', name: 'Golden Key', note: 'It opens a very small door.', image: 'images/scene/transition/golden-key.webp' },
  { id: 'playing-card', name: 'Playing Card', note: 'Off with their heads!', image: 'images/scene/transition/playing-card.webp' },
  { id: 'drink-me-bottle', name: '“Drink Me” Bottle', note: 'Curiouser and curiouser…', image: 'images/scene/transition/drink-me-bottle.webp' },
] as const

export const PUZZLE_IDS: string[] = puzzleData.photos.map((photo) => photo.id)
export const STORY_IDS: string[] = storyData.chapters.map((chapter) => chapter.id)
export const FIREFLY_MAX = 10

const POINTS = { dish: 10, treasure: 5, puzzle: 15, chapter: 5, firefly: 2, note: 10 }

// Titles are earned at these fractions of the maximum score.
const LEVELS = [
  { at: 0, title: 'Curious Visitor' },
  { at: 0.2, title: 'Tea Party Guest' },
  { at: 0.45, title: 'Friend of the Hatter' },
  { at: 0.7, title: 'Keeper of Wonders' },
  { at: 1, title: 'Wonderland Legend' },
]

const KEY = 'ssu-progress-v2'

export type GameEvent = { id: number; icon: string; title: string; detail: string }

type Saved = { dishes: string[]; treasures: string[]; puzzles: string[]; chapters: string[]; fireflies: number; noted: boolean }

export type Progress = Saved & {
  score: number
  maxScore: number
  level: number
  levelTitle: string
  nextTitle: string | null
  levelProgress: number // 0..1 toward the next title
  complete: boolean
  event: GameEvent | null
}

const MAX_SCORE =
  DISH_IDS.length * POINTS.dish +
  TREASURES.length * POINTS.treasure +
  PUZZLE_IDS.length * POINTS.puzzle +
  STORY_IDS.length * POINTS.chapter +
  FIREFLY_MAX * POINTS.firefly +
  POINTS.note

const only = (list: unknown, allowed: readonly string[]) => (Array.isArray(list) ? (list as string[]).filter((id) => allowed.includes(id)) : [])

const load = (): Saved => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Saved>
    return {
      dishes: only(raw.dishes, DISH_IDS),
      treasures: only(raw.treasures, TREASURES.map((item) => item.id)),
      puzzles: only(raw.puzzles, PUZZLE_IDS),
      chapters: only(raw.chapters, STORY_IDS),
      fireflies: Math.min(Math.max(Number(raw.fireflies) || 0, 0), FIREFLY_MAX),
      noted: Boolean(raw.noted),
    }
  } catch {
    return { dishes: [], treasures: [], puzzles: [], chapters: [], fireflies: 0, noted: false }
  }
}

let saved: Saved = load()
let event: GameEvent | null = null
let eventId = 0
let snapshot: Progress = build()
const listeners = new Set<() => void>()

function scoreOf(value: Saved): number {
  return (
    value.dishes.length * POINTS.dish +
    value.treasures.length * POINTS.treasure +
    value.puzzles.length * POINTS.puzzle +
    value.chapters.length * POINTS.chapter +
    value.fireflies * POINTS.firefly +
    (value.noted ? POINTS.note : 0)
  )
}

function levelFor(score: number): number {
  let level = 0
  LEVELS.forEach((entry, index) => {
    if (score >= Math.round(entry.at * MAX_SCORE)) level = index
  })
  return level
}

function build(): Progress {
  const score = scoreOf(saved)
  const level = levelFor(score)
  const here = Math.round(LEVELS[level].at * MAX_SCORE)
  const next = LEVELS[level + 1]
  const nextAt = next ? Math.round(next.at * MAX_SCORE) : MAX_SCORE
  return {
    ...saved,
    score,
    maxScore: MAX_SCORE,
    level,
    levelTitle: LEVELS[level].title,
    nextTitle: next ? next.title : null,
    levelProgress: next ? (score - here) / Math.max(nextAt - here, 1) : 1,
    complete: score >= MAX_SCORE,
    event,
  }
}

function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    /* private mode: progress simply lasts for this visit */
  }
  snapshot = build()
  listeners.forEach((listener) => listener())
}

type Note = Omit<GameEvent, 'id'>

/** Save a change and announce it — or announce a level-up / the grand finale instead when one is reached. */
function award(next: Saved, note: Note | null) {
  const before = levelFor(scoreOf(saved))
  saved = next
  const after = build()
  let toast: Note | null = note
  if (after.complete) toast = { icon: '👑', title: 'Wonderland Legend!', detail: 'You found every corner of Wonderland.' }
  else if (after.level > before) toast = { icon: '✦', title: `New title: ${after.levelTitle}`, detail: note?.detail ?? 'Curiouser and curiouser!' }
  if (toast) {
    eventId += 1
    event = { id: eventId, ...toast }
  }
  commit()
}

export function discoverDish(id: string, name: string): boolean {
  if (!(DISH_IDS as readonly string[]).includes(id) || saved.dishes.includes(id)) return false
  award({ ...saved, dishes: [...saved.dishes, id] }, { icon: '🍽', title: 'New discovery!', detail: `You tasted ${name}. +${POINTS.dish} ✦` })
  return true
}

export function collectTreasure(id: string): boolean {
  const treasure = TREASURES.find((item) => item.id === id)
  if (!treasure || saved.treasures.includes(id)) return false
  award({ ...saved, treasures: [...saved.treasures, id] }, { icon: '🗝', title: `Caught: ${treasure.name}`, detail: `${treasure.note} +${POINTS.treasure} ✦` })
  return true
}

export function solvePuzzle(id: string, title: string): boolean {
  if (!PUZZLE_IDS.includes(id) || saved.puzzles.includes(id)) return false
  award({ ...saved, puzzles: [...saved.puzzles, id] }, { icon: '🧩', title: 'Puzzle solved!', detail: `${title}. +${POINTS.puzzle} ✦` })
  return true
}

export function readChapter(id: string, title: string): boolean {
  if (!STORY_IDS.includes(id) || saved.chapters.includes(id)) return false
  award({ ...saved, chapters: [...saved.chapters, id] }, { icon: '📖', title: 'Chapter read', detail: `${title}. +${POINTS.chapter} ✦` })
  return true
}

export function catchFirefly(): boolean {
  if (saved.fireflies >= FIREFLY_MAX) return false
  const count = saved.fireflies + 1
  // only the last one in the jar gets a toast; the others are just a happy little sparkle
  award(
    { ...saved, fireflies: count },
    count === FIREFLY_MAX ? { icon: '🏮', title: 'Jar full!', detail: `You caught ${FIREFLY_MAX} fireflies. +${POINTS.firefly} ✦` } : null,
  )
  return true
}

export function leaveNote(): boolean {
  if (saved.noted) return false
  award({ ...saved, noted: true }, { icon: '✎', title: 'Note pinned!', detail: `Thank you for signing the wall. +${POINTS.note} ✦` })
  return true
}

export function resetProgress() {
  saved = { dishes: [], treasures: [], puzzles: [], chapters: [], fireflies: 0, noted: false }
  event = null
  commit()
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => snapshot,
    () => snapshot,
  )
}
