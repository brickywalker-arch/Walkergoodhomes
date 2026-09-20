import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageBanner } from '@/components/ui/PageBanner';
import { HousingPartnerships } from '@/components/HousingPartnerships';
import { AudienceRouter } from '@/components/AudienceRouter';

export const metadata: Metadata = {
  title: 'Housing partnerships',
  description:
    'Walker Good Homes wants to work with local authorities, housing associations and registered providers to deliver well-designed homes across Yorkshire.',
  alternates: { canonical: '/partnerships/housing' },
};

export default function HousingPartnershipsPage() {
  return (
    <>
      <Header />
      <main id="top">
        <PageBanner
          eyebrow="Housing partnerships"
          title="For councils, housing associations and registered providers."
          lead="Land requiring development, an identified housing requirement, or a search for a local development partner — we would welcome the conversation."
        />
        <HousingPartnerships />
        <AudienceRouter />
      </main>
      <Footer />
    </>
  );
}
