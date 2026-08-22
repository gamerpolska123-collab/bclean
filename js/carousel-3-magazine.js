/* ========== CAROUSEL 3: SPLIT MAGAZINE ========== */
class CarouselSplitMagazine {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || 800;
    this.H = this.setup.height || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.progress = 0;
    this.transitioning = false;
    this.direction = 1;
    this.autoplayTimer = 0;
    this.autoplayInterval = 6000;
    this.lastTime = performance.now();
    this.hover = false;
    this.titles = ['Mycie kostki brukowej','Czyszczenie elewacji','Mycie dachów','Renowacja podjazdów','Czyszczenie elewacji 2','Mycie kostki 2'];
    this.descriptions = [
      'Usuwamy glony, mchy i zabrudzenia z kostki. Efekt jak po zakupie.',
      'Bezpieczne czyszczenie elewacji bez uszkodzenia tynku.',
      'Profesjonalne mycie dachów z zabezpieczeniem okien.',
      'Podjazd jak nowy – usuwamy olej, rdzę i osady.',
      'Elewacja po remoncie? Wyczyścimy resztki farby i zaprawy.',
      'Detale mają znaczenie. Czyścimy nawet trudno dostępne miejsca.'
    ];

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
    c.addEventListener('mouseleave', () => this.hover = false);
    c.addEventListener('click', e => {
      const rect = c.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < this.W * 0.4) this.prev(); else this.next();
    });
    let touchStartX = 0;
    c.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
    c.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    }, {passive:true});
  }

  next() { this.direction = 1; this.goTo((this.current + 1) % this.images.length); }
  prev() { this.direction = -1; this.goTo((this.current - 1 + this.images.length) % this.images.length); }
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

    // Transition
    if (this.transitioning) {
      this.progress += dt / 800;
      if (this.progress >= 1) {
        this.current = this.nextIndex;
        this.transitioning = false;
        this.progress = 0;
      }
    }

    ctx.clearRect(0, 0, this.W, this.H);

    const t = CarouselUtils.ease.outExpo(this.transitioning ? this.progress : 0);
    const splitX = this.W * 0.42;

    // Background
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    // Left panel (text side)
    this.drawTextPanel(splitX, t);

    // Right panel (image side)
    this.drawImagePanel(splitX, t);

    // Vertical separator line with glow
    ctx.save();
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX, 30);
    ctx.lineTo(splitX, this.H - 30);
    ctx.stroke();
    // Glow
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(splitX, 30);
    ctx.lineTo(splitX, this.H - 30);
    ctx.stroke();
    ctx.restore();

    // Dots
    this.drawDots();

    // Big slide number
    this.drawBigNumber();
  }

  drawTextPanel(splitX, t) {
    const ctx = this.ctx;
    const pad = Math.min(40, this.W * 0.05);
    const textX = pad;

    // Slide animation
    const slideOffset = this.transitioning ? (1 - t) * 40 * this.direction : 0;
    const textAlpha = this.transitioning ? t : 1;

    ctx.save();
    ctx.globalAlpha = textAlpha;

    // Label
    ctx.fillStyle = 'rgba(0,212,255,0.7)';
    ctx.font = `600 ${Math.min(11, this.W * 0.014)}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('REALIZACJA', textX, 70 + slideOffset);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${Math.min(28, this.W * 0.035)}px Inter, sans-serif`;
    const title = this.titles[this.current] || '';
    const words = title.split(' ');
    let lineY = 110 + slideOffset;
    let line = '';
    const maxWidth = splitX - pad * 2;
    for (let w of words) {
      const test = line + (line ? ' ' : '') + w;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, textX, lineY);
        line = w;
        lineY += 36;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, textX, lineY);

    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${Math.min(14, this.W * 0.018)}px Inter, sans-serif`;
    const desc = this.descriptions[this.current] || '';
    const descWords = desc.split(' ');
    line = '';
    lineY += 30;
    for (let w of descWords) {
      const test = line + (line ? ' ' : '') + w;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, textX, lineY);
        line = w;
        lineY += 22;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, textX, lineY);

    // CTA hint
    ctx.fillStyle = 'rgba(0,212,255,0.5)';
    ctx.font = `500 ${Math.min(12, this.W * 0.015)}px Inter, sans-serif`;
    ctx.fillText('Kliknij po więcej →', textX, this.H - 50);

    ctx.restore();
  }

  drawImagePanel(splitX, t) {
    const ctx = this.ctx;
    const img = this.images[this.current];
    const imgX = splitX + 20;
    const imgW = this.W - imgX - 20;
    const imgH = this.H - 60;
    const imgY = 30;

    // Slide animation
    const slideOffset = this.transitioning ? (1 - t) * 60 * -this.direction : 0;

    ctx.save();
    ctx.globalAlpha = this.transitioning ? 0.3 + t * 0.7 : 1;

    // Rounded rect clip
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(imgX + r + slideOffset, imgY);
    ctx.lineTo(imgX + imgW - r + slideOffset, imgY);
    ctx.quadraticCurveTo(imgX + imgW + slideOffset, imgY, imgX + imgW + slideOffset, imgY + r);
    ctx.lineTo(imgX + imgW + slideOffset, imgY + imgH - r);
    ctx.quadraticCurveTo(imgX + imgW + slideOffset, imgY + imgH, imgX + imgW - r + slideOffset, imgY + imgH);
    ctx.lineTo(imgX + r + slideOffset, imgY + imgH);
    ctx.quadraticCurveTo(imgX + slideOffset, imgY + imgH, imgX + slideOffset, imgY + imgH - r);
    ctx.lineTo(imgX + slideOffset, imgY + r);
    ctx.quadraticCurveTo(imgX + slideOffset, imgY, imgX + r + slideOffset, imgY);
    ctx.closePath();
    ctx.clip();

    // Draw image cover
    const scale = Math.max(imgW / img.width, imgH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = imgX + slideOffset + (imgW - dw) / 2;
    const dy = imgY + (imgH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    // Subtle gradient overlay on image
    const grad = ctx.createLinearGradient(imgX + slideOffset, imgY, imgX + slideOffset, imgY + imgH * 0.4);
    grad.addColorStop(0, 'rgba(7,11,20,0.3)');
    grad.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(imgX + slideOffset, imgY, imgW, imgH);

    // Border
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  drawBigNumber() {
    const ctx = this.ctx;
    const num = String(this.current + 1).padStart(2, '0');
    ctx.save();
    ctx.fillStyle = 'rgba(0,212,255,0.04)';
    ctx.font = `900 ${Math.min(140, this.W * 0.18)}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(num, 20, this.H - 30);
    ctx.restore();
  }

  drawDots() {
    const ctx = this.ctx;
    const count = this.images.length;
    const gap = 14;
    const totalW = (count - 1) * gap;
    const startX = (this.W - totalW) / 2;
    const y = this.H - 20;
    for (let i = 0; i < count; i++) {
      const active = i === this.current;
      ctx.beginPath();
      ctx.arc(startX + i * gap, y, active ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#00d4ff' : 'rgba(255,255,255,0.15)';
      ctx.fill();
      if (active) {
        ctx.beginPath();
        ctx.arc(startX + i * gap, y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,212,255,0.15)';
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
    ctx.arc(cx, cy, 26, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 26, t*3, t*3 + Math.PI*1.5);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie magazynu...', cx, cy + 50);
  }
}
