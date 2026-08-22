/* ========== SCROLL PROGRESS ========== */
const ScrollProgress = {
  bar: null,
  init() {
    this.bar = document.getElementById('scroll-progress');
    if (!this.bar) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  },
  update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.bar.style.width = progress + '%';
  }
};

/* ========== HEADER SCROLL ========== */
const HeaderScroll = {
  header: null,
  init() {
    this.header = document.getElementById('header');
    if (!this.header) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  },
  update() {
    if (window.scrollY > 60) {
      this.header.classList.add('header--scrolled');
    } else {
      this.header.classList.remove('header--scrolled');
    }
  }
};

/* ========== REVEAL ON SCROLL ========== */
const RevealOnScroll = {
  init() {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optionally unobserve after reveal
          // observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px'
    });
    elements.forEach(el => observer.observe(el));
  }
};

/* ========== PARALLAX ========== */
const Parallax = {
  elements: [],
  init() {
    this.elements = document.querySelectorAll('[data-parallax]');
    if (!this.elements.length) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  },
  update() {
    const scrollY = window.scrollY;
    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      const offset = (scrollY - rect.top + window.innerHeight) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }
};

/* ========== COUNTER ANIMATION ========== */
const CounterAnim = {
  init() {
    const counters = document.querySelectorAll('[data-counter]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  },
  animate(el) {
    const target = parseInt(el.dataset.counter);
    const suffix = el.dataset.counterSuffix || '';
    const duration = 2000;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(ease * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
};
