// src/components/MapExplorer.jsx
import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl, Marker } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { runKMeans } from '../data/kmeans';
import 'leaflet/dist/leaflet.css';

// Cluster colors (order matches risk ranking)
const CLUSTER_COLORS = ['#E24B4A', '#EF9F27', '#378ADD', '#639922', '#7F77DD'];

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

const MapExplorer = forwardRef(({ 
  alertPoints = [], 
  blackspots = [], 
  highlightedClusterId = null,
  onHighlightCluster = () => {}
}, ref) => {
  // Filters & K
  const [k, setK] = useState(5);
  const [alertFilter, setAlertFilter] = useState('ALL'); // ALL, PCW, FCW, LDW
  const [timeFilter, setTimeFilter] = useState('ALL'); // ALL or interval string
  const [severityFilter, setSeverityFilter] = useState('All'); // All, Severe, Mild

  const [clusters, setClusters] = useState([]); // points with clusterId
  const [centroids, setCentroids] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [pulseClusterId, setPulseClusterId] = useState(null);
  
  const mapRef = useRef(null);

  // Expose the map instance to the parent
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    flyTo: (lat, lng, zoom = 15) => mapRef.current?.flyTo([lat, lng], zoom)
  }));

  // Filter points based on current filter state
  const filteredPoints = useMemo(() => {
    return alertPoints.filter(p => {
      const alertOk = alertFilter === 'ALL' || p.alertType === alertFilter;
      const timeOk = timeFilter === 'ALL' || p.timeInterval === timeFilter;
      const sevOk = severityFilter === 'All' || p.severity === severityFilter.toLowerCase();
      return alertOk && timeOk && sevOk;
    });
  }, [alertPoints, alertFilter, timeFilter, severityFilter]);

  // Run K‑Means whenever filters or k change
  const runClustering = () => {
    if (filteredPoints.length === 0) return;
    const { clusters: pts, centroids: ctr } = runKMeans(filteredPoints, k);
    setClusters(pts);
    setCentroids(ctr);
  };

  const debouncedRun = useDebounce(runClustering, 150);

  useEffect(() => {
    runClustering();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPoints, k]);

  // Handle highlightedClusterId from props
  useEffect(() => {
    if (highlightedClusterId !== null) {
      const centroid = centroids.find(c => c.id === highlightedClusterId);
      if (centroid && mapRef.current) {
        mapRef.current.flyTo([centroid.lat, centroid.lng], 15, {
          duration: 1.5,
          easeLinearity: 0.25
        });
        setPulseClusterId(highlightedClusterId);
        setTimeout(() => setPulseClusterId(null), 3000);
      }
    }
  }, [highlightedClusterId, centroids]);

  const handleKChange = e => {
    const newK = Number(e.target.value);
    setK(newK);
    debouncedRun();
  };

  const getClusterColor = id => CLUSTER_COLORS[id % CLUSTER_COLORS.length];

  const createCentroidIcon = (color, label) => {
    return L.divIcon({
      className: 'centroid-marker',
      html: `<div style="background:${color}" class="centroid-inner"><span>${label}</span></div>`,
      iconSize: [28, 28],
    });
  };

  const renderControls = () => (
    <div className="w-80 md:w-96 bg-[#0f0f0f] border-r border-white/8 p-6 lg:p-8 flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <p className="text-xs font-mono text-moderate mb-2">Clustering Parameters</p>
        <div className="flex justify-between items-end mb-2">
          <span className="text-white font-mono text-3xl">{k}</span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest pb-1">Cluster count (K)</span>
        </div>
        <input
          type="range"
          min="2"
          max="8"
          value={k}
          onChange={handleKChange}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-moderate"
        />
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-moderate mb-3">Alert Type Filter</p>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PCW', 'FCW', 'LDW'].map(type => (
            <button
              key={type}
              onClick={() => setAlertFilter(type)}
              className={`px-3 py-1 rounded text-xs font-mono border ${alertFilter === type ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-white/50 hover:border-white/40'} transition-all`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-moderate mb-3">Temporal Distribution</p>
        <div className="grid grid-cols-2 gap-2">
          {['ALL', '8-12', '12-16', '16-20', '20-24'].map(interval => (
            <button
              key={interval}
              onClick={() => setTimeFilter(interval)}
              className={`text-left px-3 py-2 rounded text-[11px] font-mono border ${timeFilter === interval ? 'bg-moderate/10 border-moderate text-white' : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'} transition-all`}
            >
              {interval === 'ALL' ? 'Full Day' : `${interval} hrs`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-white/5">
        <p className="text-xs font-mono text-moderate mb-4">Live Centroids</p>
        <div className="space-y-3">
          {centroids.map(c => (
            <div key={c.id} className="flex items-center justify-between group cursor-pointer" onClick={() => onHighlightCluster(c.id)}>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 transition-transform group-hover:scale-125`} style={{ background: getClusterColor(c.id) }} />
                <span className="text-sm text-white/80 font-mono tracking-tight group-hover:text-white transition-colors">{`Zone ${String.fromCharCode(65 + c.id)}`}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/5">{c.riskLevel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-[700px] bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden glass-effect mx-4 lg:mx-8">
      {renderControls()}
      
      <div className="flex-1 relative bg-[#0f0f0f]">
        <MapContainer
          center={[21.1458, 79.0882]}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <ZoomControl position="bottomright" />
          
          {clusters.map(p => {
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
                  fillOpacity: isPulsing ? 1 : 0.6,
                  stroke: isPulsing,
                  weight: 2
                }}
              >
                <Tooltip direction="top" className="custom-tooltip">
                  <div className="p-2 font-mono text-[10px]">
                    <span className="text-white/50 uppercase">Type:</span> {p.alertType}<br/>
                    <span className="text-white/50 uppercase">Zone:</span> {String.fromCharCode(65 + p.clusterId)}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {centroids.map(c => (
            <Marker
              key={`centroid-${c.id}`}
              position={[c.lat, c.lng]}
              icon={createCentroidIcon(getClusterColor(c.id), String.fromCharCode(65 + c.id))}
              eventHandlers={{ click: () => onHighlightCluster(c.id) }}
            />
          ))}
        </MapContainer>

        {/* Floating Tooltip Style */}
        <style>{`
          .custom-tooltip {
            background: #111111 !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            color: white !important;
            border-radius: 4px !important;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5) !important;
          }
          .centroid-marker {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .centroid-inner {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            border: 2px solid rgba(255,255,255,0.2);
          }
        `}</style>
      </div>
    </div>
  );
});

MapExplorer.displayName = 'MapExplorer';

export default MapExplorer;
