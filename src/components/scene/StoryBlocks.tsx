import { Fragment, useState } from 'react'
import type { StoryBlock } from '../../types'
import { INK_MS_PER_PARAGRAPH, BLOCK_STAGGER_MS, type MediaRequest, type StoryPageSlots } from './storyPagination'
import './story-blocks.css'

/*
  Dreamy story blocks for the recipe book.
  - text   writes itself in ink (about 1 second per paragraph)
  - image  floats in a feathered oval vintage frame
  - video  plays inside a gold looking-glass, starting muted and blurred, then sharpening
  - quote  is handwritten in the margin with a small ink flourish
  Nothing pops in: every block fades up through a soft glow with a few sparkles.
*/

function InkText({ text, delay }: { text: string; delay: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  const step = INK_MS_PER_PARAGRAPH / Math.max(words.length, 1)
  return (
    <p className="sb-text">
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="sb-ink" style={{ animationDelay: `${delay + index * step}ms` }}>
            {word}
          </span>{' '}
        </Fragment>
      ))}
    </p>
  )
}

function Sparkles({ delay }: { delay: number }) {
  return (
    <span className="sb-sparkles" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <i key={index} style={{ ['--s' as string]: index, animationDelay: `${delay + index * 260}ms` }} />
      ))}
    </span>
  )
}

function Block({ block, delay, onOpen }: { block: StoryBlock; delay: number; onOpen: (media: MediaRequest) => void }) {
  if (block.type === 'text') return <InkText text={block.content.trim()} delay={delay} />

  if (block.type === 'quote') {
    return (
      <blockquote className="sb-quote" style={{ animationDelay: `${delay}ms` }}>
        <p>{block.content.trim()}</p>
        <svg className="sb-flourish" viewBox="0 0 120 12" aria-hidden="true">
          <path d="M2 8 C 18 1, 34 12, 52 6 S 92 1, 118 8" pathLength={1} style={{ animationDelay: `${delay + 500}ms` }} />
        </svg>
      </blockquote>
    )
  }

  if (block.type === 'image') {
    return (
      <figure className="sb-figure" style={{ animationDelay: `${delay}ms` }}>
        <button type="button" className="sb-oval" onClick={() => onOpen({ type: 'photo', src: block.src })} aria-label={block.caption ?? 'Open photo'}>
          <img src={block.src} alt={block.caption ?? ''} />
        </button>
        <Sparkles delay={delay + 300} />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    )
  }

  return (
    <figure className="sb-figure" style={{ animationDelay: `${delay}ms` }}>
      <button type="button" className="sb-glass" onClick={() => onOpen({ type: 'video', src: block.src })} aria-label={block.caption ?? 'Open video'}>
        <video src={block.src} poster={block.poster} autoPlay muted loop playsInline preload="metadata" style={{ animationDelay: `${delay}ms` }} />
      </button>
      <Sparkles delay={delay + 300} />
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  )
}

export function StoryPage({
  slots,
  onOpen,
  lead = 0,
  still = false,
}: {
  slots: StoryPageSlots
  onOpen: (media: MediaRequest) => void
  /** wait this long before the first block appears (e.g. while a page is still turning) */
  lead?: number
  /** show everything already written — used for the copies carried on a turning leaf */
  still?: boolean
}) {
  // Fixed at mount: changing a delay while the animation runs would make the ink jump.
  const [startLead] = useState(lead)
  // Text writes itself in order; every other block fades in right after the one before it.
  const flat = slots.flat()
  const steps = flat.map((block) => (block.type === 'text' ? INK_MS_PER_PARAGRAPH + 150 : BLOCK_STAGGER_MS + 400))
  const delayOf = (block: StoryBlock) => 250 + startLead + steps.slice(0, flat.indexOf(block)).reduce((sum, step) => sum + step, 0)

  return (
    <>
      {slots.map((blocks, slotIndex) => (
        <div key={slotIndex} className={`mb-slot mb-slot--${slotIndex + 1} sb-slot ${still ? 'sb-still' : ''}`}>
          {blocks.map((block, index) => (
            <Block key={index} block={block} delay={delayOf(block)} onOpen={onOpen} />
          ))}
        </div>
      ))}
    </>
  )
}
