/* ========== CANVAS WAVE DISTORTION CAROUSEL ========== */
class CanvasWaveDistortion {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.target = 0;
    this.slideProgress = 0;
    this.wavePhase = 0;
    this.scanlineOffset = 0;
    this.rgbSplit = 0;
    this.autoplayTimer = 0;
    this.autoplayInterval = 5500;
    this.lastTime = performance.now();
    this.hover = false;
    this.mouse = { x: this.W/2, y: this.H/2 };
    this.offCanvas = document.createElement('canvas');
    this.offCtx = this.offCanvas.getContext('2d');

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
    c.addEventListener('mousemove', e => {
      const rect = c.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => this.hover = false);
    c.addEventListener('click', () => this.next());
    c.addEventListener('touchstart', e => { this.touchStart = e.touches[0].clientX; }, { passive: true });
    c.addEventListener('touchend', e => {
      const diff = this.touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? this.next() : this.prev();
    }, { passive: true });
  }

  next() {
    this.target = (this.target + 1) % this.images.length;
    this.slideProgress = 0;
  }
  prev() {
    this.target = (this.target - 1 + this.images.length) % this.images.length;
    this.slideProgress = 0;
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    if (!this.loaded) { this.drawLoader(); return; }

    // Autoplay
    if (!this.hover) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) { this.autoplayTimer = 0; this.next(); }
    }

    // Smooth slide transition
    if (this.current !== this.target) {
      this.slideProgress += 0.025;
      if (this.slideProgress >= 1) {
        this.current = this.target;
        this.slideProgress = 0;
      }
    }

    this.wavePhase += 0.03;
    this.scanlineOffset += 0.5;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Background grid
    this.drawGrid();

    // Draw current and next slide with wave distortion
    if (this.current !== this.target) {
      const t = CarouselUtils.ease.inOutCubic(this.slideProgress);
      this.drawDistortedImage(this.images[this.current], -t * this.W, 0, 1 - t);
      this.drawDistortedImage(this.images[this.target], (1 - t) * this.W, 0, t);
    } else {
      this.drawDistortedImage(this.images[this.current], 0, 0, 1);
    }

    // Scanlines overlay
    this.drawScanlines();

    // RGB split on edges during transition
    if (this.current !== this.target) {
      this.drawRGBSplit();
    }

    // Mouse light effect
    this.drawMouseLight();

    // UI overlay
    this.drawUI();
  }

  drawGrid() {
    const ctx = this.ctx;
    const gridSize = 40;
    ctx.strokeStyle = 'rgba(0,212,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.H); ctx.stroke();
    }
    for (let y = 0; y < this.H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.W, y); ctx.stroke();
    }
  }

  drawDistortedImage(img, offsetX, offsetY, alpha) {
    const ctx = this.ctx;
    const imgAspect = img.width / img.height;
    const canvasAspect = this.W / this.H;
    let drawW, drawH;
    if (canvasAspect > imgAspect) {
      drawH = this.H * 0.85;
      drawW = drawH * imgAspect;
    } else {
      drawW = this.W * 0.85;
      drawH = drawW / imgAspect;
    }
    const x = (this.W - drawW) / 2 + offsetX;
    const y = (this.H - drawH) / 2 + offsetY;

    // Wave distortion: draw image in horizontal strips
    const stripHeight = 4;
    const strips = Math.ceil(drawH / stripHeight);

    ctx.save();
    ctx.globalAlpha = alpha;

    for (let i = 0; i < strips; i++) {
      const sy = i * stripHeight;
      const wave = Math.sin(this.wavePhase + i * 0.08) * 8;
      const wave2 = Math.cos(this.wavePhase * 0.7 + i * 0.05) * 4;
      const totalOffset = wave + wave2;

      // Mouse influence
      const mouseDist = Math.abs(this.mouse.y - (y + sy)) / this.H;
      const mouseWave = Math.sin(this.wavePhase * 2 + mouseDist * 10) * (1 - mouseDist) * 15;

      ctx.drawImage(
        img,
        0, (sy / drawH) * img.height, img.width, (stripHeight / drawH) * img.height,
        x + totalOffset + mouseWave, y + sy, drawW, stripHeight + 1
      );
    }

    // Border glow
    ctx.strokeStyle = `rgba(0,212,255,${alpha * 0.15})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y - 2, drawW + 4, drawH + 4);

    ctx.restore();
  }

  drawScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = this.scanlineOffset % 4; y < this.H; y += 4) {
      ctx.fillRect(0, y, this.W, 1);
    }
  }

  drawRGBSplit() {
    const ctx = this.ctx;
    const splitAmount = Math.sin(this.slideProgress * Math.PI) * 8;
    if (splitAmount < 0.5) return;

    ctx.globalCompositeOperation = 'screen';

    // Red channel offset left
    ctx.save();
    ctx.translate(-splitAmount, 0);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.restore();

    // Blue channel offset right
    ctx.save();
    ctx.translate(splitAmount, 0);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.restore();

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  drawMouseLight() {
    if (!this.hover) return;
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, 200
    );
    grad.addColorStop(0, 'rgba(0,212,255,0.06)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  drawUI() {
    const ctx = this.ctx;
    // Slide counter
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(this.current + 1).padStart(2,'0')} / ${String(this.images.length).padStart(2,'0')}`, 30, this.H - 30);

    // Progress bar
    const barW = 200;
    const barX = (this.W - barW) / 2;
    const barY = this.H - 40;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(barX, barY, barW, 3);
    const progress = (this.autoplayTimer / this.autoplayInterval) * barW;
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = 'rgba(0,212,255,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillRect(barX, barY, progress, 3);
    ctx.shadowBlur = 0;

    // Title
    const titles = ['Mycie kostki brukowej', 'Mycie elewacji', 'Mycie dachu', 'Mycie podjazdu', 'Czyszczenie elewacji domu', 'Detailing kostki'];
    ctx.fillStyle = '#fff';
    ctx.font = '700 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titles[this.current] || 'Realizacja', this.W/2, this.H - 70);
    ctx.fillStyle = 'rgba(0,212,255,0.8)';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText('BARTEKCLEAN REALIZACJE', this.W/2, this.H - 90);
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W/2, cy = this.H/2;
    const t = performance.now()/1000;
    ctx.clearRect(0,0,this.W,this.H);

    // Animated wave lines
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = 0; x < this.W; x += 5) {
        const y = cy + Math.sin(x * 0.02 + t * 3 + i * 0.5) * (20 + i * 10);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#00d4ff';
    ctx.font = '700 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Inicjalizacja fali...', cx, cy + 80);
  }
}
