/* ========== CANVAS 3D CYLINDER CAROUSEL ========== */
class CanvasCylinder {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.angle = 0;
    this.targetAngle = 0;
    this.radius = 0;
    this.dragging = false;
    this.lastMouseX = 0;
    this.autoRotate = true;
    this.autoSpeed = 0.003;
    this.autoplayTimer = 0;
    this.autoplayInterval = 4000;
    this.lastTime = performance.now();
    this.hover = false;
    this.mouse = { x: this.W/2, y: this.H/2 };
    this.reflectionAlpha = 0.2;

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.radius = this.W * 0.35;
      this.loaded = true;
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => { this.W = w || 800; this.H = h || 560; this.radius = (w || 800) * 0.35; });
    AnimationLoop.add(() => this.render());
  }

  bindEvents() {
    const c = this.setup.canvas;
    c.addEventListener('mousedown', e => {
      this.dragging = true;
      this.lastMouseX = e.clientX;
      this.autoRotate = false;
    });
    window.addEventListener('mouseup', () => { this.dragging = false; this.autoRotate = true; });
    c.addEventListener('mousemove', e => {
      const rect = c.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      if (this.dragging) {
        const dx = e.clientX - this.lastMouseX;
        this.targetAngle += dx * 0.005;
        this.lastMouseX = e.clientX;
      }
    });
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => { this.hover = false; this.dragging = false; });
    c.addEventListener('touchstart', e => {
      this.dragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.autoRotate = false;
    }, { passive: true });
    c.addEventListener('touchmove', e => {
      if (this.dragging) {
        const dx = e.touches[0].clientX - this.lastMouseX;
        this.targetAngle += dx * 0.005;
        this.lastMouseX = e.touches[0].clientX;
      }
    }, { passive: true });
    c.addEventListener('touchend', () => { this.dragging = false; this.autoRotate = true; }, { passive: true });
    c.addEventListener('click', () => {
      if (!this.dragging) this.next();
    });
  }

  next() {
    const step = (Math.PI * 2) / this.images.length;
    this.targetAngle += step;
  }
  prev() {
    const step = (Math.PI * 2) / this.images.length;
    this.targetAngle -= step;
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    if (!this.loaded) { this.drawLoader(); return; }

    // Smooth angle
    this.angle = CarouselUtils.lerp(this.angle, this.targetAngle, 0.06);

    // Autoplay
    if (this.autoRotate && !this.hover) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) {
        this.autoplayTimer = 0;
        this.next();
      }
      this.targetAngle += this.autoSpeed;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    const cx = this.W / 2;
    const cy = this.H / 2 - 30;
    const count = this.images.length;
    const step = (Math.PI * 2) / count;

    // Sort by Z (back to front)
    const items = [];
    for (let i = 0; i < count; i++) {
      const a = this.angle + i * step;
      const x = Math.sin(a) * this.radius;
      const z = Math.cos(a);
      items.push({ i, x, z, a });
    }
    items.sort((a, b) => a.z - b.z);

    // Draw reflection floor
    this.drawFloor(ctx, cx, cy, items);

    // Draw images on cylinder
    items.forEach(({ i, x, z, a }) => {
      const scale = 0.5 + (z + 1) * 0.25; // 0.5 to 1.0
      const alpha = 0.3 + (z + 1) * 0.35; // 0.3 to 1.0
      const imgW = 180 * scale;
      const imgH = 240 * scale;
      const px = cx + x;
      const py = cy;

      // Skew based on angle
      const skew = Math.cos(a) * 0.3;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 20 * scale;
      ctx.shadowOffsetY = 10 * scale;

      // Rounded rect with skew
      ctx.translate(px, py);
      ctx.transform(1, 0, skew, 1, 0, 0);

      const r = 8 * scale;
      ctx.beginPath();
      ctx.moveTo(-imgW/2 + r, -imgH/2);
      ctx.lineTo(imgW/2 - r, -imgH/2);
      ctx.quadraticCurveTo(imgW/2, -imgH/2, imgW/2, -imgH/2 + r);
      ctx.lineTo(imgW/2, imgH/2 - r);
      ctx.quadraticCurveTo(imgW/2, imgH/2, imgW/2 - r, imgH/2);
      ctx.lineTo(-imgW/2 + r, imgH/2);
      ctx.quadraticCurveTo(-imgW/2, imgH/2, -imgW/2, imgH/2 - r);
      ctx.lineTo(-imgW/2, -imgH/2 + r);
      ctx.quadraticCurveTo(-imgW/2, -imgH/2, -imgW/2 + r, -imgH/2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(this.images[i], -imgW/2, -imgH/2, imgW, imgH);

      // Cyan edge for front-most
      if (z > 0.8) {
        ctx.strokeStyle = 'rgba(0,212,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    });

    // Center glow
    this.drawCenterGlow(ctx, cx, cy);

    // UI
    this.drawUI(ctx);
  }

  drawFloor(ctx, cx, cy, items) {
    // Draw reflections
    items.forEach(({ i, x, z, a }) => {
      if (z < 0) return; // only front reflections
      const scale = 0.5 + (z + 1) * 0.25;
      const alpha = (0.3 + (z + 1) * 0.35) * this.reflectionAlpha;
      const imgW = 180 * scale;
      const imgH = 240 * scale;
      const px = cx + x;
      const py = cy + imgH * 0.5 + 20;
      const skew = Math.cos(a) * 0.3;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(px, py);
      ctx.transform(1, 0, skew, 1, 0, 0);
      ctx.scale(1, -0.4); // squashed reflection

      const grad = ctx.createLinearGradient(0, -imgH/2, 0, imgH/2);
      grad.addColorStop(0, 'rgba(7,11,20,0)');
      grad.addColorStop(1, 'rgba(7,11,20,0.9)');

      ctx.drawImage(this.images[i], -imgW/2, -imgH/2, imgW, imgH);
      ctx.fillStyle = grad;
      ctx.fillRect(-imgW/2, -imgH/2, imgW, imgH);
      ctx.restore();
    });

    // Floor line
    ctx.beginPath();
    ctx.moveTo(0, cy + 120);
    ctx.lineTo(this.W, cy + 120);
    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawCenterGlow(ctx, cx, cy) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.radius * 1.2);
    grad.addColorStop(0, 'rgba(0,212,255,0.03)');
    grad.addColorStop(0.5, 'rgba(0,212,255,0.01)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  drawUI(ctx) {
    // Title
    const titles = ['Kostka brukowa', 'Elewacje', 'Dachy', 'Podjazdy', 'Domy', 'Detailing'];
    const idx = Math.round((-this.angle / ((Math.PI * 2) / this.images.length)) % this.images.length);
    const safeIdx = ((idx % this.images.length) + this.images.length) % this.images.length;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRZECIĄGNIJ MYSZKĄ ABY OBRACAĆ', this.W/2, this.H - 25);

    ctx.fillStyle = '#fff';
    ctx.font = '700 18px Inter, sans-serif';
    ctx.fillText(titles[safeIdx] || 'Realizacja', this.W/2, this.H - 50);

    ctx.fillStyle = 'rgba(0,212,255,0.7)';
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillText('BARTEKCLEAN', this.W/2, this.H - 72);

    // Drag hint
    if (!this.dragging && !this.hover) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(this.W/2, this.H - 100, 20, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '16px Inter';
      ctx.fillText('↔', this.W/2, this.H - 95);
    }
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W/2, cy = this.H/2;
    const t = performance.now()/1000;
    ctx.clearRect(0,0,this.W,this.H);

    // Rotating cylinder wireframe
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.lineWidth = 1;
    const r = 60;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t;
      const x1 = cx + Math.sin(a) * r;
      const y1 = cy - 40 + Math.cos(a) * r * 0.3;
      const x2 = cx + Math.sin(a) * r;
      const y2 = cy + 40 + Math.cos(a) * r * 0.3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.fillStyle = '#00d4ff';
    ctx.font = '700 13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie cylindra 3D...', cx, cy + 90);
  }
}
