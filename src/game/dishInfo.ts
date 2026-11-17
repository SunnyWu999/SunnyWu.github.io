import bookData from '../data/recipe-book.json'

/* Everything the game layer shows about a dish, read from the recipe book data so there is one source of truth. */

type Chapter = {
  id: string
  ribbon: string
  title: string
  subtitle?: string
  image: string
  kind?: 'fortune' | 'guestbook'
  entries: { story?: unknown[] }[]
}

export type DishInfo = {
  id: string
  name: string // short: "Cocktails"
  title: string // long: "Cocktails for a Brave Life"
  blurb: string
  counts: string
  image: string
  tag?: string
}

const clean = (value?: string) => (value && !value.includes('[PLACEHOLDER]') ? value.trim() : '')
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

const tags: Record<string, string> = { cocktails: 'Drink Me', cake: 'Eat Me' }

const countsFor = (chapter: Chapter): string => {
  if (chapter.kind === 'fortune') return plural(chapter.entries.length, 'fortune')
  if (chapter.kind === 'guestbook') return 'sign the guest book'
  const stories = chapter.entries.filter((entry) => (entry.story?.length ?? 0) > 0).length
  const recipes = plural(chapter.entries.length, 'recipe')
  return stories > 0 ? `${recipes} · ${plural(stories, 'story')}` : recipes
}

export const dishInfo: Record<string, DishInfo> = Object.fromEntries(
  (bookData as unknown as { chapters: Chapter[] }).chapters.map((chapter) => [
    chapter.id,
    {
      id: chapter.id,
      name: chapter.ribbon,
      title: chapter.title,
      blurb: clean(chapter.subtitle),
      counts: countsFor(chapter),
      image: `images/scene/optimized/${chapter.image}.webp`,
      tag: tags[chapter.id],
    },
  ]),
)
