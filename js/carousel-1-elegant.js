/* ========== CAROUSEL 1: ELEGANT FADE ========== */
class CarouselElegantFade {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.nextIndex = 0;
    this.progress = 0;
    this.transitioning = false;
    this.autoplayTimer = 0;
    this.autoplayInterval = 5000;
    this.lastTime = performance.now();
    this.hover = false;
    this.mouse = { x: this.W/2, y: this.H/2 };
    this.parallax = { x: 0, y: 0 };
    this.titles = ['Mycie kostki brukowej','Czyszczenie elewacji','Mycie dachów','Renowacja podjazdów','Czyszczenie elewacji 2','Mycie kostki 2'];
    this.subtitles = ['Przed i po – efekt wow','Bez uszkodzeń powierzchni','Bezpiecznie z ziemi','Jak nowy po latach','Profesjonalny sprzęt','Dbałość o szczegóły'];

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
    c.addEventListener('mousemove', e => {
      const rect = c.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => { this.hover = false; this.parallax.x *= 0.5; this.parallax.y *= 0.5; });
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

  next() { this.goTo((this.current + 1) % this.images.length); }
  prev() { this.goTo((this.current - 1 + this.images.length) % this.images.length); }
  goTo(index) {
    if (this.transitioning || index === this.current) return;
    this.nextIndex = index;
    this.transitioning = true;
    this.progress = 0;
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;
    const ctx = this.ctx;

    if (!this.loaded) { this.drawLoader(); return; }

    // Autoplay
    if (!this.hover && !this.transitioning) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) { this.autoplayTimer = 0; this.next(); }
    }

    // Parallax smooth
    const targetPx = (this.mouse.x - this.W/2) * 0.04;
    const targetPy = (this.mouse.y - this.H/2) * 0.04;
    this.parallax.x += (targetPx - this.parallax.x) * 0.08;
    this.parallax.y += (targetPy - this.parallax.y) * 0.08;

    // Transition
    if (this.transitioning) {
      this.progress += dt / 900;
      if (this.progress >= 1) {
        this.current = this.nextIndex;
        this.transitioning = false;
        this.progress = 0;
      }
    }

    ctx.clearRect(0, 0, this.W, this.H);

    const t = CarouselUtils.ease.inOutCubic(this.transitioning ? this.progress : 0);
    const currImg = this.images[this.current];
    const nextImg = this.images[this.nextIndex];

    // Draw current image with subtle zoom
    const zoom = 1 + t * 0.06;
    const pw = this.parallax.x;
    const ph = this.parallax.y;
    this.drawImage(currImg, pw, ph, zoom, 1 - t);

    // Draw next image
    if (this.transitioning) {
      const zoomNext = 1.06 - t * 0.06;
      this.drawImage(nextImg, pw, ph, zoomNext, t);
    }

    // Gradient overlay
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, 'rgba(7,11,20,0)');
    grad.addColorStop(0.55, 'rgba(7,11,20,0.1)');
    grad.addColorStop(0.85, 'rgba(7,11,20,0.65)');
    grad.addColorStop(1, 'rgba(7,11,20,0.92)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);

    // Border glow
    ctx.save();
    ctx.strokeStyle = 'rgba(0,212,255,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, this.W - 1, this.H - 1);
    ctx.restore();

    // Text
    this.drawText(t);

    // Progress bar
    this.drawProgressBar();

    // Dots
    this.drawDots();

    // Arrows
    this.drawArrows();
  }

  drawImage(img, px, py, zoom, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    const scale = Math.max(this.W / img.width, this.H / img.height) * zoom;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (this.W - w) / 2 + px;
    const y = (this.H - h) / 2 + py;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  drawText(t) {
    const ctx = this.ctx;
    const activeIndex = this.transitioning ? (t > 0.5 ? this.nextIndex : this.current) : this.current;
    const textAlpha = this.transitioning ? (t > 0.5 ? (t - 0.5) * 2 : 1 - t * 2) : 1;
    const slideUp = this.transitioning ? (1 - textAlpha) * 20 : 0;

    ctx.save();
    ctx.globalAlpha = textAlpha;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.min(32, this.W * 0.04)}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(this.titles[activeIndex] || '', 40, this.H - 85 + slideUp);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${Math.min(16, this.W * 0.022)}px Inter, sans-serif`;
    ctx.fillText(this.subtitles[activeIndex] || '', 40, this.H - 55 + slideUp);

    // Counter
    ctx.fillStyle = 'rgba(0,212,255,0.6)';
    ctx.font = `600 ${Math.min(14, this.W * 0.018)}px Inter, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`${activeIndex + 1} / ${this.images.length}`, this.W - 40, this.H - 55 + slideUp);

    ctx.restore();
  }

  drawProgressBar() {
    const ctx = this.ctx;
    const barW = this.W * 0.3;
    const x = (this.W - barW) / 2;
    const y = 12;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, barW, 3);
    const prog = this.hover ? 0 : Math.min(this.autoplayTimer / this.autoplayInterval, 1);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(x, y, barW * prog, 3);
  }

  drawDots() {
    const ctx = this.ctx;
    const count = this.images.length;
    const gap = 14;
    const r = 4;
    const totalW = (count - 1) * gap;
    const startX = (this.W - totalW) / 2;
    const y = this.H - 22;
    for (let i = 0; i < count; i++) {
      const active = i === (this.transitioning && this.progress > 0.5 ? this.nextIndex : this.current);
      ctx.beginPath();
      ctx.arc(startX + i * gap, y, active ? r + 1.5 : r, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#00d4ff' : 'rgba(255,255,255,0.2)';
      ctx.fill();
      if (active) {
        ctx.beginPath();
        ctx.arc(startX + i * gap, y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,212,255,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  drawArrows() {
    const ctx = this.ctx;
    const y = this.H / 2;
    const size = 18;
    // Left
    ctx.save();
    ctx.globalAlpha = this.hover ? 0.4 : 0.15;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30 + size, y - size);
    ctx.lineTo(30, y);
    ctx.lineTo(30 + size, y + size);
    ctx.stroke();
    // Right
    ctx.beginPath();
    ctx.moveTo(this.W - 30 - size, y - size);
    ctx.lineTo(this.W - 30, y);
    ctx.lineTo(this.W - 30 - size, y + size);
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
    ctx.arc(cx, cy, 30, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 30, t*3, t*3 + Math.PI*1.3);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie galerii...', cx, cy + 55);
  }
}
