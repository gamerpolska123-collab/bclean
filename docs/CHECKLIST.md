# CHECKLIST — BARTEKCLEAN

## ✅ ZROBIONE — FAZA 1-5 KOMPLETNA

### Faza 1: Czyszczenie
- [x] Usunięto 39 zbędnych plików (21 martwych JS, 4 nieużywane obrazy 20MB, 4 pliki IDE, 3 nginx, 6 starych MD, 1 folder .idea)
- [x] Utworzono `.gitignore`
- [x] Utworzono `manifest.json` (PWA)

### Faza 2: Naprawy krytyczne
- [x] Fix `this.elements` w `scroll-effects.js` (runtime error)
- [x] Naprawa `interactions.js` (Toast, validation, RODO, Fetch API, memory leak fix)
- [x] Naprawa `hero-carousel.js` (reduced-motion, debounced resize, lazy init, mobile DPR limit)
- [x] Aktualizacja `main.js` (v2.0, Toast.init, SW register, Lenis init)

### Faza 3: Dostępność i RODO
- [x] Cookie Consent banner z localStorage
- [x] Polityka Prywatności — osobna strona, pełna zgodność RODO
- [x] Regulamin — osobna strona, kompletny
- [x] RODO checkbox w formularzu
- [x] Skip link
- [x] `aria-expanded` na menu
- [x] `prefers-reduced-motion` w CSS i JS
- [x] H1 w hero
- [x] width/height na img (CLS fix)
- [x] Poprawne alt text
- [x] `<main>`, `<article>`, `<figure>` semantyka

### Faza 4: Design / UX
- [x] SVG ikony zamiast emoji
- [x] Rozbudowany footer (4 kolumny: brand, nawigacja, kontakt, godziny)
- [x] Sticky mobile CTA
- [x] Toast notification zamiast alert()
- [x] Inline form validation z komunikatami błędów
- [x] Loading state na przycisku
- [x] Before/After slider (mouse, touch, keyboard, a11y)
- [x] WebP obrazy z `<picture>` fallback (89.5% oszczędności)
- [x] Text reveal animations (clip-path mask)
- [x] Line reveal (underline grow)

### Faza 5: Zaawansowane
- [x] **Service Worker** (PWA offline, cache-first, network-first, cache cleanup)
- [x] **Lenis smooth scroll** (CDN, 1.2s duration, custom easing, integration)
- [x] **Exit-Intent Popup** (10% rabat, mouse leave detection, Escape/overlay close, Lenis pause)
- [x] **Re-captcha v3 stub** (zakomentowany, gotowy do włączenia z SITE_KEY)
- [x] **Google Reviews widget** (3 placeholder opinii + stub API z instrukcją konfiguracji)
- [x] **Minifikacja CSS/JS** (13 plików, ~20% redukcji, .min wersje w produkcji)

## ⏳ DO UZUPEŁNIENIA PRZEZ KLIENTA
- [ ] Prawdziwy numer telefonu (obecnie +48 123 456 789)
- [ ] Prawdziwy e-mail (obecnie kontakt@bartekclean.pl)
- [ ] Formspree ID (obecnie YOUR_FORM_ID)
- [ ] NIP i REGON w polityce prywatności
- [ ] Google Places API Key + Place ID (dla dynamicznych opinii)
- [ ] Re-captcha v3 Site Key
- [ ] Prawdziwe pary obrazów "przed/po" dla slidera
- [ ] Opcjonalnie: Google Analytics (wymaga aktualizacji cookies info)

## 📊 METRYKI
- Pliki w repo: 54
- Rozmiar projektu: ~7MB (bez .git)
- WebP oszczędność: 89.5%
- Minifikacja: ~20% mniejsze pliki CSS/JS
- Martwe pliki usunięte: 39
