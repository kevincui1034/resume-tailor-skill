---
name: resume-tailor
description: Assemble a one-page, role-targeted LaTeX resume (and optional matching cover letter) from the user's real experience. Use when the user wants to tailor, generate, or rewrite a resume or cover letter for a specific job, role, or pasted job description. Selects and rephrases only real accomplishments — never invents work, metrics, or technologies — and compiles to an ATS-safe, one-page PDF.
license: MIT
---

# resume-tailor — accomplishments → targeted LaTeX resume

Assemble a one-page, ATS-safe LaTeX resume tailored to a target role, drawn from the user's
**real** experience. Output is a complete `.tex` document plus a compiled, verified `.pdf`.
Optionally generate a matching cover letter.

**Target:** a role name (e.g. "data scientist"), a company, or a pasted job description (JD). If
none is given, ask what to target.

## Honesty rule (load-bearing — never violate)

Every bullet and every sentence must trace to the user's **real** work. This skill **selects and
rephrases**; it **never invents** work, metrics, technologies, titles, or dates. Any claim you
infer from context rather than confirm should be marked `(verify)` and confirmed with the user
before it lands on a real resume.

## 0. Load the format (do this first)

Read `references/resume-format.md` (the generation contract) and `assets/resume-template.tex`
(the canonical LaTeX). Output MUST be a complete `.tex` document in that exact format. Two
**hard rules**, non-negotiable:

1. **One page.** Cut the weakest material rather than spill to page 2.
2. **Every bullet fills its line to the right margin** — no short orphan last line, no trailing
   gap. Each `\resumeItem` ≈ 2 full lines.

## 1. Gather the user's material

You need the user's real background to fill the template. Look for it in this order, and use
whatever is available — **do not invent** anything to fill a gap:

1. **A profile/master file** the user points to (a master resume, a "brag doc", a directory of
   accomplishment notes, a LinkedIn export, an existing `.tex` resume).
2. **An existing resume** in the working directory.
3. **Ask the user** for what's missing — identity/contact for the heading, education, real jobs
   (title, company, dates, location, impact), projects (name, link, what it does, impact), and
   the tech they actually used.

Capture: heading/contact, education, **real jobs only** for Experience, projects worth linking,
and the full inventory of skills the work evidences. Keep a running note of any metric or claim
that is unconfirmed — mark it `(verify)`.

## 2. Resolve the target

- **Pasted JD** → extract must-have skills, technologies, domains, and keyword language. Offer to
  save the JD alongside the output for future re-tailoring.
- **Company name** → if the product isn't obvious, search the web to ground the tailoring in what
  they actually do.
- **Bare role** → build a lightweight target profile from that role's typical must-haves.

Settle the **role token** and, if a specific company is named, the **company token** — these set
the output filename (step 5).

**Then ask once:** "Want a matching cover letter too?" If yes, generate it in step 6 after the
resume, reusing this same target analysis and proof points. If no, skip step 6.

## 3. Select

- **Experience** (real jobs only): keep the roles that best evidence the target; drop or shorten
  any that are clearly irrelevant to it.
- **Projects**: rank each by fit to the target's skills/tech/domains **and** semantic relevance;
  pick the strongest 2–3 that fit one page. Prefer ones with a live URL or public repo.
- **Skills**: tailor the four Technical Skills lists to the target and to what the selected work
  actually evidences. Don't list a skill no selected bullet supports.

## 4. Write bullets (honor the rules)

- Reuse the template's preamble and `\resumeItem` / `\resumeSubheading` / `\resumeProjectHeading`
  commands verbatim.
- Each bullet: strong past-tense verb, **real** quantified impact, `\textbf{}` on the target's
  key tech; escape LaTeX specials (`%` `&` `_` `#` `$`).
- Fill each bullet to ~2 full lines so the last line reaches near the right margin — revise
  wording (add a concrete detail or tighten) until there's no big end-gap. **Never invent
  metrics.** Confirm or flag any `(verify)` claim before using it.
- **ATS-safe characters only** (format rule 3): no arrows, symbol-font glyphs, or accented/
  decorative Unicode anywhere in the output — convert any `→` in your notes to plain words/ASCII.

## 5. Fit to one page, emit, and verify

Budget ≈ Education + real experiences + 2–3 projects + Technical Skills. If it overflows, cut the
weakest bullets/projects first.

Write `<outdir>/<lastname>_<role>[_<company>].tex` — a complete, compilable document. Naming
(see `references/resume-format.md` → Draft naming): `<lastname>_<role>` for a bare role or generic
JD; add `_<company>` when the JD names a specific company; compact lowercase tokens, no date.
Default `<outdir>` to the current working directory unless the user specifies one. End the file
with a commented `% SOURCING` block: which real experiences/projects each section drew from, and
what strong material was left off as off-target.

Then **compile and verify** with a TeX distribution that has `pdflatex` on PATH (TeX Live,
MiKTeX, or TinyTeX):

```
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=<build-dir> "<draft>.tex"
```

Confirm:
- **One page** — `pdfinfo <pdf> | grep Pages` → `Pages: 1`.
- **ATS-clean** — run the codepoint scan from `references/resume-format.md`; expect only
  `U+2013` (dash) and `U+2022` (bullet).
- **Full-line bullets** — render `pdftoppm -png -r 150 <pdf> <out>` and look: no orphan/short
  last lines.

Fix any offenders and recompile. Keep the final `.pdf` next to the `.tex`. If a package is
missing, install it (`tlmgr install <pkg>` for TeX Live/TinyTeX, or MiKTeX auto-installs).

## 6. Cover letter (only if requested in step 2)

Skip this whole step unless the user opted in.

Read `references/cover-letter-format.md` (voice + structure + rules) and
`assets/cover-letter-template.tex` (canonical letterhead). Write a complete `.tex` letter
following that contract:

- **Same target analysis as the resume** — reuse the proof points the resume already selected;
  strongest proof point as the centerpiece, second chosen by JD fit.
- Default = the full 3-paragraph letter with letterhead + salutation + sign-off. Honor any
  format variation the user named (body-only, word-limited, recruiter intro).
- **Honesty rule:** every claim traces to real work; never invent; confirm any `(verify)` claim.
- **No em dashes**, ATS-safe ASCII, escape LaTeX specials.
- Filename: `<outdir>/<lastname>_<role>[_<company>]_cover.tex` — the **same role/company tokens**
  as the resume, `_cover` suffix.

Then **compile and verify** with the same recipe: `Pages: 1`, ATS codepoint scan clean, and the
letter sits comfortably on one page. Keep the final `.pdf` next to the `.tex`.

## 7. Report

Tell the user where the `.tex` and `.pdf` landed, list any `(verify)` claims that still need
confirmation, and note what strong material was left off as off-target.
