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
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.nav.classList.contains('active')) {
        this.close();
      }
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

/* ========== TOAST NOTIFICATIONS ========== */
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    this.container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:12px;pointer-events:none;';
    document.body.appendChild(this.container);
  },
  show(message, type = 'success') {
    if (!this.container) this.init();
    const toast = document.createElement('div');
    const colors = {
      success: 'background:rgba(0,200,83,0.95);color:#fff;',
      error: 'background:rgba(255,82,82,0.95);color:#fff;',
      info: 'background:rgba(0,212,255,0.95);color:#070b14;'
    };
    toast.style.cssText = colors[type] + 'padding:14px 24px;border-radius:12px;font-weight:600;font-size:0.9rem;box-shadow:0 8px 32px rgba(0,0,0,0.3);transform:translateY(20px);opacity:0;transition:all 0.4s cubic-bezier(0.22,1,0.36,1);pointer-events:auto;backdrop-filter:blur(10px);';
    toast.textContent = message;
    this.container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
};

/* ========== FORM HANDLING ========== */
const FormHandler = {
  init() {
    const form = document.querySelector('.form form');
    if (!form) return;
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    // Inline validation
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearError(field));
    });
  },
  validateField(field) {
    const group = field.closest('.form__group');
    if (!group) return true;
    let valid = true;
    let msg = '';
    if (field.hasAttribute('required') && !field.value.trim()) {
      valid = false;
      msg = 'To pole jest wymagane';
    }
    if (field.type === 'tel' && field.value) {
      const digits = field.value.replace(/\D/g, '');
      if (digits.length < 9) {
        valid = false;
        msg = 'Podaj prawidłowy numer telefonu (min. 9 cyfr)';
      }
    }
    if (field.type === 'email' && field.value) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(field.value)) {
        valid = false;
        msg = 'Podaj prawidłowy adres e-mail';
      }
    }
    if (!valid) {
      group.classList.add('form__group--error');
      let err = group.querySelector('.form__error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'form__error';
        group.appendChild(err);
      }
      err.textContent = msg;
    } else {
      group.classList.remove('form__group--error');
      const err = group.querySelector('.form__error');
      if (err) err.remove();
    }
    return valid;
  },
  clearError(field) {
    const group = field.closest('.form__group');
    if (group) {
      group.classList.remove('form__group--error');
      const err = group.querySelector('.form__error');
      if (err) err.remove();
    }
  },
  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.form__submit');
    const originalText = btn ? btn.textContent : 'Wyślij';

    // Validate all
    let allValid = true;
    form.querySelectorAll('input, textarea, select').forEach(field => {
      if (!this.validateField(field)) allValid = false;
    });
    if (!allValid) {
      Toast.show('Proszę poprawić błędy w formularzu', 'error');
      return;
    }

    // RODO consent check
    const rodo = form.querySelector('input[name="rodo"]');
    if (rodo && !rodo.checked) {
      Toast.show('Musisz zaakceptować politykę prywatności', 'error');
      rodo.focus();
      return;
    }

    // Loading state
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Wysyłanie...';
    }

    // Check if Formspree is configured
    const action = form.getAttribute('action');
    if (!action || action.includes('YOUR_FORM_ID')) {
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
        Toast.show('Formularz jest w trakcie konfiguracji. Skontaktuj się telefonicznie.', 'info');
      }, 1000);
      return;
    }

    // Actual submit
    fetch(action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        form.reset();
        Toast.show('Wiadomość wysłana! Skontaktujemy się w ciągu 24h.', 'success');
      } else {
        throw new Error('Server error');
      }
    })
    .catch(() => {
      Toast.show('Błąd wysyłki. Spróbuj ponownie lub zadzwoń.', 'error');
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }
};

/* ========== LOADER ========== */
const Loader = {
  init() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      loader.classList.add('hidden');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 800);
    });
  }
};

/* ========== MAGNETIC BUTTONS ========== */
const MagneticButtons = {
  controller: null,
  init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    this.controller = new AbortController();
    const { signal } = this.controller;
    document.querySelectorAll('.btn, .header__cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
      }, { signal });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      }, { signal });
    });
  },
  destroy() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
};
