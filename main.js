const loaderFill = document.getElementById('loader-fill');
let progress = 0;
const loadInterval = setInterval(() => {
  progress += Math.random() * 15 + 5;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadInterval);
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 400);
  }
  loaderFill.style.width = progress + '%';
}, 120);


const skyCanvas = document.getElementById('sky-canvas');
const skyCtx    = skyCanvas.getContext('2d');

function resizeSky() {
  skyCanvas.width  = window.innerWidth;
  skyCanvas.height = window.innerHeight * 0.6;
}
resizeSky();

const clouds = Array.from({ length: 8 }, () => ({
  x:       Math.random() * window.innerWidth,
  y:       40 + Math.random() * 120,
  speed:   0.15 + Math.random() * 0.2,
  scale:   0.6 + Math.random() * 0.8,
  opacity: 0.3 + Math.random() * 0.4,
}));

function drawSky(t) {
  const w = skyCanvas.width, h = skyCanvas.height;
  skyCtx.clearRect(0, 0, w, h);

  const phase = (Math.sin(t * 0.0003) + 1) * 0.5;
  const grad  = skyCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, `hsl(${200 + phase * 30}, 70%, ${60 - phase * 20}%)`);
  grad.addColorStop(0.5, `hsl(${20 + phase * 20}, ${60 + phase * 30}%, ${70 - phase * 10}%)`);
  grad.addColorStop(1, `hsl(${40 + phase * 10}, ${50 + phase * 30}%, ${80 - phase * 10}%)`);
  skyCtx.fillStyle = grad;
  skyCtx.fillRect(0, 0, w, h);

  /* Sun */
  const sunX  = w * 0.5 + Math.sin(t * 0.0002) * w * 0.1;
  const sunY  = h * 0.3 + Math.sin(t * 0.0001) * h * 0.1;
  const sGrad = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
  sGrad.addColorStop(0, 'rgba(255,255,220,0.95)');
  sGrad.addColorStop(0.3, 'rgba(255,215,0,0.8)');
  sGrad.addColorStop(0.7, 'rgba(255,140,66,0.3)');
  sGrad.addColorStop(1, 'transparent');
  skyCtx.fillStyle = sGrad;
  skyCtx.fillRect(sunX - 80, sunY - 80, 160, 160);

  /* Clouds */
  clouds.forEach(cloud => {
    cloud.x += cloud.speed;
    if (cloud.x > w + 300) cloud.x = -300;

    skyCtx.save();
    skyCtx.globalAlpha = cloud.opacity;
    skyCtx.translate(cloud.x, cloud.y);
    skyCtx.scale(cloud.scale, cloud.scale * 0.7);

    const cg = skyCtx.createRadialGradient(0, 0, 0, 0, 0, 80);
    cg.addColorStop(0, 'rgba(255,255,255,0.9)');
    cg.addColorStop(1, 'rgba(255,200,150,0)');
    skyCtx.fillStyle = cg;

    [
      [0, 0, 80],
      [-60, 20, 55],
      [60, 20, 50],
    ].forEach(([cx, cy, r]) => {
      skyCtx.beginPath();
      skyCtx.arc(cx, cy, r, 0, Math.PI * 2);
      skyCtx.fill();
    });
    skyCtx.restore();
  });
}

const oceanCanvas = document.getElementById('ocean-canvas');
const oceanCtx    = oceanCanvas.getContext('2d');

function resizeOcean() {
  oceanCanvas.width  = window.innerWidth;
  oceanCanvas.height = window.innerHeight * 0.55;
}
resizeOcean();

window.addEventListener('resize', () => { resizeSky(); resizeOcean(); });

