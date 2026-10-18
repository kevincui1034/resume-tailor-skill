# settings — applier config + application profile

How the applier behaves, plus the facts application forms keep asking for. **Facts here are user-stated only** — Apply mode fills forms from this file + `identity.md` and never guesses: `(unset)` means ask the user (semi-manual) or leave blank and flag it (automatic). Contact, education, and experience live in `identity.md`, not here.

## Applier config

- **answers:** semi-manual <!-- semi-manual = ask me when unsure | automatic = answer everything, flag low-confidence -->
- **job-search recency:** recent <!-- recent = newest first, prefer postings <= 30 days old | all = rank purely by fit -->
- **job-search results:** 10
- **browser apply:** ask <!-- ask | on | off — autofill + submit via Claude in Chrome when available -->

## Application profile

### Work authorization

- **citizenship / work authorization:** (unset) <!-- e.g. "US citizen", "US permanent resident", "H-1B", "F-1 OPT" -->
- **requires sponsorship now:** (unset) <!-- yes | no -->
- **requires sponsorship in the future:** (unset) <!-- yes | no -->
- **security clearance:** (unset) <!-- none | level held -->

### Logistics

- **over 18:** (unset) <!-- yes | no -->
- **date of birth:** (unset) <!-- entered only on forms that require it -->
- **willing to relocate:** (unset) <!-- yes | no | depends (say where) -->
- **work mode:** (unset) <!-- remote | hybrid | onsite | any -->
- **earliest start date:** (unset)
- **salary expectation:** (unset) <!-- a range travels better than a single number -->

### Voluntary self-identification (EEO)

Optional on every US form. The default answer is "prefer not to say"; change a line to answer it.

- **gender:** prefer not to say
- **race / ethnicity:** prefer not to say
- **veteran status:** prefer not to say
- **disability status:** prefer not to say

### Common form answers

- **how did you hear about us:** the job board or site where the posting was found (answer plainly)
- **references:** available on request
