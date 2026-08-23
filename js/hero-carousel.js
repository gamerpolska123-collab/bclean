/* ========== HERO FULL-SCREEN CANVAS RING CAROUSEL v7 ========== */
class HeroCarousel {
  constructor(selector, imageUrls) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      this.canvas.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'hero-fallback';
      fallback.style.cssText = 'position:absolute;inset:0;background:url('+imageUrls[0]+') center/cover no-repeat;z-index:0;';
      this.canvas.parentElement.insertBefore(fallback, this.canvas);
      return;
    }

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
    this.autoplayInterval = 6000;

    // Ring rotation
    this.ringRotation = 0;
    this.targetRingRotation = 0;
    this.ringRotVel = 0;

    // Ring vertical position (as ratio of H added to H)
    // 0.70 = hidden (center below viewport)
    // 0.40 = visible (center partially inside viewport)
    this.ringCyRatio = 0.60;
    this.targetRingCyRatio = 0.60;
    this.ringCyVel = 0;

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
      const dt = Math.min(now - lastTime, 50); // cap dt at 50ms
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
    if (this.autoplayTimer > this.autoplayInterval && !this.isTransitioning) {
      this.autoplayTimer = 0;
      this.goTo((this.current + 1) % this.images.length);
    }

    // Transition progress
    if (this.isTransitioning) {
      this.transition += dt / 1400;
      if (this.transition >= 1) {
        this.transition = 1;
        this.current = this.next;
        this.isTransitioning = false;
        this.autoplayTimer = 0;
      }
    }

    // Ring vertical position animation (spring)
    const targetRatio = this.isTransitioning ? 0.55 : 0.65;
    this.targetRingCyRatio = targetRatio;

    const ratioDiff = this.targetRingCyRatio - this.ringCyRatio;
    if (Math.abs(ratioDiff) > 0.001) {
      this.ringCyVel += ratioDiff * 0.012;
      this.ringCyVel *= 0.86;
      this.ringCyRatio += this.ringCyVel;
    } else {
      this.ringCyRatio = this.targetRingCyRatio;
      this.ringCyVel = 0;
    }

    // Ring rotation animation (spring)
    const rotDiff = this.targetRingRotation - this.ringRotation;
    if (Math.abs(rotDiff) > 0.001) {
      this.ringRotVel += rotDiff * 0.004;
      this.ringRotVel *= 0.88;
      this.ringRotation += this.ringRotVel;
    } else {
      this.ringRotation = this.targetRingRotation;
      this.ringRotVel = 0;
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

    // 1. Background image(s)
    this.drawBackground(ctx);

    // 2. Radial darkening from top-left for text readability
    const overlay = ctx.createRadialGradient(0, 0, this.W * 0.10, 0, 0, this.W * 0.55);
    overlay.addColorStop(0, 'rgba(7,11,20,0.40)');
    overlay.addColorStop(0.4, 'rgba(7,11,20,0.12)');
    overlay.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, this.W, this.H);

    // 3. Bottom vignette for smooth blend into next section
    const vig = ctx.createLinearGradient(0, this.H * 0.45, 0, this.H);
    vig.addColorStop(0, 'rgba(7,11,20,0)');
    vig.addColorStop(0.30, 'rgba(7,11,20,0.10)');
    vig.addColorStop(0.65, 'rgba(7,11,20,0.55)');
    vig.addColorStop(1, 'rgba(7,11,20,0.92)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.W, this.H);

    // 4. Ring carousel
    this.drawRing(ctx);
  }

  drawBackground(ctx) {
    const curr = this.images[this.current];
    const next = this.images[this.next];

    if (curr && curr.width) {
      this.drawCover(ctx, curr, 1);
    }

    if (this.isTransitioning && next && next.width) {
      ctx.globalAlpha = this.easeOutCubic(this.transition);
      this.drawCover(ctx, next, 1);
      ctx.globalAlpha = 1;
    }
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  drawCover(ctx, img, alpha) {
    const ratio = img.width / img.height;
    const screenRatio = this.W / this.H;
    let dw, dh;

    const pad = 0.05;
    const pw = this.W * (1 + pad);
    const ph = this.H * (1 + pad);

    if (screenRatio > ratio) {
      dw = pw;
      dh = pw / ratio;
    } else {
      dh = ph;
      dw = ph * ratio;
    }
    const dx = (this.W - dw) / 2;
    const dy = (this.H - dh) / 2;

    const zoom = this.isTransitioning ? 1 + this.transition * 0.01 : 1;
    const zdw = dw * zoom;
    const zdh = dh * zoom;
    const zdx = dx - (zdw - dw) / 2;
    const zdy = dy - (zdh - dh) / 2;

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, zdx, zdy, zdw, zdh);
    ctx.globalAlpha = 1;
  }

  drawRing(ctx) {
    const cx = this.W / 2;
    const cy = this.H + this.H * this.ringCyRatio;
    const outerR = Math.min(this.W, this.H) * 0.80;
    const innerR = outerR * 0.48;
    const segAngle = (Math.PI * 2) / this.images.length;
    const gap = 0.008;
    const count = this.images.length;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.H * 0.35, this.W, this.H * 0.65);
    ctx.clip();

    for (let i = 0; i < count; i++) {
      const img = this.images[i];
      if (!img || !img.width) continue;

      const startA = this.ringRotation + i * segAngle - Math.PI / 2 - segAngle / 2;
      const endA = startA + segAngle - gap;
      const midA = (startA + endA) / 2;

      let normMid = ((midA % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const isActive = Math.abs(normMid - Math.PI * 1.5) < segAngle / 2 ||
                       Math.abs(normMid + Math.PI / 2) < segAngle / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startA, endA);
      ctx.arc(cx, cy, innerR, endA, startA, true);
      ctx.closePath();
      ctx.clip();

      const midR = (innerR + outerR) / 2;
      const segCx = cx + Math.cos(midA) * midR;
      const segCy = cy + Math.sin(midA) * midR;
      ctx.translate(segCx, segCy);
      ctx.rotate(midA + Math.PI / 2);

      const coverH = (outerR - innerR) * 1.25;
      const coverW = coverH * (img.width / img.height);
      let scale = isActive ? 1.04 : 1;
      if (isActive) scale += Math.sin(performance.now() * 0.0012) * 0.003;

      ctx.drawImage(img, -coverW * scale / 2, -coverH * scale / 2, coverW * scale, coverH * scale);

      if (!isActive) {
        ctx.fillStyle = 'rgba(7,11,20,0.22)';
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      } else {
        ctx.fillStyle = 'rgba(0,212,255,0.015)';
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      }

      ctx.restore();

      // Segment border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startA, endA);
      ctx.arc(cx, cy, innerR, endA, startA, true);
      ctx.closePath();
      ctx.strokeStyle = isActive ? 'rgba(0,212,255,0.22)' : 'rgba(0,212,255,0.035)';
      ctx.lineWidth = isActive ? 1.2 : 0.35;
      ctx.stroke();
      ctx.restore();
    }

    // Inner fill
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    innerGrad.addColorStop(0, 'rgba(7,11,20,0.97)');
    innerGrad.addColorStop(0.7, 'rgba(7,11,20,0.88)');
    innerGrad.addColorStop(1, 'rgba(7,11,20,0.65)');
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.025)';
    ctx.lineWidth = 0.35;
    ctx.stroke();

    // Active glow arc
    const activeSeg = (Math.PI * 2) / count;
    const activeStart = -Math.PI / 2 - activeSeg / 2 + gap / 2;
    const activeEnd = -Math.PI / 2 + activeSeg / 2 - gap / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 1.5, activeStart, activeEnd);
    ctx.strokeStyle = 'rgba(0,212,255,0.20)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  drawLoader(ctx) {
    const cx = this.W / 2;
    const cy = this.H / 2;
    const t = performance.now() / 1000;

    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 20, t * 2, t * 2 + Math.PI * 1.3);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie...', cx, cy + 36);
  }
}

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
