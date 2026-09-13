import React, { useEffect } from 'react';
import { ScreenId } from '../types';

import HomeHero from '../components/home/HomeHero';
import HomePackages from '../components/home/HomePackages';
import HomeMethodology from '../components/home/HomeMethodology';
import HomeServices from '../components/home/HomeServices';
import HomeBrands from '../components/home/HomeBrands';
import HomeAbout from '../components/home/HomeAbout';
import HomeFAQ from '../components/home/HomeFAQ';
import HomeCTA from '../components/home/HomeCTA';

interface HomeViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Optional: Remove hash from URL without scrolling
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 300); // Give time for animations and render to finish
    }
  }, []);

  return (
    <div className="w-full text-on-surface">
      <HomeHero onNavigate={onNavigate} />
      <HomePackages />
      <HomeMethodology />
      <HomeServices onNavigate={onNavigate} />
      <HomeBrands />
      <HomeAbout />
      <HomeFAQ />
      <HomeCTA onNavigate={onNavigate} />
    </div>
  );
}
