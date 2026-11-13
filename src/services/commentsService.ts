export type CommentRecord = {
  id: string
  name: string
  message: string
  createdAt: string
}

export interface CommentsService {
  getComments: () => CommentRecord[]
  addComment: (input: { name: string; message: string }) => CommentRecord
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

export const commentsService: CommentsService = {
  getComments: () => {
    try {
      return parseStoredComments()
    } catch {
      return []
    }
  },
  addComment: ({ name, message }) => {
    const trimmedName = name.trim() || 'Anonymous'
    const trimmedMessage = message.trim()

    const item: CommentRecord = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    }

    try {
      const next = [...parseStoredComments(), item]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Swallow storage issues gracefully so the app keeps working.
    }

    return item
  },
}
