# Resume format — generation contract

The canonical output format for every tailored resume. The skill reads this plus
`assets/resume-template.tex` and emits LaTeX in exactly this shape. Based on the
Jake Gutierrez / sb2nov template (MIT).

## Hard rules (non-negotiable)

1. **One page.** The compiled PDF must be exactly one page. If content overflows, cut the
   weakest bullets/projects — never spill to page 2.
2. **Every bullet fills its line to the right margin — no trailing whitespace.** A `\resumeItem`
   must not end with a short orphan line that leaves a big gap. Craft each bullet so its last
   line reaches near the right edge. In practice each bullet is **~2 full lines** (roughly
   200–280 characters at `\footnotesize` and this text width). Revise wording — add a concrete
   detail or tighten — until the final line is at least ~70% full. Never a 1.2-line bullet
   (huge gap on line 2) or a 2.1-line bullet (2–3 word orphan on line 3).
3. **ATS-safe characters only.** The PDF's text layer must be clean ASCII an applicant-tracking
   system can parse. No arrow glyphs (`→ ⇒ ▸`), no icon-font symbols (don't use `marvosym`
   glyphs like `\Telephone`/`\Letter`), no decorative or accented Unicode. Replace arrows with
   words ("to", "into", "then"); write plain ASCII (e.g. "Pokemon", not "Pokémon"). The `$|$`
   pipe separator and the standard round bullet are fine. **After compiling, verify** the text
   layer holds only ASCII plus the round bullet (U+2022) and en/em dash (U+2013/2014); any
   *other* non-ASCII glyph (arrow, icon, accent) is a fail:

```
pdftotext -enc UTF-8 <pdf> - | perl -CSD -ne 'for(split//){$o=ord;$h{$o}++ if $o>127} END{for(sort{$a<=>$b}keys%h){printf "U+%04X x%d\n",$_,$h{$_}}}'
```

Expect only `U+2013` (dash) and `U+2022` (bullet).

Both rules are visual and only truly verifiable by compiling — see "Compiling" below.

## Structure (section order)

`Heading → Education → Experience → Projects → Technical Skills`. Reuse the heading, links,
and section commands from `assets/resume-template.tex` verbatim; fill the placeholders from the
user's real material.

- **Experience** = real jobs only. Use `\resumeSubheading{title}{dates}{company | link}{location}`.
- **Projects** = the strongest 2–3, matched to the target role. Use
  `\resumeProjectHeading{\textbf{Name} $|$ \href{url}{...}}{date}`. Only include projects with a
  live URL or public repo worth linking.
- **Technical Skills** = tailor the four lists (Languages / Frameworks / Database / Tools) to
  the target and to what the selected work actually evidences. Don't list a skill no selected
  bullet supports. Write each language/tool plainly, without version qualifiers, unless the
  target specifically asks for a version.

## Bullet craft

- Lead with a strong past-tense verb; quantify with **real** numbers from the user's
  accomplishment record (never invented).
- Bold load-bearing tech/impact with `\textbf{...}`, matching the target's keywords for ATS.
- Escape LaTeX specials: `%` → `\%`, `&` → `\&`, `_`, `#`, `$`.
- Every bullet must trace to real work. A claim you inferred rather than confirmed should be
  marked `(verify)` and confirmed with the user before it goes on a real resume — flag any you
  used.

## Sourcing & honesty

End each generated `.tex` with a commented `% SOURCING` block listing which real experiences/
projects each section drew from and what strong material was left off-target — so the user can
add it back. This mirrors the honesty rule: the skill selects and rephrases; it never invents.

## Draft naming

Send-ready filenames — the `.tex` and compiled `.pdf` sit together in the output directory:

- **Role only:** `<lastname>_<role>` — for a bare role or a generic JD with no clear company
  (e.g. `smith_dev`, `smith_datascientist`, `smith_aiengineer`).
- **Role + company:** `<lastname>_<role>_<company>` — when tailoring to a specific company's JD
  (e.g. `smith_datascientist_stripe`). Keeps company variants from overwriting each other.
- `<role>` / `<company>` are compact, all-lowercase, no spaces or separators (data scientist →
  `datascientist`, ML engineer → `mlengineer`, Stripe → `stripe`). Confirm the role token with
  the user if ambiguous.
- **No date** in the filename — re-tailoring the same role(+company) overwrites the previous file.

## Compiling

You need a TeX distribution with `pdflatex` on PATH (TeX Live, MiKTeX, or TinyTeX all work).
Compile in a scratch/temp directory, then keep the `.tex` and final `.pdf` in the output folder.
The skill should **compile and verify** the two hard rules, not eyeball the source. Recipe:

```
pdflatex -interaction=nonstopmode -halt-on-error -output-directory="<build-dir>" "<draft>.tex"
```

- **One-page check:** the log ends `Output written on … (1 page, …)`, or
  `pdfinfo <pdf> | grep Pages` → `Pages: 1`. If >1 page, cut material and recompile.
- **Full-line-bullet check:** render to an image and look — `pdftoppm -png -r 150 <pdf> <out>`
  then read the PNG — no bullet should end with a large right-margin gap.
- **Missing package?** Install it with your distribution's package manager
  (`tlmgr install <pkg>` for TeX Live/TinyTeX, or let MiKTeX auto-install on first use).
