# build plan — how to build this entire system from zero

The complete construction plan for Resume Tailor: a Claude Code skill that turns verified work history into tailored one-page resumes, finds live postings, and fills real application portals in the browser. Nine milestones, each shippable on its own. `skills/resume-tailor/SKILL.md` is the full spec; this is the order to build it in and why that order, learned the expensive way.

**Two invariants, set before any code, enforced in every milestone:**

1. **The honesty rule.** Every bullet, letter claim, and form answer traces to a real accomplishment note, which traces to a real repo or an explicit user confirmation. Inferred-not-confirmed claims carry `(verify)` until the user signs off. Unknown facts are asked or left blank — never guessed. Every later feature (bank reuse, automatic mode, browser autofill) is designed *inside* this rule, so build it as the first test, not a late audit.
2. **Engine/workspace split.** The skill is a stateless engine; all user data lives in a `resume/` workspace it creates on first run. Nothing personal ever enters the engine's tree — which is what makes the engine publishable.

## Milestone map

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

## M0 — Skeleton + contracts

- Define the workspace layout (see SKILL.md) and the **ownership rules** that prevent every later corruption bug: machine-owned fenced JSON blocks inside human-readable markdown (`bank.md`, `applications.md`) — edit only the JSON, prose around it is human territory; one file = one anchor; folders never encode state the files don't.
- Decide naming now: `<prefix>_<role>[_<company>]` for drafts, compact lowercase tokens, no dates, latest wins. Renames are link-breaks; cheap to forbid early, expensive later.
- **Done when:** the layout is written down and every later milestone names which files it may touch.

## M1 — Identity + format + a verified compile

- `identity.md`: contact, education, experience entries, draft prefix. Make its *existence* the "workspace initialized" sentinel.
- `format.md` + `template.tex`: the generation contract. Two hard rules worth machine-checking: **one page**, and **full-line bullets** (each bullet fills its line; no orphan last line). Keep output ATS-safe ASCII.
- Build the **verification loop before the first resume**: compile with `pdflatex -interaction=nonstopmode -halt-on-error`, assert `Pages: 1`, scan codepoints for non-ASCII strays, render with `pdftoppm` and inspect line fill. LLMs confidently emit two-page resumes; only the compiler knows.
- **Done when:** a hand-written sample `.tex` round-trips through compile + all three checks.

## M2 — Connect: real work → accomplishment notes

