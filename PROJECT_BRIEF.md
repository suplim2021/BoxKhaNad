# BoxKhaNad - Hackathon Project Brief

Updated: 2026-07-17

## One-line pitch

BoxKhaNad helps Thai mobile users find the smallest practical parcel box after accounting for protective padding, then shows the fit visually instead of returning only numbers.

Short pitch: Know the right box size before you start packing.

## Problem

People shipping a product often know the item's dimensions but still have to mentally calculate:

- its packed dimensions after bubble wrap or other padding;
- whether it fits when rotated;
- which locally available box is the closest fit;
- whether the chosen box wastes space or leaves too little protection.

A conventional calculator returns dimensions, but does not build confidence that the item will actually fit.

## Proposed experience

Mobile-first, usable in a few actions:

1. Enter item length, width, and height.
2. Pick protective-material thickness: none, light, normal, or custom.
3. See the recommended box immediately.

The result screen shows:

- a responsive isometric box view containing the padded item;
- the best orientation and remaining clearance on each axis;
- the smallest recommended box as the main result;
- the nearest smaller and larger alternatives as faint "ghost" boxes;
- catalog filters for all boxes, Thailand Post boxes, and common A/B/C boxes;
- a plain-language warning when the fit is too tight.

GPT-5.6 is part of the documented development workflow, not a runtime product feature. The calculator remains deterministic and does not require an AI/API call from its users.

## Recommendation: 2D, 3D, or hybrid

Use a hybrid "2.5D" result:

- P0 default: code-native static/responsive SVG or CSS isometric view with an optional front/isometric view toggle.
- Clarity layer: dimension labels and a simple clearance diagram.
- Fallback: static 2D diagram for low-power devices and accessibility.
- P1 enhancement: touch drag-to-rotate, constrained zoom, and transparent 3D after P0 is deployed.

This gives a memorable demo without making the core calculation depend on a complex 3D engine.

## Calculation model

Inputs:

- item geometric shape and dimensions in cm;
- protective-material thickness per side `(pL, pW, pH)`, or a single uniform preset;
- optional safety tolerance for measurement and manufacturing variation.

Packed dimensions:

`packed axis = item axis + (2 * protection per side) + (2 * tolerance per side)`

For each box, test all six axis-aligned rotations of the packed item. A box is valid when every oriented item axis is less than or equal to the corresponding internal box axis.

Rank valid boxes by:

1. smallest unused internal volume;
2. smallest maximum axis clearance;
3. stable catalog and box-code order.

Important: box data must identify whether dimensions are internal or external. Recommendations should use internal dimensions after folding; if a source only publishes external dimensions, label it and apply a documented allowance rather than silently treating it as usable space.

## Box dataset

Start with a small, source-backed dataset rather than claiming every vendor uses one universal Thai standard.

Thailand Post publishes multiple distinct carton product families. The previously noted "Normal Carton" No. 1-6 sizes are a large-carton family and must not be presented as the common consumer A-F ready-made set:

- No. 1: 30 x 100 x 30 cm
- No. 2: 31 x 36 x 13 cm
- No. 3: 31 x 36 x 26 cm
- No. 4: 55 x 100 x 55 cm
- No. 5: 40 x 45 x 35 cm
- No. 6: 45 x 55 x 40 cm

Normal Carton source: https://www.thailandpost.co.th/un/article_detail/product/573/167

Before implementation, add and separately name the official Thailand Post ready-made A-F catalog from its own source. Preserve each family's published name and never merge A-F, vendor A/B/C, and No. 1-6 into one supposed universal standard.

The common Thai e-commerce box codes (such as A/B/C and variants) should be added only after verifying dimensions and whether they are internal or external from an authorized source. The UI can show the source and last-verified date for each catalog.

## Hackathon fit

Recommended track: **Apps for Your Life**.

Why it fits:

- consumer problem encountered in everyday selling and shipping;
- specific audience: occasional shippers, online sellers, and small businesses;
- visual proof makes the benefit immediately understandable;
- a working calculator plus interactive fit viewer is non-trivial but feasible within Build Week.

To strengthen judging:

- Technological implementation: preserve the core build in one Codex thread; document how Codex and GPT-5.6 helped implement rotation testing, dataset validation, responsive UI, and tests.
- Design: optimize for one-handed use, large numeric controls, instant result updates, and no required account.
- Impact: demonstrate fewer wrong box purchases, less filler, and lower wasted volume.
- Idea quality: emphasize visual fit confidence and Thailand-specific box catalogs, not merely dimension arithmetic.

## Submission compliance checklist

