// src/data/kmeans.js
// Pure JavaScript Lloyd's algorithm with k-means++ seeding
// Exported as runKMeans(points, k)
// Returns { clusters: [...pointsWithClusterId], centroids: [{lat,lng,id,dominantAlert,riskLevel,pointCount}] }

// Simple deterministic pseudo‑random generator (LCG) for reproducibility
let _seed = 123456789;
function rand() {
  // constants from Numerical Recipes
  _seed = (1664525 * _seed + 1013904223) % 4294967296;
  return _seed / 4294967296;
}

function randRange(min, max) {
  return min + rand() * (max - min);
}

function euclidean(p1, p2) {
  const dLat = p1.lat - p2.lat;
  const dLng = p1.lng - p2.lng;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// k‑means++ seeding
function initCentroidsPP(points, k) {
  const centroids = [];
  // Choose first centroid uniformly at random
  const firstIdx = Math.floor(randRange(0, points.length));
  centroids.push({ lat: points[firstIdx].lat, lng: points[firstIdx].lng });

  while (centroids.length < k) {
    // Compute distance squared to nearest existing centroid for each point
    const distances = points.map(p => {
      let minDist = Infinity;
      for (const c of centroids) {
        const d = euclidean(p, c);
        if (d < minDist) minDist = d;
      }
      return minDist * minDist;
    });
    // Compute cumulative distribution
    const sum = distances.reduce((a, b) => a + b, 0);
    const target = randRange(0, sum);
    let cumulative = 0;
    let selectedIdx = 0;
    for (let i = 0; i < distances.length; i++) {
      cumulative += distances[i];
      if (cumulative >= target) {
        selectedIdx = i;
        break;
      }
    }
    const p = points[selectedIdx];
    centroids.push({ lat: p.lat, lng: p.lng });
  }
  return centroids;
}

function assignClusters(points, centroids) {
  points.forEach(p => {
    let bestIdx = 0;
    let bestDist = euclidean(p, centroids[0]);
    for (let i = 1; i < centroids.length; i++) {
      const d = euclidean(p, centroids[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    p.clusterId = bestIdx;
  });
}

function recomputeCentroids(points, k) {
  const sums = Array.from({ length: k }, () => ({ lat: 0, lng: 0, count: 0 }));
  points.forEach(p => {
    const c = sums[p.clusterId];
    c.lat += p.lat;
    c.lng += p.lng;
    c.count++;
  });
  return sums.map(c => ({ lat: c.count ? c.lat / c.count : 0, lng: c.count ? c.lng / c.count : 0 }));
}

function computeClusterMetadata(points, centroids) {
  // Count points per cluster and alert type distribution
  const clusterInfo = centroids.map((c, idx) => ({
    id: idx,
    lat: c.lat,
    lng: c.lng,
    pointCount: 0,
    alertCounts: { PCW: 0, FCW: 0, LDW: 0 },
  }));
  points.forEach(p => {
    const info = clusterInfo[p.clusterId];
    if (info) {
      info.pointCount++;
      if (p.alertType) info.alertCounts[p.alertType]++;
    }
  });
  // Determine dominantAlert and riskLevel
  // Sort by pointCount descending for risk ranking
  const sorted = [...clusterInfo].sort((a, b) => b.pointCount - a.pointCount);
  sorted.forEach((c, rank) => {
    // risk level based on rank
    if (rank < 2) c.riskLevel = 'severe';
    else if (rank < 4) c.riskLevel = 'moderate';
    else c.riskLevel = 'mild';
    // dominant alert type
    const maxAlert = Object.entries(c.alertCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    c.dominantAlert = maxAlert;
  });
  // Return in original order (by id)
  const byId = {};
  sorted.forEach(c => { byId[c.id] = c; });
  return centroids.map((c, idx) => ({
    id: idx,
    lat: c.lat,
    lng: c.lng,
    pointCount: byId[idx].pointCount,
    dominantAlert: byId[idx].dominantAlert,
    riskLevel: byId[idx].riskLevel,
  }));
}

export const runKMeans = (points, k) => {
  if (k <= 0) throw new Error('k must be > 0');
  // Clone points to avoid mutating original array
  const pts = points.map(p => ({ ...p }));
  let centroids = initCentroidsPP(pts, k);
  const iterations = 15;
  for (let i = 0; i < iterations; i++) {
    assignClusters(pts, centroids);
    centroids = recomputeCentroids(pts, k);
  }
  // Final assignment (ensures every point has clusterId)
  assignClusters(pts, centroids);
  const centroidsMeta = computeClusterMetadata(pts, centroids);
  return { clusters: pts, centroids: centroidsMeta };
};

export default runKMeans;
