// Sparkle Cursor Trail (+2 pts) & Retro Chaos Mode (+5 pts) & Day/Night Toggle

let sparklesEnabled = true;
const sparkleColors = ['#ffd166', '#ff5d8f', '#7cc4ff', '#06d6a0', '#ffffff', '#c77dff'];

export function initSparkles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'sparkle-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];

  function addParticle(x, y) {
    if (!sparklesEnabled) return;
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        size: Math.random() * 5 + 3,
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.1,
      });
    }
  }

  window.addEventListener('pointermove', e => addParticle(e.clientX, e.clientY));
  window.addEventListener('pointerdown', e => {
    for (let i = 0; i < 6; i++) addParticle(e.clientX, e.clientY);
  });

  function drawStar(cx, cy, spikes, outerRadius, innerRadius, rot) {
    let x = cx, y = cy;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.rotation += p.spin;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      drawStar(p.x, p.y, 4, p.size, p.size / 2.5, p.rotation);
      ctx.restore();
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

export function toggleSparkles(state) {
  sparklesEnabled = state !== undefined ? state : !sparklesEnabled;
  return sparklesEnabled;
}

// ---- Day / Night Mood Toggle (Tier 1) ----
let isNight = false;
export function toggleDayNight() {
  isNight = !isNight;
  document.body.classList.toggle('night-mode', isNight);
  return isNight;
}

// ---- Retro Chaos Mode (+5 pts Bonus) ----
let isChaos = false;
export function toggleChaosMode() {
  isChaos = !isChaos;
  document.body.classList.toggle('chaos-mode', isChaos);
  return isChaos;
}
