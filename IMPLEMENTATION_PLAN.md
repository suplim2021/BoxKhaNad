# BoxKhaNad Implementation Plan

## Goal

Deliver a deployed, mobile-first Build Week submission that recommends a source-backed Thai parcel box for one protected item, explains why it fits, and visualizes the recommended and neighboring choices in a playful interactive scene.

## Sub-tasks

1. Hackathon and repository foundation
2. Fit-calculation domain engine
3. Source-backed box catalogs
4. Mobile input and result experience
5. Interactive box visualization
6. Verification, deployment, and submission package

## Parallelism

Implementation should remain mostly sequential so the majority of core functionality stays coherent in one primary Codex task and one working project history.

- Sub-task 1 precedes all code work.
- Sub-tasks 2 and 3 are logically independent but meet at shared domain types; define those types first, then implement sequentially to avoid conflicts.
- Sub-task 4 consumes sub-tasks 2 and 3.
- Sub-task 5 consumes the result model from sub-task 4.
- Sub-task 6 runs after the working product exists.

Do not split implementation across parallel agents unless file ownership is strictly non-overlapping and the primary Codex task still clearly contains the majority of core work.

## Files to touch

Planned paths; exact generated config names may vary with the approved scaffold.

- `package.json`, Vite/TypeScript config - sub-task 1
- `README.md` - sub-tasks 1 and 6, shared sequentially
- `src/domain/types.ts` - sub-task 2
- `src/domain/shapes.ts` - sub-task 2
- `src/domain/fit.ts` - sub-task 2
- `src/domain/rank.ts` - sub-task 2
- `src/domain/*.test.ts` - sub-task 2
- `src/data/catalogs/*.json` - sub-task 3
- `src/data/catalogs.ts` - sub-task 3
- `src/components/CalculatorForm.tsx` - sub-task 4
- `src/components/CatalogFilters.tsx` - sub-task 4
- `src/components/ResultCard.tsx` - sub-task 4
- `src/components/BoxScene.tsx` - sub-task 5
- `src/App.tsx`, `src/styles.css` - sub-tasks 4 then 5, shared sequentially
- `e2e/*` or equivalent responsive smoke tests - sub-task 6
- `docs/SUBMISSION_CHECKLIST.md` - sub-task 6

## Step-by-step changes

### Sub-task 1: Hackathon and repository foundation

1. Confirm Devpost registration and that implementation runs under GPT-5.6 in this primary Codex task.
2. Scaffold a static React + TypeScript + Vite app suitable for simple deployment.
3. Build a code-native 2D/isometric result first. Add Three.js through React Three Fiber only as P1 after the P0 site is deployed and smooth.
4. Establish playful design tokens: warm cardboard color, bright accent colors, rounded controls, large numeric inputs, and high-contrast text.
5. Create README sections for setup, product decisions, data sources, Codex collaboration, and later demo access.
6. Add `LICENSE` and `ATTRIBUTIONS.md` placeholders before third-party data/assets are included.
7. Make the first dated commit before core implementation only when the user authorizes commits.

### Sub-task 2: Fit-calculation domain engine

1. Define shape, dimensions, protective thickness, box, orientation, fit result, and ranking types.
2. Convert each supported shape into conservative packed bounds:
   - rectangular/flat: length, width, height;
   - cylinder: diameter, diameter, height;
   - sphere: diameter on all axes;
   - irregular: user-measured rectangular bounding box.
3. Add twice the per-side protection thickness and twice the optional per-side safety tolerance to each affected axis.
4. Generate normalized unique axis permutations generically: up to six for rectangular bounds, three for cylinders, and one for spheres.
5. Compare every orientation against usable box dimensions.
6. Compare decimal centimeters using a documented `1e-6` epsilon; never hide a material shortfall by rounding.
7. Rank fitting boxes by unused volume, worst-axis clearance, then stable catalog/code order. Filtering handles catalog preference.
8. Define nearest too-small as the box with the minimum summed positive axis deficits across its best orientation, then volume and stable catalog/code order. Define next-larger as the second ranked fitting result.
9. Unit-test exact fit, epsilon boundaries, repeated-dimension permutation deduplication, rotated fit, protection/tolerance addition, cylinder orientation, sphere fit, no-fit, deterministic ties, and catalog schema.

### Sub-task 3: Source-backed box catalogs

