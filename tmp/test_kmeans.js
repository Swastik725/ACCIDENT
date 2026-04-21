const { runKMeans } = require('../src/data/kmeans');
const points = [
  { lat: 21.1, lng: 79.1, alertType: 'PCW', severity: 'severe' },
  { lat: 21.2, lng: 79.2, alertType: 'FCW', severity: 'mild' },
  { lat: 21.15, lng: 79.15, alertType: 'LDW', severity: 'severe' },
  { lat: 21.12, lng: 79.12, alertType: 'PCW', severity: 'mild' },
  { lat: 21.13, lng: 79.13, alertType: 'FCW', severity: 'severe' },
  { lat: 21.14, lng: 79.14, alertType: 'LDW', severity: 'mild' },
  { lat: 21.11, lng: 79.11, alertType: 'PCW', severity: 'severe' },
  { lat: 21.16, lng: 79.16, alertType: 'FCW', severity: 'mild' },
  { lat: 21.17, lng: 79.17, alertType: 'LDW', severity: 'severe' },
  { lat: 21.18, lng: 79.18, alertType: 'PCW', severity: 'mild' },
];
const result = runKMeans(points, 3);
console.log(JSON.stringify(result, null, 2));
