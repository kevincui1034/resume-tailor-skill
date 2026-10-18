---
name: resume-tailor
description: Tailor one-page LaTeX resumes to job descriptions from the user's real, verified work. Use when the user wants to tailor/build a resume for a JD or role, paste job descriptions or posting URLs (single or batch), search the web for live job postings (newest-first or best-fit), apply to a posting in the browser (autofill + submit via Claude in Chrome, or a paste-ready pack), write a cover letter or application-question answers, set the answer mode (semi-manual/automatic) or application-profile facts (work authorization, salary, start date, EEO defaults), track applications (applied/interviewing/ghosted/rejected), connect a local or GitHub repo (or describe a project/job directly) as resume material, open the application dashboard, switch or drop in a resume template, archive old drafts or clear the archive, or set up a resume workspace. Triggers on "tailor my resume", "resume for this JD", "find me live jobs", "search for openings", "apply to this posting", "cover letter for", "mark <company> as <status>", "set my salary expectation", "answer mode automatic", "connect this repo" / "connect these repos", "add my experience at", "open my dashboard", "change resume template", "archive my drafts", "clear the archive".
---

# Resume Tailor

Turns a job description into a targeted, one-page LaTeX resume assembled from the user's **verified accomplishments** — never invented ones. All user data lives in a **workspace** (`./resume/` by default) that this skill creates on first use; the skill itself is a stateless engine over it.

**The honesty rule (load-bearing, applies to everything):** every resume bullet, cover-letter claim, and question answer traces to a real accomplishment note in `resume/projects/`, which traces to a real repo or an explicit user confirmation. Select and rephrase; never invent work, metrics, or technologies. Claims inferred from code rather than confirmed carry `(verify)` and must be confirmed by the user before appearing in anything sent. The same discipline covers **form facts** — work authorization, demographics, logistics, compensation: they come only from `identity.md`/`settings.md` (Settings mode), and a fact neither file holds is asked for or left blank, never guessed.

## Mode routing

| User intent | Mode |
| --- | --- |
| No workspace exists yet (no `resume/` with `identity.md`) | **Init wizard** (below), then continue with what they asked |
| A JD, posting URL, role name, or several of them | **Tailor** (the default pipeline) |
| "find me jobs", "search <role / keywords / location>", "any live postings for X?" | **Search** (live postings → ranked shortlist) |
| "apply to <company / these / this URL>", "finish the application" | **Apply** (browser autofill + submit, or a paste-ready pack) |
| "connect <repo path(s) / GitHub URL(s)>" — one or several — "add this repo / project / my experience at X" | **Connect** |
| "connect" alone, "what sources are connected", "sync my repos" | **Connect** (list + sync) |
| "refresh <draft>" | **Refresh** |
| "archive", "archive my drafts", "clean out drafts" | **Archive** (moves drafts out; reversible) |
| "clear", "clear the archive", "delete the archived drafts" | **Clear** (deletes the archive; destructive) |
| "mark <company> as interviewing/ghosted/rejected/…" | **Status** |
| "settings", "set <field> <value>", "answer mode automatic" | **Settings** |
| "change/list/drop in template" | **Template** |
| "dashboard", "open/show my applications" | **Dashboard** |

## Workspace layout (created by init)

```
resume/
  identity.md          # who the resume is about - contact, education, experience entries, self-intro
  voice.md             # how the user sounds in prose - tone, banned phrases (canonical for ALL prose)
  settings.md          # applier config (answer mode, search recency, browser apply) + application profile (form facts - never guessed)
  format.md            # universal hard rules (one page, ATS, bullet craft, naming, compile recipe)
  template.tex         # the ACTIVE resume template (line 1: % ACTIVE TEMPLATE: <name>)
  templates/           # template library (jake.tex default; drop-ins added here)
  cover-letter-format.md / cover-letter-template.tex
  projects/            # one accomplishment note per job/project - THE source of truth
  sources.md           # registry of connected context sources (repos / GitHub / manual) -> notes
  targets/             # auto-saved JDs, one note per posting
  drafts/              # generated .tex + .pdf (+ _answers.md)
  archive/             # retired drafts moved out of drafts/ (emptied only by Clear mode)
  bank.md              # reuse memory: themes -> proven bullets/cover skeletons/skills (JSON block)
  applications.md      # tracker dataset (JSON block) - feeds the dashboard
  dashboard.html       # local interactive tracker (File System Access write-back)
  scripts/jd-match.mjs # deterministic JD->theme matcher + keyword-coverage checker
  log.md               # append-only run log
```

