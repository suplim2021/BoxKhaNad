# Glossary

## Item dimensions

The measured size of the unwrapped item.

## Protective-material thickness

The thickness of bubble wrap, foam, paper, or other protection on each side of an item. A 1 cm thickness on both opposite sides adds 2 cm to that packed axis.

Thai UI meaning: protective cushioning thickness on each side.

## Packed dimensions

The conservative dimensions after protective material and any explicit safety allowance are added.

## Box catalog

A source-backed collection of named box sizes, such as Thailand Post or common Thai A/B/C box codes.

## Folded dimensions

The dimensions of an assembled box. The catalog must additionally record whether published values are internal, external, or unspecified.

## Fit

An item definitely fits only when its conservative packed dimensions can be aligned with verified internal/usable box dimensions on every axis. External or unspecified dimensions can produce only a likely-candidate result.

## Orientation

One mapping between item axes and box axes. Rectangular items have up to six axis-aligned orientations; cylinders have three unique primary-axis orientations; spheres have one.

## Bounding box

The smallest practical rectangular measurement that fully encloses an irregular item. This is a user measurement, not automatic shape recognition.

## Ghost box

A faint comparison box rendered near the recommendation. MVP shows one too-small box and one next-larger box.

## Unused volume

Box internal volume minus the conservative packed-item bounding volume. It helps rank boxes but does not by itself guarantee good protection.
