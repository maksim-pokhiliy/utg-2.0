# Initiatives — how big work is run here

A big piece of work spans many sessions and many executor runs. Without a durable home,
each new session re-derives context and drifts. An **initiative** is that home: a fixed
set of files per epic + a resume protocol + a promotion discipline, so work — and the
_reasoning behind it_ — survives context resets.

## Roles

This repo is driven by a **planner/executor split**:

- The **planner session** owns this directory: writes charters and plans, ratifies
  decisions, issues step prompts, reviews executor plans and PRs, updates the board.
- **Executor sessions** (separate tabs) run one scoped step each via `/feature`,
  `/feature small`, or `/upgrade`, from a `step-*-prompt.md` file in the initiative dir.
  Executors read initiative files for context but **do not edit them** unless their
  prompt says otherwise.

## An initiative

`initiatives/<slug>/` holds a fixed set of files (copy `_template/`):

- `charter.md` — goal · scope · non-goals · acceptance criteria · sacred constraints. Set once, refined rarely.
- `plan.md` — the phased steps with status. The "what & sequence."
- `state.md` — **the board**: scannable status table + the ONE concrete next action + pointers to open decisions/deferred. The resume entry point. Updated every planner session.
- `decisions.md` — D-numbered decisions: one-liner + rationale + status (`RATIFIED`/`OPEN`/`SUPERSEDED`). The SSOT for "why."
- `deferred.md` — carry-forwards: finding + disposition + status (`OPEN`/`SCHEDULED`/`CLOSED`/`DROPPED`). Where findings and follow-ups live so they don't get lost.
- `journal.md` — append-only narrative: per session, what happened.
- plus step prompt files (`step-N-*-prompt.md`) and any design/spec docs the initiative needs.

## Resume protocol (anti-context-loss)

The active initiative is named in `initiatives/ACTIVE` (one slug per line). To resume,
read in order: `charter.md` (what & why) → `state.md` (board + next action) →
`decisions.md` **open** entries + `deferred.md` **open** entries → `plan.md`. Trust the
promoted distillate over re-deriving from chat history.

## The promotion rule (why this system exists)

Chat context is ephemeral; this directory is the SSOT. At the end of any planner session
that touched the initiative: every decision ratified → `decisions.md` (with rationale);
every carry-forward → `deferred.md` (with disposition); board + next action →
`state.md`; a `journal.md` entry. **Nothing load-bearing stays only in chat.**

## Starting a new initiative

Copy `_template/` to `initiatives/<slug>/`, fill `charter.md`, seed `plan.md`, add the
slug to `initiatives/ACTIVE`.