`bank.md`, `applications.md` and the JSON-block convention: edit **only** the fenced JSON, never hand-mangle it; prose around it is human territory.

## Init wizard (first run, or when any anchor file is missing)

**Default everything; ask one question.** Copy the seeds from this skill's `assets/` directory into the workspace — `templates/jake.tex` (+ activate as `template.tex`, stamped `% ACTIVE TEMPLATE: jake`), `format.md`, `voice-seed.md → voice.md`, `cover-letter-format.md`, `cover-letter-template.tex`, `identity-template.md → identity.md`, `settings-template.md → settings.md`, `bank-seed.md → bank.md`, `applications-seed.md → applications.md`, `sources-seed.md → sources.md`, `dashboard.html`, `jd-match.mjs → scripts/` — then ask only:

> **"Give me your current resume (any format), links or paths to projects you've worked on, or just tell me about your work — any mix is fine."**

Process whatever comes back (each ingested source is registered in `sources.md` so it can be listed and re-synced later):
- **A resume file** (PDF/docx/tex/image) → parse into `identity.md` (name, contact, education, experience entries, draft prefix), one `projects/` note per job/project, initial skills lists, and **seed the bank** — bullets from a resume they've been sending are proven material (`source: "import"`; `template` = whatever it shipped in, so line fill is re-verified under the active template; tag each with themes and triggers). Register notes as `source: "resume import"`, `kind: manual`.
- **Repo paths/URLs** → Connect mode (below), batched if several.
- **A description of their work** → the interview path; user-confirmed notes, `kind: manual`.

Everything else defaults silently, surfaced as one-line "you can change this later" mentions rather than questions: template = `jake` (drop in their own any time via Template mode), voice = the shipped anti-AI defaults (calibratable later from a writing sample), git = auto-detect (if the workspace is inside a repo, commit after runs; note the default in `identity.md` under `## Config`, reversible on request), applier = `answers: semi-manual`, `job-search recency: recent`, `browser apply: ask` (all in `settings.md`; the application profile starts `(unset)` and fills lazily, or in one pass via the Settings interview).

End init by showing `identity.md` + the drafted notes in one batched review and collecting corrections (role titles, dates, metrics — unreadable from code).

### Dependencies (check lazily, fix helpfully)

Don't check tools at init — check when first needed, and treat a missing tool as something to fix *for* the user, not an error to report:
- **`pdflatex` missing** (first compile): offer to install TinyTeX for them (Windows/macOS/Linux one-liners from tinytex docs), or use their existing TeX distribution if one is on PATH under another name.
- **`node` missing** (first matcher/coverage call): degrade gracefully — do the theme matching and keyword-coverage check yourself by reading `bank.md`/the target note directly (same definitions: trigger-keyword hits, covered/missing lists). Results are equivalent; mention the script exists for when Node is available.
- **`gh` missing** for a GitHub connect: clone to a temp dir instead.

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
Answer each detected question **in the user's voice per `voice.md`**, honesty rule in full, respecting stated word/char caps, reusing the proof points the resume selected. Plain text, paste-ready. Emit `drafts/<same tokens>_answers.md` — question verbatim, answer, word count — opening with a one-line reminder that these are drafts for the user's review. When a question needs material the notes don't hold, follow **Answer modes** (below): semi-manual asks the user for the raw input; automatic answers anyway and marks it `(low-confidence)`.

### 10. Track + harvest + log (+ commit if configured)
- **Harvest to `bank.md`:** new bullets that survived verification, new cover skeletons, new themes for recurring unmatched requirements — each traced to a `projects/` note, tagged with themes and `template`, skipping near-duplicates. This is how the deterministic layer compounds.
- Append one record per target to `applications.md`'s JSON (status `drafted`, coverage from step 7).
- Append one entry to `resume/log.md` (`## [YYYY-MM-DD] tailor | <target> -> <draft>`; batches get one entry with per-target bullets).
- Mention the dashboard reflects the new records. If git was opted in at init: one commit per run (`tailor: <target>`), push, report failures without retry-looping.

