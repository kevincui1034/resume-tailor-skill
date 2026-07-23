# bank — reusable tailoring content

The deterministic memory behind tailoring. Every bullet here **shipped in a verified one-page draft** (or came from your imported real resume), so reusing one verbatim preserves line fill under the template it shipped in. The fenced JSON block is **machine-owned**: `scripts/jd-match.mjs` reads it to match a JD against themes without an LLM call, and the harvest step grows it after each run.

**How it's used:** a JD is matched against `themes[].triggers` (plain keyword hits, no LLM). Matched themes name the anchor projects, the candidate `bullets` (mix and match across themes per JD), per-theme `skills` fragments, and `cover` proof points for letters. The LLM's job shrinks to choosing among candidates, re-aiming `\textbf{}` at the JD's own keywords, and writing fresh material **only** for requirements no theme covers.

**Rules:** a bullet's sentence is reused as-is — the only permitted edit is re-aiming `\textbf{}` (rewording voids the line-fill guarantee; a reworded bullet is a *new* bullet and gets full verification). The guarantee is **template-scoped**: it holds only when the active template matches the bullet's `template` field. Cover entries are proof-point skeletons, not paste-ready text — letters are re-voiced per company per `voice.md`. Every addition must trace to a `projects/` note (honesty rule) and must not near-duplicate an existing entry.

**Entry shapes:**
- theme: `{"id", "triggers": [keywords], "anchor": "one-line selection guidance", "projects": [note-slugs]}`
- bullet: `{"id", "project", "themes": [ids], "tex": "LaTeX sentence", "source": "draft-or-import", "template": "jake"}`
- cover: `{"id", "themes": [ids], "skeleton": "factual spine, to be re-voiced", "source"}`
- skills: `{"<theme-id>": {"<Category>": [items]}}`

```json
{
  "themes": [],
  "bullets": [],
  "cover": [],
  "skills": {}
}
```