- One note per job/project in `projects/`, with `skills`/`tech`/`domains` frontmatter (this drives retrieval later) and quantified bullets. Three intake paths: mine a local repo, mine a GitHub repo (`gh` or temp clone), or interview the user ("add my experience at X") — user-stated facts need no `(verify)`; code-inferred ones do.
- Mine README, manifests, structure, and `git log`/`shortlog` for the *user's* contributions. **Never write into the source repo.**
- Register every source in `sources.md` (kind, note it feeds, `lastSynced`) so `connect` with no args can list + re-sync later. Syncs only add or update — never downgrade a user-confirmed fact back to `(verify)`.
- **Done when:** one repo and one described-only job both produce notes the user has corrected (role, dates, metrics — the three things code can't tell you).

## M3 — Tailor v1: one JD → one verified draft

- Resolve the target (pasted JD, URL fetch, or bare role name), **auto-save real JDs** to `targets/<company>-<role>.md` with `## Must-haves` / `## Keywords` headings — saved targets are what make refresh and coverage possible later.
- Select material: all real jobs, 2–3 best-fit projects, skills the selected work actually evidences. Write bullets (strong verb, real metric, bolded target tech), fit to one page by cutting weakest-first, emit with a `% SOURCING` comment block (what fed each section, what was left off).
- Run the full M1 verification on every draft. Opt-in **cover letter** (own template, re-voiced per company) and **application answers** for essay questions found in the posting (`_answers.md`, word counts, drafts-for-review) — both under a `voice.md` contract (banned phrases, no canned enthusiasm) that all prose defers to.
- **Done when:** one real JD yields a compiled, verified, honest PDF the user would actually send.

## M4 — The deterministic layer (build this before scale, not after)

- `bank.md`: requirement **themes** (trigger keywords → anchor projects) + **proven bullets** from shipped drafts (tagged with themes and the template they shipped in) + cover proof-point skeletons + skills fragments.
- `scripts/jd-match.mjs`, no LLM calls: `match <jd>` scores themes by keyword hits; `coverage <target> <draft>` reports covered/missing keywords with a percentage. Degrade gracefully without Node — the definitions are simple enough to run by hand.
- Wire the pipeline: matcher runs **before** selection; bank bullets reuse **verbatim** (only re-aiming the bold is allowed — rewording voids the verified line-fill and makes it a new bullet); fresh material only for unmatched requirements; verified new bullets **harvest back** into the bank at the end of each run. Coverage gaps are *surfaced, never stuffed in* — the user may simply lack that skill.
- **Done when:** the second resume for a similar role assembles mostly from the bank, and its coverage report matches a hand count.

## M5 — Tracking: the pipeline gets a memory

- `applications.md`: one JSON record per draft/application (`id, date, company, role, type, target, draft, coverLetter, coverage, status, statusUpdated, notes`), statuses `drafted → applied → interviewing/offer/rejected/ghosted`. Append on every tailor run.
- `dashboard.html`: a single self-contained file over that JSON — stat tiles, charts, filterable table, write-back via the File System Access API (Chrome/Edge; read-only + download fallback elsewhere). Regenerate the whole file when the design changes; never hand-patch fragments.
- Status mode: "mark <company> as interviewing" edits the JSON block only.
- **Done when:** a status clicked in the browser and a status set in conversation land as the same edit.

## M6 — Scale + lifecycle

- **Batch tailoring:** detect multiple JDs/URLs, confirm the split once, fan out one subagent per target in parallel. The rule that keeps this safe: **subagents write only their own draft + target note; the main session alone touches shared state** (`bank.md`, `applications.md`, indexes, logs, git). Company token in filenames becomes mandatory so batch names can't collide.
- **Refresh mode:** regenerate a draft from its saved target + *current* notes — renames and new metrics land automatically.
- **Template library:** `template.tex` is active; `templates/` holds the library; a drop-in flow recreates a user's own resume layout (compile, render, side-by-side compare, `(verify)` until approved). Line-fill guarantees are template-scoped.
- **Archive/Clear:** archive *moves* drafts out (companions travel together, tracker paths repointed, targets never archived so everything stays rebuildable); clear is the **only destructive gesture** — list files, explicit confirm, application records survive with nulled paths.
- **Done when:** a 4-JD batch produces 4 verified drafts with zero shared-state collisions, and archive→clear loses nothing but files.

## M7 — The applier: from documents to submitted applications

Build in this order — each step de-risks the next:

1. **`settings.md` (config) + the fact boundary.** Config knobs: `answers: semi-manual | automatic`, `job-search recency: recent | all`, `job-search results`, `browser apply: ask | on | off`, `sso sign-in: ask | allowed | off`, plus the application profile (authorization/sponsorship, logistics, salary, EEO defaulting to "prefer not to say", self-ratings policy). The boundary: **facts come from identity/settings or not at all** — the answer modes change who fills a gap, never whether one may be invented.
2. **Search mode.** Web-search ATS-first (`boards.greenhouse.io`, `jobs.lever.co`, `jobs.ashbyhq.com`, `apply.workable.com`); treat aggregators as leads, not endpoints. **Fetch every candidate to verify it's live**, extract blockers, score fit with the M4 matcher, rank per the recency setting. Persist nothing until a posting is actually tailored.
3. **Answer modes.** Semi-manual: ask the user when a narrative question needs material the notes don't hold; stop before Submit. Automatic: answer in the user's voice anyway and mark `(low-confidence)`, tick every required consent (arbitration and background checks included, each reported), submit, and confirm. **Never bend in any mode:** accounts/passwords/CAPTCHAs, invented facts, optional opt-ins, and submission outside the main session.
4. **Apply mode.** Detect browser tools (Claude in Chrome → built-in browser → Playwright-style MCP); without one, emit a paste-ready `_apply.md` pack. **Scout before filling** (postings contradict their URLs — country, clearance, onsite; work-auth answers are about the role's country) and **check the portal's own applications list first** (duplicates are invisible from the job page). Fill from identity/settings, verify every value after entry, upload, answer, confirm **from the site's own signal** — some portals never flip the Apply button.
5. **The portal playbook.** Seed it with known mechanics (see `assets/portal-playbook-template.md`: Workday, Phenom-style, IBM Careers + stubs), then **write a section after every first drive of a new portal**. This file is the compounding asset: the second application on any system costs a fraction of the first. Universal rules live here too — the parser-artifact rule (parsers hoist projects into work history as fake employers; the missing job title is the tell), real-click checkboxes, session staleness.
6. **Delegation, last.** Parallel *tailoring* is safe (M6 rules). Parallel *browser filling* is not, by default — one browser, sequential. If forced: pinned tab per agent, ref-based interaction, screenshot checks, instant stop on a foreign job id, exhaustive briefs on judgment calls (identically-briefed agents answer *unbriefed* questions differently), escalation over guessing, and agents never submit.
- **Done when:** one real application reaches the review screen with every field correct on the first human inspection — then, and only then, turn automatic mode loose.

## M8 — Packaging: make it installable by anyone

- Claude Code plugin shape: `.claude-plugin/plugin.json` + `marketplace.json`, `skills/resume-tailor/SKILL.md` (the engine), `assets/` (the seeds: templates for identity/settings/playbook, bank/applications/sources seeds, dashboard, matcher, LaTeX templates).
- **Init wizard: default everything, ask one question** ("give me your resume, project links, or just tell me about your work"). Silent defaults surfaced as "you can change this later" one-liners. Lazy dependencies: offer to install TinyTeX at first compile; degrade to manual matching without Node; temp-clone without `gh`.
- README for non-technical users (plain words + a command table); technical detail stays in SKILL.md.
- **Release discipline:** leak-check before every push — grep the tree for the author's contact, employers, schools, salary figures, req numbers; the only permitted personal strings are manifest authorship and the license. Bump the version in both manifests; keep a "What's new" section honest.
- **Done when:** a fresh machine goes `/plugin install` → one answered question → verified PDF, with nothing of the author's in the tree.

## Why this order (the lessons that set it)

- **Contracts before generation** — every downstream feature leans on identity/format/voice being canonical; retrofitting canon is a rewrite.
- **Machine verification before trust** — compile checks (M1) catch what review misses; the same principle returns as coverage scripts (M4) and site-signal confirmation (M7).
- **Deterministic before parallel** — the bank + matcher make batch output consistent; parallelize first and you scale inconsistency.
- **One source of truth per answer** — the moment two files can hold the same fact, they disagree; the config/fact boundary (M7.1) is the applier's load-bearing wall.
- **Limits before autonomy** — the four apply limits came first and automatic mode was defined as *named, recorded exceptions to two of them*, not as a separate looser mode. Build the fence, then the gate.
- **Playbooks from drives, not foresight** — portal knowledge written from real runs (broken widgets, lying buttons) is the only kind that survives contact; budget the first drive on each portal as an investment, then bank it.
