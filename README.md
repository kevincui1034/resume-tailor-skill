# Resume Tailor — a Claude Code skill

Turn your real work into targeted, one-page LaTeX resumes. Paste a job description (or three), get back a compiled, ATS-clean PDF built from **verified accomplishments mined from your own repos and resume** — plus an optional cover letter in your voice, answers to the posting's application questions, a deterministic keyword-coverage report, and a tracked history of every application.

**The core rule: nothing is invented.** Every bullet traces to an accomplishment note, which traces to a real repo or a fact you confirmed. Anything Claude inferred but couldn't verify is marked `(verify)` until you sign off.

## Install

```
/plugin marketplace add kevincui1034/resume-tailor-skill
/plugin install resume-tailor
```

Requirements: a LaTeX distribution on PATH ([TinyTeX](https://yihui.org/tinytex/) is plenty — the skill runs `pdflatex`, `pdfinfo`, `pdftoppm`, `pdftotext`) and Node.js (for the deterministic matcher).

## First run

Say something like *"tailor my resume for this JD: …"*. With no workspace yet, the skill runs a short init wizard:

1. **Template** — keep the classic sb2nov/Jake Gutierrez default, or hand it your current resume (PDF/docx/image/tex) and it recreates your layout as a reusable template, pixel-compared against the original for your approval. Switch any time with "change resume template".
2. **Content** — import your existing resume (parsed into structured accomplishment notes + a seeded reuse bank), connect your local or GitHub repos (it reads the code and git history and drafts quantified notes), and/or answer a short interview for work with no artifact. Every source is registered in `sources.md` so you can list and re-sync them later.
3. **Voice** — optionally paste a writing sample so cover letters sound like you. Ships with anti-AI defaults (no em dashes, no canned enthusiasm, no "not just X but Y").

Everything lives in a `resume/` folder in your project — plain markdown + LaTeX you own, sync, and edit freely.

## Commands

Everything works as natural language ("tailor my resume for this JD…") or as `/resume-tailor <command>`:

| Command | What it does |
| --- | --- |
| `tailor <JD \| posting URL \| role>` — one or several | One tailored, compiled one-page resume per target. Batches run in parallel; every JD is auto-saved as a target note; each draft gets a keyword-coverage report. Asks once per run whether you want cover letters, and answers any application questions found in the posting. |
| `connect <repo path or GitHub URL>` | Mines the repo (README, structure, your git history) into a verified accomplishment note and registers it as a context source. Never writes into your repo. |
| `connect` | Lists your connected sources and offers a sync — re-reads connected repos so new work lands in your notes. |
| "add my experience at X" | No repo needed: a short interview turns a job or project you describe into an accomplishment note. |
| `refresh <draft>` | Regenerates an existing draft from your current notes (new metrics, renames, links). |
| `status <company> <status>` | Marks an application `applied \| interviewing \| offer \| rejected \| ghosted`. |
| "show my applications" | Summarizes your tracked applications — counts by status and job type, coverage, recent activity. |
| `template` / `template <name>` | Lists the template library / switches the active resume template. Drop in your own resume (PDF/docx/image/tex) and it becomes a reusable template after a side-by-side fidelity check. |

## What a tailor run does

- **Multi-JD batches**: paste several JDs or posting URLs at once; each gets its own resume, generated in parallel.
- **Bank-first assembly**: a deterministic matcher (`jd-match.mjs`, zero LLM calls) scores the JD against themed, already-verified bullets from your past drafts — repeat contexts reuse proven lines; fresh writing only happens for requirements the bank doesn't cover, and new verified material is harvested back in, so the system compounds.
- **Hard rules**: exactly one page; ATS-clean text layer (verified by codepoint scan); every bullet fills its lines (template-dependent); compile-verified before you ever see it.
- **Coverage report**: which of the JD's must-have keywords your draft covers and which are missing — missing terms are surfaced, never stuffed in.
- **Cover letters + question answers**: opt-in, built from the same analysis, voiced per your `voice.md`.
- **Tracking**: every draft lands in `applications.md` — one record per application with company, role, job type, keyword coverage, and status (applied / interviewing / offer / rejected / ghosted). Update statuses or ask for a summary in plain words; the file is yours to read, sync, and build on.

## Layout

```
skills/resume-tailor/
  SKILL.md            # the engine
  assets/             # seeds copied into your workspace at init
    templates/jake.tex, jd-match.mjs,
    format.md, voice-seed.md, cover-letter-*, identity-template.md,
    bank-seed.md, applications-seed.md, sources-seed.md, project-note-template.md
```

## License

MIT © Kevin Cui