function drawOcean(t) {
  const w = oceanCanvas.width, h = oceanCanvas.height;
  oceanCtx.clearRect(0, 0, w, h);

  const oGrad = oceanCtx.createLinearGradient(0, 0, 0, h);
  oGrad.addColorStop(0,   '#00D4D8');
  oGrad.addColorStop(0.3, '#00B8CC');
  oGrad.addColorStop(0.7, '#006E82');
  oGrad.addColorStop(1,   '#003D4D');
  oceanCtx.fillStyle = oGrad;
  oceanCtx.fillRect(0, 0, w, h);

  const rGrad = oceanCtx.createLinearGradient(w * 0.5 - 60, 0, w * 0.5 + 60, h * 0.5);
  rGrad.addColorStop(0, 'rgba(255,215,0,0.6)');
  rGrad.addColorStop(0.5, 'rgba(255,140,66,0.3)');
  rGrad.addColorStop(1, 'transparent');
  oceanCtx.fillStyle = rGrad;
  for (let i = 0; i < 12; i++) {
    const wx = Math.sin(t * 0.001 + i * 0.8) * 25;
    oceanCtx.fillRect(w * 0.5 - 15 + wx + i * 6,  i * h * 0.06, 8 - i * 0.5, h * 0.06);
    oceanCtx.fillRect(w * 0.5 - 15 + wx - i * 6,  i * h * 0.06, 8 - i * 0.5, h * 0.06);
  }

  for (let layer = 0; layer < 6; layer++) {
    const baseY = h * (0.05 + layer * 0.15);
    const speed = (0.4 + layer * 0.2) * (layer % 2 === 0 ? 1 : -1);
    const amp   = 8 + layer * 3;
    const freq  = 0.006 - layer * 0.0005;
    const alpha = 0.08 + (5 - layer) * 0.04;

    oceanCtx.beginPath();
    oceanCtx.moveTo(0, h);
    for (let x = 0; x <= w; x += 3) {
      const y = baseY
        + Math.sin(x * freq + t * 0.001 * speed) * amp
        + Math.sin(x * freq * 1.7 + t * 0.0008 * speed) * amp * 0.5;
      x === 0 ? oceanCtx.moveTo(x, y) : oceanCtx.lineTo(x, y);
    }
    oceanCtx.lineTo(w, h);
    oceanCtx.lineTo(0, h);
    oceanCtx.closePath();

    const wGrad = oceanCtx.createLinearGradient(0, baseY - amp, 0, h);
    const hue   = 190 - layer * 5;
    wGrad.addColorStop(0, `hsla(${hue}, 80%, 60%, ${alpha + 0.15})`);
    wGrad.addColorStop(1, `hsla(${hue}, 80%, 40%, ${alpha})`);
    oceanCtx.fillStyle = wGrad;
    oceanCtx.fill();

    if (layer < 3) {
      oceanCtx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const y = baseY + Math.sin(x * freq + t * 0.001 * speed) * amp;
        oceanCtx.moveTo(x, y);
        oceanCtx.lineTo(x + 15, y);
      }
      oceanCtx.strokeStyle = `rgba(255,255,255,${0.1 + (2 - layer) * 0.05})`;
      oceanCtx.lineWidth = 1.5;
      oceanCtx.stroke();
    }
  }

  oceanCtx.beginPath();
  for (let x = 0; x <= w; x += 3) {
    const y = h - 30 + Math.sin(x * 0.03 + t * 0.003) * 8;
    x === 0 ? oceanCtx.moveTo(x, y) : oceanCtx.lineTo(x, y);
  }
  oceanCtx.lineTo(w, h);
  oceanCtx.lineTo(0, h);
  oceanCtx.closePath();

  const foamGrad = oceanCtx.createLinearGradient(0, h - 50, 0, h);
  foamGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
  foamGrad.addColorStop(1, 'rgba(255,255,255,0.1)');
  oceanCtx.fillStyle = foamGrad;
  oceanCtx.fill();
}