## Search mode — "find me live jobs", "search <role / keywords / location>"

Find postings that are **actually open right now** and feed the winners into the Tailor pipeline.

1. **Read `settings.md`:** `job-search recency` (`recent` = newest first, prefer postings ≤ 30 days old; `all` = rank purely by fit) and `job-search results` (shortlist size). Plain words in the request override per run ("newest", "best fit", "top 5").
2. **Search the open web** (parallel queries): prefer ATS-hosted postings — `site:boards.greenhouse.io`, `site:jobs.lever.co`, `site:jobs.ashbyhq.com`, `site:apply.workable.com` — plus `"<role>" <location> hiring`, with the search tool's recency filter when recency is `recent`. Aggregator links (LinkedIn/Indeed) are leads, not endpoints: they login-wall and go stale, so chase the company's own posting instead.
3. **Verify live** by fetching every candidate: drop 404s, "no longer accepting applications", and pages that won't load. Extract company, role, location, posted/updated date and comp when shown, and hard constraints worth flagging (citizenship/clearance/onsite/years asked).
4. **Score fit** with the same keyword logic as tailoring: save the JD text to a temp file and run `jd-match.mjs match` on it (or match by hand per the no-Node fallback) — matched themes and a covered/uncovered glance, not a full draft.
5. **Rank:** `recent` → dated-and-fresh first (newest → oldest), then undated ones by fit, stale ones last; `all` → fit only.
6. **Report the shortlist** as one table — company, role, location, posted, fit, flags, link. The search itself persists nothing; target notes are created only for postings that go on to be tailored. Log the run (`## [YYYY-MM-DD] tailor-search | "<query>" -> <N> live, <M> shortlisted`).
7. **Hand off** per the answer mode: semi-manual → one question, which to tailor and whether to also apply; automatic → batch-tailor the whole shortlist, then Apply mode on each (browser apply permitting).

## Apply mode — "apply to <company>", "apply to these", "finish my applications"

Take a finished draft through the company's real application form. Inputs: the compiled `.pdf` (+ cover PDF if opted), the posting URL (the target note's `source`), `identity.md` + `settings.md` for facts, Answer modes for free text. A target with no draft yet runs the Tailor pipeline first; no URL on file → ask for it.

**Browser or fallback.** Look for browser-automation tools in this order: **Claude in Chrome** (`mcp__claude-in-chrome__*`; it may first surface as a single `enable__mcp__claude-in-chrome` tool — enable it, and read its usage skill first if the session lists one), the Claude desktop app's built-in browser (`mcp__Claude_Browser__*`), then any Playwright/Puppeteer-style MCP. **None →** emit `drafts/<tokens>_apply.md` instead: a paste-ready pack with every form fact laid out field-by-field (contact + links, eligibility, logistics, EEO per settings), the question answers, and the file paths to upload — and mention that connecting Claude in Chrome unlocks the hands-off version.

