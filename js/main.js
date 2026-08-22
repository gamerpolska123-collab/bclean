/* ========== BARTEKCLEAN - MAIN INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[BartekClean] DOM ready, initializing...');

  // Loader first
  Loader.init();

  // Canvas background effects
  CanvasFX.init();
  HeroParticles.init();
  RippleFX.init();

  // Scroll effects
  ScrollProgress.init();
  HeaderScroll.init();
  RevealOnScroll.init();
  Parallax.init();
  CounterAnim.init();

  // Interactions
  MobileMenu.init();
  SmoothScroll.init();
  FormHandler.init();
  MagneticButtons.init();

  // 4 Canvas Carousels - init when visible
  const images = ['media/kostka-przed-po.jpg','media/elewacja-mycie.jpg','media/dach-mycie.jpg','media/podjazd-mycie.jpg','media/elewacja-mycie2.jpg','media/kostka-mycie.jpg'];

  const carousels = [
    { id: 'canvas-ring', Class: CarouselRing, name: 'Ring Segments' }
  ];

  carousels.forEach(({ id, Class, name }) => {
    const canvas = document.getElementById(id);
    if (!canvas) {
      console.warn('[BartekClean] Canvas not found:', id);
      return;
    }
    if (typeof Class !== 'function') {
      console.error('[BartekClean] Class not loaded for:', name);
      return;
    }

    const initCarousel = () => {
      try {
        new Class('#' + id, images);
        console.log(`[BartekClean] ${name} initialized OK`);
      } catch (err) {
        console.error(`[BartekClean] ${name} init error:`, err);
      }
    };

    const rect = canvas.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
      initCarousel();
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            initCarousel();
            observer.disconnect();
          }
        });
      }, { threshold: 0.05, rootMargin: '200px' });
      observer.observe(canvas);
    }
  });

  console.log('%c BartekClean ', 'background:linear-gradient(135deg,#00d4ff,#0099cc);color:#070b14;padding:8px 16px;border-radius:8px;font-weight:700;font-size:14px;');
  console.log('%c 4 Canvas Karuzele | Particle System | Wave FX | 3D Cylinder ', 'color:#00d4ff;font-weight:600;');
});
