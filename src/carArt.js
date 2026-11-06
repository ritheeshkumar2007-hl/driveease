// Draws a colourful illustration of a car (no external images needed, always loads).
const BODIES = {
  Hatchback: {
    body: 'M34 124 L34 104 Q34 94 48 91 L88 84 L112 58 Q118 52 128 52 L200 52 Q214 52 222 62 L248 90 L276 96 Q288 99 288 112 L288 124 Z',
    win: ['M116 80 L124 60 L158 60 L158 80 Z', 'M166 60 L202 60 Q210 60 216 68 L232 80 L166 80 Z'],
    hl: [281, 104], tl: [34, 98],
  },
  Sedan: {
    body: 'M26 124 L26 102 Q26 94 40 92 L76 88 L112 62 Q118 56 130 56 L196 56 Q208 56 216 64 L240 88 L278 94 Q294 98 294 112 L294 124 Z',
    win: ['M118 84 L128 62 L160 62 L160 84 Z', 'M168 62 L196 62 Q206 62 212 70 L228 84 L168 84 Z'],
    hl: [288, 104], tl: [26, 98],
  },
  SUV: {
    body: 'M30 124 L30 84 Q30 74 42 72 L70 70 L92 46 Q96 42 104 42 L214 42 Q222 42 228 50 L246 72 L278 80 Q292 84 292 100 L292 124 Z',
    win: ['M100 70 L108 50 L150 50 L150 70 Z', 'M158 50 L212 50 Q218 50 222 56 L236 70 L158 70 Z'],
    hl: [285, 92], tl: [30, 88],
  },
  MUV: {
    body: 'M26 124 L26 76 Q26 64 38 62 L196 58 Q210 58 218 66 L246 90 L282 96 Q294 100 294 112 L294 124 Z',
    win: ['M40 84 L40 68 L96 66 L96 84 Z', 'M104 66 L150 66 L150 84 L104 84 Z', 'M158 66 L200 66 Q208 66 214 72 L232 84 L158 84 Z'],
    hl: [288, 104], tl: [26, 90],
  },
  Jeep: {
    body: 'M40 124 L40 70 L58 62 L200 62 L214 82 L270 84 Q284 86 284 100 L284 124 Z',
    win: ['M62 70 L98 70 L98 90 L62 90 Z', 'M106 70 L194 70 L204 90 L106 90 Z'],
    hl: [278, 96], tl: [40, 90],
  },
};

const PALETTE = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#0ea5e9'];

function hash(s) {
  let h = 0;
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 100003;
  return h;
}

export function carColor(car) {
  return car.color || PALETTE[hash(car.id || car.name) % PALETTE.length];
}

export function carSvg(car) {
  const name = car.name || '';
  const kind = /thar|bolero|gurkha|jimny/i.test(name) ? 'Jeep' : BODIES[car.type] ? car.type : 'Hatchback';
  const b = BODIES[kind];
  const c = carColor(car);
  const id = 'g' + hash((car.id || '') + name);
  const wheel = (cx) =>
    `<circle cx="${cx}" cy="124" r="27" fill="#0f172a"/><circle cx="${cx}" cy="124" r="21" fill="#1f2937"/><circle cx="${cx}" cy="124" r="11" fill="#e5e7eb"/><circle cx="${cx}" cy="124" r="4" fill="#6b7280"/>`;
  const ev = car.fuel === 'Electric'
    ? '<path d="M174 108 L162 124 L171 124 L166 138 L182 118 L173 118 Z" fill="#fde047" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>'
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${name}">
<defs>
<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".45"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="#000000" stop-opacity=".25"/></linearGradient>
</defs>
<rect width="320" height="170" fill="url(#${id}s)"/>
<circle cx="268" cy="34" r="20" fill="#fef08a" opacity=".9"/>
<ellipse cx="70" cy="34" rx="30" ry="9" fill="#fff" opacity=".8"/><ellipse cx="92" cy="28" rx="22" ry="8" fill="#fff" opacity=".8"/>
<path d="M0 128 Q60 96 120 120 T240 112 T320 120 L320 170 L0 170 Z" fill="${c}" opacity=".25"/>
<rect y="140" width="320" height="30" fill="#334155"/><rect y="140" width="320" height="3" fill="#cbd5e1"/>
<g fill="#f8fafc" opacity=".8"><rect x="10" y="158" width="30" height="4" rx="2"/><rect x="90" y="158" width="30" height="4" rx="2"/><rect x="170" y="158" width="30" height="4" rx="2"/><rect x="250" y="158" width="30" height="4" rx="2"/></g>
<ellipse cx="160" cy="148" rx="130" ry="6" fill="#000" opacity=".25"/>
<path d="${b.body}" fill="url(#${id}b)"/>
${b.win.map((w) => `<path d="${w}" fill="#bae6fd" stroke="#0f172a" stroke-opacity=".35" stroke-width="1.5"/>`).join('')}
<rect x="${b.hl[0] - 8}" y="${b.hl[1]}" width="10" height="7" rx="3" fill="#fef08a" stroke="#ffffff"/>
<rect x="${b.tl[0]}" y="${b.tl[1]}" width="7" height="9" rx="2" fill="#dc2626"/>
<path d="M100 96 H220" stroke="#000" stroke-opacity=".15" stroke-width="2"/>
${ev}
${wheel(92)}${wheel(238)}
</svg>`;
}
