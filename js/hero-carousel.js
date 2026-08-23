/* ========== HERO FULL-SCREEN CANVAS RING CAROUSEL v8 ========== */
/* v8: + prefers-reduced-motion, + debounced resize, + lazy init, + mobile perf */

class HeroCarousel {
  constructor(selector, imageUrls) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      this.fallback(imageUrls[0]);
      return;
    }

    // Respect prefers-reduced-motion: show static image
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.fallback(imageUrls[0]);
      return;
    }

    // Mobile: limit DPR to save battery
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    this.maxDpr = isMobile ? 1.5 : 2;

    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);

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

    this.ringCyRatio = 0.60;
    this.targetRingCyRatio = 0.60;
    this.ringCyVel = 0;

    this.setupCanvas();
    this.bindResize();

    // Lazy init: only load when hero is visible
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.loadImages().then(() => {
            this.loaded = true;
            this.startLoop();
          });
          observer.disconnect();
        }
      }, { threshold: 0 });
      observer.observe(this.canvas);
    } else {
      this.loadImages().then(() => {
        this.loaded = true;
        this.startLoop();
      });
    }
  }

  fallback(imageUrl) {
    this.canvas.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.className = 'hero-fallback';
    fallback.style.cssText = 'position:absolute;inset:0;background:url(' + imageUrl + ') center/cover no-repeat;z-index:0;';
    this.canvas.parentElement.insertBefore(fallback, this.canvas);
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
    let timeout;
    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
        this.setupCanvas();
      }, 150);
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
    const grd = ctx.createLinearGradient(0,0,1200,800);
    grd.addColorStop(0,'#0a1628'); grd.addColorStop(1,'#070b14');
    ctx.fillStyle = grd; ctx.fillRect(0,0,1200,800);
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BartekClean', 600, 360);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('Realizacja', 600, 410);
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(100,100,1000,600);
    const placeholder = new Image();
    placeholder.src = c.toDataURL();
    return placeholder;
  }

  startLoop() {
    let lastTime = performance.now();
    const loop = (now) => {
      const dt = now - lastTime;
      lastTime = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    if (!this.loaded) return;

    // Transition
    if (this.isTransitioning) {
      this.transition += dt / 1200;
      if (this.transition >= 1) {
        this.current = this.next;
        this.transition = 0;
        this.isTransitioning = false;
      }
    } else {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) {
        this.next = (this.current + 1) % this.images.length;
        this.isTransitioning = true;
        this.autoplayTimer = 0;
      }
    }

    // Ring rotation
    this.targetRingRotation += dt * 0.00015;
    this.ringRotVel += (this.targetRingRotation - this.ringRotation) * 0.05;
    this.ringRotVel *= 0.92;
    this.ringRotation += this.ringRotVel;

    // Ring vertical position
    this.targetRingCyRatio = 0.60;
    this.ringCyVel += (this.targetRingCyRatio - this.ringCyRatio) * 0.03;
    this.ringCyVel *= 0.90;
    this.ringCyRatio += this.ringCyVel;
  }

  draw() {
    if (!this.loaded) return;
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;

    ctx.clearRect(0, 0, W, H);

    // Background
    this.drawCover(ctx, this.images[this.current], 1 - this.transition);
    if (this.isTransitioning) {
      this.drawCover(ctx, this.images[this.next], this.transition);
    }

    // Overlay
    this.drawOverlay(ctx);

    // Ring
    this.drawRing(ctx);
  }

  drawCover(ctx, img, alpha) {
    const ratio = img.width / img.height;
    const screenRatio = this.W / this.H;
    let dw, dh, dx, dy;

    const pad = 0.10;
    const pw = this.W * (1 - pad);
    const ph = this.H * (1 - pad);

    if (screenRatio > ratio) {
      dw = pw;
      dh = pw / ratio;
      dx = (this.W - dw) / 2;
      dy = (this.H - dh) / 2;
    } else {
      dh = ph;
      dw = ph * ratio;
      dx = (this.W - dw) / 2;
      dy = (this.H - dh) / 2;
    }

    const zoom = this.isTransitioning ? 1 + this.transition * 0.015 : 1;
    dw *= zoom;
    dh *= zoom;
    dx -= (dw - this.W * (1 - pad)) / 2;
    dy -= (dh - this.H * (1 - pad)) / 2;

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }

  drawOverlay(ctx) {
    const W = this.W;
    const H = this.H;
    const grd = ctx.createLinearGradient(0, 0, W * 0.40, 0);
    grd.addColorStop(0, 'rgba(7,11,20,0.85)');
    grd.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    const bottomGrd = ctx.createLinearGradient(0, H - 120, 0, H);
    bottomGrd.addColorStop(0, 'rgba(7,11,20,0)');
    bottomGrd.addColorStop(1, 'rgba(7,11,20,0.95)');
    ctx.fillStyle = bottomGrd;
    ctx.fillRect(0, H - 120, W, 120);
  }

  drawRing(ctx) {
    const cx = this.W / 2;
    const cy = this.H + this.H * 0.42;
    const outerR = Math.min(this.W, this.H) * 0.48;
    const innerR = outerR * 0.50;
    const segmentCount = this.images.length;
    const angleStep = (Math.PI * 2) / segmentCount;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.H * 0.55, this.W, this.H * 0.45);
    ctx.clip();

    for (let i = 0; i < segmentCount; i++) {
      const angle = this.ringRotation + i * angleStep;
      const img = this.images[i];
      const coverH = (outerR - innerR) * 1.25;
      const coverW = coverH * (img.width / img.height);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.arc(0, 0, outerR, -angleStep / 2, angleStep / 2);
      ctx.arc(0, 0, innerR, angleStep / 2, -angleStep / 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, -coverW / 2, -outerR + (outerR - innerR - coverH) / 2, coverW, coverH);
      ctx.restore();
    }
    ctx.restore();
  }
}
