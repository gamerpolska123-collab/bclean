# PROMPT — NAPRAWA BARTEKCLEAN

Wykonaj poniższe zmiany w projekcie strony BartekClean. Zacznij od TURY 1, potem TURA 2, 3, 4. Po każdej turze zweryfikuj zmiany.

## Kontekst
Strona firmy BartekClean (mycie ciśnieniowe) ma sekcję hero z canvas carousel (pierścień zdjęć na dole + tło). Główne problemy to: za duży zoom tła, za duży/nieestetyczny tytuł "BartekClean", pierścień za duży/za wysoko, słaby kontrast tekstu, brak animacji reveal, duplikaty CSS, bugi JS.

## Pliki do zmiany
- `js/hero-carousel.js` — tło, pierścień, overlay, autoplay
- `css/layout.css` — tytuł, pozycja, badge, desc, bottom fade, literówka
- `css/animations.css` — reveal klasy
- `css/components.css` — duplikaty carousel, przyciski
- `js/canvas-effects.js` — wyłączenie ripple
- `js/interactions.js` — magnetic buttons, form handler
- `js/scroll-effects.js` — parallax fix
- `index.html` — SEO, lazy loading, aria, form action

## INSTRUKCJA KROK PO KROKU

### KROK 1: TŁO I PIERŚCIEŃ (js/hero-carousel.js)
1. W `drawCover`: dodaj padding 10% (`const pad = 0.10`), zmniejsz zoom transition do 1.5%
2. W `drawRing`: `cy = this.H * 1.42`, `outerR = min(W,H) * 0.48`, `innerR = outerR * 0.50`, clip od `H * 0.55`, `coverH = (outerR - innerR) * 1.25`
3. W `draw`: overlay gradient do `W * 0.40` zamiast `0.55`
4. Zmień `autoplayInterval` z 3000 na 5000

### KROK 2: TYTUŁ I POZYCJA (css/layout.css)
1. `.hero-carousel__content`: `top: 32%`, `transform: translateY(0)`
2. `.hero-title__word--1`: `clamp(2.2rem, 5vw, 3.8rem)`, `letter-spacing: -1px`, `line-height: 1.12` (w kontenerze), usunąć `margin-top: -4px`
3. `.hero-title__word--2`: `clamp(2.4rem, 5.5vw, 4.2rem)`, `margin-top: 4px`, uprościć drop-shadow
4. `.hero__badge`: `margin-bottom: 20px`
5. `.hero-carousel__desc`: `color: rgba(255,255,255,0.55)`
6. `.hero-carousel__bottom-fade`: `height: 120px`
7. Popraw `pointer-evenst` na `pointer-events`
8. `.hero-carousel__scroll-hint span`: `color: rgba(255,255,255,0.45)`

### KROK 3: ANIMACJE REVEAL (css/animations.css)
Dodaj na końcu: `.reveal`, `.reveal--left`, `.reveal--right`, `.reveal--delay-1/2/3/4` z opacity/transform transitions.

### KROK 4: CSS DUPLIKATY (css/components.css)
Usuń drugi zestaw definicji `.carousel` (ten z `/* ========== CAROUSEL 1: 3D COVERFLOW */`).

### KROK 5: JS BUGI
- `js/canvas-effects.js`: wyłącz RippleFX (pusty init)
- `js/interactions.js`: MagneticButtons — użyj dataset.magnetic zamiast nadpisywać transform
- `js/scroll-effects.js`: Parallax — popraw formułę offsetu
- `js/interactions.js`: FormHandler — dodaj walidację telefonu i komentarz o backendzie

### KROK 6: HTML (index.html)
- Dodaj OG tags, Twitter Card, canonical
- Dodaj Schema.org LocalBusiness JSON-LD
- Canvas: dodaj `role="img"` i `aria-label`
- Nav: dodaj `aria-label`
- Header: dodaj `role="banner"`
- Wszystkie obrazy poza hero: dodaj `loading="lazy"`
- Form: dodaj `action` i honeypot `_gotcha`

## KRYTERIA SUKCESU
- Tło hero pokazuje pełną scenę (buty + wąż + kostka + kontekst), nie tylko zbliżenie
- Tytuł "BartekClean" jest czytelny, elegancki, dobrze umiejscowiony (nie koliduje z pierścieniem)
- Pierścień jest dekoracyjnym akcentem na dole, nie dominuje
- Tekst "MYCIE CIŚNIENIOWE" jest dobrze widoczny
- Sekcje pojawiają się z animacją przy scrollowaniu
- Brak irytujących efektów (ripple)
- Formularz ma podstawową walidację
- Strona ma podstawowe SEO
