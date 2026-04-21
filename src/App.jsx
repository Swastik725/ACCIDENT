'use client';

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
