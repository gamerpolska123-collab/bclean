/* ========== MOBILE MENU ========== */
const MobileMenu = {
  toggle: null,
  nav: null,
  init() {
    this.toggle = document.querySelector('.menu-toggle');
    this.nav = document.querySelector('.nav');
    if (!this.toggle || !this.nav) return;
    this.toggle.addEventListener('click', () => this.toggleMenu());
    this.nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });
  },
  toggleMenu() {
    this.toggle.classList.toggle('active');
    this.nav.classList.toggle('active');
    document.body.style.overflow = this.nav.classList.contains('active') ? 'hidden' : '';
  },
  close() {
    this.toggle.classList.remove('active');
    this.nav.classList.remove('active');
    document.body.style.overflow = '';
  }
};

/* ========== SMOOTH SCROLL ========== */
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }
};

/* ========== FORM HANDLING ========== */
const FormHandler = {
  init() {
    const form = document.querySelector('.form form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const tel = form.querySelector('input[type="tel"]');
      if (tel && tel.value.length < 9) {
        alert('Podaj prawidłowy numer telefonu');
        tel.focus();
        return;
      }

      const btn = form.querySelector('.form__submit');
      const original = btn.textContent;
      btn.textContent = 'Wysłano! Dziękujemy ✓';
      btn.style.background = 'linear-gradient(135deg, #00c853, #00e676)';
      btn.disabled = true;

      // TODO: Podłącz backend (Formspree, EmailJS, własny endpoint)
      console.log('[Form] Dane do wysłania:', new FormData(form));

      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }
};

/* ========== LOADER ========== */
const Loader = {
  init() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 800);
    });
  }
};

/* ========== MAGNETIC BUTTONS ========== */
const MagneticButtons = {
  init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.btn, .header__cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.dataset.magnetic = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        btn.style.transform = btn.dataset.magnetic;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        delete btn.dataset.magnetic;
      });
    });
  }
};
