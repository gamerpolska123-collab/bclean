# AUDYT BARTEKCLEAN — PEŁNA ANALIZA PROJEKTU

## 1. HERO SECTION (NAJWIĘKSZE PROBLEMY)

### 1.1 Tło — ZBYT DUŻY ZOOM
**Plik:** `js/hero-carousel.js` (drawCover)
**Problem:** Funkcja `drawCover` używa logiki `object-fit: cover`, która zawsze wypełnia cały ekran. Wysokie obrazy (portretowe proporcje) są mocno przycinane — na filmie widać tylko buty i wąż, zero kontekstu (brak widoku całej sceny mycia). 
**Skutek:** Użytkownik nie widzi co się dzieje na zdjęciu. Wygląda to jak przypadkowy crop.
**Rozwiązanie:** Dodać padding ~8-10% do drawCover lub użyć `object-fit: contain` z ciemnym tłem wypełniającym.

### 1.2 Napis "BartekClean" — ZA DUŻY, ZŁA POZYCJA, NIEESTETYCZNY
**Plik:** `css/layout.css`
**Problemy:**
- `font-size: clamp(3.2rem, 7vw, 6rem)` — na ekranie 1920px to ~6rem (96px). Przy długim słowie "BartekClean" zajmuje prawie całą szerokość ekranu.
- `letter-spacing: -4px` — litery zlewają się ze sobą, szczególnie w "Bartek".
- `line-height: 0.9` + `margin-top: -4px` — "Bartek" i "Clean" nachodzą na siebie, tworząc jeden zlepek zamiast dwóch wyraźnych linii.
- Pozycja `left: 0`, `top: 50%` — tekst jest zbyt nisko, koliduje z pierścieniem na dole.
- "Clean" ma `font-style: italic` + gradient + drop-shadow — efektów jest za dużo, wygląda to jak z lat 2000.
- `text-shadow` na "Bartek" ma 3 warstwy — przesada.

**Skutek:** Tytuł wygląda jak z szablonu Canvy z 2015 roku. Nie pasuje do profesjonalnej firmy czyszczącej.
**Rozwiązanie:** Zmniejszyć do `clamp(2.4rem, 5vw, 4rem)`, zwiększyć `line-height` do ~1.15, usunąć `margin-top: -4px`, przesunąć wyżej (`top: 35-40%`), uprościć efekty.

### 1.3 Pierścień (Ring) — ZA DUŻY, ZA WYSOKO
**Plik:** `js/hero-carousel.js` (drawRing)
**Problemy:**
- `outerR = Math.min(this.W, this.H) * 0.70` — 70% mniejszego wymiaru ekranu. Na Full HD to ~500px promień, czyli pierścień ma ~1000px średnicy.
- `cy = this.H + this.H * 0.30` — środek pierścienia jest na 130% wysokości ekranu, ale przy promieniu 500px wchodzi on na ~80% wysokości ekranu (130% - 50% = 80%).
- Clip zaczyna się od `this.H * 0.35` — pierścień jest widoczny od 35% wysokości ekranu, zajmuje ~65% dolnej części.
- `innerR = outerR * 0.40` — zbyt małe, segmenty są wąskie i rozciągnięte.
- `coverH = (outerR - innerR) * 1.6` — obrazy w segmentach są rozciągnięte poza proporcje.
- Obrazy w segmentach są obracane o `midA + Math.PI / 2` — niektóre segmenty pokazują obrazy pod dziwnym kątem.

**Skutek:** Pierścień zasłania prawie cały dolny obszar hero. Wygląda to jak bałagan, a nie jak elegancki element dekoracyjny.
**Rozwiązanie:** Zmniejszyć `outerR` do ~45-50%, obniżyć `cy` do ~140-145%, zacząć clip od ~55-60%, zwiększyć `innerR` do ~50% outerR.

### 1.4 Overlay — ZA SZEROKI
**Plik:** `js/hero-carousel.js` (draw)
**Problem:** Gradient overlay `this.W * 0.55` rozciąga się na 55% szerokości ekranu. Przyciemnia za dużo tła po lewej stronie.
**Skutek:** Tło wygląda na ciemniejsze niż jest w rzeczywistości, tracimy detale.
**Rozwiązanie:** Zmniejszyć do `this.W * 0.40`.

### 1.5 Bottom Fade — ZA WYSOKI
**Plik:** `css/layout.css`
**Problem:** `height: 160px` — gradient przejścia na dół jest zbyt agresywny.
**Skutek:** Dolna część hero jest mocno przyciemniona, pierścień jest jeszcze bardziej zdominowany przez ciemność.
**Rozwiązanie:** Zmniejszyć do `100-120px`.

### 1.6 Literówka
**Plik:** `css/layout.css`
**Problem:** `.hero-carousel__inner { pointer-evenst:none; }`
**Skutek:** Brak — przeglądarki ignorują nieznane właściwości, ale to sygnał braku dbałości o szczegóły.

---

## 2. TYPOGRAFIA I HIERARCHIA

### 2.1 Badge "KOSTRZYN NAD ODRĄ"
**Plik:** `css/layout.css`
**Problemy:**
- `margin-bottom: 28px` — za duży odstęp od tytułu.
- `padding: 8px 18px` — za duży względem małej treści.
- `letter-spacing: 3px` — przy małym foncie (0.68rem) wygląda to jak kropki zamiast liter.

### 2.2 Opis "MYCIE CIŚNIENIOWE"
**Plik:** `css/layout.css`
**Problem:** `color: rgba(255,255,255,0.35)` — kontrast 2.8:1, poniżej standardu WCAG AA (4.5:1).
**Skutek:** Tekst jest prawie niewidoczny, szczególnie na jasniejszych fragmentach tła.

