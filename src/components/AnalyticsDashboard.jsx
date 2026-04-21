// src/components/AnalyticsDashboard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// ----- Static data -------------------------------------------------------
const alertDistData = [
  { name: 'PCW', value: 68.8, color: '#378ADD', count: 344 },
  { name: 'LDW', value: 21.6, color: '#EF9F27', count: 108 },
  { name: 'FCW', value: 9.6, color: '#E24B4A', count: 48 },
];

// Helper to generate hourly counts matching the spec pattern
const getHourlyCount = (hour) => {
  if (hour >= 7 && hour <= 12) return Math.round(8000 + Math.random() * 2000); // morning peak
  if (hour >= 17 && hour <= 20) return Math.round(8000 + Math.random() * 2000); // evening peak
  if (hour >= 5 && hour <= 6) return Math.round(500 + Math.random() * 100);
  if (hour >= 0 && hour <= 4) return Math.round(100 + Math.random() * 50);
  if (hour >= 13 && hour <= 16) return Math.round(1500 + Math.random() * 500);
  if (hour >= 21 && hour <= 23) return Math.round(800 + Math.random() * 400);
  return 0;
};

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  label: `${String(i).padStart(2, '0')}:00`,
  count: getHourlyCount(i),
  isPeak: (i >= 7 && i <= 12) || (i >= 17 && i <= 20),
}));

const weeklyData = [
  { day: 'Mon', PCW: 8200, FCW: 1800, LDW: 5100 },
  { day: 'Tue', PCW: 9100, FCW: 2100, LDW: 5800 },
  { day: 'Wed', PCW: 7600, FCW: 1600, LDW: 4900 },
  { day: 'Thu', PCW: 7200, FCW: 1500, LDW: 4600 },
  { day: 'Fri', PCW: 7800, FCW: 1700, LDW: 5000 },
  { day: 'Sat', PCW: 6900, FCW: 1400, LDW: 4400 },
  { day: 'Sun', PCW: 5800, FCW: 1100, LDW: 3800 },
];

const zoneTableData = [
  { zone: 'Zone A', color: '#E24B4A', centroid: '21.1458, 79.0882', alerts: 140, type: 'PCW', risk: 'severe' },
  { zone: 'Zone B', color: '#EF9F27', centroid: '21.1523, 79.0791', alerts: 110, type: 'PCW', risk: 'severe' },
  { zone: 'Zone C', color: '#378ADD', centroid: '21.1401, 79.0701', alerts: 95, type: 'LDW', risk: 'moderate' },
  { zone: 'Zone D', color: '#1D9E75', centroid: '21.1298, 79.0954', alerts: 85, type: 'FCW', risk: 'moderate' },
  { zone: 'Zone E', color: '#7F77DD', centroid: '21.1612, 79.1008', alerts: 70, type: 'PCW', risk: 'mild' },
];

// Risk badge styles – same as ClusterDrawer
const riskStyles = {
  severe: {
    background: 'rgba(226,75,74,0.15)',
    color: '#E24B4A',
    border: '0.5px solid rgba(226,75,74,0.3)',
  },
  moderate: {
    background: 'rgba(239,159,39,0.15)',
    color: '#EF9F27',
    border: '0.5px solid rgba(239,159,39,0.3)',
  },
  mild: {
    background: 'rgba(99,153,34,0.15)',
    color: '#639922',
    border: '0.5px solid rgba(99,153,34,0.3)',
  },
};

const typeColors = {
  PCW: '#378ADD',
  FCW: '#E24B4A',
  LDW: '#EF9F27',
};

