/* ========== CANVAS 3D COVERFLOW ========== */
class CanvasCoverflow {
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
    this.progress = 0;
    this.autoplayTimer = 0;
    this.autoplayInterval = 5000;
    this.lastTime = performance.now();
    this.hover = false;
    this.mouse = { x: this.W/2, y: this.H/2 };
    this.reflectionAlpha = 0.25;
    this.gap = 60;
    this.maxVisible = 3; // each side

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
    c.addEventListener('touchstart', e => {
      this.touchStart = e.touches[0].clientX;
    }, { passive: true });
    c.addEventListener('touchend', e => {
      const diff = this.touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? this.next() : this.prev();
    }, { passive: true });
  }

  next() { this.goTo((this.current + 1) % this.images.length); }
  prev() { this.goTo((this.current - 1 + this.images.length) % this.images.length); }
  goTo(index) {
    this.current = index;
    this.progress = 0;
  }

  render() {
    if (!this.loaded) {
      this.drawLoader();
      return;
    }

    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    // Autoplay
    if (!this.hover) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) {
        this.autoplayTimer = 0;
        this.next();
      }
    }

    // Smooth progress
    this.progress = CarouselUtils.lerp(this.progress, 1, 0.08);

    this.ctx.clearRect(0, 0, this.W, this.H);

    const cx = this.W / 2;
    const cy = this.H / 2;
    const imgH = Math.min(this.H * 0.65, 420);
    const imgW = imgH * 1.5;

    // Draw from back to front
    const order = [];
    for (let i = -this.maxVisible; i <= this.maxVisible; i++) {
      const idx = (this.current + i + this.images.length) % this.images.length;
      order.push({ idx, offset: i });
    }
    // Sort by absolute offset (back first)
    order.sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));

    order.forEach(({ idx, offset }) => {
      const img = this.images[idx];
      const absOffset = Math.abs(offset);
      const isActive = offset === 0;

      // 3D transforms
      const spacing = imgW * 0.55;
      const x = cx + offset * spacing;
      const z = isActive ? 0 : -absOffset * 120;
      const scale = isActive ? 1 : 0.75 - absOffset * 0.08;
      const rotY = offset * -25 * (Math.PI / 180);
      const opacity = isActive ? 1 : 0.5 - absOffset * 0.1;
      const blur = isActive ? 0 : absOffset * 2;

      this.drawImage3D(img, x, cy, imgW * scale, imgH * scale, rotY, opacity, blur);

      // Reflection
      if (isActive || absOffset <= 1) {
        this.drawReflection(img, x, cy + imgH * scale * 0.5, imgW * scale, imgH * scale, rotY, opacity * this.reflectionAlpha);
      }
    });

    // Draw dots
    this.drawDots();

    // Draw arrows hint
    this.drawArrows();
  }

  drawImage3D(img, x, y, w, h, rotY, opacity, blur) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = opacity;

    if (blur > 0 && 'filter' in ctx) {
      ctx.filter = `blur(${blur}px)`;
    }

    ctx.translate(x, y);
    // Perspective shear simulation
    const shear = Math.sin(rotY) * 0.3;
    ctx.transform(1, 0, shear, 1, 0, 0);

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;

    // Rounded rect clip
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(-w/2 + r, -h/2);
    ctx.lineTo(w/2 - r, -h/2);
    ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    ctx.lineTo(w/2, h/2 - r);
    ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    ctx.lineTo(-w/2 + r, h/2);
    ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    ctx.lineTo(-w/2, -h/2 + r);
    ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, -w/2, -h/2, w, h);

    // Cyan edge glow on active
    if (Math.abs(rotY) < 0.1) {
      ctx.strokeStyle = 'rgba(0,212,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawReflection(img, x, y, w, h, rotY, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(1, -1);
    const shear = Math.sin(rotY) * 0.3;
    ctx.transform(1, 0, shear, 1, 0, 0);

    const r = 12;
    ctx.beginPath();
    ctx.moveTo(-w/2 + r, -h/2);
    ctx.lineTo(w/2 - r, -h/2);
    ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    ctx.lineTo(w/2, h/2 - r);
    ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    ctx.lineTo(-w/2 + r, h/2);
    ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    ctx.lineTo(-w/2, -h/2 + r);
    ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    ctx.closePath();
    ctx.clip();

    // Gradient fade for reflection
    const grad = ctx.createLinearGradient(0, -h/2, 0, h/2);
    grad.addColorStop(0, 'rgba(7,11,20,0)');
    grad.addColorStop(0.5, 'rgba(7,11,20,0.7)');
    grad.addColorStop(1, 'rgba(7,11,20,1)');

    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  drawDots() {
    const ctx = this.ctx;
    const dotCount = this.images.length;
    const dotSize = 8;
    const gap = 16;
    const totalW = dotCount * gap;
    const startX = (this.W - totalW) / 2 + gap/2;
    const y = this.H - 30;

    for (let i = 0; i < dotCount; i++) {
      const isActive = i === this.current;
      ctx.beginPath();
      ctx.arc(startX + i * gap, y, isActive ? dotSize : dotSize * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#00d4ff' : 'rgba(255,255,255,0.2)';
      ctx.shadowColor = isActive ? 'rgba(0,212,255,0.5)' : 'transparent';
      ctx.shadowBlur = isActive ? 10 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  drawArrows() {
    const ctx = this.ctx;
    const arrowSize = 18;
    const y = this.H / 2;
    const dist = this.W * 0.08;

    // Left arrow
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#fff';
    this.drawArrow(this.W/2 - dist - 100, y, arrowSize, -1);
    this.drawArrow(this.W/2 + dist + 100, y, arrowSize, 1);
    ctx.restore();
  }

  drawArrow(x, y, size, dir) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + dir * size, y - size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dir * size, y + size);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W / 2, cy = this.H / 2;
    const time = performance.now() / 1000;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 20, time * 3, time * 3 + Math.PI);
    ctx.strokeStyle = '#00d4ff';
    ctx.stroke();
  }
}
