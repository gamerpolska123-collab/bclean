/* ========== CAROUSEL 4: WATER REVEAL ========== */
class CarouselWaterReveal {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.revealProgress = 0;
    this.revealing = false;
    this.particles = [];
    this.rings = [];
    this.autoplayTimer = 0;
    this.autoplayInterval = 6000;
    this.lastTime = performance.now();
    this.hover = false;
    this.titles = ['Mycie kostki brukowej','Czyszczenie elewacji','Mycie dachów','Renowacja podjazdów','Czyszczenie elewacji 2','Mycie kostki 2'];

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.loaded = true;
      this.initReveal();
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => { this.W = w; this.H = h; this.initReveal(); });
    AnimationLoop.add(() => this.render());
  }

  initReveal() {
    this.particles = [];
    this.rings = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.2 + Math.random() * 0.8;
      this.particles.push({
        angle, dist,
        speed: 0.3 + Math.random() * 0.7,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 0.4
      });
    }
    // Initial reveal
    this.revealProgress = 1;
    this.revealing = false;
  }

  bindEvents() {
    const c = this.setup.canvas;
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => this.hover = false);
    c.addEventListener('click', e => {
      const rect = c.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < this.W * 0.3) this.prev(); else if (x > this.W * 0.7) this.next();
    });
    let touchStartX = 0;
    c.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
    c.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    }, {passive:true});
  }

  next() { this.startTransition((this.current + 1) % this.images.length); }
  prev() { this.startTransition((this.current - 1 + this.images.length) % this.images.length); }

  startTransition(newIndex) {
    if (this.revealing || newIndex === this.current) return;
    this.current = newIndex;
    this.revealing = true;
    this.revealProgress = 0;
    // Reset particles
    this.particles.forEach(p => { p.delay = Math.random() * 0.3; });
    this.rings = [{ radius: 0, alpha: 1, width: 3 }];
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;
    const ctx = this.ctx;

    if (!this.loaded) { this.drawLoader(); return; }

    // Autoplay
    if (!this.hover && !this.revealing) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) { this.autoplayTimer = 0; this.next(); }
    }

    // Reveal animation
    if (this.revealing) {
      this.revealProgress += dt / 1800;
      if (this.revealProgress >= 1) {
        this.revealProgress = 1;
        this.revealing = false;
      }
    }

    ctx.clearRect(0, 0, this.W, this.H);

    const img = this.images[this.current];
    const cx = this.W / 2;
    const cy = this.H / 2;
    const maxRadius = Math.max(this.W, this.H) * 0.75;
    const ease = CarouselUtils.ease.outCubic(this.revealProgress);
    const currentRadius = maxRadius * ease;

    // Draw dark background with subtle pattern
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    // Draw image with circular reveal mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
    ctx.clip();

    const scale = Math.max(this.W / img.width, this.H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (this.W - dw) / 2, (this.H - dh) / 2, dw, dh);

    // Subtle vignette inside image
    const vig = ctx.createRadialGradient(cx, cy, currentRadius * 0.5, cx, cy, currentRadius);
    vig.addColorStop(0, 'rgba(7,11,20,0)');
    vig.addColorStop(1, 'rgba(7,11,20,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.restore();

    // Reveal rings
    if (this.revealing) {
      this.rings.forEach(ring => {
        ring.radius += dt * 0.15;
        ring.alpha -= dt * 0.0008;
        if (ring.alpha > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,212,255,${ring.alpha})`;
          ctx.lineWidth = ring.width;
          ctx.stroke();
        }
      });
      // Add new rings
      if (this.revealing && this.revealProgress < 0.8 && Math.random() < 0.03) {
        this.rings.push({ radius: currentRadius * 0.3, alpha: 0.6, width: 1 + Math.random() * 2 });
      }
    }

    // Particles around reveal edge
    if (this.revealing) {
      this.particles.forEach(p => {
        const pProgress = Math.max(0, (this.revealProgress - p.delay) / (1 - p.delay));
        if (pProgress <= 0) return;
        const pEase = CarouselUtils.ease.outQuart(pProgress);
        const r = currentRadius + p.dist * 60 * (1 - pEase);
        const px = cx + Math.cos(p.angle + pEase * 2) * r;
        const py = cy + Math.sin(p.angle + pEase * 2) * r;
        const alpha = (1 - pEase) * 0.8;
        const size = p.size * (1 - pEase * 0.5);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${alpha})`;
        ctx.fill();

        // Glow
        if (size > 1.5) {
          ctx.beginPath();
          ctx.arc(px, py, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,212,255,${alpha * 0.1})`;
          ctx.fill();
        }
      });
    }

    // Border glow during reveal
    if (this.revealing) {
      ctx.save();
      ctx.strokeStyle = `rgba(0,212,255,${0.3 * (1 - ease)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Frame border
    ctx.save();
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, this.W - 1, this.H - 1);
    ctx.restore();

    // Title overlay
    this.drawTitle();

    // Dots
    this.drawDots();

    // Arrows
    this.drawArrows();
  }

  drawTitle() {
    const ctx = this.ctx;
    const alpha = this.revealing ? this.revealProgress : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Gradient bar behind title
    const barW = 200;
    const grad = ctx.createLinearGradient(40, 0, 40 + barW, 0);
    grad.addColorStop(0, 'rgba(7,11,20,0.8)');
    grad.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, this.H - 110, barW + 60, 80);

    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.min(20, this.W * 0.026)}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(this.titles[this.current] || '', 40, this.H - 65);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${Math.min(12, this.W * 0.015)}px Inter, sans-serif`;
    ctx.fillText('BartekClean Realizacje', 40, this.H - 42);

    ctx.restore();
  }

  drawDots() {
    const ctx = this.ctx;
    const count = this.images.length;
    const gap = 14;
    const totalW = (count - 1) * gap;
    const startX = (this.W - totalW) / 2;
    const y = this.H - 22;
    for (let i = 0; i < count; i++) {
      const active = i === this.current;
      ctx.beginPath();
      ctx.arc(startX + i * gap, y, active ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#00d4ff' : 'rgba(255,255,255,0.2)';
      ctx.fill();
      if (active) {
        ctx.beginPath();
        ctx.arc(startX + i * gap, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,212,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  drawArrows() {
    const ctx = this.ctx;
    const y = this.H / 2;
    const size = 16;
    ctx.save();
    ctx.globalAlpha = this.hover ? 0.35 : 0.12;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(28 + size, y - size);
    ctx.lineTo(28, y);
    ctx.lineTo(28 + size, y + size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.W - 28 - size, y - size);
    ctx.lineTo(this.W - 28, y);
    ctx.lineTo(this.W - 28 - size, y + size);
    ctx.stroke();
    ctx.restore();
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W/2, cy = this.H/2;
    const t = performance.now() / 1000;
    ctx.clearRect(0,0,this.W,this.H);
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0,0,this.W,this.H);
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 28, t*3, t*3 + Math.PI*1.5);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie efektu...', cx, cy + 52);
  }
}
