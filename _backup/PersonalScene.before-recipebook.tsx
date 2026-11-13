import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import cocktailsData from '../../data/cocktails.json'
import friendsData from '../../data/friends.json'
import travelData from '../../data/travel.json'
import aboutData from '../../data/about.json'
import creativeData from '../../data/creative.json'
import fortunesData from '../../data/fortunes.json'
import hotspotData from '../../data/hotspots.json'
import { commentsService } from '../../services/commentsService'
import { SectionPanel } from '../SectionPanel'

const hotspotLabelMap: Record<string, string> = {
  egg: 'the egg',
  cake: 'the cake',
  cocktails: 'the cocktails',
  'travel-board': 'the travel board',
  comfort: 'the noodle bowl',
  macarons: 'the macarons',
  'fortune-cookies': 'the fortune cookies',
  seat: 'the empty chair',
}

const personalHotspots = (hotspotData as { personal: Record<string, { x: number; y: number; w: number; h: number }> }).personal

const getSceneAsset = (name: string) => ({
  src: `/images/scene/${name}.webp`,
  fallback: `/images/scene/${name}.png`,
})

function SceneImage({ name, className, alt = '', priority = false }: { name: string; className?: string; alt?: string; priority?: boolean }) {
  const asset = getSceneAsset(name)

  return (
    <img
      className={className}
      src={asset.src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={(event) => {
        const target = event.currentTarget
        target.src = asset.fallback
      }}
    />
  )
}

const cocktailPalette = ['#c86d48', '#d8a857', '#5c8477', '#b67c5d']

function CocktailSection() {
  const [selectedId, setSelectedId] = useState<string | null>(cocktailsData[0]?.id ?? null)

  const selectedCocktail = cocktailsData.find((cocktail) => cocktail.id === selectedId) ?? cocktailsData[0]
  const storyBlocks = Array.isArray(selectedCocktail.story)
    ? selectedCocktail.story
    : [{ type: 'text', content: selectedCocktail.story }]

  return (
    <div className="section-content section-content--cocktails">
      <div className="cocktail-menu">
        {cocktailsData.map((cocktail, index) => (
          <button
            key={cocktail.id}
            type="button"
            className={`cocktail-glass ${selectedId === cocktail.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedId(cocktail.id)}
            style={{
              ['--glass-color' as string]: cocktailPalette[index % cocktailPalette.length],
              ['--glass-fill' as string]: `${Math.max(22, cocktail.proof)}%`,
            }}
          >
            <span className="cocktail-glass__liquid" aria-hidden="true" />
            <span className="cocktail-glass__bubbles" aria-hidden="true">
              {Array.from({ length: 7 }).map((_, bubbleIndex) => (
                <i key={`${cocktail.id}-bubble-${bubbleIndex}`} />
              ))}
            </span>
            <span className="cocktail-glass__label">{cocktail.name}</span>
          </button>
        ))}
      </div>

      {selectedCocktail ? (
        <article className="cocktail-story">
          <div className="cocktail-story__header">
            <div>
              <p className="cocktail-story__eyebrow">House pour</p>
              <h3>{selectedCocktail.name}</h3>
            </div>
            <span className="cocktail-story__proof">{selectedCocktail.proof}</span>
          </div>

          <div className="cocktail-story__body">
            <div className="cocktail-story__glass-wrap">
              <div
                className="cocktail-story__glass"
                style={{
                  ['--glass-color' as string]: cocktailPalette[cocktailsData.findIndex((cocktail) => cocktail.id === selectedCocktail.id) % cocktailPalette.length],
                  ['--glass-fill' as string]: `${Math.max(28, selectedCocktail.proof)}%`,
                }}
              >
                <span className="cocktail-story__liquid" aria-hidden="true" />
                <span className="cocktail-story__bubbles" aria-hidden="true">
                  {Array.from({ length: 11 }).map((_, bubbleIndex) => (
                    <i key={`${selectedCocktail.id}-story-bubble-${bubbleIndex}`} />
                  ))}
                </span>
              </div>
            </div>

            <div className="cocktail-story__text">
              <ul>
                {selectedCocktail.ingredients.map((ingredient, ingredientIndex) => (
                  <li key={`${selectedCocktail.id}-ingredient-${ingredientIndex}`}>{ingredient}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="storybook-media">
            {storyBlocks.map((block, index) => {
              if (block.type === 'text') {
                return (
                  <div key={`${selectedCocktail.id}-text-${index}`} className="story-block story-block--text">
                    <p>{block.content}</p>
                  </div>
                )
              }

              if (block.type === 'quote') {
                return (
                  <blockquote key={`${selectedCocktail.id}-quote-${index}`} className="story-block story-block--quote">
                    {block.content}
                  </blockquote>
                )
              }

              if (block.type === 'image') {
                return (
                  <figure key={`${selectedCocktail.id}-image-${index}`} className="story-block story-block--image">
                    <img src={block.src} alt={block.caption ?? selectedCocktail.name} />
                    {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                  </figure>
                )
              }

              return (
                <div key={`${selectedCocktail.id}-video-${index}`} className="story-block story-block--video">
                  <div className="story-video-frame">
                    <video src={block.src} poster={block.poster} muted playsInline controls preload="metadata" />
                  </div>
                  {block.caption ? <p>{block.caption}</p> : null}
                </div>
              )
            })}
          </div>
        </article>
      ) : null}
    </div>
  )
}

function FriendSection() {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendsData[0]?.id ?? null)
  const selectedFriend = friendsData.find((friend) => friend.id === selectedFriendId) ?? friendsData[0]

  return (
    <div className="section-content">
      <div className="cake-slice-grid">
        {friendsData.map((friend) => (
          <button
            key={friend.id}
            type="button"
            className={`cake-slice ${selectedFriendId === friend.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedFriendId(friend.id)}
          >
            <span>{friend.name}</span>
          </button>
        ))}
      </div>

      <div className="section-inline-art" aria-hidden="true">
        <SceneImage name="cake-slice" className="section-inline-art__image" alt="" />
      </div>

      {selectedFriend ? (
        <div className="profile-card">
          <div className="profile-card__photo">{selectedFriend.photo}</div>
          <div>
            <h3>{selectedFriend.name}</h3>
            <p>
              <strong>How we met:</strong> {selectedFriend.howWeMet}
            </p>
            <p>
              <strong>Friends since:</strong> {selectedFriend.friendsSince}
            </p>
            <p>
              <strong>Memory:</strong> {selectedFriend.memory}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TravelSection() {
  const [selectedTravelId, setSelectedTravelId] = useState<string | null>(travelData[0]?.id ?? null)
  const selectedTravel = travelData.find((stop) => stop.id === selectedTravelId) ?? travelData[0]

  return (
    <div className="section-content">
      <div className="travel-map" aria-label="Travel map overview">
        {travelData.map((stop, index) => (
          <button
            key={stop.id}
            type="button"
            className={`map-pin ${selectedTravelId === stop.id ? 'is-selected' : ''}`}
            style={{ left: `${16 + index * 22}%`, top: `${35 + (index % 2) * 16}%` }}
            onClick={() => setSelectedTravelId(stop.id)}
            aria-label={`Select ${stop.place}`}
          >
            📍
          </button>
        ))}
      </div>

      {selectedTravel ? (
        <div className="profile-card">
          <div>
            <h3>{selectedTravel.place}</h3>
            <p>
              <strong>Food:</strong> {selectedTravel.food}
            </p>
            <p>
              <strong>Memory:</strong> {selectedTravel.memory}
            </p>
          </div>
          <div className="photo-strip compact">
            {selectedTravel.photos.map((photo, index) => (
              <div key={`${selectedTravel.id}-photo-${index}`} className="photo-swatch">
                {photo}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AboutSection() {
  const story = aboutData[0]

  return (
    <div className="section-content">
      <div className="profile-card">
        <div className="profile-card__photo">
          <SceneImage name="comfort-dish" className="profile-card__image" alt="" />
        </div>
        <div>
          <h3>{story?.title ?? 'Sunny'}</h3>
          <p>{story?.summary}</p>
          {story?.recipe ? <p>Recipe note: {story.recipe}</p> : null}
        </div>
      </div>
    </div>
  )
}

function CreativeSection() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(creativeData[0]?.id ?? null)
  const selectedProject = creativeData.find((project) => project.id === selectedProjectId) ?? creativeData[0]

  return (
    <div className="section-content">
      <div className="macaron-plate">
        {creativeData.map((project) => (
          <button
            key={project.id}
            type="button"
            className={`macaron ${selectedProjectId === project.id ? 'is-selected' : ''}`}
            style={{ background: project.image }}
            onClick={() => setSelectedProjectId(project.id)}
            aria-label={`Open ${project.title}`}
          >
            <span>{project.title}</span>
          </button>
        ))}
      </div>

      <div className="section-inline-art" aria-hidden="true">
        <SceneImage name="travel-board" className="section-inline-art__image" alt="" />
      </div>

      {selectedProject ? (
        <div className="profile-card">
          <div className="profile-card__photo">{selectedProject.image}</div>
          <div>
            <h3>{selectedProject.title}</h3>
            <p>
              <strong>{selectedProject.type}</strong>
            </p>
            <p>{selectedProject.description}</p>
            <a href={selectedProject.link} target="_blank" rel="noreferrer">
              View project
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FortuneSection() {
  const [usedFortunes, setUsedFortunes] = useState<string[]>([])
  const [activeFortune, setActiveFortune] = useState(fortunesData[0])

  const crackAnother = () => {
    const remaining = fortunesData.filter((fortune) => !usedFortunes.includes(fortune.id))
    const next = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : fortunesData[0]
    setUsedFortunes((previous) => [...previous, next.id])
    setActiveFortune(next)
  }

  return (
    <div className="section-content fortune-content">
      <div className="fortune-slip">
        <SceneImage name="fortune-cookie-open" className="fortune-slip__image" alt="" />
        <h3>{activeFortune.question}</h3>
        <p>{activeFortune.answer}</p>
      </div>
      <button type="button" className="primary-action" onClick={crackAnother}>
        Crack another
      </button>
    </div>
  )
}

function CommentSection() {
  const [comments, setComments] = useState(commentsService.getComments())
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (honeypot) {
      return
    }

    if (!message.trim()) {
      return
    }

    const comment = commentsService.addComment({ name, message })
    setComments((previous) => [...previous, comment])
    setName('')
    setMessage('')
  }

  return (
    <div className="section-content">
      <div className="section-inline-art" aria-hidden="true">
        <SceneImage name="napkin-note" className="section-inline-art__image" alt="" />
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Optional" />
        </label>
        <label>
          Message
          <textarea value={message} maxLength={500} onChange={(event) => setMessage(event.target.value)} placeholder="What would you add to the table?" required />
        </label>
        <input
          aria-hidden="true"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
        <button type="submit" className="primary-action">
          Add a note
        </button>
      </form>

      <div className="comment-stack">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-napkin">
            <strong>{comment.name}</strong>
            <p>{comment.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PersonalSceneProps {
  activeHash?: string
  onOpenDish: (dishId: string) => void
  onClose: () => void
  onToggleScene: () => void
}

function PersonalScene({ activeHash, onOpenDish, onClose, onToggleScene }: PersonalSceneProps) {
  const reducedMotion = useReducedMotion()
  const [panelOrigin, setPanelOrigin] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isDebug, setIsDebug] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  const selectedDish = useMemo(() => {
    if (!activeHash) {
      return null
    }

    return Object.keys(personalHotspots).includes(activeHash) ? activeHash : null
  }, [activeHash])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsDebug(params.get('debug') === '1')
  }, [])

  useEffect(() => {
    if (!selectedDish) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDish, onClose])

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    setPointer({ x: x * 1.2, y: y * 1.2 })
  }

  const renderSectionContent = () => {
    switch (selectedDish) {
      case 'cocktails':
        return <CocktailSection />
      case 'cake':
        return <FriendSection />
      case 'travel-board':
        return <TravelSection />
      case 'comfort':
        return <AboutSection />
      case 'macarons':
        return <CreativeSection />
      case 'fortune-cookies':
        return <FortuneSection />
      case 'seat':
        return <CommentSection />
      default:
        return null
    }
  }

  const hotspotStyle = (hotspot: { x: number; y: number; w: number; h: number }): CSSProperties => {
    // Hotspot x/y are the CENTER of the object, in % of the painting.
    // The painting is 16:9 and covers the scene, so map image % onto the covered box.
    const boxW = 'max(100cqw, 177.78cqh)'
    const boxH = 'max(100cqh, 56.25cqw)'
    return {
      left: `calc((100cqw - ${boxW}) / 2 + ${boxW} * ${(hotspot.x - hotspot.w / 2) / 100})`,
      top: `calc((100cqh - ${boxH}) / 2 + ${boxH} * ${(hotspot.y - hotspot.h / 2) / 100})`,
      width: `calc(${boxW} * ${hotspot.w / 100})`,
      height: `calc(${boxH} * ${hotspot.h / 100})`,
    }
  }

  return (
    <div className="scene-view scene-view--personal" onMouseMove={handlePointerMove} onMouseLeave={() => setPointer({ x: 0, y: 0 })}>
      <div
        className="scene-painting scene-painting--personal"
        style={{
          ['--pointer-x' as string]: `${pointer.x}%`,
          ['--pointer-y' as string]: `${pointer.y}%`,
        }}
        aria-hidden="true"
      />

      <div className="scene-ambient scene-ambient--personal" aria-hidden="true">
        <span className="ambient-star ambient-star--1" />
        <span className="ambient-star ambient-star--2" />
        <span className="ambient-star ambient-star--3" />
        <span className="ambient-star ambient-star--4" />
        <span className="ambient-firefly ambient-firefly--1" />
        <span className="ambient-firefly ambient-firefly--2" />
        <span className="ambient-firefly ambient-firefly--3" />
        <span className="ambient-moon" />
        <span className="ambient-candle ambient-candle--1" />
        <span className="ambient-candle ambient-candle--2" />
      </div>

      {Object.entries(personalHotspots).map(([id, hotspot]) => {
        const label = id === 'egg' ? 'Flip to the professional scene' : `Open ${hotspotLabelMap[id] ?? id}`

        return (
          <button
            key={id}
            type="button"
            className={`scene-hotspot ${selectedDish === id ? 'is-selected' : ''} ${isDebug ? 'is-debug' : ''}`}
            style={hotspotStyle(hotspot)}
            aria-label={label}
            onClick={(event) => {
              if (id === 'egg') {
                onToggleScene()
                return
              }

              const rect = event.currentTarget.getBoundingClientRect()
              setPanelOrigin({
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
              })
              onOpenDish(id)
            }}
          >
            <span className="scene-hotspot__label">{id === 'egg' ? 'egg' : hotspotLabelMap[id] ?? id}</span>
          </button>
        )
      })}

      <SectionPanel
        title={selectedDish ? (selectedDish === 'egg' ? 'The Egg' : hotspotLabelMap[selectedDish] ?? 'Section') : 'Section'}
        isOpen={Boolean(selectedDish)}
        onClose={() => {
          setPanelOrigin(null)
          onClose()
        }}
        sharedImage={selectedDish && selectedDish !== 'egg' ? selectedDish : undefined}
        sharedOrigin={panelOrigin}
      >
        {renderSectionContent()}
      </SectionPanel>
    </div>
  )
}

export default PersonalScene
