import CallToAction from './_components/call-to-action';
import DashboardSnippet from './_components/dashboard-snippet';
import { PricingSection } from './_components/pricing';

const LandingPage = () => {
  return (
    <main className="md:px-10 py-20 flex flex-col gap-36">
      <div>
        <CallToAction />
        <DashboardSnippet />
      </div>
      <PricingSection />
    </main>
  );
};

export default LandingPage;
