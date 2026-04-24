// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-16 relative overflow-hidden">
      {/* Subtle road‑network SVG pattern background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ffffff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Additional faint diagonal road lines for Nagpur feel */}
          <line x1="0" y1="30%" x2="100%" y2="70%" stroke="#ffffff" strokeWidth="1" opacity="0.15" />
          <line x1="0" y1="70%" x2="100%" y2="30%" stroke="#ffffff" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-8 lg:px-12 relative">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          {/* Left Column — Brand & Thesis Context */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 bg-[#E24B4A] rounded-full flex items-center justify-center text-white text-xs font-bold font-mono">
                AZ
              </div>
              <span className="text-2xl font-semibold text-white tracking-[-0.02em]">AccidentZone</span>
            </div>
            <p className="text-white/70 text-[15px] leading-relaxed">
              Visualizing K-Means clustering on real ADAS collision alerts to predict accident-prone zones before they become blackspots.
            </p>
            <div className="mt-8 text-xs font-mono text-white/40 leading-relaxed">
              Based on the MS thesis<br />
              <span className="text-white/60">"Predictive Modeling of Accident-Prone Road Zones…"</span><br />
              Ravi Shankar Mishra • IIIT Hyderabad • April 2025
            </div>
            <div className="mt-6 text-[10px] font-mono text-white/30">
              Research visualization • Not for operational use
            </div>
          </div>

          {/* Center Column — Tech Stack */}
          <div className="flex flex-col gap-6">
            <div className="uppercase text-xs font-mono tracking-[0.08em] text-white/30 mb-1">Built with</div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium">
              <span className="text-white/70">React 19</span>
              <span className="text-white/70">Leaflet • react-leaflet</span>
              <span className="text-white/70">Recharts</span>
              <span className="text-white/70">Framer Motion</span>
              <span className="text-white/70">Tailwind CSS</span>
              <span className="text-white/70">shadcn/ui</span>
              <span className="text-white/70">Pure JS K-Means</span>
            </div>
            <div className="text-xs font-mono text-white/40 mt-4">
              Inspired by 21st.dev aesthetic • Dark CartoDB tiles
            </div>
          </div>

          {/* Right Column — Quick Links & Thesis Reference */}
          <div className="flex flex-col gap-6 text-sm">
            <a
              href="#map-explorer"
              onClick={(e) => { e.preventDefault(); document.getElementById('map-explorer')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-white/70 hover:text-white flex items-center gap-2 group"
            >
              Explore the Map
              <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-white/70 hover:text-white flex items-center gap-2 group"
            >
              How K-Means Works
              <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-white/40">
              Dummy dataset generated from thesis patterns<br />
              Nagpur, India • 500 alert points • 5 clusters
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-white/30">
          <div>
            © 2026 AccidentZone Research Visualization • All patterns derived from IIIT Hyderabad MS Thesis
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.iiit.ac.in/" target="_blank" rel="noopener" className="hover:text-white/60 transition-colors">
              IIIT Hyderabad
            </a>
            <span className="text-white/20">•</span>
            <span>Built as a student project by Swastik Goswami(and team)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">●</span>
            <span className="font-medium text-emerald-400">LIVE DEMO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
