import art1 from '../../../rebrand/assets/kyc/kyc-1-getting-started.webp';
import art2 from '../../../rebrand/assets/kyc/kyc-2-location.webp';
import art3 from '../../../rebrand/assets/kyc/kyc-3-intent.webp';
import art4 from '../../../rebrand/assets/kyc/kyc-4-match.webp';
import art5 from '../../../rebrand/assets/kyc/kyc-5-texture.webp';
import art6 from '../../../rebrand/assets/kyc/kyc-6-voice.webp';
import art7 from '../../../rebrand/assets/kyc/kyc-7-profile.webp';
import art8 from '../../../rebrand/assets/kyc/kyc-8-presence.webp';
import art9 from '../../../rebrand/assets/kyc/kyc-9-role.webp';
import art10 from '../../../rebrand/assets/kyc/kyc-10-calendar.webp';
import artDone from '../../../rebrand/assets/kyc/kyc-done.webp';

/**
 * One plate per step, for the desktop two-column layout.
 *
 * These are the white-ground portraits: blue stipple on white, so the plate
 * sits flush beside a White card with no seam. The marketing set's blue-ground
 * plates would cut the composition in half.
 *
 * The `alt` text describes the SCENE, not the step — the plate is atmosphere,
 * and a screen reader that is already reading "Your location · Who could you
 * meet tonight?" does not need the heading recited back as an image label.
 *
 * Paused has no plate on purpose. It is the one blue screen in the flow, a
 * white-ground engraving would fight it, and the bareness is the point.
 */
export const KYC_ART: Record<number, { src: string; alt: string }> = {
  1: { src: art1, alt: 'Two friends on a fire escape at golden hour, sharing a drink with a cat on the railing' },
  2: { src: art2, alt: 'A hilltop observatory looking out across a wide evening horizon' },
  3: { src: art3, alt: 'Players over a chess board in a public square, mid-consideration' },
  4: { src: art4, alt: 'A reunion of graduates greeting one another' },
  5: { src: art5, alt: 'An eclectic still life of books, blooms and lenses' },
  6: { src: art6, alt: 'A potter shaping a vessel by hand in a studio' },
  7: { src: art7, alt: 'Dancers caught mid-leap' },
  8: { src: art8, alt: 'Street food vendors at their stalls, open for the evening' },
  9: { src: art9, alt: 'Harvesters cutting grape clusters in a vineyard' },
  10: { src: art10, alt: 'An outdoor film screening under a night sky' },
  11: { src: artDone, alt: 'A high five between runners along a marathon route' },
};
