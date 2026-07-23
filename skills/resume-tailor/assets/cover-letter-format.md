# cover letter format — generation contract

The canonical format for every tailored cover letter. Tailoring reads this + `cover-letter-template.tex` and emits a `.tex` (+ compiled `.pdf`) into `drafts/` **only when the user opts in**. Runs off the same target analysis as the resume, so generate the letter right after the resume in the same run and reuse the proof points already selected.

**Voice and language rules live in `voice.md`** — the canonical contract for every prose artifact. Read it before writing.

## Honesty rule (load-bearing)

Every claim traces to a real `projects/` accomplishment note or a confirmed fact in `identity.md`. Select and rephrase; **never invent work, metrics, or technologies**. `(verify)`-marked claims must be confirmed first.

## Who the writer is

Comes from `identity.md`: the one-line self-introduction, education, current work, primary languages/tools, and the centerpiece project (usually the most substantial owned work). Adapt wording per role; never contradict identity.md.

## Structure (default: 3 body paragraphs)

The letter reads like the user talking about themselves, not a spec sheet. **Personal experience is the majority of the content** — how they work, what building things taught them, why this company resonates. Projects are supporting texture: **at most 1-2 sentences each, no metrics, no architecture walkthroughs**.

- **Paragraph 1 — who I am + why THIS company.** The identity.md self-introduction + the role (and team, if named). Then a couple of genuine sentences on why this company resonates, referencing their **actual** mission/product. Concrete and personal, not a pitch.
- **Paragraph 2 — how I work + what I've done.** Lead with the personal. Mention the centerpiece project (and at most one other) as light supporting texture. An honest personal reflection is welcome when it's genuinely the user's — as a reflection, not a tagline.
- **Paragraph 3 — values + close.** Weave the toolkit in lightly — never recite a skills-list paragraph that echoes the JD back. Name a couple of role-tied qualities. Close with a mission-level line + "Thank you for considering my application, and I'd welcome the chance to talk further."

Salutation defaults to "Dear Hiring Team," (a named person/team only if the JD gives one). Sign-off "Best regards, <name>".

## Layout (MLA-style block letter)

`cover-letter-template.tex` encodes it; reuse its preamble verbatim: left-aligned single-spaced letterhead stack, body at 1.4 line spacing with ~5pt paragraph gaps, ~1in margins, no page number. One page is a hard rule; a slightly short page is fine — see the tuning ladder at the bottom of the template. Do not shrink body spacing below ~1.35.

## Format variations (infer from the request, else default to the full letter)

- **Body only:** drop letterhead/salutation/sign-off — paste-able paragraphs for an application textbox.
- **Word-limited answer:** respect the exact word/character cap, lead with the most specific hook.
- **Short recruiter-outreach intro:** 3–4 warm sentences hitting their top requirements.
- **Mirror the exact title** the role names.

## Research step

If the company is niche, **search the web first** to ground paragraph 1 in what they actually do — never invent their mission.

## ATS + LaTeX rules (shared with the resume)

Text layer extracts as **pure ASCII** — the template's apostrophe remap keeps contractions clean. After compiling, run format.md's codepoint scan and expect **zero** non-ASCII codepoints. Escape LaTeX specials. Compile + verify one page, same recipe as the resume.
