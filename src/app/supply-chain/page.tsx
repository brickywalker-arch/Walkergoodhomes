import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageBanner } from '@/components/ui/PageBanner';
import { SupplyChain } from '@/components/SupplyChain';
import { AudienceRouter } from '@/components/AudienceRouter';

export const metadata: Metadata = {
  title: 'Join our supply chain',
  description:
    'Walker Good Homes wants to develop a strong local supply chain of skilled tradespeople, subcontractors, manufacturers and suppliers across Yorkshire.',
  alternates: { canonical: '/supply-chain' },
};

export default function SupplyChainPage() {
  return (
    <>
      <Header />
      <main id="top">
        <PageBanner
          eyebrow="Build with us"
          title="Good homes depend on good people."
          lead="Trades, subcontractors, manufacturers and suppliers. Tell us what you do and where you work, and we will come back when there is work that suits you."
        />
        <SupplyChain />
        <AudienceRouter />
      </main>
      <Footer />
    </>
  );
}
