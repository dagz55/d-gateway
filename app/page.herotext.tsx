'use client';

import { HeroSlideshow } from '@/components/HeroSlideshow';
import { FunctionalLanding } from '@/components/landing/FunctionalLanding';
import { SophisticatedLanding } from '@/components/landing/SophisticatedLanding';

export default function HeroTextDemo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slideshow Demo */}
      <section className="h-screen">
        <HeroSlideshow />
      </section>
      
      {/* Functional Landing Demo */}
      <section className="min-h-screen">
        <FunctionalLanding />
      </section>
      
      {/* Sophisticated Landing Demo */}
      <section className="min-h-screen">
        <SophisticatedLanding />
      </section>
    </div>
  );
}