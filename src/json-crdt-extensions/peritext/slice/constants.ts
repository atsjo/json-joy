/**
 * Specifies whether the start or the end of the cursor is the "anchor", e.g.
 * the end which does not move when user changes selection. The other
 * end is free to move, the moving end of the cursor is "focus". By default
 * "anchor" is usually the start of the cursor.
 */
export enum CursorAnchor {
  Start = 0,
  End = 1,
}

/**
 * Built-in slice types.
 */
export enum SliceTypes {
  Cursor = -1,
  Paragraph = 0,
}

export enum SliceHeaderMask {
  X1Anchor = 0b1,
  X2Anchor = 0b10,
  Behavior = 0b11100,
}

export enum SliceHeaderShift {
  X1Anchor = 0,
  X2Anchor = 1,
  Behavior = 2,
}

export enum SliceBehavior {
  /**
   * A Split slice, which is used to mark a block split position in the document.
   * For example, paragraph, heading, blockquote, etc.
   */
  Marker = 0b000,

  /**
   * Appends attributes to a stack of attributes for a specific slice type. This
   * is useful when the same slice type can have multiple attributes, like
   * inline comments, highlights, etc.
   */
  Stack = 0b001,

  /**
   * Overwrites the stack of attributes for a specific slice type. Could be used
   * for simple inline formatting, like bold, italic, etc.
   */
  Overwrite = 0b010,

  /**
   * Removes all attributes for a specific slice type. For example, could be
   * used to re-verse inline formatting, like bold, italic, etc.
   */
  Erase = 0b011,

  /**
   * Used to mark the user's cursor position in the document.
   *
   * @todo Consider removing this.
   */
  Cursor = 0b100,
}

export enum SliceBehaviorName {
  Marker = SliceBehavior.Marker,
  Stack = SliceBehavior.Stack,
  Overwrite = SliceBehavior.Overwrite,
  Erase = SliceBehavior.Erase,
  Cursor = SliceBehavior.Cursor,
}

/**
 * Specifies `vec` offsets in the {@link SliceView}.
 */
export enum SliceTupleIndex {
  Header = 0,
  X1 = 1,
  X2 = 2,
  Type = 3,
  Data = 4,
}
