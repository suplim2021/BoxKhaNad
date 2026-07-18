# ADR-001: Hackathon product scope

Status: Accepted

Date: 2026-07-17

## Context

BoxKhaNad must be useful on a phone, visually memorable, feasible before the Build Week deadline, and easy for a first-time programmer to explain honestly. The project should solve box selection without turning into a warehouse optimization system.

## Decision

Build a deterministic, client-side parcel-box recommendation web app.

- Audience: occasional senders and online sellers.
- Track: Apps for Your Life.
- Runtime AI: none. Codex with GPT-5.6 is used and documented as the development workflow.
- Item count: one item per calculation.
- Shape modes: rectangular/flat, cylinder/bottle, sphere/ball, and irregular-item bounding box.
- Protection input: material thickness per side; 1 cm adds 2 cm to the affected axis.
- Catalog behavior: search all catalogs by default, then filter Thailand Post or common A/B/C boxes.
- Result visualization P0: too-small ghost, recommended box, and next-larger ghost in a playful code-native 2D/isometric scene. Touch-rotatable 3D is P1.
- Box fitting: preserve raw published folded dimensions and record their dimension type. Only verified internal/usable dimensions can produce a definite "fits" claim. External or unspecified values produce a clearly labeled likely candidate unless a sourced usable-size policy exists.

## Consequences

- The core result is fast, explainable, testable, and works without an account or API cost.
- Cylinders and spheres use conservative axis-aligned bounds; the app does not solve free-angle or mesh packing.
- Irregular items require users to measure an enclosing rectangular bound.
- Multiple items, compressible-object modeling, camera measurement, and arbitrary 3D nesting are deferred.
- Cylinders may be placed on any primary axis in MVP; a must-stay-upright constraint is deferred and must be stated in the UI.
- Visual assets may be AI-generated later, but functional UI, dimension labels, and box geometry remain code-native for responsiveness and accessibility.

## Hackathon evidence

- Keep core implementation in one primary Codex task using GPT-5.6.
- Use dated Git commits for logical milestones.
- Document human decisions and Codex/GPT-5.6 contributions in README.
- Submit the primary task's `/feedback` Session ID.
