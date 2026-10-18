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
- **"Find me live openings"** — searches the web for postings that are still open (dead links get dropped), prefers the newest ones if you want, checks each against your background, and shows a shortlist you can tailor or apply to in one go.
- **"Apply to these"** — with the [Claude in Chrome](https://claude.com/chrome) extension connected, it opens each posting, fills the form from your saved profile, attaches the right PDF, and answers the essay questions in your voice. **Semi-manual** shows you the filled form and waits for your OK before submitting; **automatic** submits on its own and flags anything it wasn't sure about. Automatic also agrees on your behalf to every consent an application requires, **including arbitration agreements and background-check authorizations**, and lists each one in its report. If you'd rather approve those yourself, stay on semi-manual. No browser hookup? You get a paste-ready answer pack instead.
- **"Set my salary expectation to…"** — a settings file keeps the facts forms always ask for: work authorization, start date, salary, relocation, the voluntary diversity questions. Those are only ever answered from what you've set — never a guess. Leave a field empty and it asks you (semi-manual) or leaves it blank and tells you (automatic).

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
| `search <role, keywords, location>` | Finds live postings on the open web, verifies each is still accepting applications, and ranks them newest-first or by best fit (your setting). Shortlist comes with match notes and flags (visa, onsite, clearance). |
| `apply <company \| link \| "these">` | Fills and submits the application in your browser (Claude in Chrome) from your draft + saved profile. Semi-manual reviews before submitting; automatic submits and reports. Without a browser hookup, you get a paste-ready pack. |
| `settings` / `set <field> <value>` | Shows or sets how the applier behaves (answer mode, search recency, browser use) and your application profile (authorization, salary, start date, EEO defaults). |

## What's new in v1.6.1

**Automatic mode now completes applications that require legal consents.** Before, automatic paused whenever an application required an arbitration agreement or a background/credit-check authorization. Now it ticks every consent the application requires and lists each one by company and wording in the run report, so you can see what you agreed to. Optional opt-ins, such as marketing emails and talent networks, are still left unticked. Semi-manual is unchanged and asks before ticking any consent box.

## What's new in v1.6.0

**The applier ships with field experience.** Apply mode now comes with a **portal playbook** — step-by-step driving notes distilled from dozens of real submissions on Workday, Phenom-style career sites, and IBM Careers (plus stubs for Greenhouse, Ashby, and iCIMS): which widgets lie, which Continue button isn't really Submit, why a university picker "finds nothing" until the country field is set, and how to spot the fake employers resume parsers invent from your projects. Every new portal you drive gets its own section written afterwards, so the second application on any system costs a fraction of the first. Also new:

- a **scout step** before every apply — postings routinely contradict their own URLs (country, onsite days, clearance), and it checks the portal's "my applications" list first so you never double-apply;
- an opt-in **SSO rule** (`sso sign-in: allowed`) — it may click your already-signed-in account on a sign-in chooser, and will still never type a password or 2FA code;
- a **skill self-ratings** setting for the portals that ask you to grade yourself per skill.

## What's new in v1.5.0

**It can now find jobs and apply for you.**

- **Live job search** (`search <role, location>`) — searches the open web, keeps only postings that are verifiably still open, and ranks them **newest-first** or **by best fit** — your choice, saved as a setting. Each hit is checked against your real background before it makes the shortlist.
- **Browser auto-apply** (`apply`) — with the Claude in Chrome extension connected, it opens the posting, fills the whole form, attaches your tailored PDF, and answers the essay questions in your voice. Two gears, set once in settings or per run: **semi-manual** (it asks you about anything it's unsure of and shows you the filled form before submitting) and **automatic** (it answers everything itself, submits, and flags the answers it was least sure about for you to spot-check). It always stops for logins, CAPTCHAs, and anything involving payment or identity verification.
- **A settings profile** (`settings`) — one file for the facts every form asks: work authorization and sponsorship, over-18/date of birth, relocation and work mode, earliest start, salary expectation, and the voluntary EEO questions (default: prefer not to say). The hard rule: those answers come from your settings or not at all — the applier never guesses a fact, in either gear.

## What's new in v1.4.0

**Draft housekeeping.** Resumes pile up fast when you apply to a lot of jobs, so there are now two commands for keeping the folder under control:

- **`archive`** sweeps your drafts folder into `resume/archive/` so only current work sits in front of you. It's a move, not a delete, and it takes the matching cover letter, answers, and PDFs along with each resume. Your application list keeps every entry and just points at the new location, and the job postings are never archived, so any resume can be rebuilt with `refresh`. Name a draft (`archive jdoe_backend_acme`) to archive only that one.
- **`clear`** permanently deletes what's in the archive, after showing you the exact list and waiting for a yes. It never touches your current drafts, and your application history stays intact either way.

## What you get

- A **one-page PDF** for each job, checked automatically: it really is one page, reads cleanly to the resume-scanning software companies use, and every line is filled out properly.
- A **match report**: which of the job's requirements your resume covers, and which it honestly doesn't.
- **Your files, on your computer.** Everything lives in a `resume/` folder as plain text you can open, edit, and back up. Nothing is uploaded anywhere, except the applications you tell it to submit.

## For the curious (technical notes)

The skill keeps your background as structured "accomplishment notes," reuses proven resume lines through a keyword-matching script (no AI call needed for repeat contexts), verifies every PDF by compiling and scanning it, and grows a reusable content bank as you go. Requirements: a LaTeX distribution (it offers to install [TinyTeX](https://yihui.org/tinytex/)) and optionally Node.js (it works without, slightly slower). Layout:

```
skills/resume-tailor/
  SKILL.md            # the engine
  assets/             # seeds copied into your resume/ folder on first run
```

Want to build a system like this yourself (or have an agent rebuild it)? [docs/build-plan.md](docs/build-plan.md) is the complete construction plan — nine milestones in dependency order, with the design rules and the lessons that set the order.

## License

MIT © Kevin Cui
