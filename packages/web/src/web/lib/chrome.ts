/**
 * The amber chrome, in one place.
 *
 * The workspace and admin menus are amber-filled tiles, and the header controls that open a
 * menu match them — so the fill, the hover and the open state are defined here once instead of
 * being retyped in five components and drifting apart.
 *
 * `amber-hover` rather than `amber-deep` on hover: `amber-deep` is dark enough to swallow the
 * `on-amber` ink label, while `amber-hover` stays a light fill. The ink hairline is an inset
 * shadow, not a border, so it never moves the control by a pixel.
 */

/** Filled amber control — a nav tile, or a header trigger that opens a menu. */
export const amberFill =
  "bg-amber text-on-amber transition-[background-color,box-shadow] duration-150 " +
  "hover:bg-amber-hover hover:shadow-[inset_0_0_0_1px_var(--c-on-amber)]";

/** The ink hairline on its own, for a trigger whose menu is already open. */
export const amberRing = "shadow-[inset_0_0_0_1px_var(--c-on-amber)]";

/**
 * A row inside an open dropdown: plain until the pointer arrives, then the same amber fill.
 * `group` is on the row, so any icon inside can follow with `group-hover:text-on-amber`.
 */
export const amberRow =
  "group transition-colors duration-150 hover:bg-amber hover:text-on-amber";
