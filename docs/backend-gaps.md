# Backend gaps found during the rebrand

**Deferred by decision.** The rebrand is a UI pass; nothing here gets built
until the visual overhaul is finished. This file exists so the findings are not
re-derived later from memory.

**How these were found:** rebuilding a surface against its Figma frame forces
every field on screen to come from somewhere. When it cannot, that is a gap.

**Check the schema, not the payload.** The first version of this file called
seven fields missing because they were absent from one API projection. Five of
them had columns. A field you cannot see from where you are standing is not the
same as a field that does not exist, and the difference is a projection change
versus a migration.

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

**This has flipped before, which is why it needs an actual decision rather than
an assumption.** Three data points, in order:

1. The **Lethe-era prototype** showed full identity at suggestion time — name,
   handle, photo, role, location, pronouns, "94% match", availability.
2. The **ConnectPage this rebuild replaced** was blind. Checked at `27d82ef~1`:
   it renders only `blindRationale.roleCategory`, `confidenceBand`,
   `overlapThemes` and `availabilityCompatibility`. No `candidate.displayName`
   anywhere in the file.
3. The **new Figma frames** show identity again.

So the gate was added after the prototype and the new design returns to the
earlier model. Neither direction is a mistake — but the API, `redesign.md` 5.11
and the frames currently describe two different products, and the fields in 2b
only matter under one of them.

Two ways this resolves, and they lead to different work:

| | What changes |
|---|---|
| **Blind gate dropped** | API ships identity at suggestion time. `redesign.md` 5.11 and the match card get rewritten. Every gap below becomes real work. |
| **Blind gate stays** | This screen is the POST-REVEAL view. Suggestions needs a separate blind variant, and the gaps below apply only after reveal. |

Until this is answered, `ConnectPage` maps what exists and leaves the rest
blank.

---

## 2. Fields the Connect card needs

**Corrected 2026-08-23.** An earlier version of this list said seven fields had
"no column". That was wrong, and wrong in a way worth naming: I read
`Recommendation.candidate` — `{ id, displayName, handle, location, timezone,
introText }` — and treated its shape as the schema. Most of these fields do have
columns; they are simply not in that one projection.

Two very different kinds of problem, and only the second is real work:

### 2a. Has a column, not in the payload — widen the projection

| Field | Lives at | Verified |
|---|---|---|
| `role` | `preferences.user_type` | `user_type TEXT NOT NULL DEFAULT ''` |
| `meetingFormats` | `preferences.meeting_format` | `meeting_format TEXT NOT NULL DEFAULT 'video'` |
| `avatarUrl` | `users.avatar_url` | Written by KYC Step 7 |
| `availability` | `availability_slots` table | Own table, indexed on user and day |
| `interests` | `preferences.interests` | `JSONB` |

One change unblocks all five: return them on `candidate`. This is a projection
widening, not a migration.

**One genuine mismatch inside 2a:** `meeting_format` is a scalar `TEXT` in the
database while `Preferences.meetingFormat` is `string[]` in TypeScript, and the
design shows multiple format pills. So the column exists but cannot hold what
the screen displays. Scalar → array is a real migration, just a small one.

### 2b. No column anywhere — real work

| Field | Where it shows | Note |
|---|---|---|
| `pronouns` | Header meta row | Nothing in any table |
| `birthday` | Header meta row | Nothing. Also a PII question, not just a schema one |
| `endorsedBy` | Signal panel | No endorsement concept at all — see 3 |
| `socials` beyond LinkedIn | Signal panel | KYC Step 8 collects four, only `linkedinUrl` is persisted |

**Cheapest fix for socials:** three of the four collected values are dropped on
save. Persisting all four is a small change and unblocks most of the Signal
panel's socials row.

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
| DAILY GOAL (10 dots) | **Not a gap.** The pre-rebrand page already showed "0 of 10 reviewed", derived client-side from the recommendations list, and the dots are the same number drawn differently. Only *persistence* is missing — the index resets on reload |
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