- [ ] Join the Devpost hackathon and register before the deadline.
- [ ] Confirm entrant is of legal age and meets eligibility requirements.
- [ ] Build during the submission period with Codex and GPT-5.6.
- [ ] Keep dated Git commits and Codex session evidence.
- [ ] Put most core implementation in one Codex Project thread.
- [ ] Obtain and submit that thread's `/feedback` Codex Session ID.
- [ ] Deploy a working, free-to-test website through the judging period.
- [ ] Prepare an English project description and testing instructions.
- [ ] Record a public YouTube demo with audio, under 3 minutes.
- [ ] Demo both the working product and how Codex plus GPT-5.6 were used.
- [ ] Provide a public licensed repository, or share a private repository with `testing@devpost.com` and `build-week-event@openai.com`.
- [ ] README includes setup, sample data, key human decisions, and Codex/GPT-5.6 collaboration.
- [ ] Include a suitable LICENSE plus data/asset attribution.
- [ ] Use only owned or properly licensed code, data, images, trademarks, and music.
- [ ] Submit by 2026-07-22 07:00 Asia/Bangkok (2026-07-21 17:00 PDT).

Official rules: https://openai.devpost.com/rules

## MVP scope

P0 - must ship before visual enhancements:

- mobile-first item dimension entry;
- protective-material presets plus custom thickness;
- geometric-shape selection: rectangular/flat, cylinder/bottle, sphere/ball, and irregular-item bounding box;
- six-orientation fit calculation;
- source-backed Thailand Post and common A/B/C box catalogs;
- best-fit and one larger alternative;
- code-native 2D/isometric visualization with faint smaller/larger catalog alternatives;
- catalog filters, while searching all catalogs by default;
- basic calculation tests and responsive checks;
- deployed demo and submission-ready README.

P1 - only after P0 is deployed and stable:

- touch-rotatable Three.js visualization;
- shareable result URL or image;
- multiple items in one box;
- custom user box sizes;
- estimated void-fill volume or volumetric weight;
- additional Thai box catalogs;
- Thai/English UI toggle.

Out of scope for Build Week unless ahead of schedule:

- automatic real-world measurement from an unscaled photo;
- arbitrary-shape 3D packing optimization;
- shipping checkout or carrier integrations;
- a complete inventory/warehouse system.

## Three-minute presentation outline

1. **0:00-0:20 - Problem:** choosing a box means mentally adding padding, rotating dimensions, and hoping it fits.
2. **0:20-0:40 - Promise:** BoxKhaNad finds the smallest practical local box and shows the fit.
3. **0:40-1:35 - Live demo:** enter dimensions, choose protection, reveal the recommendation, switch the isometric view, and compare the ghost alternatives.
4. **1:35-1:55 - Trust:** show orientation, clearance, box source, and why a smaller box fails.
5. **1:55-2:25 - Codex/GPT-5.6:** show the main Codex task, algorithm/test contribution, and the developer's key product decisions.
6. **2:25-2:50 - Impact:** fewer incorrect boxes, less filler, faster packing, better mobile experience.
7. **2:50-3:00 - Close:** "Measure once. Pack with confidence."

## Confirmed product decisions

1. Serve both occasional senders and online sellers.
2. Search all catalogs by default, with later filters for Thailand Post and common A/B/C boxes.
3. Treat protective-material thickness as a per-side value: 1 cm adds 2 cm to each affected packed axis.
4. Show nearby box alternatives as faint geometric box forms around the recommendation.
5. Use GPT-5.6 for the documented build workflow only, not as a runtime calculator feature.
6. Use a playful personal-project visual style, not a formal corporate or professional style.
7. Support four MVP shape modes: rectangular/flat, cylinder/bottle, sphere/ball, and irregular-item bounding box.
8. Calculate one item at a time for MVP.
9. Show three visual choices: a too-small ghost, the recommended box, and the next-larger ghost.
10. A box with verified internal dimensions may be labeled "fits"; external or unspecified dimensions may only be labeled a likely candidate unless a sourced usable-size policy exists.

## Shape research notes

Current Thailand e-commerce category reporting highlights fashion, beauty/personal care, food and beverages, and electronics. These map well to a deliberately small geometry model:

- clothes, books, phones, and general products: rectangular or flat bounding box;
- bottles, jars, cans, and rolled items: cylinder;
- balls and round products: sphere;
- shoes, toys, appliances, and irregular products: measured rectangular bounding box.

This is a conservative fit calculator, not an arbitrary-shape nesting engine. Carrier guidance also treats irregular items through protective outer packaging and clearance rather than exact mesh packing.

Research sources:

- Thailand e-commerce overview: https://www.trade.gov/country-commercial-guides/thailand-ecommerce
- ETDA e-commerce survey catalog: https://opendata.etda.or.th/en/group/e-commerce-survey
- DHL electronics packing guide: https://mrt2.ap.dhl.com/reverse/content/dam/downloads/global/en/packing-with-care/dhl_express_electronics_packing_guide_en.pdf.coredownload.pdf
- UPS packaging guidance: https://www.ups.com/us/en/support/shipping-support/packaging-tips
