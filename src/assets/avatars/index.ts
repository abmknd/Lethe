/**
 * The cast, exported from Figma's `Avatar Image` component set.
 *
 * The set has 24 named people (`Type=avatar-elena-voss` and so on) — they are
 * real assets in the file, not placeholders, which is why the app shell stopped
 * using Unsplash URLs. Each exports at 72 (Avatar's `xxl`) and scales down;
 * nothing in the product renders one larger.
 *
 * Nine of the 24 already existed under `src/assets/dummies` from before the
 * rebrand and are re-exported here so there is one place to look. The rest were
 * pulled from the component set.
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

import anikaSharma from '../dummies/anika-sharma.png';
import marcusWebb from '../dummies/marcus-webb.png';
import priyaNair from '../dummies/priya-nair.png';
import sofiaMendes from '../dummies/sofia-mendes.png';

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
  'anika-sharma': anikaSharma,
  'marcus-webb': marcusWebb,
  'priya-nair': priyaNair,
  'sofia-mendes': sofiaMendes,
} as const;

export type AvatarName = keyof typeof AVATARS;
