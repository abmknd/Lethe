import './rebrand.css';
import Hero from './sections/Hero';
import Story from './sections/Story';
import WhoIsThisFor from './sections/WhoIsThisFor';
import HowItWorks from './sections/HowItWorks';
import Survey from './sections/Survey';
import Footer from './sections/Footer';

/**
 * Staged rebrand of the Relethe landing page ("Desktop - dark").
 * Self-contained under src/rebrand — preview at /rebrand.
 */
export default function RebrandPage() {
  return (
    <div className="rebrand-root min-h-screen w-full bg-[var(--color-blue-600)]">
      <Hero />
      <Story />
      <WhoIsThisFor />
      <HowItWorks />
      <Survey />
      <Footer />
    </div>
  );
}
