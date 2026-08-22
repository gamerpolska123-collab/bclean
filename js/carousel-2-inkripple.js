/* ========== CANVAS INK RIPPLE CAROUSEL ========== */
class CarouselInkRipple {
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
    this.autoplayInterval = 5500;
    this.lastTime = performance.now();
    this.hover = false;
    this.ripples = [];

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
    c.addEventListener('click', e => {
      const rect = c.getBoundingClientRect();
      this.triggerRipple(e.clientX - rect.left, e.clientY - rect.top);
    });
    c.addEventListener('touchstart', e => {
      this.touchStart = e.touches[0].clientX;
      const rect = c.getBoundingClientRect();
      this.triggerRipple(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }, { passive: true });
    c.addEventListener('touchend', e => {
      const diff = this.touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? this.next() : this.prev();
    }, { passive: true });
  }

  triggerRipple(x, y) {
    if (this.isTransitioning) return;
    this.ripples.push({ x, y, r: 0, maxR: Math.max(this.W, this.H) * 0.8, strength: 1 });
    setTimeout(() => this.next(), 300);
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
      if (this.autoplayTimer > this.autoplayInterval) {
        this.autoplayTimer = 0;
        const cx = this.W/2 + (Math.random()-0.5)*this.W*0.4;
        const cy = this.H/2 + (Math.random()-0.5)*this.H*0.4;
        this.ripples.push({ x: cx, y: cy, r: 0, maxR: Math.max(this.W, this.H) * 0.75, strength: 1 });
        setTimeout(() => this.next(), 350);
      }
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    // Update transition
    if (this.isTransitioning) {
      this.transition += dt / 900;
      if (this.transition >= 1) {
        this.current = this.nextIndex;
        this.isTransitioning = false;
        this.transition = 0;
      }
    }

    // Update ripples
    this.ripples.forEach(r => { r.r += dt * 0.35; r.strength *= 0.985; });
    this.ripples = this.ripples.filter(r => r.r < r.maxR && r.strength > 0.01);

    // Draw current image
    this.drawImage(this.current, 1);

    // Draw next image with ripple mask
    if (this.isTransitioning) {
      ctx.save();
      const t = CarouselUtils.ease.outCubic(this.transition);
      this.buildRippleMask(t);
      ctx.globalAlpha = t;
      this.drawImage(this.nextIndex, 1);
      ctx.restore();
    }

    // Draw ripple rings
    this.drawRippleRings();

    // Overlay info
    this.drawOverlay();
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

  buildRippleMask(t) {
    // No-op: we use globalAlpha + ripple rings for the effect
  }

  drawRippleRings() {
    const ctx = this.ctx;
    this.ripples.forEach(r => {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(0,212,255,${r.strength * 0.4})`;
      ctx.lineWidth = 2 + r.strength * 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * 0.7, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(0,212,255,${r.strength * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  drawOverlay() {
    const ctx = this.ctx;
    // Bottom gradient
    const grad = ctx.createLinearGradient(0, this.H-80, 0, this.H);
    grad.addColorStop(0, 'rgba(7,11,20,0)');
    grad.addColorStop(1, 'rgba(7,11,20,0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, this.H-80, this.W, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '600 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`REALIZACJA ${this.current + 1}`, 24, this.H - 28);

    // Dots
    const gap = 18;
    const startX = this.W - 24 - (this.images.length - 1) * gap;
    for (let i = 0; i < this.images.length; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * gap, this.H - 32, i === this.current ? 4 : 2.5, 0, Math.PI*2);
      ctx.fillStyle = i === this.current ? '#00d4ff' : 'rgba(255,255,255,0.25)';
      ctx.fill();
    }
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W/2, cy = this.H/2;
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
