// src/components/ClusterDrawer.jsx
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

// Color mapping for alerts
const ALERT_COLORS = {
  PCW: '#378ADD', // blue
  FCW: '#E24B4A', // red
  LDW: '#EF9F27', // amber
};

// Risk badge styles
const riskStyles = {
  severe: {
    bg: 'rgba(226,75,74,0.15)',
    color: '#E24B4A',
    border: '0.5px solid rgba(226,75,74,0.3)',
  },
  moderate: {
    bg: 'rgba(239,159,39,0.15)',
    color: '#EF9F27',
    border: '0.5px solid rgba(239,159,39,0.3)',
  },
  mild: {
    bg: 'rgba(99,153,34,0.15)',
    color: '#639922',
    border: '0.5px solid rgba(99,153,34,0.3)',
  },
};

export default function ClusterDrawer({
  isOpen,
  onClose,
  centroid,
  points,
  onHighlight,
}) {
  // centroid contains: id, lat, lng, pointCount, dominantAlert, riskLevel, peakWindow, pcwCount, fcwCount, ldwCount, severePercent, color (optional)
  const drawerControls = useAnimation();
  const barControls = useAnimation();
  const gridControls = useAnimation();

  // Trigger animations when drawer opens
  useEffect(() => {
    if (isOpen) {
      drawerControls.start({ x: 0 });
      // color bar scaleX
      drawerControls.start({ scaleX: 1, transition: { delay: 0.1, duration: 0.3 } }, 'colorBar');
      // stagger grid cells
      gridControls.start('visible');
      // bar chart animation handled by Recharts (isAnimationActive)
    } else {
      drawerControls.start({ x: 320 });
    }
  }, [isOpen, drawerControls, gridControls]);

  // Prepare data for alert breakdown chart
  const chartData = [
    { type: 'PCW', count: centroid.pcwCount || 0 },
    { type: 'FCW', count: centroid.fcwCount || 0 },
    { type: 'LDW', count: centroid.ldwCount || 0 },
  ];

  // Grid cell variants
  const cellVariant = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  };

  const gridVariant = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  // Helper to format coordinates
  const formatCoord = (lat, lng) => `${lat.toFixed(4)}°N  ${lng.toFixed(4)}°E`;

  return (
    <motion.div
      className="absolute top-0 right-0 h-full w-80 z-50 overflow-hidden"
      initial={{ x: 320 }}
      animate={drawerControls}
      transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        borderLeft: '0.5px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Top color bar */}
      <motion.div
        style={{ height: '4px', background: centroid?.color || '#E24B4A', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={drawerControls}
        transition={{ delay: 0.1, duration: 0.3 }}
      />

      {/* Close button */}
      <motion.button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/50 text-2xl leading-none"
        whileHover={{ rotate: 90, color: '#ffffff' }}
        transition={{ duration: 0.2 }}
      >
        ×
      </motion.button>

      {/* Header block */}
      <div className="pt-6 pb-2 px-5">
        <div className="flex items-center mb-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-2"
            style={{ background: centroid?.color || '#E24B4A' }}
          />
          <span className="text-white text-lg font-mono font-semibold">{centroid?.label || `Zone ${String.fromCharCode(65 + centroid?.id)}`}</span>
        </div>
        <div className="text-white/40 text-sm font-mono mb-2">{centroid && formatCoord(centroid.lat, centroid.lng)}</div>
        {centroid && (
          <span
            className="inline-block px-2 py-0.5 text-xs font-mono uppercase"
            style={riskStyles[centroid.riskLevel]}
          >
            {centroid.riskLevel.toUpperCase()}
          </span>
        )}
      </div>

      <div className="border-b border-white/8 mx-4 my-2" />

      {/* Stat grid */}
      <motion.div
        className="grid grid-cols-2 gap-2 px-5"
        variants={gridVariant}
        initial="hidden"
        animate={gridControls}
      >
        {/* ALERT POINTS */}
        <motion.div className="bg-white/4 border border-white/8 rounded p-3" variants={cellVariant}>
          <div className="text-xs text-white/40 font-mono mb-1">ALERT POINTS</div>
          <div className="text-white text-2xl font-mono font-medium">{centroid?.pointCount || 0}</div>
        </motion.div>
        {/* DOMINANT TYPE */}
        <motion.div className="bg-white/4 border border-white/8 rounded p-3" variants={cellVariant}>
          <div className="text-xs text-white/40 font-mono mb-1">DOMINANT TYPE</div>
          <div
            className="text-white text-2xl font-mono font-medium"
            style={{ color: ALERT_COLORS[centroid?.dominantAlert] || '#fff' }}
          >
            {centroid?.dominantAlert || 'N/A'}
          </div>
        </motion.div>
        {/* RISK LEVEL */}
        <motion.div className="bg-white/4 border border-white/8 rounded p-3" variants={cellVariant}>
          <div className="text-xs text-white/40 font-mono mb-1">RISK LEVEL</div>
          <div className="text-white text-2xl font-mono font-medium capitalize">{centroid?.riskLevel || 'N/A'}</div>
        </motion.div>
        {/* PEAK WINDOW */}
        <motion.div className="bg-white/4 border border-white/8 rounded p-3" variants={cellVariant}>
          <div className="text-xs text-white/40 font-mono mb-1">PEAK WINDOW</div>
          <div className="text-white text-2xl font-mono font-medium">{centroid?.peakWindow || 'N/A'}</div>
        </motion.div>
      </motion.div>

      {/* Alert breakdown chart */}
      <div className="mt-4 px-5">
        <div className="text-xs text-[#EF9F27] font-mono uppercase mb-2" style={{ letterSpacing: '0.1em' }}>
          ALERT BREAKDOWN
        </div>
        <BarChart width={280} height={110} data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={600}>
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={ALERT_COLORS[entry.type]} />
            ))}
          </Bar>
          <XAxis
            dataKey="type"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            itemStyle={{ color: '#ffffff' }}
          />
        </BarChart>
      </div>

      {/* Severity split bar */}
      <div className="mt-4 px-5">
        <div className="text-xs text-[#EF9F27] font-mono uppercase mb-2" style={{ letterSpacing: '0.1em' }}>
          SEVERITY SPLIT
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: centroid?.color || '#E24B4A', borderRadius: 4 }}
            initial={{ width: 0 }}
            animate={{ width: `${centroid?.severePercent || 0}%` }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-mono" style={{ color: centroid?.color || '#E24B4A' }}>{centroid?.severePercent || 0}% severe</span>
          <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{100 - (centroid?.severePercent || 0)}% mild</span>
        </div>
      </div>

      {/* Bottom action button */}
      <div className="mt-auto px-5 pb-5 pt-4">
        <motion.button
          whileHover={{ backgroundColor: 'rgba(239,159,39,0.1)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 border border-[#EF9F27] rounded text-[#EF9F27] text-sm font-mono uppercase tracking-[0.08em]"
          onClick={onHighlight}
        >
          HIGHLIGHT ON MAP ↗
        </motion.button>
      </div>
    </motion.div>
  );
}
