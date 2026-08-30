/**
 * The cast, exported from Figma's `Avatar Image` component set.
 *
 * The set has 24 named people (`Type=avatar-elena-voss` and so on) — they are
 * real assets in the file, not placeholders, which is why the app shell stopped
 * using Unsplash URLs. Each exports at 72 (Avatar's `xxl`) and scales down;
 * nothing in the product renders one larger.
 *
 * ONLY people who are in that set appear here, and a face here is a claim that
 * Figma drew that person. Four names used to be re-exported from
 * `src/assets/dummies`, which made that claim falsely — the art was pre-rebrand
 * placeholder.
 *
 * Two of those four were then removed as invented, which was half wrong: ANIKA
 * SHARMA is in `relethe-feed` 750:184, along with Kai Shore, Ana Duarte and
 * River Castellano. They are design content, not invention. All four are now
 * exported from the frame at 72. Marcus Webb, Priya Nair and Sofia Mendes are
 * in no frame and stay out.
 *
 * To add one: find its node in `Avatar Image` (924:1537), export at 1x, drop the
 * PNG in this folder, add a line below.
 */
import abelKant from './abel-kant.png';
import anaDuarte from './ana-duarte.png';
import anikaSharma from './anika-sharma.png';
import anyaKurosawa from './anya-kurosawa.png';
import elenaVoss from './elena-voss.png';
import georgeTracy from './george-tracy.png';
import irisMorrow from './iris-morrow.png';
import kaiShore from './kai-shore.png';
import marcusJin from './marcus-jin.png';
import mayaFrost from './maya-frost.png';
import montyWei from './monty-wei.png';
import riverCastellano from './river-castellano.png';
import theoLark from './theo-lark.png';

export const AVATARS = {
  'abel-kant': abelKant,
  'ana-duarte': anaDuarte,
  'anika-sharma': anikaSharma,
  'anya-kurosawa': anyaKurosawa,
  'elena-voss': elenaVoss,
  'george-tracy': georgeTracy,
  'iris-morrow': irisMorrow,
  'kai-shore': kaiShore,
  'marcus-jin': marcusJin,
  'maya-frost': mayaFrost,
  'monty-wei': montyWei,
  'river-castellano': riverCastellano,
  'theo-lark': theoLark,
} as const;

export type AvatarName = keyof typeof AVATARS;
