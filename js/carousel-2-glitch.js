/* ========== CAROUSEL 2: GLITCH DISTORTION ========== */
class CarouselGlitch {
  constructor(selector, images) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.images = [];
    this.current = 0;
    this.transition = 0;
    this.isTransitioning = false;
    this.time = 0;
    this.glitchIntensity = 0;
    this.hover = false;
    this.W = 0; this.H = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.titles = [
      'Kostka brukowa',
      'Elewacje',
      'Dachy',
      'Podjazdy',
      'Impregnacja',
      'Przemysł'
    ];

    this.preload(images).then(() => {
      this.resize();
      this.loop();
    });
    this.bindEvents();
  }

  async preload(srcs) {
    this.images = await Promise.all(srcs.map(src => new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = src;
    })));
    this.images = this.images.filter(i => i);
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.W = parent ? parent.offsetWidth : 800;
    this.H = parent ? parent.offsetHeight : 560;
    if (this.W < 10) this.W = 800;
    if (this.H < 10) this.H = 560;
    this.canvas.width = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  bindEvents() {
    const parent = this.canvas.parentElement;
    parent.addEventListener('mouseenter', () => this.hover = true);
    parent.addEventListener('mouseleave', () => this.hover = false);
    parent.addEventListener('click', () => this.triggerGlitchNext());

    let touchStart = 0;
    parent.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
    parent.addEventListener('touchend', e => {
      const diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) this.triggerGlitchNext();
    }, { passive: true });

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.resize(), 150);
    });

    setInterval(() => { if (!this.hover && !this.isTransitioning) this.triggerGlitchNext(); }, 7000);
  }

  triggerGlitchNext() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.transition = 0;
    this.glitchIntensity = 1;
    this.nextIdx = (this.current + 1) % this.images.length;
  }

  loop() {
    this.time += 0.016;
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  render() {
    if (!this.images.length) return;
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, W, H);

    // Update transition
    if (this.isTransitioning) {
      this.transition += 0.02;
      this.glitchIntensity *= 0.92;
      if (this.transition >= 1) {
        this.current = this.nextIdx;
        this.isTransitioning = false;
        this.transition = 0;
        this.glitchIntensity = 0;
      }
    }

    // Random glitch spikes
    const glitchActive = this.glitchIntensity > 0.05 || (Math.random() < 0.02 && this.hover);

    const img = this.images[this.current];
    const aspect = img.width / img.height;
    let dw = W * 0.8, dh = dw / aspect;
    if (dh > H * 0.65) { dh = H * 0.65; dw = dh * aspect; }
    const ix = (W - dw) / 2;
    const iy = (H - dh) / 2;

    if (glitchActive) {
      this.drawGlitchImage(ctx, img, ix, iy, dw, dh);
    } else {
      // Normal draw with subtle scanlines
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      this.roundRect(ctx, ix, iy, dw, dh, 12);
      ctx.clip();
      ctx.drawImage(img, ix, iy, dw, dh);
      ctx.restore();
    }

    // Scanlines overlay
    this.drawScanlines(ctx, W, H);

    // Vignette
    this.drawVignette(ctx, W, H);

    // UI
    this.drawUI(ctx, W, H);
  }

  drawGlitchImage(ctx, img, x, y, w, h) {
    const strips = 20;
    const stripH = h / strips;
    const intensity = this.glitchIntensity;

    for (let i = 0; i < strips; i++) {
      const sy = i * stripH;
      const offset = (Math.random() - 0.5) * intensity * 60;
      const scaleX = 1 + (Math.random() - 0.5) * intensity * 0.1;

      ctx.save();
      ctx.beginPath();
      ctx.rect(x + offset, y + sy, w * scaleX, stripH + 1);
      ctx.clip();

      // RGB split
      const rgbOffset = intensity * 8;
      if (rgbOffset > 1) {
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(img, 0, (sy/h)*img.height, img.width, (stripH/h)*img.height,
          x + offset - rgbOffset, y + sy, w * scaleX, stripH + 1);
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.drawImage(img, 0, (sy/h)*img.height, img.width, (stripH/h)*img.height,
        x + offset, y + sy, w * scaleX, stripH + 1);
      ctx.restore();
    }

    // Block glitches
    if (intensity > 0.3) {
      for (let i = 0; i < 5; i++) {
        const bx = x + Math.random() * w;
        const by = y + Math.random() * h;
        const bw = 20 + Math.random() * 80;
        const bh = 5 + Math.random() * 20;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,212,255,0.3)' : 'rgba(255,0,100,0.2)';
        ctx.fillRect(bx, by, bw, bh);
      }
    }
  }

  drawScanlines(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1);
    }
  }

  drawVignette(ctx, W, H) {
    const grad = ctx.createRadialGradient(W/2, H/2, W*0.3, W/2, H/2, W*0.8);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(7,11,20,0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  drawUI(ctx, W, H) {
    // Title with glitch effect
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '800 32px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';

    const title = this.titles[this.current];
    const titleX = 50;
    const titleY = H - 70;

    // Glitch shadow
    if (this.glitchIntensity > 0.1) {
      ctx.fillStyle = 'rgba(0,212,255,0.5)';
      ctx.fillText(title, titleX - this.glitchIntensity * 4, titleY);
      ctx.fillStyle = 'rgba(255,0,100,0.3)';
      ctx.fillText(title, titleX + this.glitchIntensity * 4, titleY);
    }

    ctx.fillStyle = '#fff';
    ctx.fillText(title, titleX, titleY);

    // Progress bar
    const barW = 120;
    const barH = 3;
    const barX = 50;
    const barY = H - 40;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = 'rgba(0,212,255,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillRect(barX, barY, barW * ((this.current + 1) / this.images.length), barH);
    ctx.shadowBlur = 0;

    // Counter
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '600 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.current + 1} / ${this.images.length}`, W - 50, H - 50);

    // Click hint
    if (!this.hover) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.textAlign = 'center';
      ctx.font = '500 11px Inter, system-ui, sans-serif';
      ctx.fillText('KLIKNIJ ABY ZMIENIĆ', W / 2, H - 20);
    }

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
