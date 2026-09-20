import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageBanner } from '@/components/ui/PageBanner';
import { DevelopmentPartnerships } from '@/components/DevelopmentPartnerships';
import { AudienceRouter } from '@/components/AudienceRouter';

export const metadata: Metadata = {
  title: 'Development partnerships',
  description:
    'Walker Good Homes is interested in speaking with private investors, landowners and development partners who want to participate in residential development in Yorkshire.',
  alternates: { canonical: '/partnerships/development' },
};

export default function DevelopmentPartnershipsPage() {
  return (
    <>
      <Header />
      <main id="top">
        <PageBanner
          eyebrow="Development partnerships"
          title="You bring the opportunity. We build the homes."
          lead="For private investors, landowners and partners who want to be part of residential development without running a construction operation."
        />
        <DevelopmentPartnerships />
        <AudienceRouter />
      </main>
      <Footer />
    </>
  );
}
