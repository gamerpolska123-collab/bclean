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
    const isOpen = this.nav.classList.toggle('active');
    this.toggle.classList.toggle('active');
    this.toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },
  close() {
    this.toggle.classList.remove('active');
    this.nav.classList.remove('active');
    this.toggle.setAttribute('aria-expanded', 'false');
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

      const tel = form.querySelector('input[type="tel"]');
      if (tel && tel.value.replace(/\D/g, '').length < 9) {
        this.showToast('Podaj prawidłowy numer telefonu (min. 9 cyfr)', 'error');
        tel.focus();
        return;
      }

      const btn = form.querySelector('.form__submit');
      const original = btn.innerHTML;
      btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Wysłano!</span>';
      btn.style.background = 'linear-gradient(135deg, #00c853, #00e676)';
      btn.disabled = true;

      console.log('[Form] Dane do wysłania:', Object.fromEntries(new FormData(form)));
      this.showToast('Dziękujemy! Twoje zapytanie zostało wysłane.', 'success');

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  },
  showToast(msg, type) {
    let toast = document.getElementById('form-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'form-toast';
      toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:16px 24px;border-radius:12px;font-size:0.9rem;font-weight:600;z-index:9999;transform:translateY(20px);opacity:0;transition:all 0.4s cubic-bezier(0.22,1,0.36,1);box-shadow:0 8px 30px rgba(0,0,0,0.3);';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === 'error'
      ? 'linear-gradient(135deg, #ff5252, #ff1744)'
      : 'linear-gradient(135deg, #00c853, #00e676)';
    toast.style.color = '#fff';
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
    }, 4000);
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
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
};

/* ========== BEFORE / AFTER SLIDER ========== */
const BeforeAfterSlider = {
  init() {
    document.querySelectorAll('[data-ba]').forEach(slider => {
      const before = slider.querySelector('.ba-slider__image--before');
      const handle = slider.querySelector('.ba-slider__handle');
      if (!before || !handle) return;

      let isDragging = false;

      const update = (clientX) => {
        const rect = slider.getBoundingClientRect();
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const pct = (x / rect.width) * 100;
        before.style.width = pct + '%';
        handle.style.left = pct + '%';
      };

      slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        update(e.clientX);
        e.preventDefault();
      });
      slider.addEventListener('touchstart', (e) => {
        isDragging = true;
        update(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        update(e.clientX);
      });
      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        update(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('mouseup', () => isDragging = false);
      window.addEventListener('touchend', () => isDragging = false);

      slider.addEventListener('click', (e) => {
        if (isDragging) return;
        update(e.clientX);
      });
    });
  }
};

/* ========== COOKIE CONSENT ========== */
const CookieConsent = {
  banner: null,
  init() {
    this.banner = document.getElementById('cookie-banner');
    if (!this.banner) return;
    if (localStorage.getItem('bclean_cookies')) return;

    setTimeout(() => {
      this.banner.classList.add('is-visible');
      this.banner.setAttribute('aria-hidden', 'false');
    }, 1500);

    this.banner.querySelectorAll('[data-cookie]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.cookie;
        localStorage.setItem('bclean_cookies', action);
        this.hide();
      });
    });
  },
  hide() {
    if (!this.banner) return;
    this.banner.classList.remove('is-visible');
    this.banner.setAttribute('aria-hidden', 'true');
  }
};

/* ========== MODAL SYSTEM ========== */
const ModalSystem = {
  init() {
    document.querySelectorAll('[data-open-modal]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = 'modal-' + trigger.dataset.openModal;
        this.open(modalId);
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const modal = trigger.closest('.modal');
        if (modal) this.close(modal);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.is-open').forEach(m => this.close(m));
      }
    });
  },
  open(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  },
  close(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  MobileMenu.init();
  SmoothScroll.init();
  FormHandler.init();
  Loader.init();
  MagneticButtons.init();
  BeforeAfterSlider.init();
  CookieConsent.init();
  ModalSystem.init();
});
