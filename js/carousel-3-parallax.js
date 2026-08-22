/* ========== CANVAS PARALLAX SLICES CAROUSEL ========== */
class CarouselParallaxLayers {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.nextIndex = 0;
    this.transition = 0;
    this.isTransitioning = false;
    this.autoplayTimer = 0;
    this.autoplayInterval = 7000;
    this.lastTime = performance.now();
    this.hover = false;
    this.mouse = { x: this.W/2, y: this.H/2 };
    this.sliceCount = 24;
    this.slices = [];

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.initSlices();
      this.loaded = true;
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => { this.W = w || 800; this.H = h || 560; this.initSlices(); });
    AnimationLoop.add(() => this.render());
  }

  initSlices() {
    this.slices = [];
    for (let i = 0; i < this.sliceCount; i++) {
      this.slices.push({
        offsetY: 0,
        targetOffsetY: 0,
        enterProgress: 1,
        delay: (i / this.sliceCount) * 0.4
      });
    }
  }

  bindEvents() {
    const c = this.setup.canvas;
    c.addEventListener('mousemove', e => {
      const rect = c.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => { this.hover = false; this.mouse.x = this.W/2; this.mouse.y = this.H/2; });
    c.addEventListener('click', () => this.next());
    c.addEventListener('touchstart', e => { this.touchStart = e.touches[0].clientX; }, { passive: true });
    c.addEventListener('touchend', e => {
      const diff = this.touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? this.next() : this.prev();
    }, { passive: true });
  }

  next() { this.goTo((this.current + 1) % this.images.length); }
  prev() { this.goTo((this.current - 1 + this.images.length) % this.images.length); }

  goTo(index) {
    if (this.isTransitioning || index === this.current) return;
    this.nextIndex = index;
    this.isTransitioning = true;
    this.transition = 0;
    // Reset slice enter animation
    this.slices.forEach((s, i) => {
      s.enterProgress = 0;
      s.offsetY = (i % 2 === 0 ? -1 : 1) * this.H * 0.6;
    });
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    if (!this.loaded) { this.drawLoader(); return; }

    if (!this.hover && !this.isTransitioning) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) { this.autoplayTimer = 0; this.next(); }
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    // Update transition
    if (this.isTransitioning) {
      this.transition += dt / 1000;
      if (this.transition >= 1) {
        this.current = this.nextIndex;
        this.isTransitioning = false;
        this.transition = 0;
        this.slices.forEach(s => { s.enterProgress = 1; s.offsetY = 0; });
      }
    }

    // Mouse parallax factor
    const parallaxX = (this.mouse.x / this.W - 0.5) * 2;
    const parallaxY = (this.mouse.y / this.H - 0.5) * 2;

    // Draw slices
    const img = this.images[this.current];
    if (img && img.width) {
      const sliceW = this.W / this.sliceCount;
      const imgAspect = img.width / img.height;
      const canvasAspect = this.W / this.H;
      let dw, dh;
      if (imgAspect > canvasAspect) { dh = this.H; dw = dh * imgAspect; }
      else { dw = this.W; dh = dw / imgAspect; }
      const imgX = (this.W - dw) / 2;
      const imgY = (this.H - dh) / 2;

      for (let i = 0; i < this.sliceCount; i++) {
        const s = this.slices[i];
        const x = i * sliceW;

        // Parallax per slice (stronger on edges)
        const edgeFactor = 1 - Math.abs((i / this.sliceCount) - 0.5) * 2;
        s.targetOffsetY = parallaxY * 18 * edgeFactor + parallaxX * 6 * ((i % 2) * 2 - 1);

        // Enter animation during transition
        if (this.isTransitioning) {
          const t = Math.min(1, Math.max(0, (this.transition - s.delay) / 0.6));
          s.enterProgress = CarouselUtils.ease.outCubic(t);
          s.offsetY = s.offsetY * (1 - s.enterProgress) + s.targetOffsetY * s.enterProgress;
        } else {
          s.offsetY += (s.targetOffsetY - s.offsetY) * 0.08;
        }

        ctx.save();
        const r = 16;
        const m = 4;

        // Clip to rounded rect for whole canvas, then slice
        ctx.beginPath();
        if (i === 0) {
          ctx.moveTo(m + r, m);
          ctx.lineTo(this.W - m - r, m);
          ctx.quadraticCurveTo(this.W - m, m, this.W - m, m + r);
          ctx.lineTo(this.W - m, this.H - m - r);
          ctx.quadraticCurveTo(this.W - m, this.H - m, this.W - m - r, this.H - m);
          ctx.lineTo(m + r, this.H - m);
          ctx.quadraticCurveTo(m, this.H - m, m, this.H - m - r);
          ctx.lineTo(m, m + r);
          ctx.quadraticCurveTo(m, m, m + r, m);
        }
        ctx.closePath();
        ctx.clip();

        // Draw slice with offset
        const sx = (img.width / this.W) * x;
        const sw = (img.width / this.W) * sliceW;
        const sy = 0;
        const sh = img.height;

        ctx.drawImage(img, sx, sy, sw, sh, x + 0.5, imgY + s.offsetY, sliceW - 1, dh);

        // Subtle edge shadow between slices
        ctx.fillStyle = 'rgba(7,11,20,0.15)';
        ctx.fillRect(x, 0, 1, this.H);

        ctx.restore();
      }
    }

    // Top/bottom gradient overlays
    const topGrad = ctx.createLinearGradient(0, 0, 0, 60);
    topGrad.addColorStop(0, 'rgba(7,11,20,0.5)');
    topGrad.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, this.W, 60);

    this.drawOverlay();
  }

  drawOverlay() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.current + 1} / ${this.images.length}`, this.W/2, this.H - 22);

    // Thin line indicator
    const progress = this.autoplayTimer / this.autoplayInterval;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(this.W*0.3, this.H - 8, this.W*0.4, 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(this.W*0.3, this.H - 8, this.W*0.4 * Math.min(progress, 1), 2);
  }

  drawLoader() {
    const ctx = this.ctx, cx = this.W/2, cy = this.H/2;
    const t = performance.now()/1000;
    ctx.clearRect(0,0,this.W,this.H);
    ctx.fillStyle = '#070b14'; ctx.fillRect(0,0,this.W,this.H);
    ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 28, t*3, t*3 + Math.PI*1.3);
    ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '13px Inter';
    ctx.textAlign = 'center'; ctx.fillText('Ładowanie...', cx, cy + 52);
  }
}
