/* ========== BARTEKCLEAN - MAIN INIT v2 ========== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[BartekClean] DOM ready, initializing...');
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  }



  // Hero Carousel
  if (document.getElementById('hero-canvas')) {
    new HeroCarousel('#hero-canvas', [
      'media/kostka-przed-po.jpg',
      'media/elewacja-mycie.jpg',
      'media/dach-mycie.jpg',
      'media/podjazd-mycie.jpg',
      'media/kostka-mycie.jpg',
      'media/elewacja-mycie2.jpg'
    ]);
  }

  // Loader first
  Loader.init();

  // Effects (Ripple disabled - stub)
  RippleFX.init();

  // Scroll effects
  ScrollProgress.init();
  HeaderScroll.init();
  RevealOnScroll.init();
  Parallax.init();
  CounterAnim.init();
  TextReveal.init();
  LogoMorph.init();

  // Interactions
  MobileMenu.init();
  SmoothScroll.init();
  FormHandler.init();
  MagneticButtons.init();
  Toast.init();


  // Lenis Smooth Scroll
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    // Integrate with GSAP ScrollTrigger if present
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  console.log('%c BartekClean ', 'background:linear-gradient(135deg,#00d4ff,#0099cc);color:#070b14;padding:8px 16px;border-radius:8px;font-weight:700;font-size:14px;');
  console.log('%c v2.0 | A11y | RODO | Performance | PWA Ready ', 'color:#00d4ff;font-weight:600;');
});
