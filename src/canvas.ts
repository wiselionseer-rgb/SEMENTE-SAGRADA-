import { GameState } from './gameState';
import { Seed } from './data';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: string; // 'water', 'nutri', 'magic'
  life: number;
  maxLife: number;
}
let particles: Particle[] = [];
let lastTime = performance.now();

export function emitRain() {
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * 320,
      y: Math.random() * -200, 
      vx: (Math.random() - 0.5) * 1,
      vy: 8 + Math.random() * 5,
      type: 'water',
      life: 1,
      maxLife: 1.5 + Math.random()
    });
  }
}

export function emitFertilizer() {
   for (let i = 0; i < 50; i++) {
    particles.push({
      x: 60 + Math.random() * 200,
      y: 350 + (Math.random() - 0.5) * 50, 
      vx: (Math.random() - 0.5) * 3,
      vy: -(2 + Math.random() * 4), 
      type: 'nutri',
      life: 1,
      maxLife: 1.5 + Math.random() * 1.5
    });
  }   
}

export function emitPrune() {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: 120 + Math.random() * 80,
      y: 150 + Math.random() * 100, 
      vx: (Math.random() - 0.5) * 4,
      vy: -1 + Math.random() * 2, 
      type: 'leaf',
      life: 1,
      maxLife: 2 + Math.random()
    });
  }
}

export function emitHarvest() {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: 160,
      y: 150, 
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15, 
      type: 'magic',
      life: 1,
      maxLife: 2 + Math.random() * 2
    });
  }
}

