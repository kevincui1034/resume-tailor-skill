# build plan — a second brain, with Resume Tailor built into it

The complete construction plan for the whole system: a **second brain** — a maturity-staged personal knowledge vault run by a coding agent acting as librarian — with **Resume Tailor** added to it as a self-contained layer. Three parts, in build order:

- **Part I — the second brain** (V0–V4): the vault the system lives inside.
- **Part II — the Resume Tailor engine** (M0–M8): the skill itself. Build only this part if all you want is the resume system — it stands alone.
- **Part III — wiring the layer into the vault** (W0–W2): how the two share plumbing without corrupting each other.

`skills/resume-tailor/SKILL.md` is the engine's full spec; this is the order to build everything in and why that order, learned the expensive way.

---

## Part I — the second brain

### V0 — Principles (decide these before making a single folder)

- **Maturity, not topic.** Notes flow through stages as they ripen — capture → active work → shipped → distilled. Nothing is filed by subject, ever, and the agent never reorganizes by topic.
- **The folder is the stage.** No `stage` frontmatter field — a note's location is the single source of truth for its maturity, so a drag-and-drop in the editor can never strand a stale field. If frontmatter and folder ever disagree, the folder wins; fix the note.
- **Harvest, don't author.** The agent authors only *derived* layers: evergreen articles distilled from shipped work, and reference pages compiled from outside sources and filed answers. Humans author the primary material — captures, project notes, raw sources. Provenance decides placement: born from your shipped work → wiki; imported from the world → reference; neither → inbox.
- **Retrieval is links + search, not folder browsing.** An unlinked note is a lost note; design every rule below to keep links alive.
- **Done when:** these four are written into the vault's own contract file (its `CLAUDE.md`), because every later dispute gets settled by quoting it.

### V1 — Stages and the pipeline

| Folder | What lives here | Leaves via |
| --- | --- | --- |
| `sources/` | Immutable raw material — clipped articles, papers, exports. The agent reads, **never edits or renames**. | ingest → reference (the file itself stays put) |
| `inbox/` | Zero-friction captures. Title and dump; no organizing at write time. | triage |
| `projects/` | Active work, **one file per project**, carrying a `status` field. Grows as the work progresses. | ship → output; harvest → wiki |
| `output/` | Records of shipped artifacts — what went out the door, when, where. | terminal |
| `wiki/` | Evergreen distillations, **harvested from shipped projects only**. Living documents — later harvests revise, never fork. | terminal |
| `reference/` | Durable knowledge NOT derived from your own work. | terminal |
| `attachments/` | Media (images, PDFs) — never inside stage folders. | — |

Pipeline: `sources → (ingest) → reference` · `inbox → (triage) → projects or reference` · `projects → (ship) → output` · `projects → (harvest) → wiki`.

- **Done when:** the folders exist and each stage names its one leaving-gesture.

### V2 — Contracts: frontmatter, naming, link safety

- **Minimal frontmatter**, ISO dates: every note gets `created`; `projects/` notes add `status: active | paused | shipped | abandoned` and a `harvested:` date stamped *only* by the harvest command; `wiki/` notes add `from:` (the shipped project(s) they distill); `reference/` notes list their inputs in `sources:`.
- **Filenames are vault-unique, kebab-case** — topic-shaped for wiki/reference, work-shaped for projects. `sources/` files arrive named by the clipper and are never renamed.
- **Links are bare `[[filename]]`, never `[[folder/filename]]`** — with one exception: the per-stage `_index.md` files share a name and are pinned to their folders forever, so links to them are path-qualified.
- **External tools don't rewrite links when they move files — and the agent is an external tool.** Bare-filename links survive folder moves as long as the filename is unchanged. Therefore: **stage moves never rename**, and a rename greps the vault for `[[old-name` and updates every occurrence in the same operation.
- **Done when:** a note can travel through every stage with zero broken links.

### V3 — Librarian duties: the loop that keeps it alive

