// src/components/BlackspotPanel.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import alertPoints from '../data/alertPoints';
import blackspots from '../data/blackspots';
import { runKMeans } from '../data/kmeans';

// ----- Static content ----------------------------------------------------
const recallPercent = 64; // 64% recall
const predictedCount = 16; // of 25 known blackspots

// Icons – simple inline SVGs
const EMDIcon = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="12" stroke="#EF9F27" strokeWidth="2" />
    <circle cx="42" cy="42" r="12" stroke="#378ADD" strokeWidth="2" />
    <path d="M34 34L30 30" stroke="#FFFFFF" strokeWidth="2" />
  </svg>
);
const BusShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="20" width="40" height="24" rx="4" stroke="#EF9F27" strokeWidth="2" />
    <path d="M20 44V48" stroke="#EF9F27" strokeWidth="2" />
    <path d="M44 44V48" stroke="#EF9F27" strokeWidth="2" />
    <path d="M28 28H36" stroke="#EF9F27" strokeWidth="2" />
    <path d="M28 36H36" stroke="#EF9F27" strokeWidth="2" />
    <path d="M28 44H36" stroke="#EF9F27" strokeWidth="2" />
    <path d="M20 28L24 24" stroke="#EF9F27" strokeWidth="2" />
    <path d="M44 28L40 24" stroke="#EF9F27" strokeWidth="2" />
  </svg>
);
const RoadDashedIcon = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 32H56" stroke="#EF9F27" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="20" cy="32" r="4" fill="#EF9F27" />
    <circle cx="44" cy="32" r="4" fill="#EF9F27" />
  </svg>
);

export default function BlackspotPanel() {
  // Compute centroids once using the pure JS kmeans implementation
  const centroids = useMemo(() => {
    const { centroids: cs } = runKMeans(alertPoints, 5);
    // The algorithm returns centroids with extra metadata; we only need lat/lng/id
    return cs.map((c, i) => ({ id: i, lat: c.lat, lng: c.lng }));
  }, []);

  return (
    <motion.section
      id="blackspot-prediction"
      className="bg-[#0a0a0a] py-24 px-8 md:px-16 lg:px-24"
      style={{ scrollMarginTop: '80px' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="max-w-4xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs font-mono text-[#EF9F27] tracking-wider mb-2">PREDICTIVE INSIGHT</p>
        <h2 className="text-4xl text-white font-semibold">From Alerts to Emerging Blackspots</h2>
        <p className="text-base text-white/45 mt-2 max-w-[620px] mx-auto">
          K-Means clusters compared against civic blackspot data — 64% recall on previously unreported zones
        </p>
      </motion.div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
        {/* LEFT – Mini map visual */}
        <div className="lg:col-span-7">
          <div className="bg-white/3 border border-white/12 rounded-2xl overflow-hidden relative" style={{ height: '420px' }}>
            {/* Map */}
            <MapContainer
              center={[21.1458, 79.0882]}
              zoom={11}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              boxZoom={false}
              keyboard={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="CartoDB"
              />
              {/* Predicted centroids – blue pulsing */}
              {centroids.map((c) => (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lng]}
                  radius={9}
                  fillColor="#378ADD"
                  fillOpacity={0.9}
                  stroke={false}
                  className="pulse-marker"
                />
              ))}
              {/* Confirmed blackspots – red static */}
              {blackspots.map((bs, i) => (
                <CircleMarker
                  key={i}
                  center={[bs.lat, bs.lng]}
                  radius={6}
                  fillColor="#E24B4A"
                  fillOpacity={0.85}
                  stroke={false}
                />
              ))}
            </MapContainer>
            {/* Overlay badge */}
            <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-white">
              <div className="text-xs font-mono tracking-[0.08em] text-emerald-400">{recallPercent}% RECALL</div>
              <div className="text-5xl font-semibold font-mono tabular-nums">{predictedCount} of 25</div>
              <div className="text-sm text-white/60">emerging blackspots predicted</div>
            </div>
            {/* Bottom legend */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded">
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-[#378ADD]" />
                <span className="text-xs font-mono text-white/80">K-Means Predicted</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-[#E24B4A]" />
                <span className="text-xs font-mono text-white/80">Civic Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT – Explanation cards */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card 1 */}
          <motion.div
            className="bg-white/3 border border-white/8 rounded-xl p-7 flex flex-col gap-4 hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <EMDIcon />
            <h3 className="text-lg text-white font-medium">EMD Similarity Matching</h3>
            <p className="text-sm text-white/70 font-mono">
              Each K-Means cluster’s 2D histogram is compared to known blackspot histograms using Earth Mover’s Distance. Clusters below threshold are flagged as emerging blackspots — exactly as proposed in the IIIT Hyderabad thesis.
            </p>
            <div className="text-xs text-white/30 font-mono mt-2">“Adapted from Chapter 2.4.4 — Predictive Modeling”</div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            className="bg-white/3 border border-white/8 rounded-xl p-7 flex flex-col gap-4 hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <BusShieldIcon />
            <h3 className="text-lg text-white font-medium">Early Intervention Before Accidents</h3>
            <p className="text-sm text-white/70 font-mono">
              Civic authorities receive actionable zones weeks or months before the next crash. Traffic‑calming measures, signage, or speed cameras can be deployed proactively — turning reactive safety into predictive safety.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            className="bg-white/3 border border-white/8 rounded-xl p-7 flex flex-col gap-4 hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <RoadDashedIcon />
            <h3 className="text-lg text-white font-medium">Coverage & Future Extensions</h3>
            <p className="text-sm text-white/70 font-mono">
              Data currently covers ~85% of Nagpur’s road network (200 ADAS‑equipped buses). Future work: add private vehicles, incorporate weather, and scale to other Indian cities.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="mt-12 overflow-hidden border-t border-white/12">
        <div className="whitespace-nowrap animate-marquee text-sm font-mono text-white/70 py-3" style={{ letterSpacing: '0.5px' }}>
          Predicted 16 of 25 emerging blackspots  ·  Recall rate: 0.64  ·  500+ alert points  ·  200 ADAS-equipped buses  ·  1 year of data  ·  K-Means + EMD methodology  ·  Nagpur, India  ·  Based on IIIT Hyderabad MS Thesis 2025&nbsp;&nbsp;&nbsp;&nbsp;
          Predicted 16 of 25 emerging blackspots  ·  Recall rate: 0.64  ·  500+ alert points  ·  200 ADAS-equipped buses  ·  1 year of data  ·  K-Means + EMD methodology  ·  Nagpur, India  ·  Based on IIIT Hyderabad MS Thesis 2025
        </div>
      </div>

      {/* Inline CSS for pulse and marquee */}
      <style>{`
        .pulse-marker {
          animation: pulse 2s infinite ease-out;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
        @media (max-width: 1024px) {
          .lg\:col-span-7 { grid-column: span 12 / span 12; }
          .lg\:col-span-5 { grid-column: span 12 / span 12; }
        }
        @media (max-width: 768px) {
          .bg-white\/3 { padding: 1.5rem; }
        }
      `}</style>
    </motion.section>
  );
}
