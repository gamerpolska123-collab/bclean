/* ========== CANVAS RING SEGMENT CAROUSEL v3 ========== */
class CarouselRing {
  constructor(selector, images) {
    this.setup = CarouselUtils.setupCanvas(selector);
    if (!this.setup) return;
    this.ctx = this.setup.ctx;
    this.W = this.setup.width || window.innerWidth || 800;
    this.H = this.setup.height || (this.W * 0.625) || 560;
    this.images = [];
    this.loaded = false;
    this.current = 0;
    this.nextIndex = 0;
    this.bgTransition = 0;
    this.isTransitioning = false;
    this.autoplayTimer = 0;
    this.autoplayInterval = 6000;
    this.lastTime = performance.now();
    this.hover = false;

    this.textAlpha = 0;
    this.textY = 25;
    this.textPhase = 'in';
    this.textTimer = 0;

    this.ringRotation = 0;
    this.targetRingRotation = 0;
    this.ringVel = 0;

    this.titles = [
      'Mycie kostki brukowej',
      'Czyszczenie elewacji',
      'Mycie dachów',
      'Podjazdy i tarasy',
      'Elewacja po remoncie',
      'Odkurzanie kostki'
    ];

    CarouselUtils.preloadImages(images).then(imgs => {
      this.images = imgs;
      this.loaded = true;
      this.textAlpha = 1;
      this.textY = 0;
    });

    this.bindEvents();
    CarouselUtils.onResize(this.setup.canvas, (w, h) => {
      this.W = w || window.innerWidth || 800; this.H = h || (this.W * 0.625) || 560;
    });
    AnimationLoop.add(() => this.render());
  }

  bindEvents() {
    const c = this.setup.canvas;
    c.addEventListener('mouseenter', () => this.hover = true);
    c.addEventListener('mouseleave', () => this.hover = false);
    c.addEventListener('click', () => this.next());
    c.addEventListener('wheel', e => {
      e.preventDefault();
      e.deltaY > 0 ? this.next() : this.prev();
    }, { passive: false });
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
    if (this.isTransitioning || index === this.current) return;
    this.nextIndex = index;
    this.isTransitioning = true;
    this.bgTransition = 0;
    this.textPhase = 'out';
    this.textTimer = 0;
    const seg = (Math.PI * 2) / this.images.length;
    this.targetRingRotation = -this.nextIndex * seg;
  }

  render() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    if (!this.loaded) { this.drawLoader(); return; }

