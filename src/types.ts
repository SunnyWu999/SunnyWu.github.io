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
  story: string
  images: string[]
}

export type Friend = {
  id: string
  name: string
  howWeMet: string
  friendsSince: string
  memory: string
  photo: string
}

export type TravelStop = {
  id: string
  place: string
  country: string
  food: string
  memory: string
  photos: string[]
  coordinates: [number, number]
}

export type AboutStory = {
  id: string
  title: string
  summary: string
  recipe?: string
  image?: string
}

export type CreativeProject = {
  id: string
  title: string
  type: string
  description: string
  image: string
  link: string
}

export type Fortune = {
  id: string
  question: string
  answer: string
}

export type ResumeCourse = {
  id: string
  title: string
  date: string
  description: string
  details: string[]
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
