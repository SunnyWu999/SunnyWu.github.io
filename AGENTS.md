# Sunny Side Up project notes

Theme: inspired by Lewis Carroll's original Alice's Adventures in Wonderland and John Tenniel's illustrations, never the Disney film look. The world should feel dreamlike, textured, and hand-drawn rather than pasted in.

- Use the project in order: set up the app, build the professional scene as "before the rabbit hole," build the personal scene as "Wonderland," then add the egg toggle and each data-backed section.
- Keep all content ready for replacement with real data later; placeholder JSON entries should remain clearly marked as [PLACEHOLDER].
- Keep routes available for both `/` and `/professional` and ensure deep links and hash URLs continue to work.
- Use a simple, accessible, resilient structure so the app can later be upgraded to a real backend or Supabase data source.

Scene concept:
- Professional scene = "before the rabbit hole": bright sunny afternoon. Background bg-professional.png shows a sunny alpine meadow under a snowy mountain with a small rabbit hole by the big tree. A neat table with a white tablecloth (table-professional.png) stands on the meadow, with the menu card and a pocket-watch.png. Calm, orderly, trustworthy.
- Personal scene = "Wonderland": night. Background bg-personal-night.png is the same meadow at night with stars, moon, glowing snow, fireflies, and glowing mushrooms. The wooden table (table-personal.png) holds all the dishes, candles, and mismatched teacups. Dreamy, playful, magical. Cocktails carry a paper "Drink Me" tag and the cake an "Eat Me" tag.
- The egg flip = falling down the rabbit hole (professional → personal) or floating back up (personal → professional), through a tunnel of floating objects.
- Media rule: every entry can include a "story" list of blocks mixing text, images, and videos. Media must always blend in: photos in feathered oval vintage frames or drifting polaroids, videos inside an ornate looking-glass mirror frame, text that writes itself like ink. Nothing appears abruptly; everything fades in through soft glow and sparkles.

Scene build rules:
- Fill the whole window at every size (cover, no blank bands). The table stands on the meadow with legs on the grass, a soft contact shadow, and a feathered strip of foreground grass cropped from the background placed in front of the table legs. Dishes sit on the tabletop around the egg with small shadows. Remove any text-pill labels and corner badges; the dishes and the egg are the buttons.
- Professional (day): use bg-professional.png, table-professional.png, menu card, and pocket-watch.png on the table. Keep warm daylight, subtle drifting clouds, and very calm motion.
- Personal (night): use bg-personal-night.png and table-personal.png. Relight the table and every dish for night with CSS filters (darker, cooler) plus warm candlelight glow from candles on the table. Ambient magic: twinkling stars, fireflies drifting across the scene, the moon softly glowing, and gentle floating sparkles. Dishes glow softly; on hover a dish grows slightly bigger (like Alice's potion), sparkles rise, and a handwritten label fades in. Small paper tags: "Drink Me" on cocktails and "Eat Me" on cake.
- The fall (egg click): Professional → personal: the egg flips, the camera dives toward the rabbit hole, then the screen becomes rabbit-hole.png scrolling upward to create a slow fall (about 3 seconds). Floating objects drift past at different speeds and rotations with parallax: pocket-watch, teacup, golden-key, playing-card, drink-me-bottle, plus 3–4 photos from the data files in vintage frames. The tunnel brightens into night and you land softly at the Wonderland table.
- Personal → professional: the reverse, floating up out of the hole into daylight.
- Add a small "skip" button during the fall, and prefer-reduced-motion uses a simple crossfade.
- Remember the URL rules: "/" is personal, "/professional" is professional, and both load directly without the fall animation.

Recipe book and media blocks:
- The enchanted recipe book for Wonderland glows softly in the dark; golden dust and fireflies drift around it. Page edges are gilded. Small Tenniel-style ink illustrations in the margins (teacups, keys, a pocket watch, playing cards) serve as subtle decorations.
- Add a "story" field to every data type: an array of blocks, each one of: { type: "text", content }, { type: "image", src, caption }, { type: "video", src, poster, caption }, { type: "quote", content }.
- Render blocks dreamily: text writes itself in ink when the page opens (fast, about 1 second per paragraph); image uses a feathered oval vintage frame or drifting polaroid; video plays inside an ornate gold looking-glass mirror frame, starts muted and softly blurred, then sharpens; quote is handwritten in the margin with a small ink flourish.
- Long stories continue onto the next page with the page-turn animation instead of scrolling.
- Add 1–2 example blocks of each type to the cocktail placeholder data to preview the effect.

Implementation notes:
- Keep the dishes, data files, recipe book, and résumé tasting menu in place.
- Do not remove the existing route structure or the data-driven sections.
- Organize assets simply and accessibly so they can be replaced later with real media files and a real backend.
