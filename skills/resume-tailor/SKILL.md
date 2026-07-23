---
name: resume-tailor
description: Tailor one-page LaTeX resumes to job descriptions from the user's real, verified work. Use when the user wants to tailor/build a resume for a JD or role, paste job descriptions or posting URLs (single or batch), write a cover letter or application-question answers, track applications (applied/interviewing/ghosted/rejected), add a repo as resume material, switch or drop in a resume template, or set up a resume workspace. Triggers on "tailor my resume", "resume for this JD", "cover letter for", "mark <company> as <status>", "add this repo to my resume", "change resume template".
---

# Resume Tailor

Turns a job description into a targeted, one-page LaTeX resume assembled from the user's **verified accomplishments** — never invented ones. All user data lives in a **workspace** (`./resume/` by default) that this skill creates on first use; the skill itself is a stateless engine over it.

**The honesty rule (load-bearing, applies to everything):** every resume bullet, cover-letter claim, and question answer traces to a real accomplishment note in `resume/projects/`, which traces to a real repo or an explicit user confirmation. Select and rephrase; never invent work, metrics, or technologies. Claims inferred from code rather than confirmed carry `(verify)` and must be confirmed by the user before appearing in anything sent.

## Mode routing

| User intent | Mode |
| --- | --- |
| No workspace exists yet (no `resume/` with `identity.md`) | **Init wizard** (below), then continue with what they asked |
| A JD, posting URL, role name, or several of them | **Tailor** (the default pipeline) |
| "add this repo / project to my resume" | **Add material** |
| "refresh <draft>" | **Refresh** |
| "mark <company> as interviewing/ghosted/rejected/…" | **Status** |
| "change/list/drop in template" | **Template** |
| "show my applications / dashboard" | Point at `resume/dashboard.html` (open in Chrome/Edge) |

## Workspace layout (created by init)

```
resume/
  identity.md          # who the resume is about - contact, education, experience entries, self-intro
  voice.md             # how the user sounds in prose - tone, banned phrases (canonical for ALL prose)
  format.md            # universal hard rules (one page, ATS, bullet craft, naming, compile recipe)
  template.tex         # the ACTIVE resume template (line 1: % ACTIVE TEMPLATE: <name>)
  templates/           # template library (jake.tex default; drop-ins added here)
  cover-letter-format.md / cover-letter-template.tex
  projects/            # one accomplishment note per job/project - THE source of truth
  targets/             # auto-saved JDs, one note per posting
  drafts/              # generated .tex + .pdf (+ _answers.md)
  bank.md              # reuse memory: themes -> proven bullets/cover skeletons/skills (JSON block)
  applications.md      # tracker dataset (JSON block) - feeds the dashboard
  dashboard.html       # local interactive tracker (File System Access write-back)
  scripts/jd-match.mjs # deterministic JD->theme matcher + keyword-coverage checker
  log.md               # append-only run log
```

`bank.md`, `applications.md` and the JSON-block convention: edit **only** the fenced JSON, never hand-mangle it; prose around it is human territory.

## Init wizard (first run, or when any anchor file is missing)

Copy the seeds from this skill's `assets/` directory into the workspace: `templates/jake.tex` (+ activate as `template.tex`, stamped `% ACTIVE TEMPLATE: jake`), `format.md`, `voice-seed.md → voice.md`, `cover-letter-format.md`, `cover-letter-template.tex`, `identity-template.md → identity.md`, `bank-seed.md → bank.md`, `applications-seed.md → applications.md`, `dashboard.html`, `jd-match.mjs → scripts/`. Then walk the user through, asking in one or two batched questions rather than a drip:

1. **Template** — keep the default `jake` (sb2nov classic) or drop in their own resume as a template (see Template mode). Asked once here; changeable any time later.
2. **Context intake — where the resume content comes from.** Offer all three, best first:
   - **Import their existing resume** (PDF/docx/tex/image). Parse it into: `identity.md` (name, contact, education, experience entries, draft prefix), one `projects/` note per job/project (bullets become accomplishments), initial skills lists, and **seed the bank** — bullets from a resume they've been sending are proven material (`source: "import"`, `template` = whatever it shipped in, so line fill still gets re-verified under the active template; tag each with themes and trigger keywords). This gives a working bank on day one.
   - **Mine repos** (Add-material mode): local paths or GitHub URLs → read README/manifests/structure and git history for what *they* did; draft quantified accomplishment notes per `assets/project-note-template.md`; mark inferred claims `(verify)`; never write into the source repo.
   - **Interview** for experience with no artifact: short Q&A; answers recorded as user-confirmed notes.
3. **Voice** — `voice.md` ships with generic anti-AI defaults. Offer: paste a writing sample (an old cover letter, a long email) and calibrate the "How you sound" section to them; skip is fine.
4. **Plumbing** — if the workspace is inside a git repo, ask once whether runs should commit (+push). Record the answer in `identity.md` under a `## Config` heading.

