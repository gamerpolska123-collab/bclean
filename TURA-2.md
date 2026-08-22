# TURA 2 — CSS (ANIMACJE, DUPLIKATY, KONTRAST, PRZYCISKI)

## Cel
Naprawić brakujące animacje reveal, usunąć duplikaty CSS, poprawić kontrast, naprawić przyciski.

---

### 2.1 css/animations.css — DODAJ REVEAL KLASY

DODAJ na końcu pliku:

```css
/* ========== REVEAL ON SCROLL ========== */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.active {
  opacity: 1;
  transform: translateY(0);
}
.reveal--left {
  opacity: 0;
  transform: translateX(-50px);
  transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal--left.active {
  opacity: 1;
  transform: translateX(0);
}
.reveal--right {
  opacity: 0;
  transform: translateX(50px);
  transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal--right.active {
  opacity: 1;
  transform: translateX(0);
}
.reveal--delay-1 { transition-delay: 0.1s; }
.reveal--delay-2 { transition-delay: 0.2s; }
.reveal--delay-3 { transition-delay: 0.3s; }
.reveal--delay-4 { transition-delay: 0.4s; }
```

---

### 2.2 css/components.css — USUŃ DUPLIKATY CAROUSEL

USUŃ drugi zestaw definicji carousel (zaczyna się od `/* ========== CAROUSEL 1: 3D COVERFLOW... */`).
Zostaw TYLKO pierwszy zestaw (ten z `width: 600px`, `height: 380px`).

---

### 2.3 css/components.css — PRZYCISKI WIĘKSZE

ZASTĄP `.btn`:
```css
.btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 36px; font-size: 0.82rem; font-weight: var(--fw-600);
  text-transform: uppercase; letter-spacing: 2px;
  border-radius: 50px; position: relative; overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
}
```

---

### 2.4 css/layout.css — HEADER COMPACT

ZASTĄP `.header`:
```css
.header {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: var(--z-header);
  padding: 14px 0;
  transition: all var(--t-base);
}
.header--scrolled {
  background: rgba(7,11,20,0.92);
  backdrop-filter: blur(24px) saturate(1.2);
  border-bottom: 1px solid var(--c-border);
  padding: 10px 0;
}
```

ZASTĄP `.header__logo img`:
```css
.header__logo img {
  height: 44px; width: auto;  /* Było 52px */
  filter: drop-shadow(0 2px 8px var(--c-accent-glow));
  transition: transform var(--t-fast);
}
```

---

### 2.5 css/components.css — FORM INPUTS KONTRAST

ZASTĄP focus style:
```css
.form__group input:focus,
.form__group textarea:focus,
.form__group select:focus {
  border-color: var(--c-accent);
  box-shadow: 0 0 20px rgba(0,212,255,0.12);
  background: rgba(255,255,255,0.08);
}
```

---

## Weryfikacja po TURZE 2
- [ ] Sekcje pojawiają się z animacją przy scrollowaniu
- [ ] Nie ma duplikatów CSS carousel
- [ ] Przyciski są lepiej widoczne
- [ ] Header jest bardziej kompaktowy
