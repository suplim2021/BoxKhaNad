# Box catalog source research

Checked: 2026-07-18 (Asia/Bangkok)

## P0 decision

Ship the first catalog in **likely-candidate mode only**. Do not display `fits`, `will fit`, or a guaranteed-clearance claim for any Thailand Post or common A/B/C-family entry below.

Reason: the official Thailand Post documents say only `ขนาด / Size`; they do not say internal/usable, external, flat blank, or assembled-after-folding dimensions. The manufacturer sources either leave the dimension type unspecified or explicitly publish external dimensions. No primary or authorized SKU source found in this pass establishes usable/internal dimensions for the whole requested catalog.

Implementation consequences:

- Preserve the published tuple verbatim as `rawPublishedDimensions`; set `dimensionType: "unspecified"` or `"external"` exactly as supported below.
- Do not derive internal size from flute type, wall thickness, or a generic subtraction.
- Treat Thailand Post Ready-Made Carton A-F, Thailand Post Normal Carton No.1-No.6, and each manufacturer's A/B/C family as separate catalogs.
- UI wording: `กล่องที่น่าจะเหมาะ` / `likely candidate`; add `ตรวจขนาดภายในของกล่องจริงก่อนซื้อ`.
- A future definite `fits` result requires a manufacturer/SKU page or written specification that explicitly states internal/usable dimensions. A user-entered measured internal size could also support a definite result, but is outside this research dataset.

## 1. Thailand Post Ready-Made Carton A-F (official)