**Autopilot, per application:**
1. Open the posting; click through to the form.
2. Fill facts: contact/links/education from `identity.md`; authorization, logistics, comp, EEO from `settings.md`. **A fact neither file holds is never guessed** — semi-manual asks the user on the spot; automatic leaves it blank when optional, otherwise pauses that application and flags it in the run report.
3. Upload the resume PDF (and the cover PDF where there's a slot).
4. Free-text questions → **Answer modes**. Record every answer actually entered in `drafts/<tokens>_answers.md` (marked "as submitted").
5. **Hard stops, every mode:** account creation and login walls, CAPTCHAs, identity or payment verification, anything outside the application flow. Hand them to the user (semi-manual) or flag + skip to the next application (automatic). The browser is the user's real signed-in session — act only inside the form, never store credentials.
6. **Submit:** semi-manual → show the filled form (screenshot or field summary) and wait for the go-ahead; automatic → submit and capture the confirmation (text or screenshot).
7. Update the `applications.md` record: `status: applied`, `statusUpdated`, `notes` gain how it went out (`via browser — auto` / `— reviewed`) + the posting URL. Log (`## [YYYY-MM-DD] tailor-apply | <company> -> applied (auto|reviewed)`) (+ commit if configured).

Batch applies run **sequentially** — one browser, one form at a time — even when the drafts were tailored in parallel.

## Answer modes — semi-manual vs automatic

`settings.md` sets `answers: semi-manual | automatic`; plain words override per run ("ask me about anything you're unsure of" / "answer everything yourself"). The modes govern **narrative** questions only — "tell me about yourself", "how would you apply AI to this workflow?" — always drafted in the user's voice per `voice.md` from real material (`bank.md`, `projects/`, the self-intro). **Fact questions** sit outside the modes: `identity.md`/`settings.md` or nothing (Apply step 2).

- **semi-manual** (default): confident answers are drafted for review like everything else. Unsure — the question needs an opinion, a preference, or an experience the notes don't hold — ask the user for the raw material (one batched ask when several questions need it), then shape their words in voice.
- **automatic**: answer every narrative question from the best available material, unsure or not, and mark shaky ones `(low-confidence)` in `_answers.md` so the user can spot-check what went out. Automatic never extends to facts — an unknown fact stays blank and flagged in every mode.

## Connect mode — repos, GitHub, or plain description

The user's project context can come from three places; all three land in a `projects/` accomplishment note (the file tailoring reads) and are registered in `sources.md` (the registry that remembers where notes came from).

- **`connect <local-path or github-url>` — one or several at once.** Mine each source: read README, manifests, top-level structure, and `git log`/`shortlog` for the *user's* actual contributions (GitHub: `gh repo view` or clone to a temp dir); **never write into the source repo**. Draft/refresh `projects/<name>.md` per `assets/project-note-template.md` with `skills`/`tech`/`domains` frontmatter (these drive retrieval), quantified bullets, `(verify)` on anything inferred rather than confirmed. Register each in `sources.md` (`kind: local` or `github`) and stamp `lastSynced`.
  - **Single source:** show the drafted note and ask the user to correct role/dates/metrics (unreadable from code).
  - **Batch (2+ sources):** list the detected paths/URLs and confirm the split once (same pattern as multi-JD tailoring), then fan out **one subagent per repo in parallel** (single message). Each agent mines and writes only its own `projects/` note and returns a summary; **the main conversation alone touches `sources.md` and `log.md`** after all agents return, so parallel writes can't clobber the JSON block. Close with **one batched review**: show all drafted notes together and collect the user's corrections (role, dates, metrics) in a single pass instead of per-repo.
- **"add my experience/project at X" with no repo** — short interview instead: what it was, their role and dates, what they actually did, real numbers they can stand behind. Note gets `repo: none — described by user`; registered as `kind: manual`. Facts the user states are confirmed by definition — no `(verify)`.
- **`connect` with no arguments** — list everything in `sources.md` (source, kind, note, lastSynced) and offer a **sync**: re-mine each repo source and refresh its note so new features/metrics land. Never downgrade a user-confirmed fact back to `(verify)` during a sync; only add or update.

Draft refreshes (Refresh mode) pick up note changes; a connect sync is how the notes themselves get fresher. Log each connect/sync run.

## Dashboard mode — "dashboard"

Open `resume/dashboard.html` in the user's default browser: Windows → PowerShell `Start-Process "resume\dashboard.html"` (or `start "" "resume\dashboard.html"`), macOS → `open resume/dashboard.html`, Linux → `xdg-open resume/dashboard.html`. Remind on first open: click **Open applications.md** once and pick `resume/applications.md`; Chrome/Edge get click-to-save write-back (statuses/notes), other browsers are read-only with a download-to-save fallback — if their default browser isn't Chromium, suggest opening it in Chrome/Edge instead.

## Refresh mode — "refresh <draft>"

Regenerate an existing draft from its saved target + the **current** `projects/` notes (rebrands and new metrics land automatically). For a legacy draft with no target note, reconstruct from its `% SOURCING` block and confirm. Same filename — overwrite `.tex`/`.pdf`, full verification, refresh the target's Tailoring-notes trailer and the `applications.md` record's notes.

## Archive mode — "archive"

Empties the working `drafts/` folder by **moving** its contents into `archive/` (created on first use). Nothing is deleted here; archiving is undone by moving files back.

- **Default is everything in `drafts/`** — `.tex`, `.pdf`, `_cover.*`, `_answers.md`, all of it. With arguments (`archive <draft-name> …`) move only the named drafts **plus their companions** (cover letter, answers, PDFs) so a draft never gets split across the two folders. Never touch `targets/`, `projects/`, `bank.md`, `applications.md`'s prose, or any anchor file.
- Show what will move (count, plus the names or a grouped summary if the list is long) and confirm once. Keep the now-empty `drafts/` folder in place.
- **Name collision** in `archive/`: the incoming (newer) file replaces the archived copy — name those files in the report so the user knows an older version is gone.
- **Repoint the tracker:** in `applications.md`'s JSON block, records whose `draft`/`coverLetter` files moved get their paths updated to the `archive/` location. Records themselves stay untouched — the application still happened; only the file moved.
- Refresh mode does not look in `archive/`. To rework an archived draft, move it back to `drafts/` first, or just re-tailor from its saved target note — **targets are never archived**, so nothing needed to regenerate a draft is ever lost.
- Log the run (`## [YYYY-MM-DD] tailor-archive | <N> files -> archive/`) (+ commit if configured).

## Clear mode — "clear"

Permanently deletes the contents of `archive/`. This is the only destructive mode in the skill; treat it that way.

- **Scope is `archive/` and nothing else.** Never delete from `drafts/` (moving them out is Archive mode's job), and never run as a side effect of another mode — Clear happens only when the user asks for it by name.
- List exactly what will go (count + filenames) and get an **explicit** confirmation before deleting. If `archive/` is missing or already empty, say so and stop. Keep the empty `archive/` folder afterwards.
- `applications.md` records that pointed into `archive/` **keep their entry** — set the now-dead `draft`/`coverLetter` value to `null` and note the clear date in `notes`. Never drop application history because a file was deleted.
- Log the run (`## [YYYY-MM-DD] tailor-clear | <N> files deleted from archive/`) (+ commit if configured — once cleared, git history is the only recovery path, so the commit matters).

## Status mode — "mark <company> as <status>"

Find the record in `applications.md` (match `company`, fall back to `id`/`role`; ask if ambiguous). Statuses: `drafted | applied | interviewing | offer | rejected | ghosted`. Set `status` + `statusUpdated` (today), JSON block only, log (+ commit if configured). The dashboard's in-page status buttons are the click alternative — it writes the same file via the File System Access API (Chrome/Edge; read-only + download fallback elsewhere).

## Settings mode — "settings", "set <field> <value>"

`settings.md` holds the **applier config** — `answers: semi-manual | automatic`, `job-search recency: recent | all`, `job-search results: <n>`, `browser apply: ask | on | off` — and the **application profile**: the facts forms keep asking for. Work authorization + sponsorship (now/future), security clearance, over-18 / date of birth (entered only where a form requires it), willing to relocate, work mode (remote/hybrid/onsite), earliest start date, salary expectation, EEO voluntary self-ID (gender, race/ethnicity, veteran status, disability status — default `prefer not to say`), "how did you hear about us", references. Contact, education, and experience stay in `identity.md`; settings never duplicates them.

- **"settings"** bare → show the file; call out `(unset)` fields, especially any that already blocked or weakened an apply run.
- **"set <field> <value>"** → update that line and confirm in one line. A new field some form surfaced gets added rather than shoehorned into an existing one.
- **Interview fill** (offered at init and whenever many fields are `(unset)`): batch the profile questions into a few grouped asks and write the file once. Skippable — `(unset)` stays legal; it just means semi-manual asks when a form needs it and automatic flags it.
- Values the user states are confirmed facts by definition (no `(verify)`). Log as `## [YYYY-MM-DD] tailor-settings | updated: <field names>` — **field names only, never values**; the log travels further than the file.

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
