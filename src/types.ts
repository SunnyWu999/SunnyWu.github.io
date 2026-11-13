export type StoryBlock =
  | { type: 'text'; content: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'video'; src: string; poster?: string; caption?: string }
  | { type: 'quote'; content: string }

export type PlaceholderEntry = {
  id: string
  title: string
  label?: string
  description?: string
  status?: string
}

export type Cocktail = {
  id: string
  name: string
  date: string
  location: string
  ingredients: string[]
  proof: number
  story: string | StoryBlock[]
  images: string[]
}

export type Friend = {
  id: string
  name: string
  howWeMet: string
  friendsSince: string
  memory: string
  photo: string
  story?: StoryBlock[]
}

export type TravelStop = {
  id: string
  place: string
  country: string
  food: string
  memory: string
  photos: string[]
  coordinates: [number, number]
  story?: StoryBlock[]
}

export type AboutStory = {
  id: string
  title: string
  summary: string
  recipe?: string
  image?: string
  story?: StoryBlock[]
}

export type CreativeProject = {
  id: string
  title: string
  type: string
  description: string
  image: string
  link: string
  story?: StoryBlock[]
}

export type Fortune = {
  id: string
  question: string
  answer: string
  story?: StoryBlock[]
}

export type ResumeCourse = {
  id: string
  title: string
  date: string
  description: string
  details: string[]
  story?: StoryBlock[]
}

export type ResumeMenu = {
  id: string
  title: string
  courses: ResumeCourse[]
}

export type PersonalDish = {
  id: string
  label: string
  title: string
  kind: 'cocktails' | 'cake' | 'travel' | 'comfort' | 'macarons' | 'fortunes' | 'seat'
}