function animatePalms(t) {
  const palmNL = document.getElementById('palmNL');
  const palmNR = document.getElementById('palmNR');
  const palm1  = document.getElementById('palm1');
  const palm2  = document.getElementById('palm2');

  if (palmNL) {
    const a = Math.sin(t * 0.001) * 4 + Math.sin(t * 0.0017) * 2;
    palmNL.style.transform       = `rotate(${a}deg)`;
    palmNL.style.transformOrigin = '140px 580px';
  }
  if (palmNR) {
    const a = Math.sin(t * 0.001 + 1) * 4 + Math.sin(t * 0.0017 + 0.5) * 2;
    palmNR.style.transform       = `rotate(${a}deg)`;
    palmNR.style.transformOrigin = '160px 620px';
  }
  if (palm1) { const a = Math.sin(t * 0.0009) * 3;       palm1.querySelector('g').style.transform = `rotate(${a}deg)`; }
  if (palm2) { const a = Math.sin(t * 0.0009 + 0.8) * 3; palm2.querySelector('g').style.transform = `rotate(${a}deg)`; }
}

const seagullContainer = document.getElementById('hero');
const seagullData = [
  { x: 20, y: 20,  speed: 0.08, dir:  1 },
  { x: 65, y: 14,  speed: 0.12, dir:  1 },
  { x: 40, y: 28,  speed: 0.06, dir: -1 },
];