### 2.3 Scroll Hint
**Plik:** `css/layout.css`
**Problem:** `color: rgba(255,255,255,0.25)` — prawie niewidoczne.

### 2.4 Przyciski
**Plik:** `css/components.css`
**Problem:** `font-size: 0.75rem` przy ogromnym tytule — przyciski wyglądają jak mikroskopijne.

---

## 3. CSS — STRUKTURA I BŁĘDY

### 3.1 Zduplikowane definicje carousel
**Plik:** `css/components.css`
**Problem:** Klasy `.carousel`, `.carousel__track`, `.carousel__slide`, `.carousel__nav`, `.carousel__dot`, `.carousel__arrow` są zdefiniowane DWUKROTNIE w tym samym pliku (linie ~350 i ~420). Drugi zestaw nadpisuje pierwszy z większymi wartościami.
**Skutek:** Nieprzewidywalne zachowanie, trudność w debugowaniu.

### 3.2 Brak reveal animacji w CSS
**Plik:** `css/animations.css`
**Problem:** Klasy `.reveal`, `.reveal--left`, `.reveal--right`, `.reveal--delay-*` są używane w HTML, ale NIE SĄ zdefiniowane w CSS.
**Skutek:** Elementy sekcji "O nas", "Oferta", "Realizacje" nie mają animacji wejścia.

### 3.3 Magnetic Buttons nadpisują CSS hover
**Plik:** `js/interactions.js`
**Problem:** `btn.style.transform = translate(...)` nadpisuje `transform` z CSS hover (`translateY(-2px)`).
**Skutek:** Przyciski nie podskakują na hover, tylko się przesuwają.

---

## 4. JAVASCRIPT — BUGI I PERFORMANCE

### 4.1 Brak obsługi błędów w canvas
**Plik:** `js/hero-carousel.js`
**Problem:** Jeśli `getContext('2d')` zwróci null (tryb oszczędzania energii na iOS, starsze przeglądarki), cały hero się zawiesi.

### 4.2 Autoplay za szybki
**Plik:** `js/hero-carousel.js`
**Problem:** `autoplayInterval = 3000` — 3 sekundy to za mało, by przeczytać tekst i zaobserwować tło.

### 4.3 Brak lazy loading obrazów
**Plik:** `index.html`
**Problem:** Wszystkie obrazy w sekcjach poniżej folda ładują się od razu.

### 4.4 RippleFX na całej stronie
**Plik:** `js/canvas-effects.js`
**Problem:** Efekt ripple na KAŻDY click w dowolnym miejscu strony. Przeszkadza w użytkowaniu, szczególnie na mobile.

### 4.5 Parallax bug
**Plik:** `js/scroll-effects.js`
**Problem:** `const offset = (scrollY - rect.top + window.innerHeight) * speed;` — formuła jest błędna, powinno być `rect.top` zamiast `scrollY - rect.top + window.innerHeight`.

---

## 5. HTML I SEO

### 5.1 Brak Schema.org
**Plik:** `index.html`
**Problem:** Brak structured data dla LocalBusiness.

### 5.2 Brak Open Graph
**Plik:** `index.html`
**Problem:** Brak `og:title`, `og:description`, `og:image`.

### 5.3 Brak `loading="lazy"`
**Plik:** `index.html`
**Problem:** Obrazy w galerii i kartach nie mają lazy loading.

### 5.4 Formularz bez action
**Plik:** `index.html`
**Problem:** Formularz nie ma `action` ani `method`. JS tylko pokazuje komunikat, ale dane nigdzie nie idą.

### 5.5 Brak aria-label na canvas
**Plik:** `index.html`
**Problem:** Canvas hero nie ma `aria-label` ani `role="img"`.

---

## 6. RESPONSIVE

### 6.1 Mobile hero title
**Plik:** `css/responsive.css`
**Problem:** `font-size: clamp(2.4rem, 10vw, 3.5rem)` wciąż jest za duży na mobile. Przy 375px to ~2.4rem (38px), ale przy `letter-spacing: -2px` nadal wygląda ściśnięcie.

### 6.2 Mobile menu
**Plik:** `css/responsive.css`
**Problem:** Menu mobilne pojawia się dopiero przy `max-width: 1024px`. Na tabletach (np. iPad 820px) menu desktopowe jest zbyt szerokie.

---

## PODSUMOWANIE PRIORYTETÓW

| Priorytet | Problem | Plik |
|-----------|---------|------|
| 🔴 P0 | Tło za mocno przycięte (zoom) | `js/hero-carousel.js` |
| 🔴 P0 | Tytuł za duży, zła pozycja, nieestetyczny | `css/layout.css` |
| 🔴 P0 | Pierścień za duży, za wysoko | `js/hero-carousel.js` |
| 🟡 P1 | Overlay za szeroki | `js/hero-carousel.js` |
| 🟡 P1 | Brak animacji reveal | `css/animations.css` |
| 🟡 P1 | Duplikaty CSS carousel | `css/components.css` |
| 🟡 P1 | Kontrast opisu za słaby | `css/layout.css` |
| 🟢 P2 | Brak SEO / OG | `index.html` |
| 🟢 P2 | Brak lazy loading | `index.html` |
| 🟢 P2 | RippleFX przeszkadza | `js/canvas-effects.js` |
| 🟢 P2 | Formularz bez backendu | `index.html` + `js/interactions.js` |
