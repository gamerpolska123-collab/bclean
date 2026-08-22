/* ========== CANVAS LIGHT SWEEP CAROUSEL ========== */
class CarouselLightSweep {
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
    this.autoplayInterval = 6500;
    this.lastTime = performance.now();
    this.hover = false;
    this.sweepAngle = -30 * (Math.PI / 180);

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.loaded = true;
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => { this.W = w || 800; this.H = h || 560; });
    AnimationLoop.add(() => this.render());
  }

  bindEvents() {
    const c = this.setup.canvas;
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => this.hover = false);
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

    if (this.isTransitioning) {
      this.transition += dt / 1100;
      if (this.transition >= 1) {
        this.current = this.nextIndex;
        this.isTransitioning = false;
        this.transition = 0;
      }
    }

    // Draw current image
    this.drawImage(this.current, 1);

    // Draw next image with light sweep mask
    if (this.isTransitioning) {
      const t = CarouselUtils.ease.inOutCubic(this.transition);
      ctx.save();
      this.applyLightSweep(t);
      this.drawImage(this.nextIndex, 1);
      ctx.restore();

      // Draw sweep glow line
      this.drawSweepGlow(t);
    }

    // Frame overlay
    this.drawFrame();
    this.drawInfo();
  }

  drawImage(idx, alpha) {
    const img = this.images[idx];
    if (!img || !img.width) return;
    const ctx = this.ctx;
    const imgAspect = img.width / img.height;
    const canvasAspect = this.W / this.H;
    let dw, dh;
    if (imgAspect > canvasAspect) { dh = this.H; dw = dh * imgAspect; }
    else { dw = this.W; dh = dw / imgAspect; }
    const dx = (this.W - dw) / 2;
    const dy = (this.H - dh) / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    const r = 16, m = 4;
    ctx.beginPath();
    ctx.moveTo(m+r, m); ctx.lineTo(this.W-m-r, m);
    ctx.quadraticCurveTo(this.W-m, m, this.W-m, m+r);
    ctx.lineTo(this.W-m, this.H-m-r);
    ctx.quadraticCurveTo(this.W-m, this.H-m, this.W-m-r, this.H-m);
    ctx.lineTo(m+r, this.H-m);
    ctx.quadraticCurveTo(m, this.H-m, m, this.H-m-r);
    ctx.lineTo(m, m+r);
    ctx.quadraticCurveTo(m, m, m+r, m);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  applyLightSweep(t) {
    const ctx = this.ctx;
    // Create diagonal sweep gradient
    const sweepW = this.W * 0.35;
    const cx = -sweepW + (this.W + sweepW * 2) * t;
    const cy = this.H / 2;

    // Build a gradient perpendicular to sweep direction
    const grad = ctx.createLinearGradient(cx - sweepW, cy - this.H, cx + sweepW, cy + this.H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.5, 'rgba(255,255,255,1)');
    grad.addColorStop(0.65, 'rgba(255,255,255,0.95)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.globalCompositeOperation = 'source-over';
  }

  drawSweepGlow(t) {
    const ctx = this.ctx;
    const sweepW = this.W * 0.25;
    const cx = -sweepW + (this.W + sweepW * 2) * t;

    // Glow behind sweep
    const glow = ctx.createLinearGradient(cx - sweepW*1.5, 0, cx + sweepW*1.5, 0);
    glow.addColorStop(0, 'rgba(0,212,255,0)');
    glow.addColorStop(0.5, `rgba(0,212,255,${0.15 * (1 - Math.abs(t - 0.5) * 2)})`);
    glow.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - sweepW*1.5, 0, sweepW*3, this.H);

    // Bright center line
    ctx.fillStyle = `rgba(200,240,255,${0.4 * (1 - Math.abs(t - 0.5) * 2)})`;
    ctx.fillRect(cx - 1, 0, 2, this.H);
  }

  drawFrame() {
    const ctx = this.ctx;
    const m = 4, r = 16;
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m+r, m); ctx.lineTo(this.W-m-r, m);
    ctx.quadraticCurveTo(this.W-m, m, this.W-m, m+r);
    ctx.lineTo(this.W-m, this.H-m-r);
    ctx.quadraticCurveTo(this.W-m, this.H-m, this.W-m-r, this.H-m);
    ctx.lineTo(m+r, this.H-m);
    ctx.quadraticCurveTo(m, this.H-m, m, this.H-m-r);
    ctx.lineTo(m, m+r);
    ctx.quadraticCurveTo(m, m, m+r, m);
    ctx.closePath();
    ctx.stroke();
  }

  drawInfo() {
    const ctx = this.ctx;
    // Corner brackets
    const s = 18;
    ctx.strokeStyle = 'rgba(0,212,255,0.35)';
    ctx.lineWidth = 1.5;

    // Top-left
    ctx.beginPath(); ctx.moveTo(12, 12+s); ctx.lineTo(12, 12); ctx.lineTo(12+s, 12); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(this.W-12, 12+s); ctx.lineTo(this.W-12, 12); ctx.lineTo(this.W-12-s, 12); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(12, this.H-12-s); ctx.lineTo(12, this.H-12); ctx.lineTo(12+s, this.H-12); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(this.W-12, this.H-12-s); ctx.lineTo(this.W-12, this.H-12); ctx.lineTo(this.W-12-s, this.H-12); ctx.stroke();

    // Counter
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${String(this.current + 1).padStart(2,'0')} / ${String(this.images.length).padStart(2,'0')}`, this.W/2, 28);

    // Dots
    const gap = 14;
    const totalW = (this.images.length - 1) * gap;
    const startX = (this.W - totalW) / 2;
    for (let i = 0; i < this.images.length; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * gap, this.H - 20, i === this.current ? 3.5 : 2, 0, Math.PI*2);
      ctx.fillStyle = i === this.current ? '#00d4ff' : 'rgba(255,255,255,0.2)';
      ctx.fill();
    }
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
