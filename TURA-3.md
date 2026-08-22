# TURA 3 — JAVASCRIPT (BUGI, PERFORMANCE, UX)

## Cel
Naprawić bugi w JS, poprawić performance, usunąć irytujące efekty.

---

### 3.1 js/hero-carousel.js — CANVAS FALLBACK

DODAJ na początku konstruktora (po `this.canvas = ...`):

```javascript
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      // Fallback: pokaż pierwszy obraz jako static background
      this.canvas.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'hero-fallback';
      fallback.style.cssText = 'position:absolute;inset:0;background:url('+imageUrls[0]+') center/cover no-repeat;z-index:0;';
      this.canvas.parentElement.insertBefore(fallback, this.canvas);
      return;
    }
```

---

### 3.2 js/canvas-effects.js — WYŁĄCZ RIPPLEFX

ZASTĄP całą zawartość pliku:

```javascript
/* ========== RIPPLE EFFECT — DISABLED ========== */
/* Efekt ripple został wyłączony, ponieważ przeszkadzał w użytkowaniu strony.
   Jeśli potrzebny, można go przywrócić ograniczając do konkretnych elementów. */
const RippleFX = {
  init() { /* disabled */ }
};
```

---

### 3.3 js/interactions.js — MAGNETIC BUTTONS FIX

ZASTĄP `MagneticButtons`:

```javascript
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
```

---

### 3.4 js/scroll-effects.js — PARALLAX FIX

ZASTĄP `update()` w `Parallax`:

```javascript
  update() {
    const scrollY = window.scrollY;
    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      const offset = rect.top * speed * 0.1;
      el.style.transform = `translateY(${offset}px)`;
    });
  }
```

---

### 3.5 js/interactions.js — FORM HANDLER Z WALIDACJĄ

ZASTĄP `FormHandler`:

```javascript
const FormHandler = {
  init() {
    const form = document.querySelector('.form form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const email = form.querySelector('input[type="tel"]');
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
```

---

## Weryfikacja po TURZE 3
- [ ] Canvas ma fallback dla starszych przeglądarek
- [ ] Brak irytującego ripple na całej stronie
- [ ] Przyciski magnetic nie psują hover
- [ ] Parallax działa poprawnie
- [ ] Formularz waliduje telefon