- **Indexes:** each stage keeps an `_index.md` — one line per note (`- [[note]] — hook`), updated on every create/move/delete. Indexes are maps, never content.
- **Audit trail:** an append-only root `log.md` — one entry per command run (`## [YYYY-MM-DD] <op> | <summary>` plus a few bullets), newest at the bottom, history never rewritten. It rides the sync layer to every device.
- **Capture rule:** "jot this down" goes to `inbox/` untriaged. Organizing at write time is triage's job, not capture's.
- **Linking discipline:** every note promoted out of inbox links to at least one related note; a `[[link]]` pointing nowhere yet is allowed — it marks an article worth writing, not an error.
- **Sync + git, two deliberate layers:** a live sync service carries note content between devices; **git runs on one primary machine only** as versioned backup and the command audit trail (per-device editor churn gitignored). Commands end with one descriptive commit and a push.
- **Done when:** any create/move/delete leaves index, log, and git consistent without being asked.

### V4 — Commands (one per stage transition) + the failure modes they exist for

- **triage** — sweep the inbox, route every note with one confirmation, flag stale captures (older than ~14 days).
- **ingest <source>** — integrate a raw source into **concept-shaped** reference pages: update existing pages rather than piling one-summary-per-source; flag contradictions in place with a plain conflict blockquote (old claim vs new claim, both cited), never silently overwrite; cite sources inline where a claim is load-bearing.
- **harvest <project>** — **refuses unless `status: shipped`.** Distills the project into wiki article(s), records the artifact in `output/`, stamps `harvested`, cross-links. When a later harvest contradicts an earlier article, revise that article and note the supersession inline — never write a parallel one.
- **lint** — vault health check: orphans, unresolved conflicts, stale claims, index accuracy, project drift, inbox staleness. Report first; mechanical fixes on one confirmation.
- Each command is designed against a named failure mode: **wiki starvation** (shipping without harvesting — a shipped project with no harvest stamp gets called out), **inbox graveyard** (triage + the staleness flag), **reference fragmentation** (ingest integrates instead of piling summaries), and **silent degradation** (without the librarian it's just folders — an accepted tradeoff; don't add plugin dependencies to compensate).
- **Done when:** each command runs end to end on real notes and leaves the V3 loop consistent.

---

## Part II — the Resume Tailor engine

Nine milestones, each shippable on its own. **Two invariants, set before any code, enforced in every milestone:**

1. **The honesty rule.** Every bullet, letter claim, and form answer traces to a real accomplishment note, which traces to a real repo or an explicit user confirmation. Inferred-not-confirmed claims carry `(verify)` until the user signs off. Unknown facts are asked or left blank — never guessed. Every later feature (bank reuse, automatic mode, browser autofill) is designed *inside* this rule, so build it as the first test, not a late audit. (Notice it is the vault's harvest-don't-author principle wearing work clothes: the agent only derives, never invents.)
2. **Engine/workspace split.** The skill is a stateless engine; all user data lives in a `resume/` workspace it creates on first run. Nothing personal ever enters the engine's tree — which is what makes the engine publishable.

### Milestone map

| # | Milestone | Ships | Proves |
| --- | --- | --- | --- |
| M0 | Skeleton + contracts | workspace layout, file-ownership rules | the split holds |
| M1 | Identity + format + verified compile | `identity.md`, `format.md`, `template.tex`, compile loop | a machine-checked one-page PDF |
| M2 | Connect (context ingestion) | `projects/` notes, `sources.md` registry | real work → structured, verified notes |
| M3 | Tailor v1 (single target) | JD → draft pipeline, targets, cover letters, answers | end-to-end value for one job |
| M4 | Deterministic layer | `bank.md`, `jd-match.mjs`, coverage reports | repeat contexts without re-reasoning |
| M5 | Tracking | `applications.md`, `dashboard.html`, status mode | the pipeline has a memory |
| M6 | Scale + lifecycle | batch/parallel, refresh, template library, archive/clear | volume without corruption |
| M7 | The applier | `settings.md`, search, apply, answer modes, portal playbook | from documents to submitted applications |
| M8 | Packaging | plugin manifests, init wizard, lazy deps, README, leak-check | anyone can install it |

### M0 — Skeleton + contracts

- Define the workspace layout (see SKILL.md) and the **ownership rules** that prevent every later corruption bug: machine-owned fenced JSON blocks inside human-readable markdown (`bank.md`, `applications.md`) — edit only the JSON, prose around it is human territory; one file = one anchor; folders never encode state the files don't.
- Decide naming now: `<prefix>_<role>[_<company>]` for drafts, compact lowercase tokens, no dates, latest wins. Renames are link-breaks; cheap to forbid early, expensive later.
- **Done when:** the layout is written down and every later milestone names which files it may touch.

