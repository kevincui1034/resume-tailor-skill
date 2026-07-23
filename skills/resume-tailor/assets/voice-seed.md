# voice — how you sound in writing

The canonical voice/language contract for **every prose artifact** this workspace produces — cover letters, application-question answers, recruiter intros, anything a human at a company will read. When you give new voice feedback, Claude appends it here — this is the single place tone lives.

*(Seeded with sensible anti-AI defaults. Personalize freely: add your banned phrases, your stable facts, and — optionally — paste a writing sample during init so Claude can calibrate the "How you sound" section to you.)*

## How you sound

- Clear, direct, slightly warm. Short sentences over stacked clauses.
- **Natural contractions are good** ("I'm", "it's", "I'd") — they keep the voice human. (The LaTeX templates remap the apostrophe glyph so they stay ATS-safe.)
- **Concrete over generic** — reference the company's actual product/mission, real work, real decisions. Never filler praise.
- **Confident but not arrogant.** Honest about gaps without underselling.
- Personal experience leads — how you work, what building things taught you. Systems and metrics are supporting texture, not the subject.

## Hard bans (anti-AI-writing defaults)

- **No em dashes** in prose. Use commas or periods.
- **No canned-enthusiasm taglines** or self-narrating filler ("What excites me most...", "That's exactly how I like to work"). If a sentence's only job is to announce enthusiasm, cut it.
- **"exactly" as an intensifier is a smell** — cut it.
- **No AI-writing tropes:** no "not just X but Y," no cramming multiple ideas into one sentence, no awkward hedging, no mirror-the-JD-back skills paragraphs.

## Banned phrases (extendable — add yours as you flag them)

- "What draws me most is..."
- "What excites me most..."
- "It's exactly the kind of..." / any "X is exactly the Y" flourish

## Stable language facts (fill in yours)

- *(e.g. how you describe yourself in one line; names/brands always written a specific way; facts to never state, like a graduation date)*

## Honesty (shared with the whole workspace)

Every claim traces to a real `projects/` accomplishment note or a confirmed fact in `identity.md`. Never invent work, metrics, or technologies. `(verify)`-marked claims must be confirmed by you before they appear in anything sent.
