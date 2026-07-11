# resume-tailor

A [Claude](https://claude.com/claude-code) skill that turns your real experience into a
**one-page, ATS-safe, role-targeted LaTeX resume** (and, optionally, a matching cover letter).

You give it a role, a company, or a pasted job description. It selects the accomplishments that
fit, rephrases them in the target's language, fills a clean LaTeX template, and compiles to a
verified one-page PDF.

The skill is background-agnostic — it works for any field, any level, any stack. It ships with
**no personal data**; everything comes from your own material at run time.

## What it does

- **Tailors to a target** — a role name, a company, or a full job description.
- **Honesty-first** — it only selects and rephrases *real* work. It never invents jobs, metrics,
  titles, or technologies. Anything it infers is flagged `(verify)` for you to confirm.
- **Enforces three hard rules**, then compiles the PDF and checks them:
  1. **One page** — cuts the weakest material rather than spilling to page 2.
  2. **Full-line bullets** — every bullet fills to the right margin, no orphan lines.
  3. **ATS-safe** — the PDF text layer extracts as clean ASCII an applicant-tracking system can parse.
- **Optional cover letter** — an MLA-style block letter in a warm, concrete voice, no em dashes,
  same ATS guarantees.

## Requirements

- A TeX distribution with `pdflatex` on your `PATH` — [TeX Live](https://tug.org/texlive/),
  [MiKTeX](https://miktex.org/), or [TinyTeX](https://yihui.org/tinytex/) all work.
- `pdfinfo` and `pdftoppm` (from `poppler-utils`) are used for verification; optional but
  recommended.

## Install

Skills live in a `skills/` directory that Claude Code discovers. Clone this repo into yours:

```bash
# project-level (this repo only)
git clone https://github.com/<you>/claude-resume-tailor .claude/skills/resume-tailor

# or user-level (all your projects)
git clone https://github.com/<you>/claude-resume-tailor ~/.claude/skills/resume-tailor
```

Then just ask Claude to tailor a resume — e.g. *"tailor my resume for this job:"* + a pasted JD,
or *"make me a data scientist resume."* The skill activates automatically.

## Provide your material

The skill fills the template from **your** real background. Point it at whatever you have:

- a master resume, "brag doc", or an existing `.tex` resume,
- a directory of accomplishment notes,
- or just answer its questions.

It captures your heading/contact, education, real jobs, projects worth linking, and the skills
your work evidences — then tailors from that.

## Repo layout

```
SKILL.md                          # the skill: the tailoring procedure Claude follows
references/
  resume-format.md                # generation contract: hard rules, bullet craft, verify recipe
  cover-letter-format.md          # cover-letter voice, structure, and rules
assets/
  resume-template.tex             # canonical LaTeX resume (placeholders, no personal data)
  cover-letter-template.tex       # canonical LaTeX cover letter (placeholders)
```

## Credits & license

The LaTeX resume template is based on [Jake Gutierrez's template](https://github.com/sb2nov/resume)
(MIT). This skill is released under the [MIT License](LICENSE).
