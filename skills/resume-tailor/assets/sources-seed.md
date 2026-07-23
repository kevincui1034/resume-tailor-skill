# sources — where your resume context comes from

Registry of every connected context source. **Connecting** a source registers it here and mines it into a `projects/` accomplishment note — the note is what tailoring actually reads; this file remembers where each note came from so it can be **re-synced** later ("connect" with no arguments lists sources and offers a sync, which re-reads repo sources and refreshes their notes with new work).

Three kinds:
- `local` — a repo on this machine (mined via its files + git history)
- `github` — a repo URL (mined via `gh` or a temp clone)
- `manual` — no artifact: you described the project or job directly, or it was parsed from your imported resume. User-stated facts are confirmed by definition; only code-inferred claims carry `(verify)`.

The fenced JSON block is **machine-owned** — edited by the skill, not by hand. Fields: `source` (path, URL, `"resume import"`, or `"user-described"`) · `kind` · `note` (the `projects/` note slug it feeds) · `added` · `lastSynced`.

```json
[]
```
