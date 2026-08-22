# TURA 1 — HERO SECTION (TŁO, TYTUŁ, PIERŚCIEŃ, OVERLAY)

## Cel
Naprawić najbardziej widoczne problemy w sekcji hero: zoom tła, rozmiar/pozycję tytułu, rozmiar pierścienia, overlay.

---

### 1.1 js/hero-carousel.js — drawCover (ZOOM TŁA)

ZASTĄP całą funkcję `drawCover`:

```javascript
drawCover(ctx, img, alpha) {
    const ratio = img.width / img.height;
    const screenRatio = this.W / this.H;
    let dw, dh, dx, dy;

    // Padding 10% — pokazuje więcej kontekstu, mniej agresywny crop
    const pad = 0.10;
    const pw = this.W * (1 - pad);
    const ph = this.H * (1 - pad);

    if (screenRatio > ratio) {
      dw = pw;
      dh = pw / ratio;
      dx = (this.W - dw) / 2;
      dy = (this.H - dh) / 2;
    } else {
      dh = ph;
      dw = ph * ratio;
      dx = (this.W - dw) / 2;
      dy = (this.H - dh) / 2;
    }

    // Bardzo subtelny zoom tylko podczas transition (1.5% zamiast 3%)
    const zoom = this.isTransitioning ? 1 + this.transition * 0.015 : 1;
    dw *= zoom;
    dh *= zoom;
    dx -= (dw - this.W * (1 - pad)) / 2;
    dy -= (dh - this.H * (1 - pad)) / 2;

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }
```

---

### 1.2 js/hero-carousel.js — drawRing (PIERŚCIEŃ)

ZASTĄP pierwsze linie funkcji `drawRing`:

```javascript
drawRing(ctx) {
    const cx = this.W / 2;
    const cy = this.H + this.H * 0.42;      // Niżej (było 0.30)
    const outerR = Math.min(this.W, this.H) * 0.48;  // Mniejszy (było 0.70)
    const innerR = outerR * 0.50;           // Szersze segmenty (było 0.40)
```

ZASTĄP clip area:

```javascript
    // Clip to bottom area only — ring starts lower
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.H * 0.55, this.W, this.H * 0.45);  // Było 0.35
    ctx.clip();
```

ZASTĄP coverH w pętli segmentów:

```javascript
      // Draw image
      const coverH = (outerR - innerR) * 1.25;  // Mniej rozciągnięte (było 1.6)
      const coverW = coverH * (img.width / img.height);
```

---

### 1.3 js/hero-carousel.js — draw (OVERLAY)

ZASTĄP overlay gradient:

```javascript
    // 2. Dark overlay (left side for text readability)
    const overlay = ctx.createLinearGradient(0, 0, this.W * 0.40, 0);  // Było 0.55
    overlay.addColorStop(0, 'rgba(7,11,20,0.55)');
    overlay.addColorStop(0.30, 'rgba(7,11,20,0.18)');
    overlay.addColorStop(0.65, 'rgba(7,11,20,0.03)');
    overlay.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, this.W, this.H);
```

---

### 1.4 js/hero-carousel.js — autoplayInterval

ZMIEN:
```javascript
this.autoplayInterval = 3000;
```
NA:
```javascript
this.autoplayInterval = 5000;
```

---

### 1.5 css/layout.css — HERO TITLE

ZASTĄP cały blok `.hero-carousel__title` i `.hero-title__word`:

```css
/* ========== HERO TITLE ========== */
.hero-carousel__title {
  display: flex;
  flex-direction: column;
  line-height: 1.12;
  margin-bottom: 22px;
  position: relative;
}

.hero-title__word--1 {
  display: block;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: var(--fw-400);
  color: #fff;
  letter-spacing: -1px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.45);
  opacity: 0;
  transform: translateY(20px);
  animation: heroReveal 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s forwards;
}

.hero-title__word--2 {
  display: block;
  font-size: clamp(2.4rem, 5.5vw, 4.2rem);
  font-weight: var(--fw-800);
  font-style: italic;
  letter-spacing: -0.5px;
  margin-top: 4px;
  background: linear-gradient(90deg, #00d4ff 0%, #4de8ff 25%, #00d4ff 50%, #0099cc 75%, #00d4ff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 6px rgba(0,212,255,0.18));
  animation: heroReveal 0.9s cubic-bezier(0.22,1,0.36,1) 0.6s forwards,
             shimmer 4s linear 1.5s infinite;
  opacity: 0;
  transform: translateY(20px);
}
```

---

### 1.6 css/layout.css — HERO CONTENT POSITION

ZASTĄP:
```css
.hero-carousel__content {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  pointer-events: auto;
  max-width: 520px;
  padding-right: 24px;
}
```

NA:
```css
.hero-carousel__content {
  position: absolute;
  left: 0;
  top: 32%;
  transform: translateY(0);
  z-index: 2;
  pointer-events: auto;
  max-width: 520px;
  padding-right: 24px;
}
```

---

### 1.7 css/layout.css — HERO BADGE

ZASTĄP margin-bottom w `.hero__badge`:
```css
  margin-bottom: 20px;  /* Było 28px */
```

---

### 1.8 css/layout.css — HERO DESC (KONTRAST)

ZASTĄP kolor:
```css
  color: rgba(255,255,255,0.55);  /* Było 0.35 */
```

---

### 1.9 css/layout.css — BOTTOM FADE

ZASTĄP:
```css
.hero-carousel__bottom-fade {
  height: 120px;  /* Było 160px */
}
```

---

### 1.10 css/layout.css — LITERÓWKA

ZASTĄP:
```css
  pointer-evenst: none;
```
NA:
```css
  pointer-events: none;
```

---

### 1.11 css/layout.css — SCROLL HINT

ZASTĄP kolor:
```css
.hero-carousel__scroll-hint span {
  color: rgba(255,255,255,0.45);  /* Było 0.25 */
}
```

---

## Weryfikacja po TURZE 1
- [ ] Tło pokazuje więcej kontekstu (mniej zoomu)
- [ ] Tytuł jest czytelny, nie zlewa się, dobra wielkość
- [ ] Pierścień jest mniejszy i niżej
- [ ] Overlay nie przyciemnia za dużo tła
- [ ] Literówka poprawiona
