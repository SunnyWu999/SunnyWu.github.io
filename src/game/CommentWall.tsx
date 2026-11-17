import { useState, type FormEvent } from 'react'
import { commentsService, type CommentRecord } from '../services/commentsService'
import { leaveNote } from './progress'
import { burstAt } from './sparkle'
import GameModal from './GameModal'
import './comment-wall.css'

/*
  The wall of notes: visitors pin a note (a colour, a sticker, a few words) and read the others.
  Notes go through commentsService, which today stores them in this browser only.
*/

const PAPERS = ['#fff1b8', '#ffd9d4', '#d7efd9', '#d6e5ff', '#eadcff']
const STICKERS = ['✦', '♥', '🗝', '🫖', '🃏', '🍄']
const MAX = 280

const hash = (text: string) => [...text].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 7)
const dateLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export default function CommentWall({ onClose }: { onClose: () => void }) {
  const [notes, setNotes] = useState<CommentRecord[]>(() => commentsService.getComments())
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [color, setColor] = useState(PAPERS[0])
  const [sticker, setSticker] = useState(STICKERS[0])
  const [trap, setTrap] = useState('')
  const [liked, setLiked] = useState<string[]>([])
  const [justPinned, setJustPinned] = useState<string | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (trap || !message.trim()) return
    const pinned = commentsService.addComment({ name, message, color, sticker })
    setNotes(commentsService.getComments())
    setJustPinned(pinned.id)
    setMessage('')
    leaveNote()
    const box = event.currentTarget.getBoundingClientRect()
    burstAt(box.left + box.width / 2, box.bottom - 30, { count: 22, spread: 150 })
  }

  const like = (id: string) => {
    if (liked.includes(id)) return
    setLiked((list) => [...list, id])
    setNotes(commentsService.likeComment(id))
  }

  const ordered = [...notes].reverse()

  return (
    <GameModal title="The Wall of Notes" subtitle="pin a few words for the next visitor" onClose={onClose} wide>
      <div className="cw">
        <form className="cw__form" onSubmit={submit}>
          <div className="cw__preview" style={{ background: color }}>
            <span className="cw__sticker" aria-hidden="true">
              {sticker}
            </span>
            <p>{message.trim() || 'Your note will look like this…'}</p>
            <em>— {name.trim() || 'Anonymous'}</em>
          </div>

          <label className="cw__label">
            Your name <span>(optional)</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="the Mad Hatter" />
          </label>

          <label className="cw__label">
            Your note
            <textarea value={message} onChange={(event) => setMessage(event.target.value.slice(0, MAX))} maxLength={MAX} rows={4} placeholder="a hello, a dare, a favourite memory…" required />
            <span className="cw__count">
              {message.length} / {MAX}
            </span>
          </label>

          <input className="cw__trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(event) => setTrap(event.target.value)} aria-hidden="true" />

          <div className="cw__pick" role="radiogroup" aria-label="Paper colour">
            {PAPERS.map((paper) => (
              <button key={paper} type="button" role="radio" aria-checked={paper === color} aria-label={`Paper ${paper}`} className={paper === color ? 'is-on' : ''} style={{ background: paper }} onClick={() => setColor(paper)} />
            ))}
          </div>
          <div className="cw__pick cw__pick--stickers" role="radiogroup" aria-label="Sticker">
            {STICKERS.map((item) => (
              <button key={item} type="button" role="radio" aria-checked={item === sticker} className={item === sticker ? 'is-on' : ''} onClick={() => setSticker(item)}>
                {item}
              </button>
            ))}
          </div>

          <button type="submit" className="cw__send">
            📌 Pin it to the wall
          </button>
          <p className="cw__fine">Notes are kept in this browser for now. Connect a server in <code>commentsService.ts</code> to share them between visitors.</p>
        </form>

        <div className="cw__board" aria-live="polite">
          {ordered.length === 0 ? <p className="cw__empty">The wall is empty — be the first to pin a note.</p> : null}
          {ordered.map((note) => {
            const seed = hash(note.id)
            return (
              <article
                key={note.id}
                className={`cw__note ${note.id === justPinned ? 'is-new' : ''}`}
                style={{ background: note.color ?? PAPERS[seed % PAPERS.length], ['--tilt' as string]: `${(seed % 9) - 4}deg` }}
              >
                <span className="cw__pin" aria-hidden="true" />
                <span className="cw__sticker" aria-hidden="true">
                  {note.sticker ?? STICKERS[seed % STICKERS.length]}
                </span>
                <p>{note.message}</p>
                <footer>
                  <em>
                    — {note.name} · {dateLabel(note.createdAt)}
                  </em>
                  <button type="button" onClick={() => like(note.id)} className={liked.includes(note.id) ? 'is-liked' : ''} aria-label={`Like this note (${note.likes ?? 0})`}>
                    ♥ {note.likes ?? 0}
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      </div>
    </GameModal>
  )
}
