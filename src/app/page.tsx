'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Plots } from '@/components/Plots';
import { Drawings } from '@/components/Drawings';
import { Inside } from '@/components/Inside';
import { Spec } from '@/components/Spec';
import { HowWeBuild } from '@/components/HowWeBuild';
import { BuildJournal } from '@/components/BuildJournal';
import { Buyers } from '@/components/Buyers';
import { FutureDevelopments } from '@/components/FutureDevelopments';
import { LandWanted } from '@/components/LandWanted';
import { AudienceRouter } from '@/components/AudienceRouter';
import { Enquire } from '@/components/Enquire';
import { Footer } from '@/components/Footer';
import { DEFAULT_FINISHES, type Finishes } from '@/data/interior';

/**
 * One scrolling page.
 *
 * The order is a buyer's journey and stays that way: see the homes, read the
 * drawings, step inside, check the specification, watch it being built, then
 * get in touch. The business-development sections live on their own pages —
 * a landowner and a bricklayer should not have to scroll a buyer's page to
 * reach their own — and the router near the foot is how they get there.
 *
 * Every new section takes an `id`, so moving one onto or off this page is a
 * single line either way.
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
        <HowWeBuild />
        <BuildJournal />
        <Buyers />
        <FutureDevelopments />
        <LandWanted />
        <AudienceRouter />
        <Enquire finishes={finishes} />
      </main>
      <Footer />
    </>
  );
}
