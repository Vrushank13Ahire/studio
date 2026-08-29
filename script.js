(() => {
  "use strict";

  /* ================= Preloader ================= */
  const preloader = document.getElementById('preloader');
  document.body.classList.add('no-scroll');

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('is-open');
      setTimeout(() => {
        preloader.classList.add('is-done');
        document.body.classList.remove('no-scroll');
      }, 1200);
    }, 500);
  });
  // Fallback in case load fires too fast / not at all
  setTimeout(() => {
    if (!preloader.classList.contains('is-open')) {
      preloader.classList.add('is-open');
      setTimeout(() => {
        preloader.classList.add('is-done');
        document.body.classList.remove('no-scroll');
      }, 1200);
    }
  }, 2600);

  /* ================= Theme toggle ================= */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'perihelion-theme';

  function applyTheme(mode){
    if(mode === 'light'){ root.classList.add('light'); }
    else{ root.classList.remove('light'); }
  }
  const saved = localStorage.getItem(THEME_KEY);
  if(saved){ applyTheme(saved); }
  else if(window.matchMedia('(prefers-color-scheme: light)').matches){
    applyTheme('light');
  }

  themeToggle.addEventListener('click', () => {
    const isLight = root.classList.toggle('light');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  });

  /* ================= Nav scroll state ================= */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ================= Mobile menu ================= */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
  });

  /* ================= Custom cursor ================= */
  const cursor = document.getElementById('cursor');
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;
  let cursorReady = false;

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if(!cursorReady){ cx = tx; cy = ty; cursorReady = true; cursor.classList.add('is-ready'); }
  });

  function tickCursor(){
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(tickCursor);
  }
  requestAnimationFrame(tickCursor);

  document.querySelectorAll('a, button, .discipline, .exhibit, input, textarea, select')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });

  /* ================= Scroll reveal ================= */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ================= 3D tilt ================= */
  const tiltEls = document.querySelectorAll('[data-tilt]');
  tiltEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    });
  });

  /* ================= Generative art: hero field ================= */
  const fieldCanvas = document.getElementById('fieldCanvas');
  const fctx = fieldCanvas.getContext('2d');
  let fw, fh, particles = [];

  function seedField(){
    const rect = fieldCanvas.parentElement.getBoundingClientRect();
    fw = fieldCanvas.width = rect.width;
    fh = fieldCanvas.height = rect.height;
    const count = Math.max(24, Math.floor(fw / 60));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * fw,
      y: Math.random() * fh,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      hue: Math.random() > 0.5 ? 'v' : 'b',
      a: Math.random() * 0.5 + 0.15
    }));
  }

  let mx = 0.5, my = 0.5;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
  });

  /* ---- Orb parallax ---- */
  const orbWrap = document.getElementById('orbWrap');
  if(orbWrap){
    let ox = 0, oy = 0, otx = 0, oty = 0;
    window.addEventListener('pointermove', (e) => {
      otx = (e.clientX / window.innerWidth - 0.5) * 40;
      oty = (e.clientY / window.innerHeight - 0.5) * 30;
    });
    function tickOrb(){
      ox += (otx - ox) * 0.06;
      oy += (oty - oy) * 0.06;
      orbWrap.style.transform = `translateY(-52%) translate(${ox}px, ${oy}px) rotateY(${(ox / 6).toFixed(2)}deg)`;
      requestAnimationFrame(tickOrb);
    }
    requestAnimationFrame(tickOrb);
  }

  function drawField(){
    fctx.clearRect(0, 0, fw, fh);
    const violet = getComputedStyle(root).getPropertyValue('--violet').trim();
    const bloom = getComputedStyle(root).getPropertyValue('--bloom').trim();

    const ox = (mx - 0.5) * 24;
    const oy = (my - 0.5) * 24;

    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0) p.x = fw; if(p.x > fw) p.x = 0;
      if(p.y < 0) p.y = fh; if(p.y > fh) p.y = 0;

      const dx = p.x + ox, dy = p.y + oy;
      fctx.beginPath();
      fctx.arc(dx, dy, p.r, 0, Math.PI * 2);
      fctx.fillStyle = p.hue === 'v' ? violet : bloom;
      fctx.globalAlpha = p.a;
      fctx.fill();

      for(let j = i + 1; j < particles.length; j++){
        const q = particles[j];
        const ddx = p.x - q.x, ddy = p.y - q.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if(dist < 140){
          fctx.globalAlpha = (1 - dist / 140) * 0.12;
          fctx.strokeStyle = violet;
          fctx.lineWidth = 0.6;
          fctx.beginPath();
          fctx.moveTo(p.x + ox, p.y + oy);
          fctx.lineTo(q.x + ox, q.y + oy);
          fctx.stroke();
        }
      }
    });
    fctx.globalAlpha = 1;
    requestAnimationFrame(drawField);
  }

  seedField();
  requestAnimationFrame(drawField);
  window.addEventListener('resize', seedField);

  /* ================= Generative art: exhibit thumbnails ================= */
  function mulberry32(seed){
    return function(){
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function paintExhibit(canvas, seedNum){
    const rand = mulberry32(seedNum * 977 + 13);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 320, h = rect.height || 400;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const violet = getComputedStyle(root).getPropertyValue('--violet').trim();
    const bloom = getComputedStyle(root).getPropertyValue('--bloom').trim();
    const bgSoft = getComputedStyle(root).getPropertyValue('--bg-soft').trim();

    ctx.fillStyle = bgSoft;
    ctx.fillRect(0, 0, w, h);

    const mode = seedNum % 3;

    if(mode === 0){
      // radiating arcs
      const cx = w * (0.3 + rand() * 0.4), cy = h * (0.3 + rand() * 0.4);
      const rings = 10 + Math.floor(rand() * 10);
      for(let i = 0; i < rings; i++){
        const rad = (i / rings) * Math.max(w, h) * 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, rand() * Math.PI, rand() * Math.PI + Math.PI);
        ctx.strokeStyle = i % 2 === 0 ? violet : bloom;
        ctx.globalAlpha = 0.5 - (i / rings) * 0.35;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    } else if(mode === 1){
      // flow lines
      const lines = 26;
      for(let i = 0; i < lines; i++){
        let x = rand() * w, y = rand() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for(let s = 0; s < 40; s++){
          const angle = Math.sin((x * 0.01) + i) * Math.cos((y * 0.01) + seedNum) * Math.PI;
          x += Math.cos(angle) * 6;
          y += Math.sin(angle) * 6;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rand() > 0.5 ? violet : bloom;
        ctx.globalAlpha = 0.18 + rand() * 0.25;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    } else {
      // fractured triangles
      const cols = 6, rows = 7;
      const cw = w / cols, ch = h / rows;
      for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
          if(rand() > 0.62){
            const x = i * cw, y = j * ch;
            ctx.beginPath();
            ctx.moveTo(x + rand() * cw, y);
            ctx.lineTo(x + cw, y + rand() * ch);
            ctx.lineTo(x, y + ch);
            ctx.closePath();
            ctx.fillStyle = rand() > 0.5 ? violet : bloom;
            ctx.globalAlpha = 0.08 + rand() * 0.22;
            ctx.fill();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  const exhibitCanvases = document.querySelectorAll('.exhibit__canvas');
  function paintAllExhibits(){
    exhibitCanvases.forEach(c => {
      const seed = parseInt(c.closest('.exhibit').dataset.seed, 10) || 1;
      paintExhibit(c, seed);
    });
  }
  paintAllExhibits();
  window.addEventListener('resize', () => {
    clearTimeout(window.__exhibitResizeT);
    window.__exhibitResizeT = setTimeout(paintAllExhibits, 200);
  });
  // repaint on theme change so colours track the palette
  themeToggle.addEventListener('click', () => setTimeout(paintAllExhibits, 60));

  /* ================= Voices carousel ================= */
  const voices = document.querySelectorAll('.voice');
  const dotsWrap = document.getElementById('voiceDots');
  let activeVoice = 0;

  voices.forEach((_, i) => {
    const dot = document.createElement('button');
    if(i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => setVoice(i));
    dotsWrap.appendChild(dot);
  });

  function setVoice(i){
    voices[activeVoice].classList.remove('is-active');
    dotsWrap.children[activeVoice].classList.remove('is-active');
    activeVoice = i;
    voices[activeVoice].classList.add('is-active');
    dotsWrap.children[activeVoice].classList.add('is-active');
  }

  let voiceTimer = setInterval(() => setVoice((activeVoice + 1) % voices.length), 5500);
  dotsWrap.addEventListener('click', () => {
    clearInterval(voiceTimer);
    voiceTimer = setInterval(() => setVoice((activeVoice + 1) % voices.length), 5500);
  });

  /* ================= Contact form ================= */
  const form = document.getElementById('begin-form');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const label = form.querySelector('.btn__label');
    label.textContent = 'Sending…';
    setTimeout(() => {
      label.textContent = 'Sent';
      status.textContent = 'Received — expect a reply within two working days.';
      form.reset();
      setTimeout(() => { label.textContent = 'Send it in'; }, 2400);
    }, 900);
  });

  /* ================= Footer ================= */
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('toTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
