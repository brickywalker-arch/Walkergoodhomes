import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageBanner } from '@/components/ui/PageBanner';
import { LandWanted } from '@/components/LandWanted';
import { FutureDevelopments } from '@/components/FutureDevelopments';
import { AudienceRouter } from '@/components/AudienceRouter';

export const metadata: Metadata = {
  title: 'Land wanted',
  description:
    'Walker Good Homes is actively interested in residential development opportunities throughout Yorkshire — with or without planning, brownfield, infill and redevelopment sites.',
  alternates: { canonical: '/land' },
};

export default function LandPage() {
  return (
    <>
      <Header />
      <main id="top">
        <PageBanner
          eyebrow="Land"
          title="The next Walker Good Home could start with your land."
          lead="Sites across Yorkshire, with or without planning. Send us what you have and we will tell you honestly whether it is something we could develop."
        />
        <LandWanted />
        <FutureDevelopments />
        <AudienceRouter />
      </main>
      <Footer />
    </>
  );
}
