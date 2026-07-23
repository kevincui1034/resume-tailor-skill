# applications — tracker dataset

One record per application/draft, machine-owned. **The fenced JSON block below is the dataset** — tailoring appends to it, and Claude edits it on request ("mark Acme as ghosted" or the status mode) and summarizes it ("show my applications"). Edit the JSON only through those paths; prose outside the block is safe to touch.

**Fields:** `id` (draft basename) · `date` (drafted) · `company` (null = generic) · `role` · `type` — one of `fullstack | frontend | backend | data-science | ml-ai | devtools | mobile | other` (extend if a target truly fits nothing) · `target` (targets/ note slug or null) · `draft` (.tex basename) · `coverLetter` · `coverage` (`{pct, missing[]}` from the keyword report) · `status` — `drafted | applied | interviewing | offer | rejected | ghosted` · `statusUpdated` · `notes`.

```json
[]
```