seagullData.forEach((sg, i) => {
  const el = document.createElement('div');
  el.className  = 'seagull';
  el.style.left = sg.x + '%';
  el.style.top  = sg.y + '%';
  el.style.zIndex = 7;
  el.innerHTML = `<svg width="28" height="14" viewBox="0 0 28 14">
    <path d="M14,7 Q7,0 0,4"  stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M14,7 Q21,0 28,4" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
  seagullContainer.appendChild(el);

  el.addEventListener('mouseenter', () => {
    const sign = Math.random() > 0.5 ? 1 : -1;
    el.style.transition = 'transform 1s ease, opacity 0.5s';
    el.style.transform  = `translate(${sign * 200}px, -150px) scale(0.3)`;
    el.style.opacity    = '0';
    setTimeout(() => {
      el.style.transition = 'none';
      el.style.transform  = '';
      el.style.opacity    = '1';
      el.style.left = Math.random() * 80 + 10 + '%';
      el.style.top  = Math.random() * 30 + 8  + '%';
    }, 2000);
  });
});

const seagullEls = document.querySelectorAll('.seagull');

function animateSeagulls(t) {
  seagullData.forEach((sg, i) => {
    const el = seagullEls[i];
    if (!el) return;
    sg.x += sg.speed * sg.dir * 0.08;
    sg.y += Math.sin(t * 0.001 + i * 2) * 0.03;
    if (sg.x > 95) { sg.dir = -1; el.querySelector('svg').style.transform = 'scaleX(-1)'; }
    if (sg.x < 5)  { sg.dir =  1; el.querySelector('svg').style.transform = 'scaleX(1)';  }
    el.style.left = sg.x + '%';
    el.style.top  = sg.y + '%';
  });
}

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleOut {
    0%   { transform: translate(-50%,-50%) scale(0);  opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(15); opacity: 0; }
  }`;
document.head.appendChild(rippleStyle);

function createRipple(x, y) {
  for (let r = 0; r < 3; r++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:10px; height:10px; border-radius:50%;
      border:2px solid rgba(0,212,216,0.8);
      transform:translate(-50%,-50%) scale(0);
      animation:rippleOut ${0.8 + r * 0.4}s ease-out ${r * 0.15}s forwards;
      pointer-events:none; z-index:9999;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

document.getElementById('ocean-canvas').addEventListener('click', e => createRipple(e.clientX, e.clientY));
document.getElementById('hero').addEventListener('click', e => {
  if (e.target !== document.getElementById('ocean-canvas')) createRipple(e.clientX, e.clientY);
});

function createBubble() {
  const b    = document.createElement('div');
  const size = 4 + Math.random() * 20;
  b.className  = 'bubble';
  b.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random() * 100}%;
    animation-duration:${5 + Math.random() * 10}s;
    animation-delay:${Math.random() * 3}s;`;
  document.getElementById('bubbles').appendChild(b);
  setTimeout(() => b.remove(), 18000);
}

setInterval(createBubble, 600);
for (let i = 0; i < 12; i++) setTimeout(createBubble, i * 300);

function handleParallax() {
  const sy = window.scrollY;
  const pn = document.getElementById('palms-near');
  const pf = document.getElementById('palms-far');
  if (pn) pn.style.transform = `translateY(${sy * 0.25}px)`;
  if (pf) pf.style.transform = `translateY(${sy * 0.12}px)`;

  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity   = Math.max(0, 1 - sy / (window.innerHeight * 0.6));
    heroContent.style.transform = `translateY(${sy * 0.3}px)`;
  }
}

window.addEventListener('scroll', handleParallax, { passive: true });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .glass-card').forEach(el => revealObserver.observe(el));

document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left)  / r.width)  * 100 + '%');
    card.style.setProperty('--my', ((e.clientY - r.top)   / r.height) * 100 + '%');
  });
});

(function () {
  const track    = document.getElementById('galleryTrack');
  const btnPrev  = document.getElementById('galleryPrev');
  const btnNext  = document.getElementById('galleryNext');
  const dots     = document.querySelectorAll('.gallery-dot');
  const items    = track.querySelectorAll('.gallery-item');

  const TOTAL    = items.length;
  let current    = 0;
  let autoTimer  = null;

  function visibleCount() {
    return window.innerWidth <= 768 ? 1 : Math.floor(track.parentElement.offsetWidth / (380 + 24));
  }

  function maxIndex() {
    return Math.max(0, TOTAL - visibleCount());
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));

    const itemWidth = items[0].offsetWidth + 24; // ширина + gap
    track.style.transform = `translateX(-${current * itemWidth}px)`;

    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    btnPrev.disabled = current === 0;
    btnNext.disabled = current >= maxIndex();
  }

  btnPrev.addEventListener('click', () => { resetAuto(); goTo(current - 1); });
  btnNext.addEventListener('click', () => { resetAuto(); goTo(current + 1); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => { resetAuto(); goTo(+dot.dataset.index); });
  });

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 3500);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { resetAuto(); goTo(diff > 0 ? current + 1 : current - 1); }
  }, { passive: true });

  window.addEventListener('resize', () => goTo(current));

  goTo(0);
  startAuto();
})();

function handleBook(btn) {
  btn.textContent = '🌊 Готовим ваш рай...';
  btn.style.background = 'linear-gradient(135deg, #00FFD1, #00D4D8)';
  setTimeout(() => {
    btn.textContent  = '✅ Заявка принята! Скоро свяжемся';
    btn.style.background = 'linear-gradient(135deg, #40916C, #2D6A4F)';
    btn.style.color  = 'white';
    const r = btn.getBoundingClientRect();
    createRipple(r.left + btn.offsetWidth / 2, r.top + btn.offsetHeight / 2);
  }, 1500);
}

const sandStyle = document.createElement('style');
sandStyle.textContent = `@keyframes sandFly {
  0%   { transform: translateY(0) translateX(0); opacity: 0.8; }
  100% { transform: translateY(-40px) translateX(30px); opacity: 0; }
}`;
document.head.appendChild(sandStyle);

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const delta = Math.abs(window.scrollY - lastScroll);
  if (delta > 5 && window.scrollY < window.innerHeight) {
    for (let i = 0; i < Math.min(3, delta / 10); i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position:fixed;
        left:${20 + Math.random() * 60}vw;
        top:${80 + Math.random() * 15}vh;
        width:${2 + Math.random() * 4}px;
        height:${2 + Math.random() * 4}px;
        border-radius:50%;
        background:rgba(196,164,82,0.6);
        pointer-events:none; z-index:8;
        animation:sandFly 1s ease-out forwards;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }
  lastScroll = window.scrollY;
}, { passive: true });

let lastFrame = 0;
function mainLoop(t) {
  if (t - lastFrame > 16) {
    drawSky(t);
    drawOcean(t);
    animatePalms(t);
    animateSeagulls(t);
    lastFrame = t;
  }
  requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);
