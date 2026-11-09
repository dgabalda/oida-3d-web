// Stapes footplate from the stapes vertices, without Three.js (so the Node tests can check it).
// The stapes' main axis (principal component of its vertices, oriented towards the vestibule) is the
// footplate's normal; the footplate centre is the mean of the vertices in the last 15 % along that axis.
// positions: flat Float32Array [x, y, z, …]; towards: a point inside the vestibule. Returns plain arrays.

export function stapesFootplate(positions, towards) {
  const n = positions.length / 3;
  const mean = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) mean[k] += positions[3 * i + k] / n;
  const c = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) {
    const d = [0, 1, 2].map((k) => positions[3 * i + k] - mean[k]);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) c[a][b] += d[a] * d[b];
  }
  const unit = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
  let axis = unit([1, 1, 1]);
  for (let it = 0; it < 100; it++) axis = unit(c.map((row) => row[0] * axis[0] + row[1] * axis[1] + row[2] * axis[2]));
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  if (dot([0, 1, 2].map((k) => towards[k] - mean[k]), axis) < 0) axis = axis.map((x) => -x);
  const proj = Array.from({ length: n }, (_, i) => dot([0, 1, 2].map((k) => positions[3 * i + k] - mean[k]), axis));
  const max = Math.max(...proj), min = Math.min(...proj);
  const centre = [0, 0, 0];
  let m = 0;
  for (let i = 0; i < n; i++) {
    if (proj[i] <= max - 0.15 * (max - min)) continue;
    for (let k = 0; k < 3; k++) centre[k] += positions[3 * i + k];
    m++;
  }
  return { centre: centre.map((x) => x / m), normal: axis };
}