End init by showing the user their `identity.md` and asking them to correct role titles, dates, and metrics — those can't be read reliably from code.

## Tailor pipeline

### 0. Load contracts
Read `format.md`, `template.tex` (the active template — its comment header states section order, macros, and whether the full-line rule applies), `identity.md`, and `voice.md`. Hard rules: **one page**; **full-line bullets** when the active template says so (each bullet ~2 full lines, no orphan last line); ATS-safe ASCII per format.md rule 3. Self-heal any missing workspace anchor from `assets/` before proceeding.

### 1. Resolve the target(s)
Inputs, mixable: a `targets/` slug · pasted JD(s) · posting URL(s) (fetch with WebFetch; if login-walled ask for a paste) · a bare role name (lightweight profile, nothing persisted).

- **Multi-JD detection:** more than one JD (separated by `---`, distinct company/role headers, or multiple URLs) → list the detected targets and confirm the split in one question. This is the one confirmation that always happens.
- **Application-question detection:** note any essay prompts / "why us" / word-capped questions in the posting; they're answered in step 9.
- **Auto-save every real JD** to `targets/<company>-<role>.md`: frontmatter `created`, `company`, `role`, `source`, plus `tech:`/`tools:`/`domains:` arrays; body = short summary + the JD's content under its own headings (`## Must-haves`, `## Keywords`/`## Keyword language`, `## Nice to haves` — the coverage checker parses these). After the draft ships, append a `## Tailoring notes` trailer.
- Settle the **role token** and **company token** for the filename (mandatory company token in batches so names can't collide).

### 2. Ask once, up front
- **Cover letters:** single target → "Want a matching cover letter too?" Batch → one question: all / none / name which.
- **`(verify)` claims:** batch-confirm any that the likely-selected notes carry, so generation never blocks mid-flight.

### 3. Generate — inline or fan out
Single target → steps 4–9 inline. **Batch (2+) → parallel by default**: one general-purpose subagent per target in a single message (sequential only on request). Each agent's prompt is self-contained: target note path, tokens, cover-letter obligation, detected questions, pointers to `format.md`/`template.tex`/`identity.md`/`voice.md`/`bank.md`/`projects/`, its target's matcher output, and the full hard-rule recap (one page; full-line rule per template; ATS ASCII; never invent; the `(verify)` resolutions). Agents do steps 4–9 for their one target and **return a summary**. **Agents never touch `applications.md`, `bank.md`, or `log.md`** — the main conversation updates those once in step 10.

### 4. Select — bank first, LLM second
Run the deterministic matcher before any reasoning:
```
node resume/scripts/jd-match.mjs match <target-note-or-jd-file>
```
It scores the JD against `bank.md` themes (plain keyword hits, no LLM) and returns matched themes with anchor guidance, candidate bullets, cover proof-point ids, and skills fragments. Start from that: experience entries come from `identity.md` (keep all real jobs unless the target makes one clearly irrelevant); projects default to the matched themes' anchors (read full `projects/` notes only for surfaced candidates + uncovered requirements); skills start from the matcher's fragments trimmed to what the selected work evidences. Judgment is reserved for choosing among candidates and covering requirements **no theme matched**. A requirement that stays unmatched across runs is a signal to add a theme (step 10 harvest).

### 5. Write bullets
- **Bank bullets first, verbatim** — the only permitted edit is re-aiming `\textbf{}` at the target's keywords. The line-fill guarantee is **template-scoped**: it holds only when the active template matches the bullet's `template` field; otherwise (and for any reworded or fresh bullet) full fill verification applies, and the result is a harvest candidate.
- Fresh bullets: strong past-tense verb, real quantified impact from the note, `\textbf{}` on the target's key tech, LaTeX specials escaped, ~2 full lines when the rule applies. Convert any `→`-style shorthand from notes into plain words.

### 6. Fit to one page
Budget ≈ education + real jobs + 2–3 projects + skills. Overflow → cut the weakest material first.

### 7. Emit and verify
Write `drafts/<prefix>_<role>[_<company>].tex` — complete and compilable, ending with a commented `% SOURCING` block (which notes fed each section; what strong material was left off). Compile per format.md's recipe; confirm `Pages: 1`, run the ATS codepoint scan, and — when the full-line rule applies — render with `pdftoppm` and inspect for orphans. Copy the final `.pdf` next to the `.tex`. Then the **deterministic coverage check**:
```
node resume/scripts/jd-match.mjs coverage <target-note.md> <draft.tex>
```
Record `{pct, missing}` for step 10. Read the missing list with judgment (soft-skill phrases are noise); genuinely missing terms are **surfaced, never stuffed in** — the user may simply not have that skill.

### 8. Cover letter (only if opted in)
Follow `cover-letter-format.md` + `cover-letter-template.tex`. Same target analysis as the resume; the matcher's `cover` ids point at bank proof-point skeletons — use them as the factual spine but **re-voice every letter for the company** per `voice.md`; never paste a skeleton verbatim across companies. Filename `<same tokens>_cover.tex`; compile + verify one page + ATS scan.

### 9. Application answers (only if questions were detected)
Answer each detected question **in the user's voice per `voice.md`**, honesty rule in full, respecting stated word/char caps, reusing the proof points the resume selected. Plain text, paste-ready. Emit `drafts/<same tokens>_answers.md` — question verbatim, answer, word count — opening with a one-line reminder that these are drafts for the user's review.

### 10. Track + harvest + log (+ commit if configured)
- **Harvest to `bank.md`:** new bullets that survived verification, new cover skeletons, new themes for recurring unmatched requirements — each traced to a `projects/` note, tagged with themes and `template`, skipping near-duplicates. This is how the deterministic layer compounds.
- Append one record per target to `applications.md`'s JSON (status `drafted`, coverage from step 7).
- Append one entry to `resume/log.md` (`## [YYYY-MM-DD] tailor | <target> -> <draft>`; batches get one entry with per-target bullets).
- Mention the dashboard reflects the new records. If git was opted in at init: one commit per run (`tailor: <target>`), push, report failures without retry-looping.

## Add-material mode

Input: a local repo path or GitHub URL (or "I also worked at X" with no artifact → interview). Read the source — README, manifests, structure, `git log`/`shortlog` for the user's actual contributions; never write into it. Draft/refresh `projects/<name>.md` per `assets/project-note-template.md` with `skills`/`tech`/`domains` frontmatter (these drive retrieval), quantified bullets, `(verify)` on anything inferred. Show the note and ask the user to correct role/dates/metrics. Log it.

## Refresh mode — "refresh <draft>"

Regenerate an existing draft from its saved target + the **current** `projects/` notes (rebrands and new metrics land automatically). For a legacy draft with no target note, reconstruct from its `% SOURCING` block and confirm. Same filename — overwrite `.tex`/`.pdf`, full verification, refresh the target's Tailoring-notes trailer and the `applications.md` record's notes.

## Status mode — "mark <company> as <status>"

Find the record in `applications.md` (match `company`, fall back to `id`/`role`; ask if ambiguous). Statuses: `drafted | applied | interviewing | offer | rejected | ghosted`. Set `status` + `statusUpdated` (today), JSON block only, log (+ commit if configured). The dashboard's in-page status buttons are the click alternative — it writes the same file via the File System Access API (Chrome/Edge; read-only + download fallback elsewhere).

## Template mode — "template", "template <name>", or a dropped-in resume

`template.tex` is always the **active** template; `templates/*.tex` is the library. Every library file opens with a structured comment header: `TEMPLATE: <name>`, `STATUS: approved | (verify)`, style summary, section order, entry macros, and **whether the full-line-bullet rule applies** (a per-template geometry property).

- **List** (no argument): each template's name, status, one-line summary, and which is active.
- **Switch** (`template <name>`): copy `templates/<name>.tex` over `template.tex`, update the `% ACTIVE TEMPLATE:` line. Warn + confirm if the template is `(verify)`. Remind that bank bullets from other templates lose their verbatim fill guarantee. Log (+ commit if configured).
- **Drop-in** (user supplies a resume as PDF/image/.tex/.docx): recreate its **layout faithfully** as `templates/<name>.tex`:
  1. Study font family, margins, header layout, section-head styling, entry anatomy, bullet glyph/indent, skills format.
  2. Write a complete `.tex` with the library header, reusable macros, and — for the fidelity check — the source's own content verbatim.
  3. Compile (`tlmgr install` any missing font package; note: on TinyTeX prefer `\usepackage[T1]{fontenc}` + `times` over `mathptmx` for Times-style sources — mathptmx pulls missing math fonts, and without T1 a literal `|` renders as an em dash), confirm one page, render with `pdftoppm`, and **visually compare against the source side by side**, iterating margins/spacing until line wraps match. Keep the compiled `.pdf` beside the `.tex`.
  4. Mark `STATUS: (verify)` and hand it to the user for manual fidelity verification. Only after approval: flip to `approved` and ask whether to activate it. When tailoring later uses the template, its macros/geometry are reused and content comes from the user's data — the source's content never appears in a generated draft.
  5. Ask once whether the full-line-bullet rule should apply to this template; record it in the header.

## Voice discipline (all prose artifacts)

`voice.md` is canonical for cover letters, question answers, and any prose a company will read. Hard defaults: no em dashes, no canned enthusiasm, no "not just X but Y", "exactly" as intensifier is a smell, contractions welcome, concrete over generic. When the user gives new voice feedback, append it to `voice.md` — nowhere else.
