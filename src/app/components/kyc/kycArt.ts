import art1 from '../../../rebrand/assets/kyc/kyc-1-getting-started.webp';
import art1sm from '../../../rebrand/assets/kyc/kyc-1-getting-started-sm.webp';
import art2 from '../../../rebrand/assets/kyc/kyc-2-location.webp';
import art2sm from '../../../rebrand/assets/kyc/kyc-2-location-sm.webp';
import art3 from '../../../rebrand/assets/kyc/kyc-3-intent.webp';
import art3sm from '../../../rebrand/assets/kyc/kyc-3-intent-sm.webp';
import art4 from '../../../rebrand/assets/kyc/kyc-4-match.webp';
import art4sm from '../../../rebrand/assets/kyc/kyc-4-match-sm.webp';
import art5 from '../../../rebrand/assets/kyc/kyc-5-texture.webp';
import art5sm from '../../../rebrand/assets/kyc/kyc-5-texture-sm.webp';
import art6 from '../../../rebrand/assets/kyc/kyc-6-voice.webp';
import art6sm from '../../../rebrand/assets/kyc/kyc-6-voice-sm.webp';
import art7 from '../../../rebrand/assets/kyc/kyc-7-profile.webp';
import art7sm from '../../../rebrand/assets/kyc/kyc-7-profile-sm.webp';
import art8 from '../../../rebrand/assets/kyc/kyc-8-presence.webp';
import art8sm from '../../../rebrand/assets/kyc/kyc-8-presence-sm.webp';
import art9 from '../../../rebrand/assets/kyc/kyc-9-role.webp';
import art9sm from '../../../rebrand/assets/kyc/kyc-9-role-sm.webp';
import art10 from '../../../rebrand/assets/kyc/kyc-10-calendar.webp';
import art10sm from '../../../rebrand/assets/kyc/kyc-10-calendar-sm.webp';
import artDone from '../../../rebrand/assets/kyc/kyc-done.webp';
import artDonesm from '../../../rebrand/assets/kyc/kyc-done-sm.webp';

/**
 * One plate per step.
 *
 * These are the white-ground portraits: blue stipple on white, so the plate
 * sits flush beside a White card with no seam. The marketing set's blue-ground
 * plates would cut the composition in half.
 *
 * Two sources each. The plate is a 560px column in the split layout and a
 * full-bleed ~180px banner when stacked, and mobile is exactly where paying
 * 480KB a step is least acceptable — so `sm` (640px, 2.3MB for the set) carries
 * the stacked case and the browser picks via srcset.
 *
 * The `alt` text describes the SCENE, not the step — the plate is atmosphere,
 * and a screen reader that is already reading "Your location · Who could you
 * meet tonight?" does not need the heading recited back as an image label.
 *
 * Paused has no plate on purpose. It is the one blue screen in the flow, a
 * white-ground engraving would fight it, and the bareness is the point.
 */
export const KYC_ART: Record<number, { src: string; srcSm: string; alt: string }> = {
  1: { src: art1, srcSm: art1sm, alt: 'Two friends on a fire escape at golden hour, sharing a drink with a cat on the railing' },
  2: { src: art2, srcSm: art2sm, alt: 'A hilltop observatory looking out across a wide evening horizon' },
  3: { src: art3, srcSm: art3sm, alt: 'Players over a chess board in a public square, mid-consideration' },
  4: { src: art4, srcSm: art4sm, alt: 'A reunion of graduates greeting one another' },
  5: { src: art5, srcSm: art5sm, alt: 'An eclectic still life of books, blooms and lenses' },
  6: { src: art6, srcSm: art6sm, alt: 'A potter shaping a vessel by hand in a studio' },
  7: { src: art7, srcSm: art7sm, alt: 'Dancers caught mid-leap' },
  8: { src: art8, srcSm: art8sm, alt: 'Street food vendors at their stalls, open for the evening' },
  9: { src: art9, srcSm: art9sm, alt: 'Harvesters cutting grape clusters in a vineyard' },
  10: { src: art10, srcSm: art10sm, alt: 'An outdoor film screening under a night sky' },
  11: { src: artDone, srcSm: artDonesm, alt: 'A high five between runners along a marathon route' },
};