1. Research official Thailand Post folded box sizes and at least one authorized source for common Thai A/B/C sizes.
2. Treat at least one catalog with verified internal/usable dimensions as a P0 data gate. If no such source can be established, change all product/demo language to likely-candidate and do not claim guaranteed clearance.
3. Preserve raw published dimensions separately from optional usable dimensions; record product family, catalog, code, axis order, source URL, source date, and dimension type.
4. Keep Thailand Post and A/B/C entries separate in data while allowing an all-catalog search.
5. Add catalog validation for positive dimensions, unique IDs, source presence, and dimension-type presence.
6. Only verified internal/usable dimensions produce a definite fit recommendation. External or unspecified dimensions produce a likely-candidate result unless a sourced wall/usable allowance is stored explicitly.
7. Display a short source/dimension disclaimer in results; do not imply a universal Thai standard where vendors differ.

### Sub-task 4: Mobile input and result experience

1. Build a one-screen flow with large controls and progressive disclosure.
2. Select shape first; reveal only its required measurements.
3. Provide protective-material presets plus a clearly labeled custom per-side thickness.
4. Calculate immediately after valid input; avoid a multi-page wizard.
5. Search all catalogs by default and provide filter chips for All, Thailand Post, and A/B/C.
6. Show recommended code, folded dimensions, best orientation, remaining clearance, source, and a simple reason.
7. Use Thai primary labels with concise English helper labels where judges need clarity.
8. Use `inputmode="decimal"`, explicit cm units, fieldset/label semantics, 44px minimum touch targets, visible focus, and a polite `aria-live` result summary.
9. Handle invalid numbers, no matching box, and unknown dimension-type warnings without dead ends.

### Sub-task 5: Interactive box visualization

1. Ship an accessible code-native SVG/CSS isometric render of the item and protective envelope inside the recommended box.
2. Provide a simple front/isometric view toggle; P0 does not require drag, zoom, or canvas controls.
3. Show the nearest too-small box faintly on one side and the next-larger box faintly on the other.
4. Encode states through shape, labels, and color rather than color alone.
5. Scale the scene by relative dimensions so extreme box ratios remain visible.
6. Keep numeric results outside the graphic and provide accessible text equivalents and reduced-motion behavior.
7. Test 320px plus one common mobile viewport before adding decorative effects.
8. P1 only after deployed P0: add touch rotation, constrained zoom, reset/keyboard alternatives, accessible canvas naming, and touch behavior that preserves page scrolling.

### Sub-task 6: Verification, deployment, and submission package

1. Run unit tests, production build, and mobile-width interaction smoke tests.
2. Manually verify representative rectangular, flat, bottle, ball, and irregular-item cases.
3. Verify source links and catalog warnings.
4. Deploy a free-to-test static site and test it in a clean browser session.
5. Complete README with actual Codex/GPT-5.6 contributions and the developer's key decisions.
6. Create English Devpost description, testing instructions, screenshots, and a sub-three-minute video script.
7. Record a public YouTube demo with audio showing the app plus Codex/GPT-5.6 workflow.
8. Obtain the primary task's `/feedback` Session ID and complete the Devpost form before the deadline.
9. Reserve the final day for clean-browser testing, recording/uploading the video, checking English translations, and submitting Devpost.

## Risks & open questions

- Published box dimensions may be external or ambiguous. Do not overstate usable space; record uncertainty and prefer conservative handling.
- Common A/B/C codes may vary by vendor. Treat them as a named catalog with sources, not a national standard.
- Exact free-angle packing of cylinders or irregular shapes is out of scope; use documented conservative bounds.
- Three.js and share-image are P1. They must not delay a deployed P0 calculator with an isometric comparison.
- The current Codex model selection is not independently verified in the repository. Confirm GPT-5.6 before implementation begins.
- Deployment provider and public/private repository choice remain user-controlled external decisions.

## Verification

- Domain: all unit cases pass and results are stable across repeated runs.
- Data: every catalog record validates and displays its source/dimension type.
- UI: a first-time user can get a result with one shape selection, dimensions, and one protection choice.
- Mobile: no horizontal overflow at 320 px; touch targets are usable; scene controls do not block page scrolling unexpectedly.
- Accessibility: inputs have labels, result text exists outside 3D canvas, focus order works, and reduced motion is respected.
- Build: production build succeeds without warnings that affect operation.
- Deployment: public test URL works in a clean browser without login or payment.
- Submission: README, public video, repository access, English materials, and `/feedback` Session ID all satisfy the official checklist.
