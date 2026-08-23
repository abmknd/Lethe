# Backend gaps found during the rebrand

**Deferred by decision.** The rebrand is a UI pass; nothing here gets built
until the visual overhaul is finished. This file exists so the findings are not
re-derived later from memory.

**How these were found:** rebuilding a surface against its Figma frame forces
every field on screen to come from somewhere. When it cannot, that is a gap.
Each entry below is a real thing a designed screen asks for and the API does
not currently provide.

**The rule the UI follows meanwhile:** a missing field renders EMPTY, never
invented. An empty COMMON INTEREST block is an honest gap; a card filled with
plausible fiction is a lie that reaches production and is much harder to find.

---

## 1. The blind gate contradicts the Connect design — DECISION NEEDED FIRST

Everything else in this file is a column. This one is a product decision, and
it changes what the other entries even mean.

**The model today.** Relethe matches double-blind: you decide before you see who
it is. `redesign.md` 5.11 specifies it and the API enforces it — while a match
is blind, `Recommendation.candidate` is `null` and only `blindRationale` ships.
The type carries a comment saying so. The stated reason is that the gate stops
anyone browsing or targeting a specific person, and stops identity crossing
before both sides commit.

**The design.** `connect-default` / `connect-open` show name, photo, role,
location, pronouns, birthday, endorsements and socials — all above PASS / MATCH.

Two ways this resolves, and they lead to different work:

| | What changes |
|---|---|
| **Blind gate dropped** | API ships identity at suggestion time. `redesign.md` 5.11 and the match card get rewritten. Every gap below becomes real work. |
| **Blind gate stays** | This screen is the POST-REVEAL view. Suggestions needs a separate blind variant, and the gaps below apply only after reveal. |

Until this is answered, `ConnectPage` maps what exists and leaves the rest
blank.

---

## 2. Fields the Connect card needs that have no column

`Recommendation.candidate` is `{ id, displayName, handle, location, timezone,
introText }`. The card asks for more:

| Field | Where it shows | Status |
|---|---|---|
| `pronouns` | Header meta row | No column anywhere |
| `birthday` | Header meta row | No column. Also a PII question, not just a schema one |
| `role` / job title | Role chip | `preferences.userType` exists, but it is a role FAMILY, not a job title |
| `meetingFormats` | MEETING FORMAT | No column. `meeting.provider` is about a booked call, not a preference |
| `endorsedBy` | Signal panel | No endorsement concept exists at all — see 3 |
| `socials` | Signal panel | Only `preferences.linkedinUrl` exists. KYC Step 8 collects four, and only LinkedIn is persisted |
| `avatarUrl` on a candidate | Header | Stored on `users.avatar_url` but not returned in the `candidate` shape |

**Cheapest fix for socials:** KYC already collects LinkedIn, Twitter, website
and GitHub. Three of the four are dropped on save. Persisting all four is a
small change and unblocks most of the Signal panel's socials row.

---

## 3. Endorsements do not exist

The Signal panel shows "George Tracy and 3 others" over an avatar stack. There
is no endorsement entity, table, or write path — no way for one user to endorse
another, and no way to read it back.

This is a feature, not a field. It needs its own design: who can endorse whom,
whether it is mutual, whether it decays like the feed does, and whether it is
visible before a match resolves (which interacts with 1).

---

## 4. Role taxonomy migration

`ROLE_OPTIONS` went from six entries to fourteen families. Profiles written
before the rebrand still carry `Creative` or `Other`, which nothing new will
produce.

**Not urgent, and the reason matters:** role fit is a SCORE component, not a
filter. The hard gate is "2 of 3 primary signals" — intent, interest,
complementarity — and role fit is none of them. So a legacy value costs score,
not eligibility. The frontend bridges preference lists in both directions
(`bridgeRoleTaxonomy` in `constants/roles.ts`), which holds until a backfill
happens.

**Open:** whether to backfill identities. `Creative` maps to Designer, Writer or
Artist — three different answers — so a migration would be guessing on someone's
behalf. Probably better to prompt those users to re-pick.

---

## 5. Surfaces with no data source

| Surface | Needs |
|---|---|
| DAILY GOAL (10 dots) | A per-day decision count. Currently derived from the local session index, so it resets on reload |
| Notification badge | An unread count. Currently hardcoded true |
| UPCOMING tab | A scheduled-meetings-for-me query. Currently routes to `/matches?filter=upcoming`, which nothing reads |
| ALL MATCHES tab | Routes to the old-brand `/matches` |

---

## 6. Carried over from before the rebrand

- **OAuth providers unset.** LinkedIn OIDC is the primary, Google/Microsoft the
  fallback. The `verification_tier` column exists; nothing writes it. Blocks the
  verification tiers and the higher-stakes investor-intro gate.
- **`preferredLocations`** is saved from KYC Step 4 but no filter consumes it.
- **HITL dial** has `GET/PUT /api/v1/admin/hitl-config` and no UI. That one is a
  frontend gap, listed here only so it is not lost.

---

## 7. Not a gap, but a trap worth recording

**`preferredUserTypes: []` means "wants nobody", not "no preference".** Role fit
is `preferredUserTypes.has(candidate.userType)`, so an empty set answers no to
everyone. "Open to anyone" therefore persists as EVERY family rather than an
empty list. Anything that later writes this field has to know that.
