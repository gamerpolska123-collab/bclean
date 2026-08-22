/* ========== CANVAS PARTICLE MORPH CAROUSEL ========== */
class CanvasParticleMorph {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.particles = [];
    this.gridW = 70; // columns
    this.gridH = 50; // rows
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.autoplayTimer = 0;
    this.autoplayInterval = 6000;
    this.lastTime = performance.now();
    this.hover = false;
    this.mouse = { x: 0, y: 0 };
    this.explosionForce = 0;

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.initParticles();
      this.loaded = true;
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => { this.W = w || 800; this.H = h || 560; this.initParticles(); });
    AnimationLoop.add(() => this.render());
  }

  initParticles() {
    this.particles = [];
    if (!this.images.length) return;
    const imgW = this.images[0] ? this.images[0].width : 100;
    const imgH = this.images[0] ? this.images[0].height : 100;

    for (let gy = 0; gy < this.gridH; gy++) {
      for (let gx = 0; gx < this.gridW; gx++) {
        this.particles.push({
          x: 0, y: 0,
          targetX: 0, targetY: 0,
          originX: 0, originY: 0,
          color: 'rgba(0,212,255,1)',
          size: 0,
          vx: 0, vy: 0,
          delay: Math.random() * 0.3,
          gx, gy
        });
      }
    }
    this.sampleImage(0);
  }

  sampleImage(imgIndex) {
    const img = this.images[imgIndex];
    if (!img) return;

    // Create offscreen canvas to read pixel data
    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d');
    const scale = Math.min(this.W / img.width, this.H / img.height) * 0.85;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const offsetX = (this.W - drawW) / 2;
    const offsetY = (this.H - drawH) / 2;

    off.width = this.gridW;
    off.height = this.gridH;
    offCtx.drawImage(img, 0, 0, this.gridW, this.gridH);
    const data = offCtx.getImageData(0, 0, this.gridW, this.gridH).data;

    this.particles.forEach((p, i) => {
      const px = i % this.gridW;
      const py = Math.floor(i / this.gridW);
      const di = (py * this.gridW + px) * 4;
      const r = data[di], g = data[di+1], b = data[di+2], a = data[di+3];

      p.targetX = offsetX + (px / this.gridW) * drawW;
      p.targetY = offsetY + (py / this.gridH) * drawH;
      p.color = `rgba(${r},${g},${b},${a/255})`;
      p.size = Math.max(2, (this.W / this.gridW) * 0.55);

      if (!this.isTransitioning) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.originX = p.targetX;
        p.originY = p.targetY;
      }
    });
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
    if (this.isTransitioning) return;
    this.startTransition((this.current + 1) % this.images.length);
  }
  prev() {
    if (this.isTransitioning) return;
    this.startTransition((this.current - 1 + this.images.length) % this.images.length);
  }

  startTransition(newIndex) {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.current = newIndex;
    this.sampleImage(newIndex);

    // Explode particles outward
    this.particles.forEach(p => {
      const angle = Math.random() * Math.PI * 2;
      const force = 50 + Math.random() * 150;
      p.vx = Math.cos(angle) * force;
      p.vy = Math.sin(angle) * force;
    });
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    if (!this.loaded) {
      this.drawLoader();
      return;
    }

    // Autoplay
    if (!this.hover && !this.isTransitioning) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) {
        this.autoplayTimer = 0;
        this.next();
      }
    }

    this.ctx.fillStyle = 'rgba(7,11,20,0.3)';
    this.ctx.fillRect(0, 0, this.W, this.H);

    if (this.isTransitioning) {
      this.transitionProgress += 0.012;
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
      }
    }

    const ease = CarouselUtils.ease.outCubic(this.transitionProgress);

    this.particles.forEach(p => {
      // Mouse repulsion
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120 && this.hover) {
        const force = (120 - dist) / 120;
        p.vx -= (dx / dist) * force * 3;
        p.vy -= (dy / dist) * force * 3;
      }

      // Spring to target
      const ax = (p.targetX - p.x) * 0.08;
      const ay = (p.targetY - p.y) * 0.08;
      p.vx += ax;
      p.vy += ay;
      p.vx *= 0.92; // damping
      p.vy *= 0.92;

      p.x += p.vx;
      p.y += p.vy;

      // Draw particle
      const size = p.size * (0.5 + ease * 0.5);
      const alpha = Math.min(1, ease * 1.5);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.slice(0, p.color.lastIndexOf(',') + 1) + alpha + ')';
      this.ctx.fill();

      // Glow for bright particles
      if (alpha > 0.5) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color.slice(0, p.color.lastIndexOf(',') + 1) + (alpha * 0.15) + ')';
        this.ctx.fill();
      }
    });

    // Draw connecting lines for nearby particles (constellation effect)
    if (!this.isTransitioning) {
      this.ctx.strokeStyle = 'rgba(0,212,255,0.04)';
      this.ctx.lineWidth = 0.5;
      for (let i = 0; i < this.particles.length; i += 3) {
        const p = this.particles[i];
        for (let j = i + 1; j < Math.min(i + 5, this.particles.length); j += 3) {
          const p2 = this.particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const d = Math.sqrt(ddx*ddx + ddy*ddy);
          if (d < 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }
    }

    this.drawOverlay();
  }

  drawOverlay() {
    // Title
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '700 14px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`REALIZACJA ${this.current + 1} / ${this.images.length}`, this.W/2, this.H - 20);

    // Progress dots
    const dotCount = this.images.length;
    const gap = 20;
    const startX = (this.W - (dotCount-1)*gap)/2;
    for (let i = 0; i < dotCount; i++) {
      this.ctx.beginPath();
      this.ctx.arc(startX + i*gap, this.H - 45, i === this.current ? 5 : 3, 0, Math.PI*2);
      this.ctx.fillStyle = i === this.current ? '#00d4ff' : 'rgba(255,255,255,0.2)';
      this.ctx.fill();
    }
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W/2, cy = this.H/2;
    const t = performance.now()/1000;
    ctx.clearRect(0,0,this.W,this.H);
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 25, t*4, t*4 + Math.PI*1.5);
    ctx.strokeStyle = '#00d4ff';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie cząsteczek...', cx, cy + 50);
  }
}
