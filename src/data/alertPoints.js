// src/data/alertPoints.js
// Deterministic seeded data generation for 500 alert points across 5 zones in Nagpur

// Simple deterministic pseudo‑random generator (LCG) – same as in kmeans.js for reproducibility
let _seed = 987654321;
function rand() {
  _seed = (1664525 * _seed + 1013904223) % 4294967296;
  return _seed / 4294967296;
}
function randRange(min, max) {
  return min + rand() * (max - min);
}
// Box‑Muller transform using seeded rand()
function randNormal(mean, std) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}

const zones = [
  {
    name: 'A',
    center: { lat: 21.1458, lng: 79.0882 },
    spread: 0.012,
    count: 140,
    alertDist: { PCW: 0.8, FCW: 0.1, LDW: 0.1 },
    severityDist: { severe: 0.7, mild: 0.3 },
  },
  {
    name: 'B',
    center: { lat: 21.1523, lng: 79.0791 },
    spread: 0.009,
    count: 110,
    alertDist: { PCW: 0.33, FCW: 0.34, LDW: 0.33 },
    severityDist: { severe: 0.4, mild: 0.6 },
  },
  {
    name: 'C',
    center: { lat: 21.1401, lng: 79.0701 },
    spread: 0.010,
    count: 95,
    alertDist: { PCW: 0.2, FCW: 0.2, LDW: 0.6 },
    severityDist: { severe: 0.3, mild: 0.7 },
  },
  {
    name: 'D',
    center: { lat: 21.1298, lng: 79.0954 },
    spread: 0.011,
    count: 85,
    alertDist: { PCW: 0.2, FCW: 0.7, LDW: 0.1 },
    severityDist: { severe: 0.5, mild: 0.5 },
  },
  {
    name: 'E',
    center: { lat: 21.1612, lng: 79.1008 },
    spread: 0.013,
    count: 70,
    alertDist: { PCW: 0.4, FCW: 0.2, LDW: 0.4 },
    severityDist: { severe: 0.5, mild: 0.5 },
  },
];

function pickWeighted(dist) {
  const r = rand();
  let cum = 0;
  for (const key in dist) {
    cum += dist[key];
    if (r <= cum) return key;
  }
  // fallback
  const keys = Object.keys(dist);
  return keys[keys.length - 1];
}

let id = 1;
const points = [];
zones.forEach(zone => {
  for (let i = 0; i < zone.count; i++) {
    const lat = randNormal(zone.center.lat, zone.spread);
    const lng = randNormal(zone.center.lng, zone.spread);
    const alertType = pickWeighted(zone.alertDist);
    const severity = pickWeighted(zone.severityDist);
    const timeIntervals = ['8-12', '12-16', '16-20', '20-24'];
    const timeInterval = timeIntervals[Math.floor(rand() * timeIntervals.length)];
    points.push({
      id: id++,
      lat,
      lng,
      alertType,
      timeInterval,
      severity,
      clusterId: null,
    });
  }
});

export default points;
