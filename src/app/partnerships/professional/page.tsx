import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageBanner } from '@/components/ui/PageBanner';
import { ProfessionalPartners } from '@/components/ProfessionalPartners';
import { AudienceRouter } from '@/components/AudienceRouter';

export const metadata: Metadata = {
  title: 'Professional partners',
  description:
    'Architects, engineers, planning consultants, surveyors, agents and solicitors — Walker Good Homes wants to build relationships with high-quality local professionals.',
  alternates: { canonical: '/partnerships/professional' },
};

export default function ProfessionalPartnersPage() {
  return (
    <>
      <Header />
      <main id="top">
        <PageBanner
          eyebrow="Professional partners"
          title="Work with Walker Good Homes."
          lead="As we grow, we want to know the local professionals a development actually depends on — long before anything is built."
        />
        <ProfessionalPartners />
        <AudienceRouter />
      </main>
      <Footer />
    </>
  );
}
