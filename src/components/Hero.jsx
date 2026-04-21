// src/components/Hero.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

// Helper to generate grid positions with slight randomness
function generateGridLines(size, count) {
  const spacing = size / (count + 1);
  const positions = [];
  for (let i = 1; i <= count; i++) {
    const base = i * spacing;
    const offset = (Math.random() - 0.5) * 30; // ±15px
    positions.push(base + offset);
  }
  return positions;
}

export default function Hero() {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [dots, setDots] = useState([]); // {x, y, createdAt}

  // Motion values for count-up stats
  const alertPointsVal = useMotionValue(0);
  const alertPoints = useTransform(alertPointsVal, v => Math.floor(v));
  const alertTypesVal = useMotionValue(0);
  const alertTypes = useTransform(alertTypesVal, v => Math.floor(v));
  const timeIntervalsVal = useMotionValue(0);
  const timeIntervals = useTransform(timeIntervalsVal, v => Math.floor(v));
  const busesVal = useMotionValue(0);
  const buses = useTransform(busesVal, v => Math.floor(v));

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastDotSpawn = performance.now();

    const draw = () => {
      const now = performance.now();
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      const verticals = generateGridLines(canvas.width, 20);
      const horizontals = generateGridLines(canvas.height, 20);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      verticals.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      });
      horizontals.forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      });

      // Spawn new red dot every 2 seconds
      if (now - lastDotSpawn > 2000) {
        const xIdx = Math.floor(Math.random() * verticals.length);
        const yIdx = Math.floor(Math.random() * horizontals.length);
        const newDot = {
          x: verticals[xIdx],
          y: horizontals[yIdx],
          createdAt: now,
        };
        setDots(prev => {
          const updated = [...prev, newDot];
          if (updated.length > 30) {
            // remove oldest
            updated.shift();
          }
          return updated;
        });
        lastDotSpawn = now;
      }

      // Draw dots with ripple animation
      dots.forEach(dot => {
        const age = now - dot.createdAt;
        // Ripple for first 800ms
        if (age < 800) {
          const radius = (age / 800) * 12; // up to 12px
          const opacity = 1 - age / 800;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(226,75,74,${opacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        // Static dot after ripple
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#E24B4A';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    // Resize handling
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dots]); // re-run when dots array changes (adds new dot)

  // Update canvas size when state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
  }, [canvasSize]);

  // Count-up animations on mount
  useEffect(() => {
    const duration = 1800; // ms
    const start = performance.now();
    const animate = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      alertPointsVal.set(500 * progress);
      alertTypesVal.set(3 * progress);
      timeIntervalsVal.set(4 * progress);
      busesVal.set(200 * progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth scroll helper
  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen px-8 md:px-16">
        {/* Left column */}
        <motion.div
          className="md:w-7/12 w-full text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.p
            className="text-xs font-mono tracking-widest text-[#EF9F27] mb-2"
            style={{ fontSize: '11px' }}
          >
            ADAS · K-MEANS CLUSTERING · NAGPUR, INDIA
          </motion.p>
          <motion.h1
            className="text-5xl md:text-6xl font-semibold leading-none"
          >
            Predicting Danger
          </motion.h1>
          <motion.h1
            className="text-5xl md:text-6xl font-semibold leading-none relative inline-block"
          >
            Before It Happens
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-white/60 max-w-md leading-relaxed"
          >
            K-Means clustering on ADAS collision alert data identifies emerging accident-prone zones across urban road networks — before accidents occur.
          </motion.p>
          <motion.div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start" >
            <motion.button
              className="px-6 py-2 bg-white text-black rounded-md hover:shadow-lg transition-shadow"
              onClick={() => scrollTo('map-explorer')}
            >
              Explore the Map
            </motion.button>
            <motion.button
              className="px-6 py-2 border border-white/50 text-white rounded-md hover:bg-white/10 transition-colors"
              onClick={() => scrollTo('algorithm-explainer')}
            >
              How it Works
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right column – stats card */}
        <motion.div
          className="md:w-5/12 w-full mt-12 md:mt-0 flex justify-center"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/12 rounded-xl p-6 w-80">
            <p className="text-xs font-mono tracking-wider text-white/70 mb-4">System Overview</p>
            <div className="space-y-3">
              {[
                { label: 'Alert Points Logged', value: '500+' },
                { label: 'Clusters Detected (K=5)', value: '5 zones' },
                { label: 'City Coverage', value: '~85%' },
                { label: 'Prediction Recall', value: '0.64' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-2 border-b border-white/6 last:border-b-0">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-[pulse_2s_ease-in-out_infinite]" />
                    <span className="text-sm text-white/70">{item.label}</span>
                  </div>
                  <span className="font-mono text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom stat bar */}
      <motion.div
        className="absolute bottom-0 left-0 w-full flex justify-around items-center bg-white/4 border-t border-white/8 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex flex-col items-center">
          <motion.span className="font-mono text-3xl text-white" style={{ fontSize: '36px' }}>
            {alertPointsVal && <motion.span>{alertPoints}</motion.span>}
          </motion.span>
          <span className="text-xs text-white/45 mt-1">Alert Points</span>
        </div>
        <div className="border-l border-white/8 h-8 mx-4" />
        <div className="flex flex-col items-center">
          <motion.span className="font-mono text-3xl text-white" style={{ fontSize: '36px' }}>
            {alertTypesVal && <motion.span>{alertTypes}</motion.span>}
          </motion.span>
          <span className="text-xs text-white/45 mt-1">Alert Types (PCW·FCW·LDW)</span>
        </div>
        <div className="border-l border-white/8 h-8 mx-4" />
        <div className="flex flex-col items-center">
          <motion.span className="font-mono text-3xl text-white" style={{ fontSize: '36px' }}>
            {timeIntervalsVal && <motion.span>{timeIntervals}</motion.span>}
          </motion.span>
          <span className="text-xs text-white/45 mt-1">Time Intervals</span>
        </div>
        <div className="border-l border-white/8 h-8 mx-4" />
        <div className="flex flex-col items-center">
          <motion.span className="font-mono text-3xl text-white" style={{ fontSize: '36px' }}>
            {busesVal && <motion.span>{buses}</motion.span>}
          </motion.span>
          <span className="text-xs text-white/45 mt-1">ADAS‑Equipped Buses</span>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute inset-x-0 bottom-2 flex flex-col items-center cursor-pointer"
        onClick={() => scrollTo('map-explorer')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        style={{ zIndex: 20 }}
      >
        <ChevronDownIcon className="w-6 h-6 text-white/70" />
        <span className="mt-1 text-xs font-mono text-white/60 tracking-[0.12em]">scroll to explore</span>
      </motion.div>

      {/* SVG underline animation keyframes */}
      <style>{`
        @keyframes underlineDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity:1; }
          50% { transform: scale(1.4); opacity:0.6; }
        }
      `}</style>
    </section>
  );
}
