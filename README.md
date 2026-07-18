# BoxKhaNad

**Know the right box size before you start packing.**

BoxKhaNad is a mobile-first parcel-box calculator for Thailand. Enter an item's shape and measurements, choose protective-material thickness, and compare the smallest likely box with nearby alternatives.

> Submission note: the project owner should review and rewrite the final Devpost description in their own voice. This README may be improved with Codex, as allowed by the Build Week guidance, but it must stay accurate to the shipped product.

## Why it exists

People often know the size of an item but still have to mentally add bubble wrap, rotate three dimensions, and compare several box tables. A numerical answer alone also does not make the fit easy to trust. BoxKhaNad turns that process into one small visual flow.

## Current features

- Four item modes: rectangular/flat, cylinder, sphere, and irregular bounding box
- Mobile dimension sliders with minus/plus controls and direct numeric entry
- Protective-material presets or a custom thickness per side
- Six-axis rotation checks with duplicate rotations removed
- Thailand Post Ready-Made A-F and a separately sourced common Thai A/B/C-family catalog
- All-catalog search with filters
- Selectable overlapping isometric boxes for too small, likely fit, and next larger, with eased size transitions
- Mobile-first Thai interface with English-friendly data labels
- Source and uncertainty warning for every recommendation
- No account, backend, or runtime AI required

## Important accuracy limitation

The sources used by the current P0 dataset publish a `Size`, but they do not consistently establish usable internal dimensions. BoxKhaNad therefore says **likely candidate**, not guaranteed fit. Users should verify the actual inside dimensions before buying boxes in quantity.

The project deliberately keeps:

- Thailand Post Ready-Made A-F;
- Thailand Post Normal Carton No.1-No.6; and
- manufacturer-specific A/B/C variants

as separate product families. Similar codes can have different dimensions across vendors.

## How the calculator works

1. Convert the selected shape into a conservative rectangular bound.
2. Add protective material to both opposite sides of every axis.
3. Add a small measurement tolerance to both sides.
4. Try every unique axis-aligned rotation.
5. Keep boxes whose published/usable dimensions contain one rotation.
6. Rank matches by the least unused volume, then worst axis gap and stable catalog/code order.
7. Show the next candidate only when it has strictly more spare volume, so equal-size catalog duplicates are not mislabeled as larger.

For example, 1 cm of protection adds 2 cm to length, 2 cm to width, and 2 cm to height.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run test:unit
npm run lint
npm run build
npm test
```

Unit tests cover protection math, shape bounds, unique rotations, rotated fits and visuals, uncertainty language, no-fit results, deterministic ranking, equal-size catalog duplicates, decimal boundaries, and the real catalog data. Rendered checks cover key Thai output, accessibility state, minimum touch-target rules, and social metadata.

## Project structure

- `app/lib/box-fit.ts` - the calculation rules
- `app/data/boxes.ts` - source-backed catalog facts
- `app/components/BoxCalculator.tsx` - inputs and result flow
- `app/components/BoxComparison.tsx` - code-native box visualization
- `tests/box-fit.test.ts` - understandable examples of the core rules
- `docs/LEARNING_GUIDE_TH.md` - Thai code walkthrough for the project owner
- `docs/BOX_DATA_RESEARCH.md` - source research and uncertainty decisions

The interface uses React and code-native CSS geometry/animation; it does not require Three.js, canvas, or runtime AI.

## Collaboration with Codex and GPT-5.6

The project started from the owner's everyday packing problem and product direction: few taps on mobile, protection included, playful visuals, separate box catalogs, and faint neighboring suggestions.

Codex helped turn those decisions into:

- a documented product scope and risk review;
- a deterministic fit algorithm and tests;
- source research that prevented external/unspecified sizes from being presented as guaranteed internal fit;
- an accessible mobile interface and code-native visual comparison;
- build, test, and submission checks.

The owner made the core product decisions and reviews the code through the Thai learning guide and worked examples. Before submission, record the specific part built or reviewed while GPT-5.6 was selected and add the primary `/feedback` Session ID to Devpost. Do not claim a model was used where the interface/session evidence does not confirm it.

Primary `/feedback` Session ID: `019f70ce-e666-7671-8061-5f8ab4ae2ce7`

## Data and licensing

Minimal factual dimensions are transcribed with source links; source layouts, photos, logos, and marketing copy are not reused. See [ATTRIBUTIONS.md](ATTRIBUTIONS.md).

Project code is available under the [MIT License](LICENSE).
