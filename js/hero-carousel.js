/* ========== HERO CANVAS RING CAROUSEL v15 — REWRITE ========== */
class HeroCarousel {
  constructor(selector, services) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      this.fallback(services[0].image);
      return;
    }

    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.services = services;
    this.images = [];
    this.loaded = false;

    this.current = 0;
    this.next = 0;
    this.transition = 0;
    this.isTransitioning = false;

    this.autoplayInterval = 7000;
    this.shineProgress = 0;

    this.ringRotation = 0;
    this.targetRingRotation = 0;
    this.ringRotVel = 0;

    this.ringCyRatio = 0.58;
    this.targetRingCyRatio = 0.58;
    this.ringCyVel = 0;

    this.slideOffsets = services.map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 10,
      currentScale: 1 + Math.random() * 0.03,
      targetScale: 1.04 + Math.random() * 0.02,
    }));

    // Text animation
    this.textAlpha = 1;
    this.textTargetAlpha = 1;
    this.textY = 0;
    this.textTargetY = 0;
    this.textBlur = 0;
    this.textTargetBlur = 0;
    this._cacheValid = false;
    this._cachedDescLines = [];

    // Particles
    this.particles = [];
    this.initParticles();

    this.time = 0;

    this.setupCanvas();
    this.bindResize();
    this.loadImages().then(() => {
      this.loaded = true;
      this.startLoop();
    });
  }

  fallback(imageSrc) {
    this.canvas.style.display = 'none';
    const fb = document.createElement('div');
    fb.className = 'hero-fallback';
    fb.style.cssText = 'position:absolute;inset:0;background:url('+imageSrc+') center/cover no-repeat;z-index:0;';
    this.canvas.parentElement.insertBefore(fb, this.canvas);
  }

  initParticles() {
    const count = Math.min(30, Math.floor((this.W * this.H) / 35000));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.8 + 0.3,
        speed: Math.random() * 0.00015 + 0.00003,
        opacity: Math.random() * 0.25 + 0.04,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  setupCanvas() {
    this.canvas.width = Math.floor(this.W * this.dpr);
    this.canvas.height = Math.floor(this.H * this.dpr);
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  bindResize() {
    let raf;
    let lastW = this.W, lastH = this.H;
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const newW = window.innerWidth, newH = window.innerHeight;
        if (newW === lastW && newH === lastH) return;
        lastW = newW; lastH = newH;
        this.W = newW; this.H = newH;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.setupCanvas();
        this.initParticles();
        this._cacheValid = false;
      });
    });
  }

  loadImages() {
    return Promise.all(this.services.map(s => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(this.createPlaceholder());
      img.src = s.image;
    }))).then(imgs => { this.images = imgs; });
  }

  createPlaceholder() {
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 800;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, 1200, 800);
    const img = new Image();
    img.src = c.toDataURL();
    return img;
  }

  startLoop() {
    let lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(now - lastTime, 33);
      lastTime = now;
      this.time = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  update(dt) {
    if (!this.loaded) return;

    // Shine timer — full circumference
    if (!this.isTransitioning) {
      this.shineProgress += dt / this.autoplayInterval;
      if (this.shineProgress >= 1) {
        this.shineProgress = 0;
        this.goTo((this.current + 1) % this.services.length);
      }
    }

    if (this.isTransitioning) {
      this.transition += dt / 1600;
      if (this.transition >= 1) {
        this.transition = 1;
        this.current = this.next;
        this.isTransitioning = false;
        this.shineProgress = 0;
        this.textTargetAlpha = 1;
        this.textTargetY = 0;
        this.textTargetBlur = 0;
        this._cacheValid = false;
      } else {
        const t = this.transition;
        if (t < 0.35) {
          this.textTargetAlpha = 1 - t / 0.35;
          this.textTargetY = -15 * (t / 0.35);
          this.textTargetBlur = (t / 0.35) * 3;
        } else if (t > 0.65) {
          const t2 = (t - 0.65) / 0.35;
          this.textTargetAlpha = t2;
          this.textTargetY = 15 * (1 - t2);
          this.textTargetBlur = (1 - t2) * 2;
        } else {
          this.textTargetAlpha = 0;
          this.textTargetBlur = 3;
        }
      }
    }

    this.textAlpha += (this.textTargetAlpha - this.textAlpha) * 0.10;
    this.textY += (this.textTargetY - this.textY) * 0.10;
    this.textBlur += (this.textTargetBlur - this.textBlur) * 0.12;

    const off = this.slideOffsets[this.current];
    off.currentScale += (off.targetScale - off.currentScale) * 0.0002 * dt;

    const targetRatio = this.isTransitioning ? 0.52 : 0.58;
    this.targetRingCyRatio = targetRatio;
    const ratioDiff = this.targetRingCyRatio - this.ringCyRatio;
    if (Math.abs(ratioDiff) > 0.001) {
      this.ringCyVel += ratioDiff * 0.008;
      this.ringCyVel *= 0.90;
      this.ringCyRatio += this.ringCyVel;
    }

    const rotDiff = this.targetRingRotation - this.ringRotation;
    if (Math.abs(rotDiff) > 0.001) {
      this.ringRotVel += rotDiff * 0.0028;
      this.ringRotVel *= 0.92;
      this.ringRotation += this.ringRotVel;
    }

    const t = this.time;
    for (const p of this.particles) {
      p.y -= p.speed * dt;
      if (p.y < -0.05) p.y = 1.05;
      p.currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(t * 0.0007 + p.phase));
    }
  }

  goTo(index) {
    if (this.isTransitioning || index === this.current) return;
    this.next = index;
    this.isTransitioning = true;
    this.transition = 0;
    this.textTargetAlpha = 0;
    this.textTargetBlur = 0;
    this.shineProgress = 0;
    this.slideOffsets[index].currentScale = 1 + Math.random() * 0.02;
    this.slideOffsets[index].targetScale = 1.05 + Math.random() * 0.02;
    const seg = (Math.PI * 2) / this.services.length;
    const diff = index - this.current;
    let steps = diff;
    if (steps < 0) steps += this.services.length;
    this.targetRingRotation -= steps * seg;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    if (!this.loaded) {
      this.drawLoader(ctx);
      return;
    }

    this.drawBackground(ctx);
    this.drawVignette(ctx);
    this.drawParticles(ctx);
    this.drawBottomFade(ctx);
    this.drawRing(ctx);
    this.drawServiceText(ctx);
    this.drawTopBar(ctx);
  }

  drawBackground(ctx) {
    const curr = this.images[this.current];
    const next = this.images[this.next];
    const off = this.slideOffsets[this.current];

    if (curr && curr.width) {
      this.drawCover(ctx, curr, 1, off.currentScale, off.x, off.y);
    }

    if (this.isTransitioning && next && next.width) {
      const ease = this.easeInOutCubic(this.transition);
      ctx.globalAlpha = ease;
      const slideX = (1 - ease) * this.W * 0.12;
      const nextOff = this.slideOffsets[this.next];
      this.drawCover(ctx, next, 1, nextOff.currentScale, nextOff.x + slideX, nextOff.y);
      ctx.globalAlpha = 1;

      ctx.globalAlpha = 1 - ease;
      const currSlideX = -ease * this.W * 0.08;
      this.drawCover(ctx, curr, 1, off.currentScale * (1 + ease * 0.02), off.x + currSlideX, off.y);
      ctx.globalAlpha = 1;
    }
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  drawCover(ctx, img, alpha, scale, offsetX, offsetY) {
    const ratio = img.width / img.height;
    const screenRatio = this.W / this.H;
    let dw, dh;
    const pw = this.W * 1.04;
    const ph = this.H * 1.04;
    if (screenRatio > ratio) {
      dw = pw;
      dh = pw / ratio;
    } else {
      dh = ph;
      dw = ph * ratio;
    }
    const zdw = dw * scale;
    const zdh = dh * scale;
    const dx = (this.W - zdw) / 2 + offsetX;
    const dy = (this.H - zdh) / 2 + offsetY;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, zdw, zdh);
    ctx.globalAlpha = 1;
  }

  drawVignette(ctx) {
    const cx = this.W / 2, cy = this.H / 2;
    const r1 = this.W * 0.30, r2 = this.W * 0.90;
    const vig = ctx.createRadialGradient(cx, cy, r1, cx, cy, r2);
    vig.addColorStop(0, 'rgba(7,11,20,0)');
    vig.addColorStop(0.5, 'rgba(7,11,20,0.06)');
    vig.addColorStop(0.8, 'rgba(7,11,20,0.30)');
    vig.addColorStop(1, 'rgba(7,11,20,0.50)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const x = p.x * this.W;
      const y = p.y * this.H;
      const op = p.currentOpacity || p.opacity;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, p.r * 2);
      grad.addColorStop(0, `rgba(0,212,255,${op})`);
      grad.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, p.r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBottomFade(ctx) {
    const g = ctx.createLinearGradient(0, this.H * 0.30, 0, this.H);
    g.addColorStop(0, 'rgba(7,11,20,0)');
    g.addColorStop(0.18, 'rgba(7,11,20,0.08)');
    g.addColorStop(0.40, 'rgba(7,11,20,0.40)');
    g.addColorStop(0.65, 'rgba(7,11,20,0.78)');
    g.addColorStop(0.85, 'rgba(7,11,20,0.95)');
    g.addColorStop(1, 'rgba(7,11,20,0.99)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  drawTopBar(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 90);
    g.addColorStop(0, 'rgba(7,11,20,0.50)');
    g.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, 90);
  }

  drawRing(ctx) {
    const cx = this.W / 2;
    const cy = this.H + this.H * this.ringCyRatio;

    const isMobile = this.W < 768;
    const ringScale = isMobile ? 0.50 : (this.W < 1200 ? 0.62 : 0.72);
    const outerR = Math.min(this.W, this.H) * ringScale;
    const innerR = outerR * 0.46;
    const segAngle = (Math.PI * 2) / this.services.length;
    const gap = 0.018;
    const count = this.services.length;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.H * 0.32, this.W, this.H * 0.68);
    ctx.clip();

    const activeSeg = (Math.PI * 2) / count;
    const activeStartBase = -Math.PI / 2 - activeSeg / 2 + gap / 2;
    const activeEndBase = -Math.PI / 2 + activeSeg / 2 - gap / 2;

    for (let i = 0; i < count; i++) {
      const img = this.images[i];
      if (!img || !img.width) continue;

      const startA = this.ringRotation + i * segAngle - Math.PI / 2 - segAngle / 2;
      const endA = startA + segAngle - gap;
      const midA = (startA + endA) / 2;

      let normMid = ((midA % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const isActive = Math.abs(normMid - Math.PI * 1.5) < segAngle / 2 ||
                       Math.abs(normMid + Math.PI / 2) < segAngle / 2;

      const depthAngle = Math.sin(midA);
      const depthFactor = 0.50 + 0.50 * Math.max(0, depthAngle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startA, endA);
      ctx.arc(cx, cy, innerR, endA, startA, true);
      ctx.closePath();
      ctx.clip();

      const midR = (innerR + outerR) / 2;
      const segCx = cx + Math.cos(midA) * midR;
      const segCy = cy + Math.sin(midA) * midR;
      ctx.translate(segCx, segCy);
      ctx.rotate(midA + Math.PI / 2);

      // === KEY FIX: larger cover to fill segment completely ===
      // Segment is a wedge. We need the image to be large enough to fill it.
      // coverH = segment thickness * 1.5 (fill vertically with margin)
      // coverW = at least chord length of outer arc (fill horizontally)
      const segThickness = outerR - innerR;
      const chordLen = 2 * outerR * Math.sin(segAngle / 2); // chord at outer radius
      const coverH = segThickness * 1.55;
      const coverW = Math.max(coverH * (img.width / img.height), chordLen * 0.85);
      let scale = isActive ? 1.04 : 0.98;
      if (isActive) scale += Math.sin(this.time * 0.001) * 0.002;

      ctx.globalAlpha = depthFactor;
      ctx.drawImage(img, -coverW * scale / 2, -coverH * scale / 2, coverW * scale, coverH * scale);
      ctx.globalAlpha = 1;

      if (!isActive) {
        ctx.fillStyle = `rgba(7,11,20,${0.40 + (1 - depthFactor) * 0.25})`;
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      } else {
        ctx.fillStyle = 'rgba(0,212,255,0.05)';
        ctx.fillRect(-coverW, -coverH, coverW * 2, coverH * 2);
      }

      // Inner shadow
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = 'rgba(0,0,0,0.20)';
      ctx.lineWidth = 10;
      ctx.strokeRect(-coverW * 0.5, -coverH * 0.5, coverW, coverH);
      ctx.shadowBlur = 0;

      ctx.restore();

      // Border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startA, endA);
      ctx.arc(cx, cy, innerR, endA, startA, true);
      ctx.closePath();

      if (isActive) {
        ctx.strokeStyle = 'rgba(0,212,255,0.55)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0,212,255,0.50)';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,212,255,0.20)';
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 8;
        ctx.stroke();
      } else {
        ctx.strokeStyle = `rgba(0,212,255,${0.03 + depthFactor * 0.05})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Inner circle mask
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    innerGrad.addColorStop(0, 'rgba(7,11,20,0.995)');
    innerGrad.addColorStop(0.5, 'rgba(7,11,20,0.90)');
    innerGrad.addColorStop(0.80, 'rgba(7,11,20,0.62)');
    innerGrad.addColorStop(0.93, 'rgba(7,11,20,0.28)');
    innerGrad.addColorStop(1, 'rgba(7,11,20,0.10)');
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // Inner ring glow
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = 'rgba(0,212,255,0.25)';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Active glow arc
    const aStart = activeStartBase + this.ringRotation;
    const aEnd = activeEndBase + this.ringRotation;

    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 4, aStart, aEnd);
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 5;
    ctx.shadowColor = 'rgba(0,212,255,0.60)';
    ctx.shadowBlur = 32;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 2, aStart, aEnd);
    ctx.strokeStyle = 'rgba(0,212,255,0.35)';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 16;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 0.5, aStart, aEnd);
    ctx.strokeStyle = 'rgba(0,212,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Shine — full circumference
    const totalAngle = Math.PI * 2;
    const shineAngle = -Math.PI / 2 + this.shineProgress * totalAngle;
    const shineR = outerR + 3;
    const shineX = cx + Math.cos(shineAngle) * shineR;
    const shineY = cy + Math.sin(shineAngle) * shineR;

    // Glow trail
    const trailLen = 0.40;
    ctx.beginPath();
    ctx.arc(cx, cy, shineR, shineAngle - trailLen, shineAngle);
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(0,212,255,0.40)';
    ctx.shadowBlur = 24;
    ctx.stroke();

    // Main shine dot
    const shineGrad = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, 35);
    shineGrad.addColorStop(0, 'rgba(255,255,255,0.40)');
    shineGrad.addColorStop(0.25, 'rgba(0,212,255,0.18)');
    shineGrad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.arc(shineX, shineY, 35, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(shineX, shineY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Halo
    ctx.fillStyle = 'rgba(0,212,255,0.20)';
    ctx.beginPath();
    ctx.arc(shineX, shineY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Segment under shine highlight
    const segUnderShine = Math.floor(((shineAngle + Math.PI / 2) / segAngle + count) % count);
    const suStart = this.ringRotation + segUnderShine * segAngle - Math.PI / 2 - segAngle / 2;
    const suEnd = suStart + segAngle - gap;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 2, suStart, suEnd);
    ctx.strokeStyle = 'rgba(0,212,255,0.20)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0,212,255,0.25)';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner reflection
    ctx.beginPath();
    ctx.arc(cx, cy, innerR + 3, aStart - 0.06, aEnd + 0.06);
    ctx.strokeStyle = 'rgba(0,212,255,0.08)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0,212,255,0.12)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawServiceText(ctx) {
    const svc = this.services[this.current];
    if (!svc) return;

    const alpha = this.textAlpha;
    if (alpha < 0.01) return;

    const yOffset = this.textY;
    const blur = this.textBlur;

    const boxW = Math.min(360, this.W * 0.28);
    const boxX = this.W - boxW - Math.max(36, this.W * 0.035);
    const boxY = this.H * 0.16 + yOffset;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (blur > 0.5) {
      ctx.globalAlpha *= Math.max(0.2, 1 - blur * 0.15);
    }

    // Watermark number
    ctx.save();
    ctx.font = `800 ${Math.min(120, this.W * 0.09)}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(0, 212, 255, 0.035)';
    ctx.textAlign = 'right';
    ctx.fillText(`0${this.current + 1}`, boxX + boxW + 8, boxY + 70);
    ctx.restore();

    // Service label
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0, 212, 255, 0.75)';
    ctx.fillText(`USŁUGA 0${this.current + 1} / 0${this.services.length}`, boxX, boxY + 12);

    // Title with text-shadow
    const titleSize = Math.min(24, this.W * 0.020);
    ctx.font = `800 ${titleSize}px Inter, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 3;
    ctx.fillText(svc.title, boxX, boxY + 44);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Accent line
    ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
    ctx.fillRect(boxX, boxY + 54, 40, 1.5);

    // Description
    if (!this._cacheValid) {
      const descSize = Math.min(12, this.W * 0.010);
      ctx.font = `400 ${descSize}px Inter, sans-serif`;
      const maxW = boxW;
      const words = svc.description.split(' ');
      let line = '', lines = [];
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxW && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = test;
        }
      }
      lines.push(line.trim());
      this._cachedDescLines = lines;
      this._cacheValid = true;
    }

    const descSize = Math.min(12, this.W * 0.010);
    ctx.font = `400 ${descSize}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
    let descY = boxY + 78;
    for (const line of this._cachedDescLines) {
      ctx.fillText(line, boxX, descY);
      descY += 18;
    }

    // Vertical dots
    const dotR = 3;
    const dotGap = 12;
    const dotsY = boxY + 130;
    const dotsX = boxX + boxW - 4;

    for (let i = 0; i < this.services.length; i++) {
      const isActive = i === this.current;
      const dotY = dotsY + i * dotGap;
      if (isActive) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.25)';
        ctx.fillRect(dotsX - 16, dotY - 0.5, 14, 1);
        const dg = ctx.createRadialGradient(dotsX, dotY, 0, dotsX, dotY, dotR * 3);
        dg.addColorStop(0, 'rgba(0, 212, 255, 0.5)');
        dg.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(dotsX, dotY, dotR * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(dotsX, dotY, dotR, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.beginPath();
        ctx.arc(dotsX, dotY, dotR * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawLoader(ctx) {
    const cx = this.W / 2, cy = this.H / 2;
    const t = this.time / 1000;

    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 24, t * 2.5, t * 2.5 + Math.PI * 1.4);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    const dotAngle = t * 2.5 + Math.PI * 1.4;
    const dotX = cx + Math.cos(dotAngle) * 24;
    const dotY = cy + Math.sin(dotAngle) * 24;
    const dg = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
    dg.addColorStop(0, 'rgba(0,212,255,0.8)');
    dg.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ładowanie...', cx, cy + 42);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const services = [
    {
      image: 'media/kostka-mycie.jpg',
      title: 'Mycie kostki brukowej',
      description: 'Profesjonalne czyszczenie kostki brukowej, polbruku i płyt betonowych. Usuwamy mech, glony i plamy olejowe.'
    },
    {
      image: 'media/elewacja-mycie.jpg',
      title: 'Mycie elewacji',
      description: 'Czyszczenie elewacji z nalotów, glonów i zabrudzeń atmosferycznych. Bezpieczne metody dla każdego tynku.'
    },
    {
      image: 'media/dach-mycie.jpg',
      title: 'Mycie dachów',
      description: 'Usuwanie mchu, porostów i nalotów z dachówek i blachodachówki. Przedłuż żywotność dachu.'
    },
    {
      image: 'media/podjazd-mycie.jpg',
      title: 'Podjazdy i tarasy',
      description: 'Kompleksowe czyszczenie podjazdów, tarasów i alejek ogrodowych. Przywracamy pierwotny wygląd.'
    }
  ];
  new HeroCarousel('#hero-canvas', services);
});
