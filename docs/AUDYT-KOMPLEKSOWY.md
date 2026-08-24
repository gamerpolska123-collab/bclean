# AUDYT KOMPLEKSOWY — BARTEKCLEAN

> Data: 2026-08-23
> Autor: AI Audit
> Wersja: 1.0

---

## SPIS TREŚCI
1. [Architektura i struktura plików](#1-architektura-i-struktura-plików)
2. [HTML / SEO / Dostępność](#2-html--seo--dostępność)
3. [CSS Audyt](#3-css-audyt)
4. [JavaScript Audyt](#4-javascript-audyt)
5. [Performance / Web Vitals](#5-performance--web-vitals)
6. [Bezpieczeństwo i Prawne (UE / RODO)](#6-bezpieczeństwo-i-prawne-ue--rodo)
7. [UX / Design](#7-ux--design)
8. [Propozycje Zaawansowane](#8-propozycje-zaawansowane-premium-look)
9. [Lista plików do usunięcia](#9-lista-plików-do-usunięcia)
10. [Nowa struktura plików](#10-nowa-struktura-plików)

---

## 1. ARCHITEKTURA I STRUKTURA PLIKÓW

### Obecny stan
```
bclean/
├── .idea/                    ← ❌ ŚMIECI IDE (4 pliki)
├── css/                      ← ✅ Dobry podział modułowy
│   ├── main.css              ← ✅ Entry point
│   ├── variables.css         ← ✅ Design tokens
│   ├── base.css              ← ✅ Reset + utilities
│   ├── layout.css            ← ⚠️ Za duży (13.4KB), mieszane odpowiedzialności
│   ├── components.css        ← ⚠️ Duplikaty carousel (martwy kod)
│   ├── animations.css        ← ✅ OK
│   ├── responsive.css        ← ✅ OK
│   └── canvas.css            ← ✅ OK
├── js/                       ← ❌ KATASTROFA — 27 plików, 21 martwych
│   ├── (używane: 6)
│   └── (martwe: 21)         ← ❌ Żaden nie jest załadowany w index.html
├── media/                    ← ⚠️ 13 plików, 4 nieużywane (20MB!)
├── index.html                ← ⚠️ 17KB, do poprawy
├── docker-compose.yml        ← ✅ Minimalny, OK
├── nginx.conf                ← ⚠️ Można scalić z proxy
├── nginx-proxy.conf          ← ⚠️ Nadmiarowy
├── nginx-web.conf            ← ⚠️ Nadmiarowy
├── AUDYT.md                  ← ❌ Stary audyt
├── PROMPT.md                 ← ❌ Stary prompt
├── TURA-1.md .. TURA-4.md   ← ❌ Stara dokumentacja zmian
└── .git/                     ← ✅ Standardowe
```

### Wykryte problemy strukturalne

| # | Problem | Waga | Plik(i) |
|---|---------|------|---------|
| 1 | **21 martwych plików JS** (~170KB) | 🔴 Krytyczna | `js/carousel-*.js` |
| 2 | **4 nieużywane obrazy 20MB** | 🔴 Krytyczna | `media/realizacja-*.jpg` |
| 3 | **Pliki IDE w repo** | 🟡 Średnia | `.idea/*` |
| 4 | **Stara dokumentacja w repo** | 🟡 Średnia | `AUDYT.md`, `PROMPT.md`, `TURA-*.md` |
| 5 | **3 pliki nginx zamiast 1** | 🟢 Niska | `nginx-*.conf` |
| 6 | **Brak .gitignore** | 🟡 Średnia | root |

---

## 2. HTML / SEO / DOSTĘPNOŚĆ

### 🔴 Krytyczne

| Problem | Lokalizacja | Opis |
|---------|-------------|------|
| **Brak H1** | Hero section | Główny tytuł to `<div>`, nie `<h1>`. Google nie widzi głównej frazy. |
| **Fake numer telefonu** | `tel:+48123456789` | Placeholder z szablonu. Klient nie może zadzwonić. |
| **Fake email** | `mailto:kontakt@bartekclean.pl` | Prawdopodobnie nieaktywny. |
| **Nieaktywny formularz** | Form action | `https://formspree.io/f/YOUR_FORM_ID` — formularz nie działa. |
| **Brak favicon** | `<head>` | Brak `favicon.ico`, `apple-touch-icon`, `manifest.json`. |
| **Puste `alt=""`** | Header + Hero | Screenreadery pomijają obraz bez opisu. |

### 🟡 Średnie

| Problem | Lokalizacja | Opis |
|---------|-------------|------|
| **Brak Skip Link** | Body start | Brak linku „Przejdź do treści” dla screenreaderów. |
| **Brak `aria-expanded`** | Mobile menu | `.menu-toggle` nie sygnalizuje stanu menu. |
| **Brak `aria-current="page"`** | Nawigacja | Aktywny link nie jest oznaczony. |
| **Canvas bez fallback** | Hero | Tylko tekst „Twoja przeglądarka nie obsługuje Canvas”. |
| **Brak `width`/`height` na img** | Wiele | CLS — obrazy skaczą podczas ładowania. |
| **Brak `fetchpriority="high"`** | Hero images | LCP nie jest priorytetowany. |

### 🟢 Niskie

- Brak breadcrumb schema
- Brak FAQ schema
- Brak Service schema
- Brak `og:locale`
- Brak Twitter site

---

## 3. CSS AUDYT

### 🔴 Krytyczne

| Problem | Plik | Opis |
|---------|------|------|
| **Duplikaty carousel** | `components.css` | Martwe definicje `.carousel-3d` itp. (~3KB). |
| **Niespójne breakpointy** | `responsive.css` vs `layout.css` | Część mediów w `layout.css`, część w `responsive.css`. |
| **Brak `prefers-reduced-motion`** | `animations.css` | Wszystkie animacje działają mimo ustawień użytkownika. |

### 🟡 Średnie

| Problem | Plik | Opis |
|---------|------|------|
| **Za długi `layout.css`** | `layout.css` | 13.4KB — zawiera header, hero, about, services, gallery, contact, footer. |
| **Magic numbers** | `layout.css` | Wiele wartości w px zamiast tokenów. |
| **Brak container queries** | Wszystkie | Tylko media queries. |
| **Nieoptymalne selektory** | `layout.css` | 7 poziomów zagnieżdżenia. |

---

## 4. JAVASCRIPT AUDYT

### 🔴 Krytyczne

| Problem | Plik | Opis |
|---------|------|------|
| **Błąd runtime** | `scroll-effects.js` | `ScrollProgress.update()` odwołuje się do `this.elements`, ale `init()` nie inicjalizuje tej tablicy. |
| **Brak polyfill** | `scroll-effects.js` | Na starszych Safari strona się zawiesza. |
| **Canvas performance** | `hero-carousel.js` | Cały ekran canvas 60fps na mobile = drain baterii. |
| **Brak debounce** | `hero-carousel.js` | `resize` event może spamować. |

### 🟡 Średnie

| Problem | Plik | Opis |
|---------|------|------|
| **Pusty stub** | `canvas-effects.js` | Plik istnieje tylko po to, by `main.js` nie wywalał błędu. |
| **Brak error handling** | `interactions.js` | `alert()` — antypattern UX. |
| **Brak lazy-init** | `hero-carousel.js` | Ładuje wszystkie obrazy natychmiast. |
| **Memory leak** | `interactions.js` | Event listenery nie są usuwane. |

---

## 5. PERFORMANCE / WEB VITALS

| Metryka | Obecny stan | Cel | Problem |
|---------|-------------|-----|---------|
| **LCP** | ~2.5-4s | <2.5s | Hero canvas + brak preload. |
| **CLS** | ~0.15 | <0.1 | Brak `width`/`height` na `<img>`. |
| **TBT** | ~200ms | <200ms | JS parsuje 27 plików. |
| **INP** | Średni | Szybki | Canvas hero blokuje główny wątek. |
| **Rozmiar** | ~25MB | <3MB | 4 nieużywane obrazy 20MB + 21 martwych JS. |

---

## 6. BEZPIECZEŃSTWO I PRAWNE (UE / RODO)

| Problem | Waga | Opis |
|---------|------|------|
| **Brak Cookie Consent** | 🔴 Krytyczna | Wymagane w UE. |
| **Brak Polityki Prywatności** | 🔴 Krytyczna | Formularz zbierający dane wymaga polityki RODO. |
| **Brak checkboxa RODO** | 🔴 Krytyczna | Formularz wysyła dane bez zgody. |
| **Brak SSL redirect** | 🟡 Średnia | Nginx nie wymusza HTTPS. |
| **Brak Security Headers** | 🟡 Średnia | Brak CSP, X-Frame-Options itp. |

---

## 7. UX / DESIGN

| Element | Problem | Propozycja |
|---------|---------|------------|
| **Hero** | Canvas z pierścieniem wygląda jak demo techniczne. | Statyczne zdjęcie „przed/po” z overlay. |
| **Emoji w sekcji „Dlaczego my?”** | `⚡ 🛡️ 🚚 💎` wyglądają jak z Facebooka 2010. | Custom SVG ikony. |
| **Emoji w kontakcie** | `📍 📞 ✉️ 🌐` | Ikony SVG w kolorze akcentu. |
| **Formularz** | Brak walidacji inline, brak stanu „wysyłam”. | Full UX: walidacja, spinner, toast. |
| **„Zadzwoń teraz”** | Fake numer. | Prawdziwy numer lub ukryć. |
| **Footer** | Tylko 1 linia. | Mapa, godziny, social media. |
| **Brak CTA sticky** | Na mobile brak przycisku „Zadzwoń”. | Fixed bottom CTA. |
| **Brak galerii „przed/po”** | Sekcja realizacje bez interaktywnego porównania. | Slider „przed/po”. |

---

## 8. PROPozycje ZAAWANSOWANE (Premium Look)

### A. Animacje i Mikrointerakcje
1. **Text reveal z maską** — `clip-path: inset()`
2. **Smooth scroll z Lenis**
3. **Parallax na zdjęciach**
4. **Magnetic buttons v2** — z `requestAnimationFrame`
5. **Number counter with easing**

### B. Komponenty
1. **Before/After Slider**
2. **Sticky Services**
3. **Testimonials carousel**
4. **FAQ Accordion** (schema.org FAQPage)
5. **Live Chat / WhatsApp**

### C. Techniczne
1. **Vite build system**
2. **Image optimization pipeline** (WebP/AVIF)
3. **Critical CSS inline**
4. **Partytown** (trackery w web workerach)
5. **SSG** (Astro / 11ty)

### D. Marketing / Konwersja
1. **Google Reviews widget**
2. **Lead magnet**
3. **Exit-intent popup**
4. **Re-captcha v3**
5. **Thank you page** z trackingiem

---

## 9. LISTA PLIKÓW DO USUNIĘCIA

```
❌ .idea/                           → 4 pliki IDE
❌ .idea/.gitignore
❌ .idea/bartekclean.iml
❌ .idea/modules.xml
❌ .idea/vcs.xml

❌ js/carousel.js
❌ js/carousel-fade.js
❌ js/carousel-stack.js
❌ js/carousel-strip.js
❌ js/carousel-1-elegant.js
❌ js/carousel-1-kenburns.js
❌ js/carousel-1-liquid.js
❌ js/carousel-2-cube.js
❌ js/carousel-2-glitch.js
❌ js/carousel-2-inkripple.js
❌ js/carousel-3-cylinder.js
❌ js/carousel-3-magazine.js
❌ js/carousel-3-parallax.js
❌ js/carousel-4-lightsweep.js
❌ js/carousel-4-magazine.js
❌ js/carousel-4-water.js
❌ js/carousel-5-ring.js
❌ js/carousel-canvas-coverflow.js
❌ js/carousel-canvas-cylinder.js
❌ js/carousel-canvas-particles.js
❌ js/carousel-canvas-wave.js

❌ media/realizacja-1.jpg          → 4.1MB, nieużywany
❌ media/realizacja-2.jpg          → 4.5MB, nieużywany
❌ media/realizacja-3.jpg          → 6.2MB, nieużywany
❌ media/realizacja-4.jpg          → 5.9MB, nieużywany
❌ media/logo.png                  → 41KB, nieużywany

❌ nginx-proxy.conf                → Nadmiarowy
❌ nginx-web.conf                  → Nadmiarowy

❌ AUDYT.md                        → Stary audyt
❌ PROMPT.md                       → Stary prompt
❌ TURA-1.md
❌ TURA-2.md
❌ TURA-3.md
❌ TURA-4.md

RAZEM DO USUNIĘCIA: 38 plików (~21.5MB)
```

---

## 10. NOWA STRUKTURA PLIKÓW

```
bclean/
├── .gitignore
├── README.md
├── docker-compose.yml
├── nginx.conf                    ← SCALONY
├── src/
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── 0-variables.css
│   │   ├── 1-base.css
│   │   ├── 2-layout.css
│   │   ├── 3-components.css
│   │   ├── 4-animations.css
│   │   ├── 5-responsive.css
│   │   └── 6-canvas.css
│   ├── js/
│   │   ├── main.js
│   │   ├── hero-carousel.js
│   │   ├── scroll-effects.js
│   │   ├── interactions.js
│   │   └── utils.js            ← NOWY
│   └── media/
│       ├── favicon/
│       ├── logo-icon.png
│       ├── logo-icon.svg
│       └── (optymalizowane)
└── docs/
    ├── AUDYT-KOMPLEKSOWY.md
    ├── CHECKLIST.md
    └── CHANGELOG.md
```
