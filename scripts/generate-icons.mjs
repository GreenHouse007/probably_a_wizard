import sharp from "sharp";
import { writeFileSync } from "fs";

// SVG icon design: dark violet background, wizard hat, stars, question mark
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="96" fill="#15102a"/>

  <!-- Scattered background stars (small dots) -->
  <circle cx="80"  cy="90"  r="5" fill="#c4b5fd" opacity="0.6"/>
  <circle cx="430" cy="70"  r="4" fill="#a78bfa" opacity="0.5"/>
  <circle cx="400" cy="160" r="3" fill="#ddd6fe" opacity="0.5"/>
  <circle cx="60"  cy="220" r="3" fill="#c4b5fd" opacity="0.45"/>
  <circle cx="460" cy="280" r="5" fill="#a78bfa" opacity="0.5"/>
  <circle cx="55"  cy="370" r="4" fill="#ddd6fe" opacity="0.4"/>
  <circle cx="445" cy="410" r="4" fill="#c4b5fd" opacity="0.45"/>
  <circle cx="110" cy="430" r="3" fill="#a78bfa" opacity="0.4"/>

  <!-- 4-point sparkles -->
  <path d="M130 140 L134 152 L138 140 L134 128 Z" fill="#e9d5ff" opacity="0.7"/>
  <path d="M370 110 L374 122 L378 110 L374 98  Z" fill="#ddd6fe" opacity="0.6"/>
  <path d="M460 190 L463 199 L466 190 L463 181 Z" fill="#c4b5fd" opacity="0.55"/>

  <!-- Hat shadow/depth -->
  <path d="M262 80 L378 330 L280 330 Z" fill="#3b0764" opacity="0.4"/>

  <!-- Hat body: tall cone from tip to brim line -->
  <path d="M256 55 L370 330 L142 330 Z" fill="#5b21b6"/>

  <!-- Hat highlight seam -->
  <path d="M256 55 L300 220 L256 210 Z" fill="#7c3aed" opacity="0.35"/>

  <!-- Stars on hat face -->
  <circle cx="210" cy="230" r="7"  fill="#fde68a" opacity="0.9"/>
  <circle cx="295" cy="195" r="5"  fill="#e9d5ff" opacity="0.85"/>
  <circle cx="248" cy="155" r="4"  fill="#fbbf24" opacity="0.8"/>
  <circle cx="228" cy="170" r="3"  fill="#ddd6fe" opacity="0.7"/>
  <circle cx="278" cy="255" r="3.5" fill="#c4b5fd" opacity="0.75"/>

  <!-- Brim: flat ellipse -->
  <ellipse cx="256" cy="332" rx="148" ry="26" fill="#4c1d95"/>
  <!-- Brim highlight rim -->
  <ellipse cx="256" cy="332" rx="148" ry="26" fill="none" stroke="#7c3aed" stroke-width="3.5"/>

  <!-- Hat band -->
  <path d="M152 318 L360 318 L360 346 L152 346 Z" rx="4" fill="#3b0764"/>

  <!-- Buckle plate -->
  <rect x="230" y="316" width="52" height="32" rx="5" fill="#6d28d9" stroke="#a78bfa" stroke-width="2"/>
  <!-- Buckle inner frame -->
  <rect x="238" y="323" width="36" height="18" rx="3" fill="none" stroke="#ddd6fe" stroke-width="1.5"/>
  <!-- Buckle pin (horizontal bar through centre) -->
  <line x1="256" y1="323" x2="256" y2="341" stroke="#ddd6fe" stroke-width="1.5"/>

  <!-- Question mark — the "Probably" -->
  <text
    x="256" y="472"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="96"
    font-weight="bold"
    fill="#7c3aed"
    text-anchor="middle"
    opacity="0.55"
  >?</text>
</svg>`;

const svgBuffer = Buffer.from(svg);

async function generate(size) {
  const png = await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toBuffer();
  writeFileSync(`public/icons/icon-${size}x${size}.png`, png);
  console.log(`✓ icon-${size}x${size}.png`);
}

await generate(192);
await generate(512);
console.log("Done.");
