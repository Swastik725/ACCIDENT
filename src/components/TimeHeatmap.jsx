// src/components/TimeHeatmap.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import alertPoints from '../data/alertPoints';

// ----- Static panel data -------------------------------------------------
const panels = [
  {
    interval: '08:00–11:59',
    label: 'Morning Peak',
    total: 12847,
    recall: 0.77,
    dotColor: '#EF9F27', // peak colour
    timeKey: '08:00-11:59', // match alertPoints.timeInterval format (adjust if needed)
  },
  {
    interval: '12:00–15:59',
    label: 'Afternoon Lull',
    total: 4392,
    recall: 0.72,
    dotColor: '#777777', // muted for lull
    timeKey: '12:00-15:59',
  },
  {
    interval: '16:00–19:59',
    label: 'Evening Peak',
    total: 13215,
    recall: 0.78,
    dotColor: '#EF9F27',
    timeKey: '16:00-19:59',
  },
  {
    interval: '20:00–23:59',
    label: 'Night',
    total: 6104,
    recall: 0.71,
    dotColor: '#777777',
    timeKey: '20:00-23:59',
  },
];

// Helper to filter points for a given interval
const filterPoints = (key) =>
  alertPoints.filter((p) => p.timeInterval === key);

export default function TimeHeatmap() {
  return (
    <section
      id="time-heatmap"
      className="bg-[#111111] py-24 px-8 md:px-16 lg:px-24"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Section entry animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto mb-14"
      >
        <p className="text-xs font-mono text-[#EF9F27] tracking-wider mb-2">TEMPORAL ANALYSIS</p>
        <h2 className="text-4xl text-white font-semibold">Alert Clusters by Time of Day</h2>
        <p className="text-base text-white/45 mt-2 max-w-[520px]">
          KDE-style density visualization across the four traffic intervals used in the IIIT Hyderabad thesis
        </p>
      </motion.div>

      {/* Grid of four panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {panels.map((panel, idx) => {
          const points = filterPoints(panel.timeKey);
          return (
            <motion.div
              key={panel.interval}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                {/* Two‑column layout */}
                <div className="flex flex-col md:flex-row">
                  {/* Mini map */}
                  <div className="w-full md:w-7/10" style={{ height: '260px' }}>
                    <MapContainer
                      center={[21.1458, 79.0882]}
                      zoom={11.5}
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
                      {points.map((pt) => (
                        <CircleMarker
                          key={pt.id}
                          center={[pt.lat, pt.lng]}
                          radius={pt.severity === 'severe' ? 4 : 2.5}
                          fillColor={pt.severity === 'severe' ? '#E24B4A' : '#EF9F27'}
                          fillOpacity={0.85}
                          stroke={false}
                        />
                      ))}
                    </MapContainer>
                  </div>

                  {/* Info panel */}
                  <div className="p-5 flex flex-col justify-between" style={{ flexBasis: '30%' }}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ background: panel.dotColor }}
                        />
                        <h3 className="text-2xl text-white font-mono">{panel.interval}</h3>
                      </div>
                      <p className="text-sm text-white/70 mb-4 font-mono">{panel.label}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-mono text-white">{panel.total.toLocaleString()}</div>
                        <div className="text-xs text-white/40 font-mono">TOTAL ALERTS</div>
                      </div>
                      <div>
                        <div className="text-2xl font-mono text-[#639922]">{panel.recall.toFixed(2)}</div>
                        <div className="text-xs text-white/40 font-mono">RECALL vs BLACKSPOTS</div>
                      </div>
                      <div className="text-xs text-white/30 font-mono">
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
