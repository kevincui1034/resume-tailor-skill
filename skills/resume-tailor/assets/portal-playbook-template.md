# portal playbook — how to fill each application system

Per-portal, step-by-step. The point is that the **second** application on a given portal type costs a fraction of the first: the navigation is already mapped, the field-to-answer mapping is already decided, and the broken widgets are already known so nobody burns turns on them again.

**This file is procedure. It is not the source of truth for any answer.** Every answer traces back to `identity.md` (contact, education, experience) and `settings.md` (authorization, logistics, comp, EEO, SSO policy); prose answers follow `voice.md`. If this file and those files ever disagree, they win and this file gets fixed.

**Write-back rule:** the first time a new portal type is driven, drive it carefully and **write its section here afterwards** — steps, field map surprises, and quirks, each quirk one line. The sections below were distilled from real application runs and start you ahead; your own runs will correct and extend them.

## Rules that apply on every portal

1. **Fill everything, stop before Submit** (semi-manual default). Submit only per the Answer-modes rules in the skill.
2. **Never create an account and never type a password.** When a portal gates on registration, stop and hand the browser to the user with the exact URL and what's left to do. With `sso sign-in: allowed` in `settings.md`, clicking an **already-authenticated** account on an SSO chooser is permitted; typing a password or 2FA code never is.
3. **Consent / terms checkboxes** follow the Answer-modes rules. Semi-manual needs the user's explicit yes. Automatic ticks every consent the application requires, arbitration and background-check authorizations included, and reports each one. Optional opt-ins stay unticked in both modes.
4. **Answer from `identity.md`/`settings.md` first.** Only ask about something those files do not cover, or where a form's wording makes a recorded answer not apply.
5. **Never invent.** Screening questions, citizenship, agreements, and dates get real answers or a question to the user — never a plausible guess.
6. **Verify every value after entry.** Parser output and typeahead both lie. Screenshot a field when the accessibility tree redacts its value.
7. **Check the portal's own "my applications" list before a batch** when one exists — duplicate applications are invisible from the job page, and a duplicate submit can't be unsent.
8. **Record what happened:** the tracker (`applications.md`), the run log, and this file's portal section if anything new was learned.

## Field → answer quick map

The same dozen or so fields appear on every portal. Resolve them from the user's files without re-asking:

| Field on the form | Source |
| --- | --- |
| Name / email / phone / address / links | `identity.md` Contact |
| School / degree / dates / field of study | `identity.md` Education |
| Employment history | `identity.md` experience entries — **and nothing else** (see parser-artifact rule below) |
| Work authorization / sponsorship / visa | `settings.md` Work authorization |
| Relocation / work mode / start date / salary | `settings.md` Logistics |
| EEO self-ID (gender, race/ethnicity, veteran, disability) | `settings.md` EEO (default: prefer not to say) |
| "How did you hear about us" / references | `settings.md` Common form answers |
| Essay / free-text questions | Answer modes (skill) + `voice.md` |

