/* ========== CANVAS PARTICLE SYSTEM ========== */
const CanvasFX = {
  canvas: null, ctx: null,
  particles: [],
  mouse: { x: -1000, y: -1000 },
  width: 0, height: 0,
  animId: null,

  init() {
    this.canvas = document.getElementById('fx-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.createParticles(100);
    this.animate();
  },

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  createParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
        life: Math.random() * 200 + 100,
        maxLife: Math.random() * 200 + 100,
        hue: 190 + Math.random() * 20, // cyan range
      });
    }
  },

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw connections
    this.particles.forEach((p, i) => {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    // Update & draw particles
    this.particles.forEach(p => {
      // Mouse repulsion
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const force = (180 - dist) / 180;
        p.x -= (dx / dist) * force * 2;
        p.y -= (dy / dist) * force * 2;
      }

      p.x += p.speedX;
      p.y += p.speedY;
      p.life--;

      // Wrap around
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Fade near death
      const lifeRatio = p.life / p.maxLife;
      const alpha = p.opacity * Math.min(lifeRatio * 2, 1);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue},100%,60%,${alpha})`;
      this.ctx.fill();

      // Glow
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue},100%,60%,${alpha * 0.15})`;
      this.ctx.fill();

      if (p.life <= 0) {
        p.x = Math.random() * this.width;
        p.y = Math.random() * this.height;
        p.life = p.maxLife;
      }
    });

    this.animId = requestAnimationFrame(() => this.animate());
  },

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
};

/* ========== HERO FLOATING PARTICLES (DOM) ========== */
const HeroParticles = {
  init() {
    const container = document.getElementById('hero-particles');
    if (!container) return;
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.animationDuration = (7 + Math.random() * 8) + 's';
      const size = 2 + Math.random() * 5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      container.appendChild(p);
    }
  }
};

/* ========== RIPPLE EFFECT ON CLICK ========== */
const RippleFX = {
  init() {
    document.addEventListener('click', e => {
      this.create(e.clientX, e.clientY);
    });
  },
  create(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:0; height:0; border-radius:50%;
      border:2px solid rgba(0,212,255,0.5);
      pointer-events:none; z-index:9999;
      transform:translate(-50%,-50%);
      animation:ripple-expand 0.8s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  }
};

// Add ripple keyframe dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple-expand {
    to { width:300px; height:300px; opacity:0; border-width:0; }
  }
`;
document.head.appendChild(rippleStyle);
