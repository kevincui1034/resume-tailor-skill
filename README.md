# Resume Tailor

A [Claude Code](https://claude.com/claude-code) skill that writes you a **custom resume for every job you apply to** — built only from work you've actually done.

You paste a job posting. It picks the most relevant things from your background, writes a clean one-page resume around them, double-checks the result, and hands you a finished PDF. It can also write the cover letter, answer the application's essay questions in your own voice, and keep track of everywhere you've applied.

**It never makes things up.** Everything on the resume comes from your real projects and jobs. If it's unsure about a detail, it asks you instead of guessing.

## Setting up

1. Install [Claude Code](https://claude.com/claude-code), then run:

   ```
   /plugin marketplace add kevincui1034/resume-tailor-skill
   /plugin install resume-tailor
   ```

2. Say **"help me tailor my resume"**. The first time, it sets itself up and asks you one question: share your current resume (any file format), links to projects you've worked on, or just describe your work in your own words — any mix is fine.

That's it. It learns your background from what you give it, and if your computer is missing a helper tool (like the free PDF maker it uses), it offers to install it for you.

## How you use it

Just talk to it. For example:

- **"Tailor my resume for this job:"** *(paste the posting, or a link to it)* — you get a one-page PDF matched to that job. Paste several postings at once and it makes one resume for each, at the same time.
- **"Write a cover letter too"** — it asks anyway on each run; say yes and it writes one that sounds like you, not like a robot.
- **"Here's another project I worked on:"** *(paste one or more project links or folders)* — it studies them and adds what you built to your background. No code? Just describe the work and it takes notes.
- **"I applied to Acme"** / **"Acme rejected me"** / **"I'm interviewing at Acme"** — it keeps your application list up to date.
- **"Open my dashboard"** — a page in your browser with charts of everywhere you've applied, what type of jobs, how well you matched them, and buttons to update each application's status.
- **"Use my resume's design"** — hand it your current resume and it reuses your exact layout for every future resume, instead of the built-in design. You approve the copy before it's used.
- **"Archive my drafts"** — sweeps old resumes out of the drafts folder into `resume/archive/` so only current work is in front of you. Later, **"clear the archive"** deletes them for good, after it shows you the list and you confirm.

## Commands

Everything above works in plain words, but if you prefer exact commands, these all work too (as natural language or `/resume-tailor <command>`):

| Command | What it does |
| --- | --- |
| `tailor <job posting \| link \| role>` — one or several | One tailored, compiled one-page resume per job. Several postings run in parallel; every posting is saved for reference; each resume gets a match report. Asks once per run whether you want cover letters, and answers any essay questions found in the posting. |
| `connect <repo path or GitHub link>` — one or several | Studies each project (its files and your commit history) and adds what you built to your background. Several repos are processed in parallel with one review at the end. Never changes your repos. |
| `connect` | Lists your connected projects and offers a re-sync so new work lands in your background. |
| "add my experience at X" | No code needed: a short interview turns a job or project you describe into background material. |
| `refresh <draft>` | Regenerates an existing resume from your current background (new numbers, renames, links). |
| `status <company> <status>` | Marks an application `applied \| interviewing \| offer \| rejected \| ghosted` — same effect as clicking in the dashboard. |
| `template` / `template <name>` | Lists the available resume designs / switches the active one. Hand it your own resume and it becomes a reusable design after a side-by-side check you approve. |
| `dashboard` | Opens the application tracker in your browser. |
| `archive` | Moves everything in your drafts folder into `resume/archive/` so drafts only holds current work. Nothing is deleted, and the job postings are kept, so any resume can be rebuilt. Name a draft to archive just that one. |
| `clear` | Permanently deletes what's in `resume/archive/`. Asks you to confirm first, and never touches your current drafts. Your application history stays either way. |

## What's new in v1.4.0

**Draft housekeeping.** Resumes pile up fast when you apply to a lot of jobs, so there are now two commands for keeping the folder under control:

- **`archive`** sweeps your drafts folder into `resume/archive/` so only current work sits in front of you. It's a move, not a delete, and it takes the matching cover letter, answers, and PDFs along with each resume. Your application list keeps every entry and just points at the new location, and the job postings are never archived, so any resume can be rebuilt with `refresh`. Name a draft (`archive kevincui_backend_acme`) to archive only that one.
- **`clear`** permanently deletes what's in the archive, after showing you the exact list and waiting for a yes. It never touches your current drafts, and your application history stays intact either way.

## What you get

- A **one-page PDF** for each job, checked automatically: it really is one page, reads cleanly to the resume-scanning software companies use, and every line is filled out properly.
- A **match report**: which of the job's requirements your resume covers, and which it honestly doesn't.
- **Your files, on your computer.** Everything lives in a `resume/` folder as plain text you can open, edit, and back up. Nothing is uploaded anywhere.

## For the curious (technical notes)

The skill keeps your background as structured "accomplishment notes," reuses proven resume lines through a keyword-matching script (no AI call needed for repeat contexts), verifies every PDF by compiling and scanning it, and grows a reusable content bank as you go. Requirements: a LaTeX distribution (it offers to install [TinyTeX](https://yihui.org/tinytex/)) and optionally Node.js (it works without, slightly slower). Layout:

```
skills/resume-tailor/
  SKILL.md            # the engine
  assets/             # seeds copied into your resume/ folder on first run
```

## License

MIT © Kevin Cui