    if (!this.hover && !this.isTransitioning) {
      this.autoplayTimer += dt;
      if (this.autoplayTimer > this.autoplayInterval) {
        this.autoplayTimer = 0;
        this.next();
      }
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Update background transition
    if (this.isTransitioning) {
      this.bgTransition += dt / 900;
      if (this.bgTransition >= 1) {
        this.bgTransition = 1;
        this.current = this.nextIndex;
        this.isTransitioning = false;
        this.textPhase = 'in';
        this.textTimer = 0;
        this.autoplayTimer = 0;
      }
    }

    // Update ring rotation (spring)
    const rDiff = this.targetRingRotation - this.ringRotation;
    if (Math.abs(rDiff) > 0.0003) {
      this.ringVel += rDiff * 0.003;
      this.ringVel *= 0.90;
      this.ringRotation += this.ringVel;
    } else {
      this.ringRotation = this.targetRingRotation;
      this.ringVel = 0;
    }

    // 1. Draw background images (crossfade)
    this.drawBackground();

    // 2. Dark overlay for text readability
    ctx.fillStyle = 'rgba(7,11,20,0.45)';
    ctx.fillRect(0, 0, this.W, this.H);

    // 3. Bottom vignette for ring blend
    const vig = ctx.createLinearGradient(0, this.H * 0.5, 0, this.H);
    vig.addColorStop(0, 'rgba(7,11,20,0)');
    vig.addColorStop(0.6, 'rgba(7,11,20,0.3)');
    vig.addColorStop(1, 'rgba(7,11,20,0.85)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.W, this.H);

    // 4. Draw bottom ring segments
    this.drawRingSegments();

    // 5. Text overlay
    this.updateText(dt);
    this.drawText();

    // 6. Top progress bar
    if (!this.hover && !this.isTransitioning) {
      const prog = this.autoplayTimer / this.autoplayInterval;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(this.W * 0.25, 16, this.W * 0.5, 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fillRect(this.W * 0.25, 16, this.W * 0.5 * prog, 2);
    }
  }

  drawBackground() {
    const ctx = this.ctx;
    const imgCur = this.images[this.current];
    if (!imgCur || !imgCur.width) return;

    // Current image
    this.drawCoverImage(imgCur, 1);

    // Next image with crossfade
    if (this.isTransitioning) {
      const imgNext = this.images[this.nextIndex];
      if (imgNext && imgNext.width) {
        ctx.save();
        ctx.globalAlpha = CarouselUtils.ease.inOutCubic(this.bgTransition);
        this.drawCoverImage(imgNext, 1);
        ctx.restore();
      }
    }
  }

  drawCoverImage(img, alpha) {
    const ctx = this.ctx;
    const imgAspect = img.width / img.height;
    const canvasAspect = this.W / this.H;
    let dw, dh;
    if (imgAspect > canvasAspect) {
      dh = this.H;
      dw = dh * imgAspect;
    } else {
      dw = this.W;
      dh = dw / imgAspect;
    }
    const dx = (this.W - dw) / 2;
    const dy = (this.H - dh) / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  drawRingSegments() {
    const ctx = this.ctx;
    const cx = this.W / 2;
    const cy = this.H + 150; // Center below canvas so only top arc is visible
    const minDim = Math.min(this.W, this.H);
    const innerR = minDim * 0.32;
    const outerR = minDim * 0.58;
    const segAngle = (Math.PI * 2) / this.images.length;
    const gap = 0.012;

    // Only draw the visible portion (top arc of the ring)
    // Clip to bottom area of canvas
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.H * 0.55, this.W, this.H * 0.45);
    ctx.clip();

    for (let i = 0; i < this.images.length; i++) {
      const img = this.images[i];
      if (!img || !img.width) continue;

      const startAngle = this.ringRotation + i * segAngle - Math.PI / 2 - segAngle / 2;
      const endAngle = startAngle + segAngle - gap;
      const midAngle = (startAngle + endAngle) / 2;

      // Active: segment whose center is at top of ring (angle = -PI/2 or 3PI/2)
      let normMid = ((midAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const isActive = Math.abs(normMid - Math.PI * 1.5) < segAngle / 2 ||
                       Math.abs(normMid + Math.PI / 2) < segAngle / 2;

      ctx.save();

      // Segment clip
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.clip();

      // Draw image in segment - rotated to match segment orientation
      const midR = (innerR + outerR) / 2;
      const segCx = cx + Math.cos(midAngle) * midR;
      const segCy = cy + Math.sin(midAngle) * midR;

      ctx.translate(segCx, segCy);
      ctx.rotate(midAngle + Math.PI / 2);

      const coverH = (outerR - innerR) * 1.5;
      const coverW = coverH * (img.width / img.height);
      let scale = isActive ? 1.05 : 1;
      if (isActive) scale += Math.sin(performance.now() * 0.001) * 0.01;

      ctx.drawImage(img, -coverW * scale / 2, -coverH * scale / 2, coverW * scale, coverH * scale);

      // Overlay
      if (!isActive) {
        ctx.fillStyle = 'rgba(7,11,20,0.40)';
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      } else {
        ctx.fillStyle = 'rgba(0,212,255,0.06)';
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      }

      ctx.restore();

      // Border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.strokeStyle = isActive ? 'rgba(0,212,255,0.50)' : 'rgba(0,212,255,0.12)';
      ctx.lineWidth = isActive ? 2.5 : 1;
      ctx.stroke();
      ctx.restore();
    }

    // Inner hole fill (dark)
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#070b14';
    ctx.fill();

    // Inner ring line
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Outer ring line
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.10)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Active indicator at top of ring (which is at angle -PI/2)
    const activeStart = -Math.PI / 2 - segAngle / 2 + gap / 2;
    const activeEnd = -Math.PI / 2 + segAngle / 2 - gap / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 4, activeStart, activeEnd);
    ctx.strokeStyle = 'rgba(0,212,255,0.55)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glow at top of ring
    const glowGrad = ctx.createRadialGradient(cx, cy - outerR, 0, cx, cy - outerR, 50);
    glowGrad.addColorStop(0, 'rgba(0,212,255,0.10)');
    glowGrad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - outerR, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // end bottom clip
  }

  updateText(dt) {
    if (this.textPhase === 'out') {
      this.textTimer += dt;
      const t = Math.min(this.textTimer / 280, 1);
      this.textAlpha = 1 - t;
      this.textY = -t * 15;
      if (this.textTimer > 280) { this.textPhase = 'in'; this.textTimer = 0; }
    } else if (this.textPhase === 'in') {
      this.textTimer += dt;
      const t = Math.min(this.textTimer / 500, 1);
      this.textAlpha = CarouselUtils.ease.outBack(t);
      this.textY = (1 - CarouselUtils.ease.outBack(t)) * 25;
      if (this.textTimer > 500) this.textPhase = 'hold';
    }
  }

  drawText() {
    const ctx = this.ctx;
    const cx = this.W / 2;
    const cy = this.H / 2 - 10;

    ctx.save();
    ctx.globalAlpha = this.textAlpha;

    const title = (this.titles[this.current] || `REALIZACJA ${this.current + 1}`).toUpperCase();

    // Subtle text shadow/glow
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = '#fff';
    ctx.font = '300 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, cy + this.textY);

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0,212,255,0.60)';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('BARTEKCLEAN • KOSTRZYN NAD ODRĄ', cx, cy + 28 + this.textY);

    // Decorative line
    ctx.strokeStyle = 'rgba(0,212,255,0.30)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - 35 + this.textY);
    ctx.lineTo(cx + 40, cy - 35 + this.textY);
    ctx.stroke();

    ctx.restore();
  }

  drawLoader() {
    const ctx = this.ctx;
    const cx = this.W / 2, cy = this.H / 2;
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 28, t * 3, t * 3 + Math.PI * 1.3);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie...', cx, cy + 52);
  }
}
