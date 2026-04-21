// src/components/MapExplorer.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl, Marker } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { runKMeans } from '../data/kmeans';
import alertPoints from '../data/alertPoints';
import ClusterDrawer from './ClusterDrawer';
import 'leaflet/dist/leaflet.css';

// Cluster colors (order matches risk ranking)
const CLUSTER_COLORS = ['#E24B4A', '#EF9F27', '#378ADD', '#1D9E75', '#7F77DD'];

// Debounce helper
function useDebounce(callback, delay) {
  const timeout = useRef(null);
  return (...args) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export default function MapExplorer() {
  // Filters & K
  const [k, setK] = useState(5);
  const [alertFilter, setAlertFilter] = useState('ALL'); // ALL, PCW, FCW, LDW
  const [timeFilter, setTimeFilter] = useState('ALL'); // ALL or interval string
  const [severityFilter, setSeverityFilter] = useState('All'); // All, Severe, Mild

  const [clusters, setClusters] = useState([]); // points with clusterId
  const [centroids, setCentroids] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter points based on current filter state
  const filteredPoints = useMemo(() => {
    return alertPoints.filter(p => {
      const alertOk = alertFilter === 'ALL' || p.alertType === alertFilter;
      const timeOk = timeFilter === 'ALL' || p.timeInterval === timeFilter;
      const sevOk = severityFilter === 'All' || p.severity === severityFilter.toLowerCase();
      return alertOk && timeOk && sevOk;
    });
  }, [alertFilter, timeFilter, severityFilter]);

  // Run K‑Means whenever filters or k change (debounced for slider)
  const runClustering = () => {
    const { clusters: pts, centroids: ctr } = runKMeans(filteredPoints, k);
    setClusters(pts);
    setCentroids(ctr);
  };

  // Debounced version for K slider
  const debouncedRun = useDebounce(runClustering, 150);

  // Effect for initial load and when filters/k change
  useEffect(() => {
    runClustering();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPoints, k]);

  // Update when slider changes (debounce)
  const handleKChange = e => {
    const newK = Number(e.target.value);
    setK(newK);
    debouncedRun();
  };

  // Helper to get color for a cluster id
  const getClusterColor = id => CLUSTER_COLORS[id % CLUSTER_COLORS.length];

  // Create custom DivIcon for centroids with pulse animation
  const createCentroidIcon = (color, label) => {
    return L.divIcon({
      className: 'centroid-marker',
      html: `<div style="background:${color}" class="centroid-inner"><span>${label}</span></div>`,
      iconSize: [28, 28],
    });
  };

  // Click handler for centroid
  const onCentroidClick = centroid => {
    setSelectedCluster(centroid);
    setDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCluster(null);
  };

  // Highlight cluster on map (used by drawer)
  const highlightCluster = centroid => {
    // Fit bounds to points belonging to this cluster
    const pointsInCluster = clusters.filter(p => p.clusterId === centroid.id);
    if (pointsInCluster.length === 0) return;
    const latLngs = pointsInCluster.map(p => [p.lat, p.lng]);
    const bounds = L.latLngBounds(latLngs);
    mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
    // Pulse effect – add a temporary class to those markers
    // We'll toggle a CSS class via state (simple approach)
    setPulseClusterId(centroid.id);
    setTimeout(() => setPulseClusterId(null), 1200);
  };

  const mapRef = useRef(null);
  const [pulseClusterId, setPulseClusterId] = useState(null);

  // Render controls
  const renderControls = () => (
    <div className="w-80 md:w-96 bg-[#0f0f0f] border-r border-white/8 p-6 sticky top-0 h-full flex flex-col">
      {/* K Slider */}
      <div className="mb-6">
        <p className="text-xs font-mono text-[#EF9F27] mb-1">Clusters (K)</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-white font-mono text-2xl">{k}</span>
        </div>
        <input
          type="range"
          min="2"
          max="8"
          value={k}
          onChange={handleKChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer thumb:bg-white thumb:w-4 thumb:h-4 thumb:rounded-full"
        />
        <p className="text-xs text-white/50 mt-1">drag to re‑cluster the map</p>
      </div>

      {/* Alert Type */}
      <div className="mb-6">
        <p className="text-xs font-mono text-[#EF9F27] mb-1">Alert Type</p>
        <div className="flex gap-2">
          {['ALL', 'PCW', 'FCW', 'LDW'].map(type => (
            <motion.button
              key={type}
              layout
              onClick={() => setAlertFilter(type)}
              className={`px-3 py-1 rounded text-sm font-mono ${alertFilter === type ? 'bg-white text-black' : 'bg-transparent border border-white/20 text-white/70'} transition-colors`}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Interval */}
      <div className="mb-6">
        <p className="text-xs font-mono text-[#EF9F27] mb-1">Time Window</p>
        <div className="flex flex-col gap-1">
          {['ALL', '8-12', '12-16', '16-20', '20-24'].map(interval => (
            <motion.button
              key={interval}
              layout
              onClick={() => setTimeFilter(interval)}
              className={`text-left px-3 py-2 rounded text-sm font-mono ${timeFilter === interval ? 'border-l-4 border-[#EF9F27] bg-[#EF9F27]/8 text-white' : 'text-white/70'} transition-colors`}
            >
              {interval === 'ALL' ? 'All Intervals' : `${interval}`}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div className="mb-6">
        <p className="text-xs font-mono text-[#EF9F27] mb-1">Severity</p>
        <div className="flex gap-2">
          {['All', 'Severe', 'Mild'].map(s => (
            <motion.button
              key={s}
              layout
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded text-sm font-mono ${severityFilter === s ? 'bg-white text-black' : 'bg-transparent border border-white/20 text-white/70'} transition-colors`}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-auto">
        <p className="text-xs font-mono text-[#EF9F27] mb-2">Cluster Colors</p>
        <div className="space-y-2">
          {centroids.map(c => (
            <div key={c.id} className="flex items-center justify-between text-sm text-white/70">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ background: getClusterColor(c.id) }} />
                <span>{`Zone ${String.fromCharCode(65 + c.id)}`}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs uppercase" style={{ background: 'rgba(255,255,255,0.1)' }}>{c.riskLevel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render map markers
  const renderPoints = () => (
    clusters.map(p => {
      const color = getClusterColor(p.clusterId);
      const isPulsing = pulseClusterId === p.clusterId;
      return (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={p.severity === 'severe' ? 5 : 3}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.75,
            stroke: false,
          }}
          eventHandlers={{
            mouseover: e => {
              e.target.setStyle({ fillOpacity: 1, radius: p.severity === 'severe' ? 7 : 5 });
            },
            mouseout: e => {
              e.target.setStyle({ fillOpacity: 0.75, radius: p.severity === 'severe' ? 5 : 3 });
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} className="bg-[#1a1a1a] text-white text-xs font-mono p-1 rounded">
            [{p.alertType}] {p.lat.toFixed(4)}, {p.lng.toFixed(4)}<br />
            Time: {p.timeInterval} · {p.severity.charAt(0).toUpperCase() + p.severity.slice(1)}<br />
            Cluster: Zone {String.fromCharCode(65 + p.clusterId)}
          </Tooltip>
        </CircleMarker>
      );
    })
  );

  // Render centroids
  const renderCentroids = () => (
    centroids.map(c => {
      const color = getClusterColor(c.id);
      const icon = createCentroidIcon(color, String.fromCharCode(65 + c.id));
      return (
        <Marker
          key={`centroid-${c.id}`}
          position={[c.lat, c.lng]}
          icon={icon}
          eventHandlers={{ click: () => onCentroidClick(c) }}
        />
      );
    })
  );

  return (
    <section id="map-explorer" className="relative min-h-screen" style={{ scrollMarginTop: '80px' }}>
      <motion.div
        className="flex flex-col md:flex-row"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Controls */}
        {renderControls()}
        {/* Map */}
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 80px)' }}>
          <MapContainer
            center={[21.1458, 79.0882]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            whenCreated={map => (mapRef.current = map)}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; CartoDB"
            />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
              // fallback – will be displayed if Carto fails (Leaflet will load both, but order ensures Carto on top)
            />
            <ZoomControl position="bottomright" />
            {renderPoints()}
            {renderCentroids()}
          </MapContainer>
        </div>
      </motion.div>

      {/* Cluster Drawer */}
      {selectedCluster && (
        <ClusterDrawer
          isOpen={drawerOpen}
          onClose={closeDrawer}
          centroid={selectedCluster}
          points={clusters.filter(p => p.clusterId === selectedCluster.id)}
          onHighlight={() => highlightCluster(selectedCluster)}
        />
      )}

      {/* CSS for centroid marker and pulse */}
      <style>{`
        .centroid-marker {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .centroid-inner {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
          position: relative;
        }
        .centroid-marker::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid currentColor;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
