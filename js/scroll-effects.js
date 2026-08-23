/* ========== SCROLL PROGRESS ========== */
const ScrollProgress = {
  bar: null,
  init() {
    this.bar = document.getElementById('scroll-progress');
    if (!this.bar) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  },
  update() {
    const scrollY = window.scrollY;
    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      const offset = rect.top * speed * 0.1;
      el.style.transform = `translateY(${offset}px)`;
    });
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
      const offset = rect.top * speed * 0.1;
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


/* ========== LOGO MORPH (hero <-> header) ========== */
const LogoMorph = {
  heroBrand: null,
  headerLogo: null,
  threshold: 60,
  init() {
    this.heroBrand = document.getElementById('hero-brand');
    this.headerLogo = document.getElementById('header-logo');
    if (!this.heroBrand || !this.headerLogo) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  },
  update() {
    const scrolled = window.scrollY > this.threshold;
    if (scrolled) {
      // Scroll w dół: hero brand znika, header logo pojawia się
      this.heroBrand.classList.add('is-scrolled');
      this.headerLogo.classList.add('is-visible');
    } else {
      // Scroll do góry: hero brand wraca, header logo znika
      this.heroBrand.classList.remove('is-scrolled');
      this.headerLogo.classList.remove('is-visible');
    }
  }
};