Primary source: [Thailand Post product page](https://www.thailandpost.co.th/un/article_detail/product/573/155) and its linked [official Ready-Made Carton PDF](https://file.thailandpost.com/upload/content/boxes-fee_11560.pdf).

Published date: not displayed in the page or PDF. Checked 2026-07-18.

The PDF calls this family `กล่องสำเร็จรูป (Ready-Made Carton)`, says there are six sizes, and labels the numeric column only `ขนาด / Size`.

| Official item wording | Raw published size (cm) | Axis order | Dimension type | Product use |
|---|---:|---|---|---|
| กล่องสำเร็จรูปแบบ ก. / Ready-Made Carton type A | 14 x 20 x 6 | Not stated | Unspecified | Likely candidate only |
| กล่องสำเร็จรูปแบบ ข. / type B | 17 x 25 x 9 | Not stated | Unspecified | Likely candidate only |
| กล่องสำเร็จรูปแบบ ค. / type C | 20 x 30 x 11 | Not stated | Unspecified | Likely candidate only |
| กล่องสำเร็จรูปแบบ ง. / type D | 22 x 35 x 14 | Not stated | Unspecified | Likely candidate only |
| กล่องสำเร็จรูปแบบ จ. / type E | 24 x 40 x 17 | Not stated | Unspecified | Likely candidate only |
| กล่องสำเร็จรูปแบบ ฉ. / type F | 30 x 45 x 20 | Not stated | Unspecified | Likely candidate only |

Important: `Ready-Made Carton` is the official English product name, not evidence that the numbers are internal or measured after folding. The source does not use `ขนาดภายใน`, `ขนาดภายนอก`, `usable`, `internal`, `external`, or an equivalent folded/assembled qualifier.

## 2. Thailand Post Normal Carton No.1-No.6 (official, separate family)

Primary source: [Thailand Post Normal Carton product page](https://www.thailandpost.co.th/un/article_detail/product/573/167) and its linked [official Normal Carton PDF](https://file.thailandpost.com/upload/content/normal%20carton_86934.pdf).

Published date: not displayed in the page or PDF. Checked 2026-07-18.

| Official item wording | Raw published size (cm) | Axis order | Dimension type | Product use |
|---|---:|---|---|---|
| กล่องธรรมดา หมายเลข 1 / Normal Carton No.1 | 30 x 100 x 30 | Not stated | Unspecified | Likely candidate only |
| Normal Carton No.2 | 31 x 36 x 13 | Not stated | Unspecified | Likely candidate only |
| Normal Carton No.3 | 31 x 36 x 26 | Not stated | Unspecified | Likely candidate only |
| Normal Carton No.4 | 55 x 100 x 55 | Not stated | Unspecified | Likely candidate only |
| Normal Carton No.5 | 40 x 45 x 35 | Not stated | Unspecified | Likely candidate only |
| Normal Carton No.6 | 45 x 55 x 40 | Not stated | Unspecified | Likely candidate only |

Do not map these six numbered cartons to Ready-Made A-F. They are independently named and independently sized official product families. The official description also characterizes Normal Carton as a large brown carton, whereas Ready-Made Carton is a distinct six-type product.

## 3. Common Thai e-commerce A/B/C-family boxes

### Authorized manufacturer catalog: Hong Thai

Source: [Hong Thai, “กล่องไปรษณีย์ ฝาชน ไซส์มาตรฐานมีกี่ขนาด”](https://hongthaipackaging.com/blog/how-many-standard-size-postal-mail-boxes/).

Published date: page displays `27 ส.ค.` but no year; checked 2026-07-18. The site identifies Hong Thai as the seller/manufacturer and separates KA and KT/FSC product lines. The two lines publish the same tuples below.

| Manufacturer code | Source wording (ย x ก x ส) | Dimension type | Product use |
|---|---:|---|---|
| A+6 | 20 x 14 x 12 cm | Unspecified | Likely candidate only |
| A (ก) | 20 x 14 x 6 cm | Unspecified | Likely candidate only |
| 2A | 19 x 12 x 14 cm | Unspecified | Likely candidate only |
| B (ข) | 25 x 17 x 9 cm | Unspecified | Likely candidate only |
| 2B | 25 x 17 x 18 cm | Unspecified | Likely candidate only |
| B+7 | 25 x 17 x 16 cm | Unspecified | Likely candidate only |
| C (ค) | 30 x 20 x 11 cm | Unspecified | Likely candidate only |
| CD | 15 x 15 x 15 cm | Unspecified | Likely candidate only |
| C+9 | 30 x 20 x 20 cm | Unspecified | Likely candidate only |

The page explicitly gives the axis order as `ย x ก x ส` (length x width x height), but never identifies the values as inside, outside, usable, flat, or folded. Axis order is therefore known; dimension type is not.

### Manufacturer counter-check: T.C.M. Paperbox

Source: [T.C.M. guide to choosing corrugated-box size](https://www.thaipaperbox.com/index.php/article/how-to-choose-packaging-size), updated 2026-05-03; checked 2026-07-18.

T.C.M. explicitly labels its table `ขนาดภายนอก (กว้าง x ยาว x สูง ซม.)` (external width x length x height):

| Code | Explicit external size (cm) | Product use |
|---|---:|---|
| A | 14 x 20 x 8 | Likely candidate only |
| B | 17 x 25 x 9 | Likely candidate only |
| C | 20 x 30 x 11 | Likely candidate only |

This source is valuable because it proves that at least one manufacturer publishes these common labels as **external**, and its A height (8 cm) differs from Thailand Post's raw A tuple (6 cm). Do not silently merge these records.

### Manufacturer counter-check: Trangprint Group

Source: [Trangprint Group postal boxes](https://www.trangprint.com/parcel-box), publication date not displayed; checked 2026-07-18.

Trangprint is a manufacturer/seller and publishes A 14 x 20 x 6, B 17 x 25 x 9, C 20 x 30 x 11, plus 2A 14 x 20 x 12, 2B 17 x 25 x 18, CD 15 x 15 x 15, and C+8 19.8 x 30 x 19 cm. It does not state axis order or dimension type, so all are likely candidates only.

This also demonstrates code drift between vendors: Hong Thai publishes `2A = 19 x 12 x 14` and `C+9 = 30 x 20 x 20`, while Trangprint publishes `2A = 14 x 20 x 12` and `C+8 = 19.8 x 30 x 19`. Codes beyond the core A/B/C names are not safe universal identifiers.

## Rejected evidence for definite fit

- [h-ansarian article](https://h-ansarian.org/packagingknowledge/what-is-postal-box/) states that its A-I table is measured inside and also warns that sizes are approximate and vary by manufacturer. Its own About page describes an information-aggregation website, not a manufacturer, carrier, standards body, or seller specification. It is useful corroboration, but not strong enough to turn a specific catalog record into verified usable space.
- [Dezpax Size S product](https://www.dezpax.com/commerce-packaging/product/%E0%B8%81%E0%B8%A5%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%A5%E0%B8%B9%E0%B8%81%E0%B8%9F%E0%B8%B9%E0%B8%81-%E0%B8%AB%E0%B8%B9%E0%B8%8A%E0%B9%89%E0%B8%B2%E0%B8%87-Size-S-14x20x6-%E0%B8%8B%E0%B8%A1.-%E0%B8%A5%E0%B8%AD%E0%B8%99-B-%E0%B8%9E%E0%B8%B4%E0%B8%A1%E0%B8%9E%E0%B9%8C%E0%B8%AA%E0%B8%B5-%E0%B8%94%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%99%E0%B8%AD%E0%B8%81%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%94%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B9%83%E0%B8%99%E0%B8%81%E0%B8%A5%E0%B9%88%E0%B8%AD%E0%B8%87/) is a good example of a SKU that explicitly separates external 20 x 14 x 6 from internal 19 x 14 x 6 cm. It is not an A/B/C-family SKU and therefore should not be used to invent an allowance for other boxes.

## Attribution and licensing

- No open-data or content-reuse license was found on the cited Thailand Post product PDFs. Store only the factual names, sizes, source URLs, and check date; attribute Thailand Post and link to the originals. Do not copy the PDF layout, photos, or Thailand Post logo.
- Hong Thai's page footer says `Copyright 2026 ... สงวนลิขสิทธิ์ตามกฎหมาย`; T.C.M. says `Copyright 2010-2026 All Rights Reserved`; Trangprint says `© Copyright TRANGPRINT GROUP 2022 All Rights Reserved`. Transcribe only the minimal factual dimensions, cite the vendor, and do not reuse their prose, product photos, tables as images, or branding.
- Use company and product-family names only to identify the source/catalog; do not imply endorsement, partnership, certification of BoxKhaNad, or a universal Thai standard.

## Recommended catalog metadata

Each record should keep: `catalogOwner`, `catalogFamily`, `code`, `rawPublishedDimensions`, `publishedAxisOrder`, `dimensionType`, `sourceUrl`, `sourcePublishedDate`, `sourceCheckedDate`, and `fitClaim`. For all records above, `fitClaim` is `likely-candidate`; only T.C.M.'s A/B/C records have `dimensionType: external`, while the others remain `unspecified`.
