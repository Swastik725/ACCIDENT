

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollProgressBar from './components/ScrollProgressBar';
import Hero from './components/Hero';
import MapExplorer from './components/MapExplorer';
import AlgorithmExplainer from './components/AlgorithmExplainer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TimeHeatmap from './components/TimeHeatmap';
import BlackspotPanel from './components/BlackspotPanel';
import Footer from './components/Footer';

import { alertPoints } from './data/alertPoints';
import { blackspots } from './data/blackspots';


import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollProgressBar from './components/ScrollProgressBar';
import Hero from './components/Hero';
import MapExplorer from './components/MapExplorer';
import AlgorithmExplainer from './components/AlgorithmExplainer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TimeHeatmap from './components/TimeHeatmap';
import BlackspotPanel from './components/BlackspotPanel';
import Footer from './components/Footer';

import { alertPoints } from './data/alertPoints';
import { blackspots } from './data/blackspots';

export default function App() {
  const [highlightedClusterId, setHighlightedClusterId] = useState(null);
  const mapRef = useRef(null);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHighlightCluster = (clusterId) => {
    setHighlightedClusterId(clusterId);
    setTimeout(() => scrollToSection('map-explorer'), 400);
  };

  useEffect(() => {
    if (highlightedClusterId !== null) {
      const timer = setTimeout(() => setHighlightedClusterId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [highlightedClusterId]);

  return (
    <>
      <ScrollProgressBar />

      <main className="bg-[#0a0a0a] text-white min-h-screen">
        <Hero />
        
        <section id="map-explorer" className="py-12">
          <MapExplorer
            ref={mapRef}
            highlightedClusterId={highlightedClusterId}
            onHighlightCluster={handleHighlightCluster}
            alertPoints={alertPoints}
            blackspots={blackspots}
          />
        </section>

        <section id="how-it-works">
          <AlgorithmExplainer onExploreMap={() => scrollToSection('map-explorer')} />
        </section>

        <AnalyticsDashboard onZoneSelect={handleHighlightCluster} />
        <TimeHeatmap />
        <BlackspotPanel />
        <Footer />
      </main>
    </>
  );
}




import { motion, AnimatePresence } from 'framer-motion';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import Hero from '@/components/Hero';
import MapExplorer from '@/components/MapExplorer';
import AlgorithmExplainer from '@/components/AlgorithmExplainer';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import TimeHeatmap from '@/components/TimeHeatmap';
import BlackspotPanel from '@/components/BlackspotPanel';
import Footer from '@/components/Footer';

// Import data (for global highlight syncing)
import { alertPoints } from '@/data/alertPoints';
import { blackspots } from '@/data/blackspots';

export default function App() {
  const [highlightedClusterId, setHighlightedClusterId] = useState(null);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Global highlight handler (called from AnalyticsDashboard table and BlackspotPanel)
  const handleHighlightCluster = (clusterId) => {
    setHighlightedClusterId(clusterId);
    // Scroll to map after a tiny delay so the map is in view
    setTimeout(() => {
      scrollToSection('map-explorer');
      // MapExplorer will listen to this prop and trigger the highlight animation
    }, 400);
  };

  // Reset highlight after 2.5s (same as drawer behavior)
  useEffect(() => {
    if (highlightedClusterId !== null) {
      const timer = setTimeout(() => {
        setHighlightedClusterId(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [highlightedClusterId]);

  return (
    <>
      <ScrollProgressBar />

      <main className="bg-[#0a0a0a] text-white min-h-screen">
        {/* HERO */}
        <Hero />

        {/* MAP EXPLORER — Main interactive section */}
        <section id="map-explorer" className="py-12">
          <MapExplorer
          highlightedClusterId={highlightedClusterId}
          onHighlightCluster={handleHighlightCluster}
          alertPoints={alertPoints}
          blackspots={blackspots}
        />
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works">
          <AlgorithmExplainer onExploreMap={() => scrollToSection('map-explorer')} />
        </section>

        {/* ZONE ANALYTICS DASHBOARD */}
        <AnalyticsDashboard onZoneSelect={handleHighlightCluster} />

        {/* TIME HEATMAP */}
        <TimeHeatmap />

        {/* BLACKSPOT PREDICTION PANEL */}
        <BlackspotPanel />

        {/* FOOTER */}
        <Footer />
      </main>

      {/* Optional global toast / confirmation if needed — not required */}
    </>
  );
}
