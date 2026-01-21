# Shared (Types & Utilities)

The `shared/` module contains cross-cutting artifacts used across the ecosystem.

## What belongs here
- Shared types/interfaces (proposal, group, member, evidence)
- Shared utility functions (formatting, validation helpers)
- Shared UI primitives only when they are truly reused

## Rule of thumb
If a change in `shared/` breaks a client flow, document the contract change in:
- `docs/03_workflows_stages.md` (stage semantics)
- and/or release notes (when releases are added)
