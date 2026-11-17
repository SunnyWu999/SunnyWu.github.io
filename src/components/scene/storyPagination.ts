import type { StoryBlock } from '../../types'

/* Story-page helpers: which blocks are real, and how many fit on a page. */

export type MediaRequest = { type: 'photo' | 'video'; src: string }

export const INK_MS_PER_PARAGRAPH = 1000
export const BLOCK_STAGGER_MS = 350

const isReal = (value?: string) => Boolean(value && value.trim() && !value.includes('[PLACEHOLDER]'))

/** Keep only blocks that have real content (placeholders stay hidden, like the rest of the book). */
export function usableBlocks(story?: StoryBlock[]): StoryBlock[] {
  return (story ?? []).filter((block) => {
    if (block.type === 'text' || block.type === 'quote') return isReal(block.content)
    return isReal(block.src)
  })
}

// The printed page has three slots between the leaf dividers. Heights are in cqw.
const SLOT_CAPACITY = [15.2, 9.2, 12.8]
const GAP = 0.9

/** One page = three slots, each holding the blocks that fit between the printed dividers. */
export type StoryPageSlots = StoryBlock[][]

function blockHeight(block: StoryBlock): number {
  switch (block.type) {
    case 'text':
      return Math.ceil(block.content.length / 48) * 1.9 + 0.3
    case 'quote':
      return Math.ceil(block.content.length / 34) * 2.3 + 1.5
    case 'image':
      return block.caption ? 11.6 : 9.4
    case 'video':
      return block.caption ? 12 : 9.8
  }
}

/** Fill the slots in reading order; when they are full, continue on the next page (no scrolling). */
export function paginateStory(blocks: StoryBlock[]): StoryPageSlots[] {
  const empty = (): StoryPageSlots => SLOT_CAPACITY.map(() => [])
  const pages: StoryPageSlots[] = []
  let page = empty()
  let slot = 0
  let used = 0

  for (const block of blocks) {
    const height = blockHeight(block)
    for (;;) {
      const gap = page[slot].length > 0 ? GAP : 0
      const freshPage = slot === 0 && page[0].length === 0
      if (used + gap + height <= SLOT_CAPACITY[slot] || freshPage) {
        page[slot].push(block)
        used += gap + height
        break
      }
      slot += 1
      used = 0
      if (slot >= SLOT_CAPACITY.length) {
        pages.push(page)
        page = empty()
        slot = 0
      }
    }
  }
  if (page.some((blocksInSlot) => blocksInSlot.length > 0)) pages.push(page)
  return pages
}