// ----- Reusable Card component ------------------------------------------
function ChartCard({ eyebrow, title, subtitle, children }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-6 md:p-7">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs font-mono text-[#EF9F27] tracking-wider mb-1.5">{eyebrow}</p>
          <h3 className="text-base text-white font-medium m-0">{title}</h3>
        </div>
        <span className="text-[11px] text-white/25 font-mono">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsDashboard({ onZoneSelect }) {
  // Intersection observers for each chart
  const [alertChartVisible, setAlertChartVisible] = useState(false);
  const [hourChartVisible, setHourChartVisible] = useState(false);
  const [weeklyChartVisible, setWeeklyChartVisible] = useState(false);

  const alertRef = useRef(null);
  const hourRef = useRef(null);
  const weeklyRef = useRef(null);

  useEffect(() => {
    const makeObserver = (setter) =>
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setter(true);
        },
        { threshold: 0.3 }
      );
    const alertObs = makeObserver(setAlertChartVisible);
    const hourObs = makeObserver(setHourChartVisible);
    const weeklyObs = makeObserver(setWeeklyChartVisible);
    if (alertRef.current) alertObs.observe(alertRef.current);
    if (hourRef.current) hourObs.observe(hourRef.current);
    if (weeklyRef.current) weeklyObs.observe(weeklyRef.current);
    return () => {
      alertObs.disconnect();
      hourObs.disconnect();
      weeklyObs.disconnect();
    };
  }, []);

  // Helper to handle row click
  const handleRowClick = (zoneIdx) => {
    // scroll to map explorer section
    const mapEl = document.getElementById('map-explorer');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
    // High-level state update in App.jsx
    if (onZoneSelect) {
      onZoneSelect(zoneIdx);
    }
  };

  return (
    <section
      id="analytics-dashboard"
      className="bg-[#111111] py-24 px-16 md:px-20 lg:px-24"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Section entry animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-6xl mx-auto mb-14"
      >
        <p className="text-xs font-mono text-[#EF9F27] tracking-wider mb-2">ZONE ANALYTICS</p>
        <h2 className="text-4xl text-white font-semibold">Understanding Alert Patterns</h2>
        <p className="text-base text-white/45 mt-2 max-w-[520px]">
          Spatiotemporal distribution of ADAS collision alerts across Nagpur's road network
        </p>
      </motion.div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-12 items-start max-w-6xl mx-auto">
        {/* Left column – charts */}
        <div className="flex flex-col gap-8">
          {/* Chart 1 – Alert Type Distribution */}
          <div ref={alertRef}>
            <ChartCard eyebrow="ALERT COMPOSITION" title="Distribution by Alert Type" subtitle="all intervals">
              <div className="relative flex items-center gap-8">
                <PieChart width={200} height={200}>
                  <Pie
                    data={alertDistData}
                    cx={95}
                    cy={95}
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={alertChartVisible}
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {alertDistData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-2xl font-medium font-mono text-white">500</div>
                  <div className="text-xs text-white/40 font-mono">alerts</div>
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-4">
                  {alertDistData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded" style={{ background: d.color }} />
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">{d.name}</div>
                        <div className="text-xs text-white/40 font-mono">{d.count} alerts</div>
                      </div>
                      <div className="text-base font-mono" style={{ color: d.color }}>{d.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Chart 2 – Hourly Alert Frequency */}
          <div ref={hourRef}>
            <ChartCard eyebrow="TEMPORAL PATTERN" title="Hourly Alert Frequency" subtitle="24hr cycle">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hourlyData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barSize={18}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis hide />
                  <ReTooltip
                    contentStyle={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                    formatter={(val) => [`${val.toLocaleString()} alerts`, '']}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={hourChartVisible} animationDuration={900}>
                    {hourlyData.map((entry, i) => (
                      <Cell key={i} fill={entry.isPeak ? '#EF9F27' : 'rgba(255,255,255,0.12)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Peak legend */}
              <div className="flex gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#EF9F27]" />
                  <span className="text-xs text-white/40 font-mono">peak hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white/12" />
                  <span className="text-xs text-white/40 font-mono">off‑peak</span>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Chart 3 – Weekly Alert Trend */}
          <div ref={weeklyRef}>
            <ChartCard eyebrow="WEEKLY PATTERN" title="Alert Volume by Day" subtitle="Mon – Sun">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <ReTooltip
                    contentStyle={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                    formatter={(val) => [val.toLocaleString(), '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="PCW"
                    stroke="#378ADD"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={weeklyChartVisible}
                    animationDuration={1000}
                  />
                  <Line
                    type="monotone"
                    dataKey="FCW"
                    stroke="#E24B4A"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={weeklyChartVisible}
                    animationDuration={1000}
                    animationBegin={200}
                  />
                  <Line
                    type="monotone"
                    dataKey="LDW"
                    stroke="#EF9F27"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={weeklyChartVisible}
                    animationDuration={1000}
                    animationBegin={400}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex gap-5 mt-3">
                {[
                  ['PCW', '#378ADD'],
                  ['FCW', '#E24B4A'],
                  ['LDW', '#EF9F27'],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5" style={{ background: color }} />
                    <span className="text-xs text-white/40 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Right column – zone risk table */}
        <div className="lg:sticky lg:top-8">
          <ChartCard eyebrow="CLUSTER SUMMARY" title="Identified Risk Zones" subtitle="K = 5">
            {/* Table header */}
            <div className="grid grid-cols-[80px_1fr_60px_80px] pb-2 border-b border-white/8 mb-1">
              {['ZONE', 'ALERTS', 'TYPE', 'RISK'].map((h) => (
                <span key={h} className="text-xs text-white/30 font-mono tracking-wider">
                  {h}
                </span>
              ))}
            </div>
            {/* Table rows */}
            {zoneTableData.map((row, idx) => (
              <motion.div
                key={row.zone}
                whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                onClick={() => handleRowClick(idx)}
                className="grid grid-cols-[80px_1fr_60px_80px] items-center p-3 rounded cursor-pointer border-b border-white/5"
              >
                {/* Zone cell */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                  <span className="text-sm text-white font-mono">{row.zone}</span>
                </div>
                {/* Alerts cell – bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/8 rounded overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ background: row.color, borderRadius: 2 }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(row.alerts / 140) * 100}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08 }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <span className="text-xs text-white/50 font-mono min-w-[24px] text-right">{row.alerts}</span>
                </div>
                {/* Type cell */}
                <span className="text-xs font-mono" style={{ color: typeColors[row.type] }}>
                  {row.type}
                </span>
                {/* Risk badge */}
                <span
                  className="text-xs font-mono uppercase px-2 py-0.5 rounded-full"
                  style={riskStyles[row.risk]}
                >
                  {row.risk.toUpperCase()}
                </span>
              </motion.div>
            ))}
            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/8 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-white/25 font-mono">total alert points</span>
                <span className="text-xs text-white font-mono">500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/25 font-mono">prediction recall</span>
                <span className="text-xs text-[#639922] font-mono">0.64</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
