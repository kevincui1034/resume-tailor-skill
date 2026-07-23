# resume format — generation contract

The canonical output rules for every tailored resume. Tailoring reads this + `template.tex` — the **active template** (line 1 names it; alternatives live in `templates/`, switched via the template mode). The hard rules below are universal; **structure, macros, and whether the full-line rule applies come from the active template's comment header**.

## Hard rules (non-negotiable)

1. **One page.** The compiled PDF must be exactly one page. If content overflows, cut the weakest bullets/projects — never spill to page 2.
2. **Every bullet fills its line to the right margin — no trailing whitespace** *(when the active template's header says this rule applies; it does for the default `jake`)*. A bullet must not end with a short orphan line that leaves a big gap. In practice each bullet is **~2 full lines**. Revise wording — add a concrete detail or tighten — until the final line is at least ~70% full. Never a 1.2-line bullet or a 2.1-line bullet with a 2–3 word orphan.
3. **ATS-safe characters only.** The PDF's text layer must be clean ASCII an applicant-tracking system can parse. No arrow glyphs (`→ ⇒ ▸`), no icon-font symbols, no decorative or accented Unicode. Replace arrows with words; write plain ASCII. The `$|$` pipe separator and the standard round bullet are fine. **After compiling, verify** the text layer holds only ASCII plus the round bullet (U+2022) and en/em dash (U+2013/2014):

```
pdftotext -enc UTF-8 <pdf> - | perl -CSD -ne 'for(split//){$o=ord;$h{$o}++ if $o>127} END{for(sort{$a<=>$b}keys%h){printf "U+%04X x%d\n",$_,$h{$_}}}'
```

Expect only `U+2013` (dash) and `U+2022` (bullet).

## Bullet craft

- Lead with a strong past-tense verb; quantify with **real** numbers from the accomplishment note (never invented).
- Bold load-bearing tech/impact with `\textbf{...}`, matching the target's keywords for ATS.
- Escape LaTeX specials: `%` → `\%`, `&` → `\&`, `_`, `#`, `$`.
- Every bullet must trace to a real `projects/` note. A claim still marked `(verify)` there must be confirmed by the user before it goes on a real resume.

## Draft naming

`<firstlast>_<role>[_<company>].tex` in `drafts/` — the prefix comes from `identity.md`, `<role>`/`<company>` are compact all-lowercase tokens with no separators (data scientist → `datascientist`). Add `_<company>` when the JD names one. No dates; latest wins. Cover letters add `_cover`, question answers add `_answers.md`.

## Compiling & verify

```
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=<tmp> "<draft>.tex"
```

Confirm **one page** (`pdfinfo <pdf> | grep Pages` → `Pages: 1`), the ATS codepoint scan above, and — when the full-line rule applies — render `pdftoppm -png -r 150 <pdf> <out>` and look for orphan/short last lines. Keep only the `.tex` + final `.pdf` in `drafts/`. Missing package → `tlmgr install <pkg>` (TinyTeX) or your TeX distribution's equivalent.
