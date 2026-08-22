/* ========== HERO FULL-SCREEN CANVAS RING CAROUSEL v5 ========== */
class HeroCarousel {
  constructor(selector, imageUrls) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.imageUrls = imageUrls;
    this.images = [];
    this.loaded = false;

    this.current = 0;
    this.next = 0;
    this.transition = 0;
    this.isTransitioning = false;

    this.autoplayTimer = 0;
    this.autoplayInterval = 3000;

    this.ringRotation = 0;
    this.targetRingRotation = 0;
    this.ringVel = 0;

    this.setupCanvas();
    this.bindResize();
    this.loadImages().then(() => {
      this.loaded = true;
      this.startLoop();
    });
  }

  setupCanvas() {
    this.canvas.width = Math.floor(this.W * this.dpr);
    this.canvas.height = Math.floor(this.H * this.dpr);
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  bindResize() {
    let raf;
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.setupCanvas();
      });
    });
  }

  loadImages() {
    return Promise.all(this.imageUrls.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(this.createPlaceholder());
      img.src = src;
    }))).then(imgs => { this.images = imgs; });
  }

  createPlaceholder() {
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 800;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 1200, 800);
    g.addColorStop(0, '#0a1628');
    g.addColorStop(1, '#070b14');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1200, 800);
    const img = new Image();
    img.src = c.toDataURL();
    return img;
  }

  startLoop() {
    let lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  update(dt) {
    if (!this.loaded) return;

    // Autoplay
    this.autoplayTimer += dt;
    if (this.autoplayTimer > this.autoplayInterval) {
      this.autoplayTimer = 0;
      this.goTo((this.current + 1) % this.images.length);
    }

    // Transition
    if (this.isTransitioning) {
      this.transition += dt / 1000; // 1 sekunda crossfade
      if (this.transition >= 1) {
        this.transition = 1;
        this.current = this.next;
        this.isTransitioning = false;
        this.autoplayTimer = 0;
      }
    }

    // Ring spring
    const diff = this.targetRingRotation - this.ringRotation;
    if (Math.abs(diff) > 0.001) {
      this.ringVel += diff * 0.004;
      this.ringVel *= 0.88;
      this.ringRotation += this.ringVel;
    } else {
      this.ringRotation = this.targetRingRotation;
      this.ringVel = 0;
    }
  }

  goTo(index) {
    if (this.isTransitioning || index === this.current) return;
    this.next = index;
    this.isTransitioning = true;
    this.transition = 0;
    const seg = (Math.PI * 2) / this.images.length;
    this.targetRingRotation = -this.next * seg;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    if (!this.loaded) {
      this.drawLoader(ctx);
      return;
    }

    // 1. Background — crossfade
    this.drawBackground(ctx);

    // 2. Dark overlay (left side for text readability)
    const overlay = ctx.createLinearGradient(0, 0, this.W * 0.55, 0);
    overlay.addColorStop(0, 'rgba(7,11,20,0.60)');
    overlay.addColorStop(0.35, 'rgba(7,11,20,0.22)');
    overlay.addColorStop(0.7, 'rgba(7,11,20,0.05)');
    overlay.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, this.W, this.H);

    // 3. Bottom vignette — blends ring into section below
    const vig = ctx.createLinearGradient(0, this.H * 0.35, 0, this.H);
    vig.addColorStop(0, 'rgba(7,11,20,0)');
    vig.addColorStop(0.4, 'rgba(7,11,20,0.25)');
    vig.addColorStop(0.75, 'rgba(7,11,20,0.82)');
    vig.addColorStop(1, 'rgba(7,11,20,1.0)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.W, this.H);

    // 4. Ring segments
    this.drawRing(ctx);

    // 5. Progress bar
    const prog = this.autoplayTimer / this.autoplayInterval;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(this.W / 2 - 30, 24, 60, 1.5);
    ctx.fillStyle = 'rgba(0,212,255,0.40)';
    ctx.fillRect(this.W / 2 - 30, 24, 60 * prog, 1.5);

    // 6. Counter
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = '400 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.current + 1} / ${this.images.length}`, this.W / 2, 40);
  }

  drawBackground(ctx) {
    const curr = this.images[this.current];
    const next = this.images[this.next];

    if (curr && curr.width) {
      this.drawCover(ctx, curr, 1);
    }

    if (this.isTransitioning && next && next.width) {
      ctx.globalAlpha = this.transition;
      this.drawCover(ctx, next, 1);
      ctx.globalAlpha = 1;
    }
  }

  drawCover(ctx, img, alpha) {
    const ratio = img.width / img.height;
    const screenRatio = this.W / this.H;
    let dw, dh, dx, dy;

    if (screenRatio > ratio) {
      dw = this.W;
      dh = this.W / ratio;
      dx = 0;
      dy = (this.H - dh) / 2;
    } else {
      dh = this.H;
      dw = this.H * ratio;
      dx = (this.W - dw) / 2;
      dy = 0;
    }

    // Subtle zoom animation on active image
    const zoom = this.isTransitioning ? 1 + this.transition * 0.03 : 1;
    dw *= zoom;
    dh *= zoom;
    dx -= (dw - this.W) / 2;
    dy -= (dh - this.H) / 2;

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }

  drawRing(ctx) {
    const cx = this.W / 2;
    const cy = this.H + this.H * 0.30;
    const outerR = Math.min(this.W, this.H) * 0.70;
    const innerR = outerR * 0.40;
    const segAngle = (Math.PI * 2) / this.images.length;
    const gap = 0.010;
    const count = this.images.length;

    // Clip to bottom area only — allow ring to show from ~35% down
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.H * 0.35, this.W, this.H * 0.65);
    ctx.clip();

    // Draw each segment
    for (let i = 0; i < count; i++) {
      const img = this.images[i];
      if (!img || !img.width) continue;

      const startA = this.ringRotation + i * segAngle - Math.PI / 2 - segAngle / 2;
      const endA = startA + segAngle - gap;
      const midA = (startA + endA) / 2;

      let normMid = ((midA % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const isActive = Math.abs(normMid - Math.PI * 1.5) < segAngle / 2 ||
                       Math.abs(normMid + Math.PI / 2) < segAngle / 2;

      // Segment clip path
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startA, endA);
      ctx.arc(cx, cy, innerR, endA, startA, true);
      ctx.closePath();
      ctx.clip();

      // Position and rotate image into segment
      const midR = (innerR + outerR) / 2;
      const segCx = cx + Math.cos(midA) * midR;
      const segCy = cy + Math.sin(midA) * midR;
      ctx.translate(segCx, segCy);
      ctx.rotate(midA + Math.PI / 2);

      // Draw image
      const coverH = (outerR - innerR) * 1.6;
      const coverW = coverH * (img.width / img.height);
      let scale = isActive ? 1.04 : 1;
      if (isActive) scale += Math.sin(performance.now() * 0.0012) * 0.006;

      ctx.drawImage(img, -coverW * scale / 2, -coverH * scale / 2, coverW * scale, coverH * scale);

      // Overlay — very subtle, transparent
      if (!isActive) {
        ctx.fillStyle = 'rgba(7,11,20,0.20)';
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      } else {
        ctx.fillStyle = 'rgba(0,212,255,0.025)';
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      }

      ctx.restore();

      // Segment border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startA, endA);
      ctx.arc(cx, cy, innerR, endA, startA, true);
      ctx.closePath();
      ctx.strokeStyle = isActive ? 'rgba(0,212,255,0.30)' : 'rgba(0,212,255,0.06)';
      ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.stroke();
      ctx.restore();
    }

    // Inner circle fill — dark with radial gradient for depth
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    innerGrad.addColorStop(0, 'rgba(7,11,20,0.98)');
    innerGrad.addColorStop(0.6, 'rgba(7,11,20,0.92)');
    innerGrad.addColorStop(1, 'rgba(7,11,20,0.75)');
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // Inner stroke
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.08)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Outer stroke
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.04)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Active segment glow indicator
    const activeStart = -Math.PI / 2 - segAngle / 2 + gap / 2;
    const activeEnd = -Math.PI / 2 + segAngle / 2 - gap / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 2, activeStart, activeEnd);
    ctx.strokeStyle = 'rgba(0,212,255,0.30)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Subtle glow above active segment
    const glow = ctx.createRadialGradient(cx, cy - outerR, 0, cx, cy - outerR, 50);
    glow.addColorStop(0, 'rgba(0,212,255,0.06)');
    glow.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy - outerR, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawLoader(ctx) {
    const cx = this.W / 2;
    const cy = this.H / 2;
    const t = performance.now() / 1000;

    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.10)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 22, t * 2.5, t * 2.5 + Math.PI * 1.4);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie...', cx, cy + 40);
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  const heroImages = [
    'media/kostka-mycie.jpg',
    'media/elewacja-mycie.jpg',
    'media/dach-mycie.jpg',
    'media/podjazd-mycie.jpg',
    'media/elewacja-mycie2.jpg',
    'media/kostka-przed-po.jpg'
  ];
  new HeroCarousel('#hero-canvas', heroImages);
});
