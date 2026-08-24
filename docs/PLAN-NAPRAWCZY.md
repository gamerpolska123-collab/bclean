# PLAN NAPRAWCZY — BARTEKCLEAN

> Data: 2026-08-23
> Priorytet: Krytyczne → Średnie → Niskie

---

## FAZA 1: CZYSZCZENIE (0.5h)
- [x] Usunąć 38 zbędnych plików
- [x] Dodać `.gitignore`
- [x] Scalić nginx configi
- [ ] Usunąć martwe importy/kody z CSS

## FAZA 2: NAPRAWY KRYTYCZNE (1h)
- [ ] Fix `this.elements` w `scroll-effects.js`
- [ ] Zamienić fake numer/email na prawdziwe LUB dodać komentarz `<!-- TODO: UZUPEŁNIJ -->`
- [ ] Naprawić formularz (Formspree ID lub własny backend)
- [ ] Dodać H1 w hero
- [ ] Dodać favicon
- [ ] Dodać `width`/`height` do wszystkich `<img>`

## FAZA 3: DOSTĘPNOŚĆ I RODO (1h)
- [ ] Cookie Consent banner
- [ ] Polityka prywatności
- [ ] Checkbox RODO w formularzu
- [ ] Skip link
- [ ] `aria-expanded` na menu
- [ ] `prefers-reduced-motion` w CSS i JS

## FAZA 4: DESIGN / UX (2h)
- [ ] Zamienić emoji na SVG ikony
- [ ] Nowy footer z mapą, godzinami, social
- [ ] Sticky mobile CTA
- [ ] Toast notification zamiast `alert()`
- [ ] Before/After slider w realizacjach

## FAZA 5: ZAAWANSOWANE (opcjonalnie)
- [ ] Vite + bundling
- [ ] WebP/AVIF obrazy
- [ ] Lenis smooth scroll
- [ ] Text reveal animations
- [ ] Service Worker
