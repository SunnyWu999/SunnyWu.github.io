export type CommentRecord = {
  id: string
  name: string
  message: string
  createdAt: string
  /** paper colour of the pinned note (optional so older saved notes still load) */
  color?: string
  /** a little sticker stamped on the note */
  sticker?: string
  likes?: number
}

export type NewComment = { name: string; message: string; color?: string; sticker?: string }

/*
  The comments service is the only place that knows where notes are stored.
  Today they live in this browser's localStorage, so a visitor only sees their own notes.
  To share notes between visitors, implement this same interface against a backend
  (Supabase, Firebase, a small API…) and export it as `commentsService` — nothing else changes.
*/
export interface CommentsService {
  getComments: () => CommentRecord[]
  addComment: (input: NewComment) => CommentRecord
  likeComment: (id: string) => CommentRecord[]
}

const STORAGE_KEY = 'sunny-side-up-comments'

function parseStoredComments(): CommentRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as CommentRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(next: CommentRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Swallow storage issues gracefully so the app keeps working.
  }
}

export const commentsService: CommentsService = {
  getComments: () => {
    try {
      return parseStoredComments()
    } catch {
      return []
    }
  },
  addComment: ({ name, message, color, sticker }) => {
    const item: CommentRecord = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim().slice(0, 60) || 'Anonymous',
      message: message.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
      color,
      sticker,
      likes: 0,
    }
    save([...parseStoredComments(), item])
    return item
  },
  likeComment: (id) => {
    const next = parseStoredComments().map((item) => (item.id === id ? { ...item, likes: (item.likes ?? 0) + 1 } : item))
    save(next)
    return next
  },
}
