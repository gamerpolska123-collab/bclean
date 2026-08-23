/* ========== BARTEKCLEAN - MAIN INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[BartekClean] DOM ready, initializing...');

  // Loader first
  Loader.init();

  // Effects
  RippleFX.init();

  // Scroll effects
  ScrollProgress.init();
  HeaderScroll.init();
  RevealOnScroll.init();
  Parallax.init();
  CounterAnim.init();
  LogoMorph.init();

  // Interactions
  MobileMenu.init();
  SmoothScroll.init();
  FormHandler.init();
  MagneticButtons.init();

  console.log('%c BartekClean ', 'background:linear-gradient(135deg,#00d4ff,#0099cc);color:#070b14;padding:8px 16px;border-radius:8px;font-weight:700;font-size:14px;');
  console.log('%c Full-Screen Canvas Hero | Ring Carousel | Reveal FX ', 'color:#00d4ff;font-weight:600;');
});