**The parser-artifact rule (seen on multiple portals):** resume parsers hoist *projects* into Work History as fake employers. The invented row usually has a company name, maybe a start date, and **no position title — the missing title is the tell**. Delete the row (or blank every field if there's no delete control); never answer its "is this your current position?" question. The only real employers are the ones `identity.md` lists. Watch Education for the same artifact.

**Work-authorization questions are about the country of the role.** An answer that is true at home ("authorized, never needs sponsorship") is false for a posting in another country — and postings routinely hide their country; read it off the job page, not the URL.

---

## Workday (`<tenant>.wd<N>.myworkdayjobs.com`)

Tenant-specific subdomains. **Each tenant is a separate account** — a login on one company's tenant does nothing on another's.

### Steps

1. Open the job URL. Confirm the **Apply** button is live and note the posting date.
2. **Apply** → modal offers *Autofill with Resume* / *Apply Manually* / *Use My Last Application*. **Take Autofill with Resume** — it parses most of the form correctly (then fix what it mangled, below).
3. **Account gate.** Signed out, Workday puts Create Account / Sign In in front of everything. Follow the SSO rule (universal rules above); otherwise hand to the user and resume after they sign in.
4. Upload the tailored resume PDF to the autofill uploader; wait for the "Successfully Uploaded!" state before Continue.
5. **My Information** — "How Did You Hear About Us" is a nested picker (field → category → leaf → click empty space to close). Most contact fields arrive prefilled; verify, fill address, set Phone Device Type (naming varies per tenant — "Mobile" may be "Pers Mobile").
6. **My Experience** — the big one. Fix the autofill damage, fill any blank experience blocks by hand, set the degree, upload the cover letter **into the same Resume/CV uploader** (it takes multiple files), verify parsed URLs.
7. **Application Questions** (not all tenants have this step) — company screening questions; answer from `settings.md`, escalate anything new.
8. **Voluntary Disclosures** — EEO dropdowns, then a terms checkbox at the bottom.
9. **Self Identify** — the disability form (name, date, answer).
10. **Review** — submit per Answer modes; confirmation shows on the candidate-home page as a status like *In Progress*.

### Quirks

- **Autofill reliably breaks three things:** a company can parse as `Name | website.com` (strip the URL); a second work-experience block can come through blank except the company name; a long role description can overflow and swallow the next section's header. Fix all three.
- **The LinkedIn field rejects bare domains** — it wants the full `https://www.linkedin.com/in/<handle>/` form.
- **Checkboxes need a real mouse click.** Setting the value programmatically leaves "Field and Value required". Scroll to the ref, then click the coordinate.
- **Typeahead pickers (Field of Study, Skills) can be dead on a given tenant** — every search returns nothing, including terms that certainly exist. If the field is optional, try once and move on; never browse a 500-entry virtualized list.
- **`Save and Continue` sits at a different y-coordinate per page.** Screenshot before clicking; a miss silently does nothing.
- **Going Back is safe** — answers (including consent checkboxes) survive a round trip from Review and back. Use it to fix things rather than restarting. The progress-bar step labels are **not** clickable.
- **Tenants differ more than expected** — step count, which questions exist, required vs optional address, picker health all vary between two tenants of the same product. **Read each page rather than pattern-matching from the last tenant.**
- **Session staleness is a Workday-wide symptom.** If a picker spins forever or a required field refuses to populate, suspect an expired session before suspecting the widget: reload the job URL and check the header for the signed-in state.

---

## Phenom-style career sites (`jobs.<company>.com`)

Company-branded sites on the Phenom platform (and lookalikes). Classic username+password gate; often **no SSO at all**, so the account step belongs to the user.

### Steps

1. Job URLs look like `/en_US/careers/JobDetail/<slug>/<jobId>`; the **APPLY** button often sits in the right-hand rail, not under the title.
2. Apply redirects to a Login page with a separate Register button. Note: the page may say recent applicants already exist in the system — "Forgot your password?" beats registering a duplicate account.
3. Typical flow: **Select your resume → Personal info → Questionnaire (EEO) → Job-specific questions.** Only the last step's `Submit` is the real submit; earlier steps use `Continue`.
4. The personal-info step can be **one long page that doubles as the registration form**, ending in Password / Confirm password. Fill everything except the password fields; the user types the password and clicks Continue.

### Quirks

- **Never press Return inside the form — it submits the page.** Clicks and form-input calls only.
- **Hidden template rows:** Work Experience / Education sections carry invisible template `<select>`s that element-finding surfaces alongside the real ones, so input on the "first" match lands in the wrong slot. Read the section first and target the select whose value is set vs empty, or use screen coordinates.
- **A failed submit is non-destructive** — everything entered survives a validation failure; recovery is just filling the missing bits.
- **The resume parser is decent but check two fields:** "Is current position?" is left blank on every row, and Major/Field of Study may be filled with the *degree* ("Bachelor of Science") instead of the field — overwrite with the real field of study.
- **Auto-extracted skill chips are noisy** (genuine skills mixed with junk words pulled from bullets). If pruning: **bottom-to-top, at most one chip per visual row per batch, re-screenshot between batches** — the chips are a wrapped inline list, so deleting one shifts every chip after it and a second click in the same batch lands on the wrong chip. Re-adding works via the input at the end of the list.
- **The cover letter has its own dedicated file input**, separate from the resume picked in step 1.
- Salary questions may use a searchable **currency dropdown of names, not codes** (`US Dollar` — beware decoy entries), and a required From/To range.
- Language sections ask written and spoken levels separately — claim only what the user recorded.
- Some privacy notices ask that resumes **not** contain full dates of birth — don't volunteer a DOB the form doesn't require.

---

## IBM Careers (`careers.ibm.com`)

A JS app — **plain URL fetching returns nothing**; read postings through the browser. Accounts persist, so there is normally no gate after the first sign-in.

### Steps

1. Job URL: `/en_US/careers/JobDetail?jobId=<id>`. **Apply now** sits in the right-hand rail.
2. *Choose an option to apply* → **From Device** → upload the tailored PDF.
3. *Join our Talent Network* → **"No thanks, continue to apply"** — opting in edits a profile shared across every application on the site.
4. **Main form** — greyed out until the privacy-notice **"I agree"** is ticked (that tick also reveals a residency question). Contact fields prefill from the shared profile; phone is often blank; work history is parsed from the resume with "Is current position?" blank on every row.
5. **Final page** — how-you-heard, work authorization (answering it reveals a sponsorship follow-up and an "I certify" accuracy checkbox), day/month of birth, work-arrangement acceptance, the EEO block, and a **second required Resume/CV upload**.
6. **`Continue` is NOT submit** — it leads to a review page whose separate **Submit Application** button is the real one.

### Quirks

- **The Apply button does NOT flip to "Applied" after a successful submission.** The reliable confirmation is the **Your Applications list**, where a submitted req appears with a *Withdraw* action. Read it with `…/YourApplications/?personRecordsPerPage=48&personOffset=0` (then `&personOffset=48`) — the in-page pagination fights you; URL params don't. **Check this list before a batch too**: already-applied reqs are easy to re-apply to by mistake, and nothing on the job page warns you.
- **The university picker is filtered by the country field and fails silently when country is blank** — every query returns "No results found" (HTTP 200, looks like an outage). Set the university's **country first**, then search.
- **Date dropdowns eat typeahead** (typing `22` can select `20`). Set via the element's ref, then verify by re-reading.
- **A failed validation silently clears file uploads** — re-upload immediately before the successful Continue. The second upload slot sometimes arrives with a **stale wrong file** attached; verify it.
- **The parser hoists resume projects into Work History as fake employers** (see the universal parser-artifact rule); their required "current position?" radio then blocks Continue until the row is deleted.
- **Skill self-assessment blocks use two different rating scales, and one is NOT in ascending order** — match rungs by exact text, never by position. Values sometimes arrive pre-filled from the shared profile; follow the user's recorded policy in `settings.md` (default: ask).
- Some dropdowns are **broken portal-side** (options with empty text, values that revert on serialize). If the field carries no required asterisk, leave it and move on — document which one in this section.
- **Race/Veteran are custom widgets, not native selects** — form-input fails with "Available options: ''"; click the field, then click the option in the overlay. Race stays empty until Ethnicity is answered. **Don't press Enter on custom selects** — it can navigate the wizard back a step.
- **Field values can be redacted in the accessibility tree** (`[value redacted]`) — screenshot before deleting any work-history row.
- US and non-US reqs use **different EEO blocks and different work-authorization wording** — a req's country changes the honest answer; read location off the job page, not the URL.
- Long forms sometimes stop responding to wheel scroll: scroll to a ref, or resize the window taller.

---

## Greenhouse (`boards.greenhouse.io`)

**Not yet driven in this workspace.** Expected shape: single long page, no account required, resume + cover-letter file inputs near the top, custom questions in the middle, EEO block at the bottom. Usually the fastest portal. Write this section on first run.

---

## Ashby (`jobs.ashbyhq.com`)

**Not yet driven in this workspace.** Expected shape: single-page React form, no account, drag-and-drop resume upload with parsing, custom questions as free text. Write this section on first run.

---

## iCIMS

**Not yet driven in this workspace.** Expected shape: account required, multi-step, aggressive resume parsing that needs correction. Write this section on first run.
