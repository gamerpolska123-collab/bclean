/* ========== CAROUSEL 1: LIQUID MORPH ========== */
class CarouselLiquid {
  constructor(selector, images) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.images = [];
    this.current = 0;
    this.nextIdx = 0;
    this.transition = 0;
    this.isTransitioning = false;
    this.time = 0;
    this.mouse = { x: 0.5, y: 0.5 };
    this.hover = false;
    this.W = 0; this.H = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.titles = [
      'Mycie kostki brukowej',
      'Czyszczenie elewacji',
      'Mycie dachów',
      'Podjazdy i tarasy',
      'Impregnacja powierzchni',
      'Czyszczenie przemysłowe'
    ];
    this.subtitles = [
      'Profesjonalne usuwanie zabrudzeń',
      'Bezpieczne metody dla każdego tynku',
      'Usuwanie mchu i porostów',
      'Przywracamy pierwotny blask',
      'Hydrofobowa ochrona na lata',
      'Elastyczne terminy i atrakcyjne ceny'
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
    parent.addEventListener('mousemove', e => {
      const rect = parent.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = (e.clientY - rect.top) / rect.height;
    });
    parent.addEventListener('mouseenter', () => this.hover = true);
    parent.addEventListener('mouseleave', () => this.hover = false);
    parent.addEventListener('click', () => this.next());

    let touchStart = 0;
    parent.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
    parent.addEventListener('touchend', e => {
      const diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    }, { passive: true });

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.resize(), 150);
    });

    // Autoplay
    setInterval(() => { if (!this.hover && !this.isTransitioning) this.next(); }, 6000);
  }

  next() {
    if (this.isTransitioning || this.images.length < 2) return;
    this.nextIdx = (this.current + 1) % this.images.length;
    this.isTransitioning = true;
    this.transition = 0;
  }

  prev() {
    if (this.isTransitioning || this.images.length < 2) return;
    this.nextIdx = (this.current - 1 + this.images.length) % this.images.length;
    this.isTransitioning = true;
    this.transition = 0;
  }

  goTo(idx) {
    if (this.isTransitioning || idx === this.current) return;
    this.nextIdx = idx;
    this.isTransitioning = true;
    this.transition = 0;
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

    ctx.clearRect(0, 0, W, H);

    // Background subtle gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#070b14');
    bgGrad.addColorStop(1, '#0d1a2d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Draw current image
    const img = this.images[this.current];
    const aspect = img.width / img.height;
    let dw = W * 0.85, dh = dw / aspect;
    if (dh > H * 0.7) { dh = H * 0.7; dw = dh * aspect; }
    const ix = (W - dw) / 2;
    const iy = (H - dh) / 2 - 20;

    // Mouse parallax offset
    const parallaxX = (this.mouse.x - 0.5) * 20;
    const parallaxY = (this.mouse.y - 0.5) * 15;

    // Transition effect
    if (this.isTransitioning) {
      this.transition += 0.025;
      if (this.transition >= 1) {
        this.current = this.nextIdx;
        this.isTransitioning = false;
        this.transition = 0;
      }
    }

    const t = this.easeInOutCubic(this.transition);

    // Draw image with rounded corners and shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    const r = 16;
    const x = ix + parallaxX;
    const y = iy + parallaxY;

    this.roundRect(ctx, x, y, dw, dh, r);
    ctx.clip();

    if (this.isTransitioning) {
      // Liquid wipe effect
      const nextImg = this.images[this.nextIdx];
      const waveCount = 8;
      const stripH = dh / waveCount;

      for (let i = 0; i < waveCount; i++) {
        const sy = i * stripH;
        const waveOffset = Math.sin(this.time * 3 + i * 0.8) * 30 * (1 - t);
        const progress = Math.max(0, Math.min(1, (t * waveCount - i + 1)));

        // Current image strip
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y + sy, dw * (1 - progress), stripH + 1);
        ctx.clip();
        ctx.drawImage(img, 0, (sy/dh)*img.height, img.width, (stripH/dh)*img.height,
          x + waveOffset * (1 - progress), y + sy, dw, stripH + 1);
        ctx.restore();

        // Next image strip
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + dw * (1 - progress), y + sy, dw * progress, stripH + 1);
        ctx.clip();
        ctx.drawImage(nextImg, 0, (sy/dh)*nextImg.height, img.width, (stripH/dh)*img.height,
          x + waveOffset * progress, y + sy, dw, stripH + 1);
        ctx.restore();
      }
    } else {
      ctx.drawImage(img, x, y, dw, dh);
    }

    ctx.restore();

    // Cyan border glow on hover
    if (this.hover) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,212,255,0.3)';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x - 1, y - 1, dw + 2, dh + 2, r + 1);
      ctx.stroke();
      ctx.shadowColor = 'rgba(0,212,255,0.2)';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.restore();
    }

    // Text overlay
    this.drawText(ctx, W, H, t);

    // Progress dots
    this.drawDots(ctx, W, H);
  }

  drawText(ctx, W, H, t) {
    const title = this.titles[this.current];
    const subtitle = this.subtitles[this.current];

    ctx.save();

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '700 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, 50, H - 80);

    // Subtitle
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.font = '400 15px Inter, system-ui, sans-serif';
    ctx.fillText(subtitle, 50, H - 52);

    // Counter
    ctx.fillStyle = 'rgba(0,212,255,0.6)';
    ctx.font = '600 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${String(this.current + 1).padStart(2,'0')} / ${String(this.images.length).padStart(2,'0')}`, W - 50, H - 52);

    // "Click to next" hint
    if (!this.hover && !this.isTransitioning) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.textAlign = 'center';
      ctx.font = '500 12px Inter, system-ui, sans-serif';
      ctx.fillText('Kliknij lub przesuń aby zmienić', W / 2, H - 25);
    }

    ctx.restore();
  }

  drawDots(ctx, W, H) {
    const count = this.images.length;
    const gap = 14;
    const dotSize = 6;
    const totalW = count * gap;
    const startX = (W - totalW) / 2 + gap / 2;
    const y = H - 30;

    for (let i = 0; i < count; i++) {
      const isActive = i === this.current;
      ctx.beginPath();
      ctx.arc(startX + i * gap, y, isActive ? dotSize : dotSize * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#00d4ff' : 'rgba(255,255,255,0.2)';
      if (isActive) {
        ctx.shadowColor = 'rgba(0,212,255,0.5)';
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
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

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
