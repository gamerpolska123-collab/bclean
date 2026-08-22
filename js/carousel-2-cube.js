/* ========== CAROUSEL 2: 3D CUBE ========== */
class Carousel3DCube {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.targetRotation = 0;
    this.rotation = 0;
    this.autoplayTimer = 0;
    this.autoplayInterval = 5500;
    this.lastTime = performance.now();
    this.hover = false;
    this.dragging = false;
    this.dragStart = 0;
    this.dragRotation = 0;
    this.titles = ['Kostka brukowa','Elewacja','Dach','Podjazd','Elewacja 2','Kostka 2'];

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.loaded = true;
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => { this.W = w; this.H = h; });
    AnimationLoop.add(() => this.render());
  }

  bindEvents() {
    const c = this.setup.canvas;
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => { this.hover = false; this.dragging = false; });
    c.addEventListener('mousedown', e => {
      this.dragging = true;
      this.dragStart = e.clientX;
      this.dragRotation = this.rotation;
    });
    window.addEventListener('mousemove', e => {
      if (!this.dragging) return;
      const dx = e.clientX - this.dragStart;
      this.rotation = this.dragRotation + dx * 0.004;
      this.targetRotation = this.rotation;
    });
    window.addEventListener('mouseup', () => {
      if (!this.dragging) return;
      this.dragging = false;
      // Snap to nearest face
      const faceAngle = Math.PI * 2 / this.images.length;
      const nearest = Math.round(this.rotation / faceAngle);
      this.targetRotation = nearest * faceAngle;
      this.current = ((nearest % this.images.length) + this.images.length) % this.images.length;
    });
    c.addEventListener('touchstart', e => {
      this.dragging = true;
      this.dragStart = e.touches[0].clientX;
      this.dragRotation = this.rotation;
    }, {passive:true});
    c.addEventListener('touchmove', e => {
      if (!this.dragging) return;
      const dx = e.touches[0].clientX - this.dragStart;
      this.rotation = this.dragRotation + dx * 0.004;
      this.targetRotation = this.rotation;
    }, {passive:true});
    c.addEventListener('touchend', () => {
      if (!this.dragging) return;
      this.dragging = false;
      const faceAngle = Math.PI * 2 / this.images.length;
      const nearest = Math.round(this.rotation / faceAngle);
      this.targetRotation = nearest * faceAngle;
      this.current = ((nearest % this.images.length) + this.images.length) % this.images.length;
    }, {passive:true});
    c.addEventListener('click', e => {
      if (Math.abs(this.rotation - this.dragRotation) > 0.05) return;
      const rect = c.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x > this.W * 0.6) this.next();
      else if (x < this.W * 0.4) this.prev();
    });
  }

  next() {
    const faceAngle = Math.PI * 2 / this.images.length;
    this.targetRotation += faceAngle;
    this.current = (this.current + 1) % this.images.length;
  }
  prev() {
    const faceAngle = Math.PI * 2 / this.images.length;
    this.targetRotation -= faceAngle;
    this.current = (this.current - 1 + this.images.length) % this.images.length;
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;
    const ctx = this.ctx;

    if (!this.loaded) { this.drawLoader(); return; }

    // Autoplay
    if (!this.hover && !this.dragging) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) { this.autoplayTimer = 0; this.next(); }
    }

    // Smooth rotation
    this.rotation += (this.targetRotation - this.rotation) * 0.06;

    ctx.clearRect(0, 0, this.W, this.H);

    const cx = this.W / 2;
    const cy = this.H / 2 - 20;
    const radius = Math.min(this.W, this.H) * 0.38;
    const faceAngle = Math.PI * 2 / this.images.length;

    // Draw reflection floor
    this.drawFloor(cx, cy + radius * 0.8, radius);

    // Draw faces back to front
    const faces = [];
    for (let i = 0; i < this.images.length; i++) {
      const angle = this.rotation + i * faceAngle;
      const z = Math.cos(angle);
      faces.push({ i, angle, z });
    }
    faces.sort((a, b) => a.z - b.z);

    faces.forEach(({ i, angle }) => {
      const img = this.images[i];
      const z = Math.cos(angle);
      const xOffset = Math.sin(angle) * radius * 1.2;
      const scale = 0.6 + (z + 1) * 0.25;
      const alpha = 0.4 + (z + 1) * 0.3;
      const isActive = i === this.current;
      this.drawFace(img, cx + xOffset, cy, scale, alpha, isActive, angle);
    });

    // Title
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.min(22, this.W * 0.028)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(this.titles[this.current] || '', cx, this.H - 55);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${Math.min(13, this.W * 0.018)}px Inter, sans-serif`;
    ctx.fillText('Przeciągnij lub kliknij', cx, this.H - 32);
    ctx.restore();

    // Dots
    this.drawDots();
  }

  drawFace(img, x, y, scale, alpha, isActive, angle) {
    const ctx = this.ctx;
    const size = Math.min(this.W, this.H) * 0.35 * scale;
    const aspect = img.width / img.height;
    const w = size * Math.min(aspect, 1.5);
    const h = size / Math.max(aspect, 0.67);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Shadow
    ctx.shadowColor = isActive ? 'rgba(0,212,255,0.25)' : 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = isActive ? 40 : 25;
    ctx.shadowOffsetY = isActive ? 15 : 10;

    // Rounded rect
    const r = 10;
    ctx.beginPath();
    ctx.moveTo(x - w/2 + r, y - h/2);
    ctx.lineTo(x + w/2 - r, y - h/2);
    ctx.quadraticCurveTo(x + w/2, y - h/2, x + w/2, y - h/2 + r);
    ctx.lineTo(x + w/2, y + h/2 - r);
    ctx.quadraticCurveTo(x + w/2, y + h/2, x + w/2 - r, y + h/2);
    ctx.lineTo(x - w/2 + r, y + h/2);
    ctx.quadraticCurveTo(x - w/2, y + h/2, x - w/2, y + h/2 - r);
    ctx.lineTo(x - w/2, y - h/2 + r);
    ctx.quadraticCurveTo(x - w/2, y - h/2, x - w/2 + r, y - h/2);
    ctx.closePath();
    ctx.clip();

    // Slight 3D perspective
    const perspective = Math.sin(angle) * 0.15;
    ctx.transform(1, 0, perspective, 1, 0, 0);

    ctx.drawImage(img, x - w/2, y - h/2, w, h);

    // Active border glow
    if (isActive) {
      ctx.strokeStyle = 'rgba(0,212,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawFloor(cx, cy, radius) {
    const ctx = this.ctx;
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
    grad.addColorStop(0, 'rgba(0,212,255,0.06)');
    grad.addColorStop(0.5, 'rgba(0,212,255,0.02)');
    grad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.4, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawDots() {
    const ctx = this.ctx;
    const count = this.images.length;
    const gap = 16;
    const totalW = (count - 1) * gap;
    const startX = (this.W - totalW) / 2;
    const y = this.H - 18;
    for (let i = 0; i < count; i++) {
      const active = i === this.current;
      ctx.beginPath();
      ctx.arc(startX + i * gap, y, active ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#00d4ff' : 'rgba(255,255,255,0.18)';
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
    ctx.arc(cx, cy, 28, t*2.5, t*2.5 + Math.PI*1.4);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie kostki 3D...', cx, cy + 52);
  }
}
