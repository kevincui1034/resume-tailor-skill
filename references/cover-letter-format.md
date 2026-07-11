# Cover letter format — generation contract

The canonical format + voice for every tailored cover letter. The skill reads this plus
`assets/cover-letter-template.tex` and emits a `.tex` (+ compiled `.pdf`) **only when the user
opts in**. It runs off the same target analysis as the resume, so generate the letter right
after the resume in the same run and reuse the proof points already selected.

## Honesty rule (load-bearing — mirrors the resume)

Every claim in the letter must trace to the user's real experience or projects. The skill
selects and rephrases; it **never invents work, metrics, or technologies**. A claim you inferred
rather than confirmed must be verified with the user before it goes in a sent letter. Draw facts
from the user's real record, not from memory.

## Voice

- **First person, warm and direct.** Natural contractions ("I'm", "it's", "I'd") are good — they
  keep the voice human and the template remaps the apostrophe glyph to ASCII so they stay
  ATS-safe.
- **Concrete over generic** — reference the company's actual product/mission, never filler praise.
- **Confident but not arrogant.** For an early-career writer, be humble without underselling.
- If the user's current primary language isn't the target's, say they work in their languages,
  have experience with the target's, and are eager to deepen it in production.
- Metrics are good but don't stuff every one in — pick the ones that match the role.
- Avoid AI-writing tropes: no "not just X but Y," no cramming multiple ideas into one sentence,
  no awkward hedging. Clear, direct, slightly warm.

## Structure (default: 3 body paragraphs)

- **Paragraph 1 — who I am + why THIS company.** Open with a one-line self-description (role +
  background) and the role applied for (and team, if the JD names one). Then 1–2 sentences on
  what specifically draws the writer to **this** company, referencing their **actual**
  mission/product. Name a concrete thing they build — not generic praise.
- **Paragraph 2 — what I've built.** Lead with owning systems end to end. Use the strongest
  proof point as the centerpiece with the architecture/impact details that match the JD's
  concerns (reliability, billing, pipelines, agents, performance — pick the relevant ones). Add
  one shorter second proof point mapped to the role.
- **Paragraph 3 — skills fit + values + close.** Weave the toolkit into prose — **do not recite
  a skills-list paragraph that echoes the JD back**. Name a couple of role-tied qualities
  (attention to detail, clear communication, ownership, moving fast in ambiguity). Close with a
  mission-level line and a warm sentence inviting a conversation.

Sign off **"Best regards, <Name>"** (default; "Sincerely" is also fine).

## Layout (MLA-style block letter)

The letter uses a plain MLA-style block format, NOT a centered letterhead.
`assets/cover-letter-template.tex` encodes it; reuse its preamble verbatim. The shape:

- **Left-aligned, single-spaced letterhead stack** at the top: name / phone / email / linkedin /
  github / portfolio, each on its own line (name in normal body size). Links plain and unadorned.
- **Salutation:** default **"Dear Hiring Team,"**. Use a named team/person only if the JD gives one.
- **Body:** three paragraphs at **1.4 line spacing** (`\begin{spacing}{1.4}`), `\parskip` ~5pt
  between paragraphs, first-line indent off.
- **Margins ~1 inch**, **no page number** (`\pagestyle{empty}`).
- Close with a single-spaced **"Best regards, \\ <Name>"**.

One page is a hard rule; a slightly short page is fine. To fit, follow the tuning ladder at the
bottom of `assets/cover-letter-template.tex` (trim wordiest sentences first, then nudge
`\parskip`/spacing, then the bottom margin). Do **not** shrink the body spacing below ~1.35 or it
stops reading as a letter.

## Mandatory style rules

- **No em dashes. Ever.** Use commas or periods. (Also no en-dash ranges in prose.)
- Escape LaTeX specials in the body: `%` → `\%`, `&` → `\&`, `_`, `#`, `$`.

## Research step

If the company is niche or its product isn't obvious from the JD, **search the web first** to
ground paragraph 1 in what they actually do — don't invent their mission. For well-known
companies, use the JD's own framing.

## Format variations (infer from the request, else default to the full 3-paragraph letter)

- **Body only:** drop the letterhead, salutation, and sign-off — emit just the paste-able body
  paragraphs. (For a paste-into-textbox application.)
- **Word-limited answer** (e.g. "why do you want to work here?"): respect the exact word/character
  cap, lead with the most specific hook.
- **Short recruiter-outreach intro** (letter + resume): 3–4 warm sentences hitting the top
  requirements, strongest proof point as the hook.
- **Mirror the exact title** the role names.

## ATS + LaTeX rules (shared with the resume)

The PDF text layer must extract as **pure ASCII** — no arrow glyphs, no icon-font symbols, no
accented/decorative Unicode, and no em/en dashes. The one subtlety: a straight `'` normally
renders as a typographic curly apostrophe (U+2019), which is non-ASCII. The template fixes this
with `\pdfglyphtounicode{quoteright}{0027}`, so contractions **display** normally but **extract**
as ASCII `'`. After compiling, run the codepoint scan from `resume-format.md` and expect **zero**
non-ASCII codepoints.

## Draft naming

Sits alongside the matching resume in the output directory, `_cover` suffix so it never collides
with the resume:

- **Role only:** `<lastname>_<role>_cover` (e.g. `smith_datascientist_cover`).
- **Role + company:** `<lastname>_<role>_<company>_cover` (e.g. `smith_mlengineer_chime_cover`).
- Use the **same tokens** as the resume it accompanies. No date; latest wins.

## Compiling & verify (same recipe as the resume)

```
pdflatex -interaction=nonstopmode -halt-on-error -output-directory="<build-dir>" "<draft>_cover.tex"
```

- **One-page check:** `pdfinfo <pdf> | grep Pages` → `Pages: 1`. If it spills, tighten paragraphs.
- **ATS-clean check:** run the codepoint scan on the PDF text layer — expect **zero** non-ASCII
  codepoints (the apostrophe remap + no-dash rule make it fully clean).
- **Dependency:** the template needs the `setspace` package. If the compile fails with
  `setspace.sty not found`, install it (`tlmgr install setspace`, or MiKTeX auto-install).
