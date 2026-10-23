// Shared faceted-star renderer used by the orbit logo and the title stars.
export type Vec = { x: number; y: number; z: number };

// A slim faceted five-point star with a bright pearl edge. Kept thin so it reads as a gem, not a block.
const OUTER = 22;
const INNER = 9;
const THICK = 1.4;
const APEX = 4;
const PERSPECTIVE = 260;

// Object-space mesh: a front and back ring of 10 outline vertices plus one apex per side.
const outline = Array.from({ length: 10 }, (_, i) => {
  const a = (i * Math.PI) / 5 - Math.PI / 2;
  const r = i % 2 ? INNER : OUTER;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
});
const MESH: Vec[] = [
  ...outline.map(p => ({ x: p.x, y: p.y, z: THICK })),
  ...outline.map(p => ({ x: p.x, y: p.y, z: -THICK })),
  { x: 0, y: 0, z: THICK + APEX },
  { x: 0, y: 0, z: -THICK - APEX },
];
const FRONT_APEX = 20;
const BACK_APEX = 21;
const FACES: number[][] = [];
for (let i = 0; i < 10; i++) {
  const n = (i + 1) % 10;
  FACES.push([FRONT_APEX, i, n]);
  FACES.push([BACK_APEX, 10 + n, 10 + i]);
  FACES.push([i, n, 10 + n, 10 + i]);
}

const LIGHT = norm({ x: -0.45, y: -0.6, z: 0.66 });
const HALF = norm({ x: LIGHT.x, y: LIGHT.y, z: LIGHT.z + 1 });

function norm(v: Vec): Vec {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}
function dot(a: Vec, b: Vec) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function cross(a: Vec, b: Vec): Vec {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function rotate(p: Vec, ry: number, rx: number, rz: number): Vec {
  let { x, y, z } = p;
  let c = Math.cos(rz), s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(rx); s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry); s = Math.sin(ry);
  [x, z] = [x * c + z * s, -x * s + z * c];
  return { x, y, z };
}
function mix(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}
function shadeColor(shade: number, spec: number) {
  const deep = [22, 3, 52];
  const violet = [138, 60, 255];
  const pearl = [246, 234, 255];
  const [r, g, b] = shade < 0.5 ? mix(deep, violet, shade * 2) : mix(violet, pearl, (shade - 0.5) * 2);
  const boost = Math.min(1, spec);
  return `rgb(${Math.min(255, r + boost * 90)},${Math.min(255, g + boost * 80)},${Math.min(255, b + boost * 60)})`;
}

export type Point = { x: number; y: number; front: boolean; life: number };
export type Spark = { x: number; y: number; vx: number; vy: number; life: number; size: number; front: boolean };
export type Particles = { trail: Point[]; sparks: Spark[] };

const TRAIL_DECAY = 1.1;
const SPARK_DECAY = 1.6;

/** Advances the comet tail and sparks by dt and records the star's current position. */
export const stepParticles = (p: Particles, dt: number, x: number, y: number, front: boolean) => {
  p.trail.push({ x, y, front, life: 1 });
  p.trail.forEach(t => (t.life -= dt * TRAIL_DECAY));
  p.trail = p.trail.filter(t => t.life > 0);
  for (let i = 0; i < 2; i++) {
    p.sparks.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 16,
      vy: 6 + Math.random() * 14,
      life: 1,
      size: 0.6 + Math.random() * 1.3,
      front,
    });
  }
  p.sparks.forEach(s => {
    s.life -= dt * SPARK_DECAY;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
  });
  p.sparks = p.sparks.filter(s => s.life > 0);
};

/** The thin violet orbit path; `from`/`to` pick the front or back half. */
export const drawRing = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, from: number, to: number) => {
  const grad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  grad.addColorStop(0, "#c48cff00");
  grad.addColorStop(0.5, "#c48cff44");
  grad.addColorStop(1, "#c48cff00");
  ctx.save();
  ctx.strokeStyle = grad;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, from, to);
  ctx.stroke();
  ctx.restore();
};

export const drawTail = (ctx: CanvasRenderingContext2D, trail: Point[], front: boolean) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let i = 1; i < trail.length; i++) {
    const p = trail[i - 1];
    const q = trail[i];
    if (q.front !== front) continue;
    ctx.strokeStyle = `rgba(214,165,255,${Math.max(0, q.life) * 0.65})`;
    ctx.lineWidth = Math.max(0.3, 0.4 + 3.8 * q.life);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  }
  ctx.restore();
};

export const drawSparks = (ctx: CanvasRenderingContext2D, sparks: Spark[], front: boolean) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  sparks.forEach(s => {
    if (s.front !== front) return;
    const r = Math.max(0, s.size * s.life);
    if (r <= 0) return;
    ctx.fillStyle = `rgba(240,220,255,${Math.max(0, s.life)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

export const drawHalo = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(cx, cy, 1, cx, cy, 44);
  halo.addColorStop(0, "rgba(225,175,255,0.5)");
  halo.addColorStop(0.4, "rgba(150,60,255,0.18)");
  halo.addColorStop(1, "rgba(150,60,255,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, size: number) => {
  const V = MESH.map(v => rotate(v, t * 1.1, 0.55 + 0.35 * Math.sin(t * 0.6), 0.25 * Math.sin(t * 0.4)));
  const P = V.map(v => {
    const k = (PERSPECTIVE / (PERSPECTIVE - v.z)) * size;
    return { x: cx + v.x * k, y: cy + v.y * k };
  });
  const centroid = (idx: number[]) => ({
    x: idx.reduce((s, i) => s + V[i].x, 0) / idx.length,
    y: idx.reduce((s, i) => s + V[i].y, 0) / idx.length,
    z: idx.reduce((s, i) => s + V[i].z, 0) / idx.length,
  });
  const faces = FACES.map(idx => {
    const p0 = V[idx[0]], p1 = V[idx[1]], p2 = V[idx[2]];
    let n = norm(cross({ x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z }, { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z }));
    const c = centroid(idx);
    if (dot(n, c) < 0) n = { x: -n.x, y: -n.y, z: -n.z };
    return { idx, n, depth: c.z };
  })
    .filter(f => f.n.z > 0.02)
    .sort((x, y) => x.depth - y.depth);

  faces.forEach(face => {
    const diff = Math.max(0, dot(face.n, LIGHT));
    const spec = Math.pow(Math.max(0, dot(face.n, HALF)), 18);
    const shade = 0.16 + 0.84 * diff;
    ctx.beginPath();
    face.idx.forEach((i, n) => (n ? ctx.lineTo(P[i].x, P[i].y) : ctx.moveTo(P[i].x, P[i].y)));
    ctx.closePath();
    ctx.fillStyle = shadeColor(shade, spec);
    ctx.fill();
    ctx.strokeStyle = "rgba(250,236,255,0.45)";
    ctx.lineWidth = 0.35;
    ctx.stroke();
  });
};

