/* ========== CAROUSEL 4: MAGAZINE SPLIT ========== */
class CarouselMagazine {
  constructor(selector, images) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.images = [];
    this.current = 0;
    this.nextIdx = 0;
    this.progress = 0;
    this.isAnimating = false;
    this.time = 0;
    this.hover = false;
    this.W = 0; this.H = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.data = [
      { title: 'Mycie kostki', subtitle: 'Odzyskaj pierwotny blask', accent: '#00d4ff' },
      { title: 'Elewacje', subtitle: 'Bezpieczne czyszczenie tynków', accent: '#00e5ff' },
      { title: 'Dachy', subtitle: 'Usuwanie mchu i porostów', accent: '#00c8ff' },
      { title: 'Podjazdy', subtitle: 'Profesjonalne mycie nawierzchni', accent: '#00b4ff' },
      { title: 'Impregnacja', subtitle: 'Długotrwała ochrona', accent: '#0099ff' },
      { title: 'Przemysł', subtitle: 'Czyszczenie hal i magazynów', accent: '#0088ff' }
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

    setInterval(() => { if (!this.hover && !this.isAnimating) this.next(); }, 8000);
  }

  next() {
    if (this.isAnimating) return;
    this.nextIdx = (this.current + 1) % this.images.length;
    this.isAnimating = true;
    this.progress = 0;
  }

  prev() {
    if (this.isAnimating) return;
    this.nextIdx = (this.current - 1 + this.images.length) % this.images.length;
    this.isAnimating = true;
    this.progress = 0;
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

    // Update animation
    if (this.isAnimating) {
      this.progress += 0.018;
      if (this.progress >= 1) {
        this.current = this.nextIdx;
        this.isAnimating = false;
        this.progress = 0;
      }
    }

    const t = this.easeInOutCubic(this.progress);
    const img = this.images[this.current];
    const nextImg = this.isAnimating ? this.images[this.nextIdx] : null;
    const info = this.data[this.current];

    // Split layout: image on right (60%), text on left (40%)
    const splitX = W * 0.42;

    // Background accent line
    ctx.save();
    ctx.strokeStyle = info.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(splitX, 40);
    ctx.lineTo(splitX, H - 40);
    ctx.stroke();
    ctx.restore();

    // Image area (right side)
    const imgX = splitX + 30;
    const imgW = W - imgX - 40;
    const aspect = img.width / img.height;
    let imgH = imgW / aspect;
    if (imgH > H * 0.75) { imgH = H * 0.75; }
    const imgY = (H - imgH) / 2;

    if (this.isAnimating) {
      // Slide transition
      const slideOffset = t * (W * 0.3);

      // Current image sliding out
      ctx.save();
      ctx.beginPath();
      this.roundRect(ctx, imgX - slideOffset, imgY, imgW, imgH, 16);
      ctx.clip();
      ctx.globalAlpha = 1 - t;
      ctx.drawImage(img, imgX - slideOffset, imgY, imgW, imgH);
      ctx.restore();

      // Next image sliding in
      ctx.save();
      ctx.beginPath();
      this.roundRect(ctx, imgX + (W * 0.3) - slideOffset, imgY, imgW, imgH, 16);
      ctx.clip();
      ctx.globalAlpha = t;
      ctx.drawImage(nextImg, imgX + (W * 0.3) - slideOffset, imgY, imgW, imgH);
      ctx.restore();
    } else {
      // Static image with subtle parallax
      const parallaxX = this.hover ? (this.time % 1 - 0.5) * 10 : 0;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      this.roundRect(ctx, imgX, imgY, imgW, imgH, 16);
      ctx.clip();
      ctx.drawImage(img, imgX + parallaxX, imgY, imgW, imgH);

      // Cyan edge on hover
      if (this.hover) {
        ctx.strokeStyle = 'rgba(0,212,255,0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Text area (left side)
    const textX = 50;
    const textY = H / 2;

    // Number
    ctx.save();
    ctx.fillStyle = 'rgba(0,212,255,0.08)';
    ctx.font = '900 80px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(this.current + 1).padStart(2, '0'), textX, textY - 60);
    ctx.restore();

    // Accent line
    ctx.save();
    ctx.strokeStyle = info.accent;
    ctx.lineWidth = 3;
    ctx.shadowColor = info.accent;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(textX, textY - 20);
    ctx.lineTo(textX + 40, textY - 20);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Title
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '800 36px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';

    if (this.isAnimating) {
      // Title morph
      ctx.globalAlpha = 1 - t;
      ctx.fillText(info.title, textX, textY + 20);
      ctx.globalAlpha = t;
      ctx.fillText(this.data[this.nextIdx].title, textX, textY + 20);
    } else {
      ctx.fillText(info.title, textX, textY + 20);
    }
    ctx.restore();

    // Subtitle
    ctx.save();
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.font = '400 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';

    if (this.isAnimating) {
      ctx.globalAlpha = 1 - t;
      ctx.fillText(info.subtitle, textX, textY + 55);
      ctx.globalAlpha = t;
      ctx.fillText(this.data[this.nextIdx].subtitle, textX, textY + 55);
    } else {
      ctx.fillText(info.subtitle, textX, textY + 55);
    }
    ctx.restore();

    // Progress dots
    this.drawDots(ctx, W, H);

    // Click hint
    if (!this.hover && !this.isAnimating) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.textAlign = 'left';
      ctx.font = '500 11px Inter, system-ui, sans-serif';
      ctx.fillText('KLIKNIJ ABY PRZEJŚĆ DALEJ →', textX, H - 40);
      ctx.restore();
    }
  }

  drawDots(ctx, W, H) {
    const count = this.images.length;
    const gap = 12;
    const dotSize = 5;
    const totalW = count * gap;
    const startX = 50;
    const y = H - 50;

    for (let i = 0; i < count; i++) {
      const isActive = i === this.current;
      ctx.beginPath();
      ctx.arc(startX + i * gap, y, isActive ? dotSize : dotSize * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#00d4ff' : 'rgba(255,255,255,0.15)';
      if (isActive) {
        ctx.shadowColor = 'rgba(0,212,255,0.4)';
        ctx.shadowBlur = 8;
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
