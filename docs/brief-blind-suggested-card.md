# Design brief — the blind state of the Suggested card

**For Claude Design. This brief does not propose a design.** It states what the
existing card cannot currently express, and what has to be true of whatever you
draw. Every direction decision is yours.

You already have the wireframe: `relethe-feed` **911:4246**, the Suggested row of
the MATCHES tab. This is about the state that frame does not cover.

---

## The situation

The card asks "Would you like to meet [name]?" and shows a person: photo, name,
role, location, about, common interests, meeting formats, endorsements, socials,
and a SIGNAL panel explaining the overlap. Then PASS / MATCH.

**That is the revealed state, and the user almost never sees it here.**

Relethe matches are **blind by default**. Identity opens only once *both* people
have accepted. Every card on this screen is a decision made *before* knowing who
the person is — and the design currently has no drawing for that.

This is not a data gap to be filled later. It is the product's central
mechanic: you are meant to choose based on the overlap rather than the profile.
The blind card is the primary state, and the revealed card is the exception.

---

## What is actually available while blind

Enforced server-side in `supabase/functions/api/index.ts`, which fails closed. A
`assertNoBlindIdentityLeak` guard throws rather than ship a payload containing
the other person's name, handle, email, avatar, bio or intro text.

**Present:**

| | Example |
|---|---|
| Role category | "An engineer", "A founder", "Someone new to meet" |
| Overlap themes, up to 3 | "Shared interest in **Architecture and Cats**" |
| Availability | "You share open time this week" |
| Confidence band | `low` / `medium` / `high` — never a percentage |
| Daily goal progress | 1 of 10 |

Each overlap theme arrives split into a stock phrase and an emphasis phrase (the
shared tokens). The emphasis is always the part that is specifically about these
two people.

**Absent, and not arriving later:** name, photo, handle, location, about text,
interest chips, meeting formats, endorsements, socials. Roughly two-thirds of
what the current card is built to show.

---

## What the design has to resolve

1. **What is the subject of the card when there is no person?** The heading
   "Would you like to meet Elena Voss?" has no name to use. The 72px avatar has
   no image. Roughly the top third of the card is currently identity.

2. **How does a card carry a decision on ~4 facts without reading as broken?**
   Today the empty sections hide themselves, so the card renders short and
   looks like a loading state that never finished. Absence needs to look
   deliberate.

3. **What does the confidence band do?** It exists, it is honest, and nothing
   in the current design uses it. It may be the strongest thing we can say.

4. **How is blindness itself communicated?** A user needs to understand they are
   choosing on overlap, that identity opens on mutual acceptance, and that PASS
   is not a judgement of a person. There is no slot for this. A previous
   attempt jammed "Identity opens when you both accept" into the role chip; it
   has been scrapped rather than kept, because a sentence in a chip is a chip
   used as a paragraph.

5. **Is this a variant of the existing card, or its own frame?** If a variant,
   the axis needs naming and the shared parts need to genuinely survive the
   change. If its own frame, the relationship to the revealed card should be
   legible — the same decision, further along.

6. **What does the revealed card become?** If it is now the rarer state, it may
   want to be a different surface entirely rather than the same card with more
   filled in.

---

## Constraints

- **Every existing component stays.** Tag, Button, Badge Button, Badge Text,
  Avatar, Avatar Stack, Sidebar, Divider, section labels — all built and
  applied. New composition is expected; new *components* need a reason.
- **The shell is fixed.** 911:4246 is `248 + 760` in a 1080 grid, two columns,
  no right-hand sidebar. The card is 760 wide. The header and rail do not move.
- **PASS / MATCH and DAILY GOAL stay in the bottom bar** at their current
  weights. The decision and its pacing are the point of the screen.
- **Never invent a fact to fill a space.** No placeholder faces, no silhouette
  standing in for a photo we will never have, no "3 mutual connections" unless
  something computes it. A visible absence is honest; a plausible fiction is a
  lie that survives to production.
- **No percentages.** The score is an uncalibrated heuristic; a number
  manufactures precision the matcher does not have. Bands only.
- **Blue 600 / Yellow, Archivo, the warm neutral ramp** — existing system.

---

## Also unresolved, lower priority

- **COMMON INTEREST has no blind source.** Overlap themes are sentences, not
  tags. Either the chips go in this state, or the payload needs a token list
  beside the sentences.
- **Empty states for the other rail rows** — Matches, Upcoming, Endorsed,
  Invited, Disavowed — are all undrawn, and a new member sees empty on all six.

---

## What would make this brief answered

A frame for the blind state that a real payload can fill with nothing left over
and nothing missing — where every element maps to something in the "present"
table above, and a user reading it understands what they are being asked and
what happens next.
