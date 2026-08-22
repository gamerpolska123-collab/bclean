/* ========== CANVAS KEN BURNS CAROUSEL ========== */
class CarouselKenBurns {
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
    this.transition = 0; // 0..1
    this.isTransitioning = false;
    this.autoplayTimer = 0;
    this.autoplayInterval = 6000;
    this.lastTime = performance.now();
    this.hover = false;
    this.mouse = { x: this.W/2, y: this.H/2 };

    // Ken Burns params for each slide: scale, offsetX, offsetY
    this.slides = [];

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.initSlides();
      this.loaded = true;
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => {
      this.W = w || 800; this.H = h || 560;
    });
    AnimationLoop.add(() => this.render());
  }

  initSlides() {
    this.slides = this.images.map(() => ({
      scale: 1 + Math.random() * 0.25,
      tx: (Math.random() - 0.5) * 0.15,
      ty: (Math.random() - 0.5) * 0.15,
      time: 0
    }));
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

    // Autoplay
    if (!this.hover && !this.isTransitioning) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) {
        this.autoplayTimer = 0;
        this.next();
      }
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Background dark fill
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    // Update transition
    if (this.isTransitioning) {
      this.transition += dt / 1200;
      if (this.transition >= 1) {
        this.transition = 1;
        this.current = this.nextIndex;
        this.isTransitioning = false;
        this.transition = 0;
      }
    }

    // Draw current slide
    this.drawSlide(this.current, 1);

    // Draw next slide with crossfade
    if (this.isTransitioning) {
      ctx.save();
      ctx.globalAlpha = CarouselUtils.ease.inOutSine(this.transition);
      this.drawSlide(this.nextIndex, 1);
      ctx.restore();
    }

    // Vignette overlay
    this.drawVignette();

    // Progress bar
    this.drawProgress(dt);

    // Slide counter
    this.drawCounter();
  }

  drawSlide(idx, alpha) {
    const img = this.images[idx];
    if (!img || !img.width) return;

    const slide = this.slides[idx];
    slide.time += 0.0003;

    // Animate scale and offset slowly
    const s = slide.scale + Math.sin(slide.time) * 0.03;
    const ox = slide.tx + Math.cos(slide.time * 0.7) * 0.02;
    const oy = slide.ty + Math.sin(slide.time * 0.5) * 0.02;

    const ctx = this.ctx;
    const imgAspect = img.width / img.height;
    const canvasAspect = this.W / this.H;

    let dw, dh;
    if (imgAspect > canvasAspect) {
      dh = this.H * s;
      dw = dh * imgAspect;
    } else {
      dw = this.W * s;
      dh = dw / imgAspect;
    }

    const dx = (this.W - dw) / 2 + ox * this.W;
    const dy = (this.H - dh) / 2 + oy * this.H;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Rounded rect clip
    const r = 16;
    const margin = 4;
    ctx.beginPath();
    ctx.moveTo(margin + r, margin);
    ctx.lineTo(this.W - margin - r, margin);
    ctx.quadraticCurveTo(this.W - margin, margin, this.W - margin, margin + r);
    ctx.lineTo(this.W - margin, this.H - margin - r);
    ctx.quadraticCurveTo(this.W - margin, this.H - margin, this.W - margin - r, this.H - margin);
    ctx.lineTo(margin + r, this.H - margin);
    ctx.quadraticCurveTo(margin, this.H - margin, margin, this.H - margin - r);
    ctx.lineTo(margin, margin + r);
    ctx.quadraticCurveTo(margin, margin, margin + r, margin);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, dx, dy, dw, dh);

    // Subtle cyan border glow on active
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  drawVignette() {
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(this.W/2, this.H/2, this.H*0.35, this.W/2, this.H/2, this.H*0.85);
    grad.addColorStop(0, 'rgba(7,11,20,0)');
    grad.addColorStop(1, 'rgba(7,11,20,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  drawProgress(dt) {
    if (this.hover || this.isTransitioning) return;
    const ctx = this.ctx;
    const barW = 120;
    const barH = 3;
    const x = (this.W - barW) / 2;
    const y = this.H - 24;

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, barH/2);
    ctx.fill();

    const progress = Math.min(this.autoplayTimer / this.autoplayInterval, 1);
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.roundRect(x, y, barW * progress, barH, barH/2);
    ctx.fill();
  }

  drawCounter() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '500 13px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.current + 1} / ${this.images.length}`, this.W - 24, 32);
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W/2, cy = this.H/2;
    const t = performance.now()/1000;
    ctx.clearRect(0,0,this.W,this.H);
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0,0,this.W,this.H);
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 28, t*3, t*3 + Math.PI*1.3);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie galerii...', cx, cy + 52);
  }
}
