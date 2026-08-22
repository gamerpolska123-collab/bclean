/* ========== CAROUSEL 3: 3D CYLINDER ========== */
class CarouselCylinder {
  constructor(selector, images) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.images = [];
    this.angle = 0;
    this.targetAngle = 0;
    this.dragging = false;
    this.lastX = 0;
    this.autoRotate = true;
    this.hover = false;
    this.W = 0;
    this.H = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.titles = [
      'Mycie kostki',
      'Elewacje',
      'Dachy',
      'Podjazdy',
      'Impregnacja',
      'Przemysl'
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

    parent.addEventListener('mousedown', e => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.autoRotate = false;
    });
    window.addEventListener('mouseup', () => {
      this.dragging = false;
      this.autoRotate = true;
    });
    parent.addEventListener('mousemove', e => {
      if (this.dragging) {
        const dx = e.clientX - this.lastX;
        this.targetAngle += dx * 0.008;
        this.lastX = e.clientX;
      }
    });
    parent.addEventListener('mouseenter', () => this.hover = true);
    parent.addEventListener('mouseleave', () => {
      this.hover = false;
      this.dragging = false;
    });

    parent.addEventListener('touchstart', e => {
      this.dragging = true;
      this.lastX = e.touches[0].clientX;
      this.autoRotate = false;
    }, { passive: true });
    parent.addEventListener('touchmove', e => {
      if (this.dragging) {
        const dx = e.touches[0].clientX - this.lastX;
        this.targetAngle += dx * 0.008;
        this.lastX = e.touches[0].clientX;
      }
    }, { passive: true });
    parent.addEventListener('touchend', () => {
      this.dragging = false;
      this.autoRotate = true;
    }, { passive: true });

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.resize(), 150);
    });
  }

  loop() {
    this.angle += (this.targetAngle - this.angle) * 0.08;
    if (this.autoRotate && !this.hover) {
      this.targetAngle += 0.003;
    }
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  render() {
    if (!this.images.length) return;
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;
    const cx = W / 2;
    const cy = H / 2 - 30;
    const radius = Math.min(W, H) * 0.38;
    const count = this.images.length;
    const step = (Math.PI * 2) / count;

    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, W, H);

    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
    bgGrad.addColorStop(0, 'rgba(0,212,255,0.04)');
    bgGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const items = [];
    for (let i = 0; i < count; i++) {
      const a = this.angle + i * step;
      const z = Math.cos(a);
      items.push({ i, a, z });
    }
    items.sort((a, b) => a.z - b.z);

    this.drawReflections(ctx, cx, cy, radius, items);

    items.forEach(({ i, a, z }) => {
      const x = cx + Math.sin(a) * radius;
      const scale = 0.55 + (z + 1) * 0.22;
      const alpha = 0.35 + (z + 1) * 0.325;
      const imgW = 160 * scale;
      const imgH = 220 * scale;
      const skew = Math.cos(a) * 0.25;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 25 * scale;
      ctx.shadowOffsetY = 15 * scale;

      ctx.translate(x, cy);
      ctx.transform(1, 0, skew, 1, 0, 0);

      const r = 8 * scale;
      ctx.beginPath();
      ctx.moveTo(-imgW / 2 + r, -imgH / 2);
      ctx.lineTo(imgW / 2 - r, -imgH / 2);
      ctx.quadraticCurveTo(imgW / 2, -imgH / 2, imgW / 2, -imgH / 2 + r);
      ctx.lineTo(imgW / 2, imgH / 2 - r);
      ctx.quadraticCurveTo(imgW / 2, imgH / 2, imgW / 2 - r, imgH / 2);
      ctx.lineTo(-imgW / 2 + r, imgH / 2);
      ctx.quadraticCurveTo(-imgW / 2, imgH / 2, -imgW / 2, imgH / 2 - r);
      ctx.lineTo(-imgW / 2, -imgH / 2 + r);
      ctx.quadraticCurveTo(-imgW / 2, -imgH / 2, -imgW / 2 + r, -imgH / 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(this.images[i], -imgW / 2, -imgH / 2, imgW, imgH);

      if (z > 0.7) {
        ctx.strokeStyle = 'rgba(0,212,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    });

    this.drawCenterInfo(ctx, W, H);
  }

  drawReflections(ctx, cx, cy, radius, items) {
    items.forEach(({ i, a, z }) => {
      if (z < 0) return;
      const x = cx + Math.sin(a) * radius;
      const scale = 0.55 + (z + 1) * 0.22;
      const alpha = (0.35 + (z + 1) * 0.325) * 0.15;
      const imgW = 160 * scale;
      const imgH = 220 * scale;
      const skew = Math.cos(a) * 0.25;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, cy + imgH * 0.5 + 25);
      ctx.transform(1, 0, skew, 1, 0, 0);
      ctx.scale(1, -0.35);

      const grad = ctx.createLinearGradient(0, -imgH / 2, 0, imgH / 2);
      grad.addColorStop(0, 'rgba(7,11,20,0)');
      grad.addColorStop(1, 'rgba(7,11,20,0.9)');

      ctx.drawImage(this.images[i], -imgW / 2, -imgH / 2, imgW, imgH);
      ctx.fillStyle = grad;
      ctx.fillRect(-imgW / 2, -imgH / 2, imgW, imgH);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.moveTo(0, cy + 120);
    ctx.lineTo(this.W, cy + 120);
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawCenterInfo(ctx, W, H) {
    const count = this.images.length;
    const step = (Math.PI * 2) / count;
    let frontIdx = 0;
    let maxZ = -2;
    for (let i = 0; i < count; i++) {
      const z = Math.cos(this.angle + i * step);
      if (z > maxZ) {
        maxZ = z;
        frontIdx = i;
      }
    }

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRZECIAGNIJ ABY OBRACAC', W / 2, H - 25);

    ctx.fillStyle = '#fff';
    ctx.font = '700 20px Inter, system-ui, sans-serif';
    ctx.fillText(this.titles[frontIdx], W / 2, H - 50);

    ctx.fillStyle = 'rgba(0,212,255,0.7)';
    ctx.font = '600 10px Inter, system-ui, sans-serif';
    ctx.fillText('BARTEKCLEAN', W / 2, H - 72);

    if (!this.hover) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W / 2, H - 95, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px Inter';
      ctx.fillText('<>', W / 2, H - 90);
    }
    ctx.restore();
  }
}
