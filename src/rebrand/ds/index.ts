/**
 * THE RELETHE DESIGN SYSTEM, AS CODE.
 *
 * One module per Figma component, named as Figma names it, with the node id in
 * the file's own doc comment. A screen imports from here and never
 * re-implements a component inline — the round of mismatches that produced this
 * folder came from exactly that: components inferred from a frame's geometry
 * and re-typed at each call site.
 *
 * THE RULES THIS FOLDER KEEPS
 *
 *   1. Read the node. Every number, token and glyph comes from
 *      `get_design_context` on a named node, never from a screenshot and never
 *      from a frame's bounding boxes. Geometry does not carry which token a
 *      fill is, or which of three `chat` glyphs a control uses.
 *   2. Never draw a glyph. Icons come from `src/assets/system_icons`, generated
 *      out of Figma by `scripts/import-figma-icons.mjs`. The two exceptions are
 *      a circle and a hairline, which have no drawing in them.
 *   3. Figma strokes are INSIDE the shape. A specified box paints its stroke as
 *      an inset box-shadow; a CSS border would push a 32-tall Button to 35.
 *   4. Figma's variant axes are the props, minus the ones the browser already
 *      owns. `Status=hover` is a CSS state, not an argument.
 *
 * WHAT IS NOT HERE YET
 *
 *   Badge Icon `Shape=star` — no surviving frame places one. The circle is
 *   exact in CSS; the star waits until a screen asks for it.
 *
 * WHERE IT IS USED
 *
 *   `../app/AppShell.tsx` is the app — FEED / MATCHES / COMMUNITIES. The
 *   CONNECT surface next to it is retired and frozen; do not extend it.
 */

export * from './EmptyState';
export { ShaderCanvas } from './ShaderCanvas';
export type { ShaderName } from './shaders';
export * from './SuggestedProfile';
export * from './type';

export { Icon, type Glyph } from './Icon';

export { Avatar, AvatarStack, AVATAR_SIZE, type AvatarSize } from './Avatar';
export { BadgeButton } from './BadgeButton';
export { BadgeIcon } from './BadgeIcon';
export { Button, ButtonText, ButtonTextCap } from './Button';
export { Check } from './Check';
export { Chip } from './Chip';
export { CompactIcon, CompactItem } from './Compact';
export { EnterButton } from './EnterButton';
export { FieldNormal, FieldButtoned, type FieldStatus } from './Field';
export { Hint, InfoText } from './Hint';
export { Input, TextInput, TextField } from './Input';
export { Label } from './Label';
export { BirthdayMeta, GenderMeta, LocationMeta, MetaRow, type GenderType } from './Meta';
export { Divider, NavItem, SectionLabel, Sidebar, TextIconNav, ItemButtonText } from './NavItem';
export { Nob } from './Nob';
export { Placeholder, type PlaceholderSize } from './Placeholder';
export { QuestionItem, Questionnaire, TextIconMenu } from './Questionnaire';
export { SwitchButton, SwitchToggle } from './Switch';
export { NumberSymbol, Symbols } from './Symbols';
export { NavButtonText, TabBar, ToggleButton, type NavButtonColor } from './TabBar';
export { BadgeText, Tag } from './Tag';
