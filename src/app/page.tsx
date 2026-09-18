'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Plots } from '@/components/Plots';
import { Drawings } from '@/components/Drawings';
import { Inside } from '@/components/Inside';
import { Spec } from '@/components/Spec';
import { Buyers } from '@/components/Buyers';
import { Enquire } from '@/components/Enquire';
import { Footer } from '@/components/Footer';
import { DEFAULT_FINISHES, type Finishes } from '@/data/interior';

/**
 * One scrolling page, six anchored sections.
 *
 * The finish selection is held here so the interior explorer and the enquiry
 * form share it — a visitor who picks sage units and oak doors has that sent
 * with their enquiry.
 */
export default function Home() {
  const [finishes, setFinishes] = useState<Finishes>(DEFAULT_FINISHES);

  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Plots />
        <Drawings />
        <Inside onFinishes={setFinishes} />
        <Spec />
        <Buyers />
        <Enquire finishes={finishes} />
      </main>
      <Footer />
    </>
  );
}
