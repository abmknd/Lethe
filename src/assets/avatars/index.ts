/**
 * The cast, exported from Figma's `Avatar Image` component set.
 *
 * The set has 24 named people (`Type=avatar-elena-voss` and so on) — they are
 * real assets in the file, not placeholders, which is why the app shell stopped
 * using Unsplash URLs. Each exports at 72 (Avatar's `xxl`) and scales down;
 * nothing in the product renders one larger.
 *
 * ONLY people who are in that set appear here. Four names used to be re-exported
 * from `src/assets/dummies` — Anika Sharma, Marcus Webb, Priya Nair, Sofia
 * Mendes — so that invented demo content had something to render. They are gone:
 * a face in this barrel is a claim that Figma drew that person, and a
 * placeholder borrowed from the pre-rebrand dummies made that claim falsely.
 *
 * To add one: find its node in `Avatar Image` (924:1537), export at 1x, drop the
 * PNG in this folder, add a line below.
 */
import abelKant from './abel-kant.png';
import anyaKurosawa from './anya-kurosawa.png';
import elenaVoss from './elena-voss.png';
import georgeTracy from './george-tracy.png';
import irisMorrow from './iris-morrow.png';
import marcusJin from './marcus-jin.png';
import mayaFrost from './maya-frost.png';
import montyWei from './monty-wei.png';
import theoLark from './theo-lark.png';

export const AVATARS = {
  'abel-kant': abelKant,
  'anya-kurosawa': anyaKurosawa,
  'elena-voss': elenaVoss,
  'george-tracy': georgeTracy,
  'iris-morrow': irisMorrow,
  'marcus-jin': marcusJin,
  'maya-frost': mayaFrost,
  'monty-wei': montyWei,
  'theo-lark': theoLark,
} as const;

export type AvatarName = keyof typeof AVATARS;