### M1 — Identity + format + a verified compile

- `identity.md`: contact, education, experience entries, draft prefix. Make its *existence* the "workspace initialized" sentinel.
- `format.md` + `template.tex`: the generation contract. Two hard rules worth machine-checking: **one page**, and **full-line bullets** (each bullet fills its line; no orphan last line). Keep output ATS-safe ASCII.
- Build the **verification loop before the first resume**: compile with `pdflatex -interaction=nonstopmode -halt-on-error`, assert `Pages: 1`, scan codepoints for non-ASCII strays, render with `pdftoppm` and inspect line fill. LLMs confidently emit two-page resumes; only the compiler knows.
- **Done when:** a hand-written sample `.tex` round-trips through compile + all three checks.

### M2 — Connect: real work → accomplishment notes

- One note per job/project in `projects/`, with `skills`/`tech`/`domains` frontmatter (this drives retrieval later) and quantified bullets. Three intake paths: mine a local repo, mine a GitHub repo (`gh` or temp clone), or interview the user ("add my experience at X") — user-stated facts need no `(verify)`; code-inferred ones do.
- Mine README, manifests, structure, and `git log`/`shortlog` for the *user's* contributions. **Never write into the source repo.**
- Register every source in `sources.md` (kind, note it feeds, `lastSynced`) so `connect` with no args can list + re-sync later. Syncs only add or update — never downgrade a user-confirmed fact back to `(verify)`.
- **Done when:** one repo and one described-only job both produce notes the user has corrected (role, dates, metrics — the three things code can't tell you).

### M3 — Tailor v1: one JD → one verified draft

- Resolve the target (pasted JD, URL fetch, or bare role name), **auto-save real JDs** to `targets/<company>-<role>.md` with `## Must-haves` / `## Keywords` headings — saved targets are what make refresh and coverage possible later.
- Select material: all real jobs, 2–3 best-fit projects, skills the selected work actually evidences. Write bullets (strong verb, real metric, bolded target tech), fit to one page by cutting weakest-first, emit with a `% SOURCING` comment block (what fed each section, what was left off).
- Run the full M1 verification on every draft. Opt-in **cover letter** (own template, re-voiced per company) and **application answers** for essay questions found in the posting (`_answers.md`, word counts, drafts-for-review) — both under a `voice.md` contract (banned phrases, no canned enthusiasm) that all prose defers to.
- **Done when:** one real JD yields a compiled, verified, honest PDF the user would actually send.

### M4 — The deterministic layer (build this before scale, not after)

- `bank.md`: requirement **themes** (trigger keywords → anchor projects) + **proven bullets** from shipped drafts (tagged with themes and the template they shipped in) + cover proof-point skeletons + skills fragments.
- `scripts/jd-match.mjs`, no LLM calls: `match <jd>` scores themes by keyword hits; `coverage <target> <draft>` reports covered/missing keywords with a percentage. Degrade gracefully without Node — the definitions are simple enough to run by hand.
- Wire the pipeline: matcher runs **before** selection; bank bullets reuse **verbatim** (only re-aiming the bold is allowed — rewording voids the verified line-fill and makes it a new bullet); fresh material only for unmatched requirements; verified new bullets **harvest back** into the bank at the end of each run. Coverage gaps are *surfaced, never stuffed in* — the user may simply lack that skill.
- **Done when:** the second resume for a similar role assembles mostly from the bank, and its coverage report matches a hand count.

### M5 — Tracking: the pipeline gets a memory

- `applications.md`: one JSON record per draft/application (`id, date, company, role, type, target, draft, coverLetter, coverage, status, statusUpdated, notes`), statuses `drafted → applied → interviewing/offer/rejected/ghosted`. Append on every tailor run.
- `dashboard.html`: a single self-contained file over that JSON — stat tiles, charts, filterable table, write-back via the File System Access API (Chrome/Edge; read-only + download fallback elsewhere). Regenerate the whole file when the design changes; never hand-patch fragments.
- Status mode: "mark <company> as interviewing" edits the JSON block only.
- **Done when:** a status clicked in the browser and a status set in conversation land as the same edit.

### M6 — Scale + lifecycle

- **Batch tailoring:** detect multiple JDs/URLs, confirm the split once, fan out one subagent per target in parallel. The rule that keeps this safe: **subagents write only their own draft + target note; the main session alone touches shared state** (`bank.md`, `applications.md`, indexes, logs, git). Company token in filenames becomes mandatory so batch names can't collide.
- **Refresh mode:** regenerate a draft from its saved target + *current* notes — renames and new metrics land automatically.
- **Template library:** `template.tex` is active; `templates/` holds the library; a drop-in flow recreates a user's own resume layout (compile, render, side-by-side compare, `(verify)` until approved). Line-fill guarantees are template-scoped.
- **Archive/Clear:** archive *moves* drafts out (companions travel together, tracker paths repointed, targets never archived so everything stays rebuildable); clear is the **only destructive gesture** — list files, explicit confirm, application records survive with nulled paths.
- **Done when:** a 4-JD batch produces 4 verified drafts with zero shared-state collisions, and archive→clear loses nothing but files.

### M7 — The applier: from documents to submitted applications

Build in this order — each step de-risks the next:

1. **`settings.md` (config) + the fact boundary.** Config knobs: `answers: semi-manual | automatic`, `job-search recency: recent | all`, `job-search results`, `browser apply: ask | on | off`, `sso sign-in: ask | allowed | off`, plus the application profile (authorization/sponsorship, logistics, salary, EEO defaulting to "prefer not to say", self-ratings policy). The boundary: **facts come from identity/settings or not at all** — the answer modes change who fills a gap, never whether one may be invented.
2. **Search mode.** Web-search ATS-first (`boards.greenhouse.io`, `jobs.lever.co`, `jobs.ashbyhq.com`, `apply.workable.com`); treat aggregators as leads, not endpoints. **Fetch every candidate to verify it's live**, extract blockers, score fit with the M4 matcher, rank per the recency setting. Persist nothing until a posting is actually tailored.
3. **Answer modes.** Semi-manual: ask the user when a narrative question needs material the notes don't hold; stop before Submit. Automatic: answer in the user's voice anyway and mark `(low-confidence)`, tick every required consent (arbitration and background checks included, each reported), submit, and confirm. **Never bend in any mode:** accounts/passwords/CAPTCHAs, invented facts, optional opt-ins, and submission outside the main session.
4. **Apply mode.** Detect browser tools (Claude in Chrome → built-in browser → Playwright-style MCP); without one, emit a paste-ready `_apply.md` pack. **Scout before filling** (postings contradict their URLs — country, clearance, onsite; work-auth answers are about the role's country) and **check the portal's own applications list first** (duplicates are invisible from the job page). Fill from identity/settings, verify every value after entry, upload, answer, confirm **from the site's own signal** — some portals never flip the Apply button.
5. **The portal playbook.** Seed it with known mechanics (see `assets/portal-playbook-template.md`: Workday, Phenom-style, IBM Careers + stubs), then **write a section after every first drive of a new portal**. This file is the compounding asset: the second application on any system costs a fraction of the first. Universal rules live here too — the parser-artifact rule (parsers hoist projects into work history as fake employers; the missing job title is the tell), real-click checkboxes, session staleness.
6. **Delegation, last.** Parallel *tailoring* is safe (M6 rules). Parallel *browser filling* is not, by default — one browser, sequential. If forced: pinned tab per agent, ref-based interaction, screenshot checks, instant stop on a foreign job id, exhaustive briefs on judgment calls (identically-briefed agents answer *unbriefed* questions differently), escalation over guessing, and agents never submit.
- **Done when:** one real application reaches the review screen with every field correct on the first human inspection — then, and only then, turn automatic mode loose.

### M8 — Packaging: make it installable by anyone

- Claude Code plugin shape: `.claude-plugin/plugin.json` + `marketplace.json`, `skills/resume-tailor/SKILL.md` (the engine), `assets/` (the seeds: templates for identity/settings/playbook, bank/applications/sources seeds, dashboard, matcher, LaTeX templates).
- **Init wizard: default everything, ask one question** ("give me your resume, project links, or just tell me about your work"). Silent defaults surfaced as "you can change this later" one-liners. Lazy dependencies: offer to install TinyTeX at first compile; degrade to manual matching without Node; temp-clone without `gh`.
- README for non-technical users (plain words + a command table); technical detail stays in SKILL.md.
- **Release discipline:** leak-check before every push — grep the tree for the author's contact, employers, schools, salary figures, req numbers; the only permitted personal strings are manifest authorship and the license. Bump the version in both manifests; keep a "What's new" section honest.
- **Done when:** a fresh machine goes `/plugin install` → one answered question → verified PDF, with nothing of the author's in the tree.

---

## Part III — wiring the Resume Tailor layer into the vault

### W0 — The layer pattern

- The resume system enters the second brain as an **additive layer** under `resume/`: it runs *parallel to* the maturity pipeline and shares its plumbing — indexes, the root `log.md`, git-on-one-machine, naming and link-safety — but it never feeds `wiki/` or `reference/`, and nothing in Part I changes because it exists. One `_index.md` maps the whole layer (path-qualified links, since it shares a name with the stage indexes).
- The layer inherits the audit habits for free: every run logs one entry to root `log.md` (the layer keeps no log of its own) and ends in one descriptive commit + push.
- **Done when:** a tailor run and a triage run leave indistinguishable footprints in the log and git history.

### W1 — Shim over engine

- Install the engine as the plugin; the vault carries a **thin command shim** that invokes the skill as the procedure and adds only the deltas the engine can't know: the user's identity facts and language rules, the vault's log/commit formats and index duties, machine-specific notes (compile recipe, browser tooling), and any procedure overrides — the vault's own apply procedure can override the plugin's generic one while the plugin stays the canonical tailoring pipeline.
- **The protected-files rule, written before it's needed:** the shim forbids running the init wizard and forbids copying any `assets/` seed over an existing workspace file — this workspace predates the install, and the generic seeds would destroy hand-tuned data. A layer `CLAUDE.md` carries the **anchor map** (which file owns which truth, and who may edit it) and **reconstruction specs**, so a genuinely missing anchor is rebuilt from spec, never from seeds.
- **One source of truth per answer:** the layer decides early which file owns each kind of fact (identity owns form answers; settings owns behavior knobs) and routes edits accordingly, with a sync map and an authority order for the files that intentionally overlap.
- **Done when:** a plugin upgrade wipes nothing, and no fact exists in two files.

### W2 — Division of truth: the vault is the engine's upstream

- Features are built **in the vault first**, against real use — real postings, real portals, real corrections — then genericized, leak-checked (no personal data in the published tree, ever), ported to the plugin, and version-bumped. The playbook pattern shows why: portal knowledge is earned in personal drives, then ships with the facts stripped.
- Keep the two in sync deliberately: port on every feature change, pull the plugin clone before porting (clones go stale), and record each port in the vault log so the audit trail spans both repos.
- **Done when:** a feature born in the vault reaches the public plugin within one session, and the leak-check still comes back clean.

---

## Why this order (the lessons that set it)

- **Contracts before generation** — every downstream feature leans on identity/format/voice being canonical; retrofitting canon is a rewrite.
- **Plumbing before layers** — the vault's indexes, log, and git existed before the resume layer, so the layer inherited an audit trail and a sync model for free instead of inventing its own.
- **Machine verification before trust** — compile checks (M1) catch what review misses; the same principle returns as coverage scripts (M4) and site-signal confirmation (M7).
- **Deterministic before parallel** — the bank + matcher make batch output consistent; parallelize first and you scale inconsistency.
- **One source of truth per answer** — the moment two files can hold the same fact, they disagree; the config/fact boundary (M7.1, W1) is the applier's load-bearing wall.
- **Limits before autonomy** — the apply limits came first and automatic mode was defined as *named, recorded exceptions to them*, not as a separate looser mode. Build the fence, then the gate.
- **Playbooks from drives, not foresight** — portal knowledge written from real runs (broken widgets, lying buttons) is the only kind that survives contact; budget the first drive on each portal as an investment, then bank it.
- **Personal first, generic second** — the vault is the upstream and the plugin is the export; building against one real user's reality and genericizing at the boundary beats designing for everyone from the start.