export function drawGarden(canvas: HTMLCanvasElement, G: GameState, s: Seed) {
  // Balanced resolution for a crisp "90s PC Game" pixel art feel
  const RES_W = 320;
  const RES_H = 420;
  
  if (canvas.width !== RES_W || canvas.height !== RES_H) {
    canvas.width = RES_W; canvas.height = RES_H;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Ensure pixelated rendering
  ctx.imageSmoothingEnabled = false;
  
  ctx.clearRect(0, 0, RES_W, RES_H);
  if (!G.planted || G.harvested) return;

  const cx = RES_W / 2;
  const soilY = RES_H - 55; // LIFTED SOIL LINE
  const age = G.gameDay - G.plantDay;
  const growR = Math.min(1, age / s.days);
  const stage = G.stage;

  // Stage 0: Seedling / Muda
  if (stage === 0) {
    ctx.fillStyle = '#6d4c41'; // Seed color
    ctx.fillRect(cx - 2, soilY - 2, 4, 4);
    ctx.fillStyle = s.leafColor;
    ctx.fillRect(cx - 4, soilY - 6, 3, 3);
    ctx.fillRect(cx + 1, soilY - 6, 3, 3);
    return;
  }

  const baseH = Math.max(20, 25 + growR * Math.min(soilY - 80, 280));
  const lSize = 6 + growR * 25;

  // Stem - Tapered pixel look
  ctx.lineWidth = Math.max(2, Math.round(2 + growR * 5));
  ctx.lineCap = 'butt';
  ctx.strokeStyle = s.stemColor;
  ctx.beginPath();
  ctx.moveTo(cx, soilY);
  const sw = 10 * Math.sin(growR * Math.PI) * (stage / 5);
  ctx.bezierCurveTo(cx - sw, soilY - baseH / 3, cx + sw, soilY - 2 * baseH / 3, cx, soilY - baseH);
  ctx.stroke();

  // Leaves - Cannabis style (fan leaves)
  const leafColor = stage >= 4 ? s.flowerColor : s.leafColor;
  const numLeafPairs = Math.max(2, Math.floor(1 + stage * 1.5));

  function fanLeaf(x: number, y: number, angle: number, size: number, color: string) {
    if (!ctx) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    
    ctx.fillStyle = color;
    // Drawing a more jagged, 5-point cannabis leaf in pixel style
    // Central blade
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.3, -size * 0.1);
    ctx.lineTo(size * 0.6, -size * 0.1);
    ctx.lineTo(size, 0);
    ctx.lineTo(size * 0.6, size * 0.1);
    ctx.lineTo(size * 0.3, size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Side blades (Upper)
    [0.55, -0.55].forEach(rot => {
      ctx.save(); ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size * 0.25, -size * 0.08);
      ctx.lineTo(size * 0.5, -size * 0.08);
      ctx.lineTo(size * 0.85, 0);
      ctx.lineTo(size * 0.5, size * 0.08);
      ctx.lineTo(size * 0.25, size * 0.08);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // Side blades (Lower/Small)
    if (size > 15) {
      [1.1, -1.1].forEach(rot => {
        ctx.save(); ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.2, -size * 0.06);
        ctx.lineTo(size * 0.4, 0);
        ctx.lineTo(size * 0.2, size * 0.06);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });
    }
    
    // Highlight vein
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(size * 0.1, -1, size * 0.6, 1);
    
    ctx.restore();
  }

  // Draw clusters of leaves
  for (let i = 0; i < numLeafPairs; i++) {
    const yO = (i + 0.5) / numLeafPairs;
    const ly = soilY - baseH * yO;
    const ls = lSize * (0.4 + yO * 0.6);
    fanLeaf(cx, ly, -Math.PI / 4, ls, leafColor);
    fanLeaf(cx, ly, Math.PI + Math.PI / 4, ls, leafColor);
  }
  
  // Dense buds for flowering stages - More chunky and "trichome" heavy
  if (stage >= 4) {
    const budClusters = 6 + Math.floor(growR * 10);
    const flowerColor2 = s.flowerColor;
    
    for (let i = 0; i < budClusters; i++) {
      const yO = 0.25 + (i / budClusters) * 0.7;
      const spread = 14 * Math.sin(yO * Math.PI) * growR;
      const bx = cx + (i % 2 === 0 ? -spread : spread);
      const by = soilY - baseH * yO;
      const budW = 8 + Math.round(growR * 10);
      const budH = 6 + Math.round(growR * 8);
      
      // Outer fluff
      ctx.fillStyle = s.budsColor;
      ctx.beginPath();
      ctx.arc(bx, by, budW/2, 0, Math.PI*2);
      ctx.fill();

      // Core
      ctx.fillStyle = flowerColor2;
      ctx.fillRect(bx - budW/4, by - budH/4, budW/2, budH/2);
      
      // Trichomes / Crystals (white dots)
      if (stage >= 5) {
        ctx.fillStyle = '#ffffffaa';
        for(let j=0; j<4; j++) {
          ctx.fillRect(bx - budW/3 + Math.random()*budW/1.5, by - budH/3 + Math.random()*budH/1.5, 1, 1);
        }
      }
    }

    // Main Top Cola - The biggest one
    const cY = soilY - baseH;
    const colaW = 16 + Math.round(growR * 18);
    const colaH = 22 + Math.round(growR * 22);
    
    // Cola shadow/glow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(cx - colaW/2 + 2, cY - colaH/2 + 2, colaW, colaH);
    
    // Cola main body
    ctx.fillStyle = s.budsColor;
    ctx.beginPath();
    ctx.ellipse(cx, cY - colaH/4, colaW/2, colaH/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cola inner highlights
    ctx.fillStyle = s.flowerColor;
    ctx.beginPath();
    ctx.ellipse(cx, cY - colaH/4, colaW/3, colaH/3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (stage >= 5) {
      ctx.fillStyle = '#fff'; // Trichomes
      for(let j=0; j<12; j++) {
        ctx.fillRect(cx - colaW/3 + Math.random()*colaW/1.5, cY - colaH/2 + Math.random()*colaH/1.2, 1.5, 1.5);
      }
      // Orange hairs
      ctx.fillStyle = '#ff9100';
      for(let j=0; j<6; j++) {
        ctx.fillRect(cx - colaW/2 + Math.random()*colaW, cY - colaH/2 + Math.random()*colaH, 2, 1);
      }
    }
  }

  // UI Text Overlays (Pixel style)
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = 2;
  
  if (stage >= 5) {
    ctx.fillStyle = '#ffff00';
    ctx.font = '22px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    ctx.fillText('✨ COLHER! ✨', cx, soilY - baseH - 50);
  }
  
  ctx.fillStyle = s.color;
  ctx.font = '18px "Press Start 2P", monospace'; ctx.textAlign = 'center';
  ctx.fillText(s.name.toUpperCase(), cx, soilY + 25);
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.fillStyle = '#aaffaa';
  ctx.fillText(`${s.stages[stage]} | DIA ${age}`, cx, soilY + 50);

  // Add ambient particles randomly
  if (Math.random() < 0.1 && !G.harvested) {
    particles.push({
      x: Math.random() * RES_W,
      y: RES_H, 
      vx: (Math.random() - 0.5) * 1,
      vy: -(0.5 + Math.random() * 1),
      type: 'ambient',
      life: 1,
      maxLife: 3 + Math.random() * 2
    });
  }

  // Draw background effect slightly
  // Let's draw particles
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp dt to 0.1s
  lastTime = now;

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    p.x += p.vx;
    p.y += p.vy;
    
    // Apply gravity
    if (p.type === 'water') {
      p.vy += 0.2; // gravity
      ctx.fillStyle = 'rgba(0, 200, 255, ' + (p.life/p.maxLife) + ')';
      ctx.fillRect(p.x, p.y, 2, 6);
    } else if (p.type === 'nutri') {
      p.vy += 0.05;
      p.x += Math.sin(p.life * 10) * 0.5; // wobble
      ctx.fillStyle = 'rgba(255, 150, 0, ' + (p.life/p.maxLife) + ')';
      ctx.fillRect(p.x, p.y, 3, 3);
    } else if (p.type === 'leaf') {
      p.vy += 0.1;
      p.x += Math.sin(p.life * 5) * 1;
      ctx.fillStyle = `rgba(0, ${150 + Math.random()*50}, 0, ` + (p.life/p.maxLife) + ')';
      ctx.fillRect(p.x, p.y, 4, 4);
    } else if (p.type === 'magic') {
      p.vy += 0.1;
      ctx.fillStyle = `hsla(${Math.random()*360}, 100%, 50%, ${p.life/p.maxLife})`;
      ctx.fillRect(p.x, p.y, 4, 4);
    } else if (p.type === 'ambient') {
      p.x += Math.sin(p.life * 3) * 0.5;
      ctx.fillStyle = `rgba(${s.color.replace('#', '').match(/.{2}/g)?.map(c => parseInt(c, 16)).join(',') || '0,255,0'}, ${(p.life/p.maxLife) * 0.3})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
      ctx.fill();
    }
  }
}
