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
    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
      return;
    }
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
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
    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
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
    if (!counters.length) return;
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
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.counterSuffix || '';
    const duration = 2000;
    const start = performance.now();
    const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  }
};

/* ========== TEXT REVEAL ========== */
const TextReveal = {
  init() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.text-reveal, .line-reveal, .img-reveal').forEach(el => el.classList.add('active'));
      return;
    }
    const elements = document.querySelectorAll('.text-reveal, .line-reveal, .img-reveal');
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
    elements.forEach(el => observer.observe(el));
  }
};

/* ========== LOGO MORPH (header logo visibility) ========== */
const LogoMorph = {
  init() {
    const logo = document.getElementById('header-logo');
    if (!logo) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          logo.classList.remove('is-visible');
        } else {
          logo.classList.add('is-visible');
        }
      });
    }, { threshold: 0 });
    const hero = document.getElementById('hero');
    if (hero) observer.observe(hero);
  }
};
