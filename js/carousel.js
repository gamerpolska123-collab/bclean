/* ========== 3D CAROUSEL ========== */
class Carousel3D {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;
    this.track = this.container.querySelector('.carousel__track');
    this.slides = Array.from(this.container.querySelectorAll('.carousel__slide'));
    this.dots = [];
    this.current = 0;
    this.autoplayInterval = null;
    this.touchStartX = 0;
    this.init();
  }

  init() {
    this.createDots();
    this.createArrows();
    this.update();
    this.startAutoplay();
    this.bindEvents();
  }

  createDots() {
    const nav = document.createElement('div');
    nav.className = 'carousel__nav';
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      nav.appendChild(dot);
      this.dots.push(dot);
    });
    this.container.appendChild(nav);
  }

  createArrows() {
    const prev = document.createElement('button');
    prev.className = 'carousel__arrow carousel__arrow--prev';
    prev.innerHTML = '‹';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.addEventListener('click', () => this.prev());

    const next = document.createElement('button');
    next.className = 'carousel__arrow carousel__arrow--next';
    next.innerHTML = '›';
    next.setAttribute('aria-label', 'Next slide');
    next.addEventListener('click', () => this.next());

    this.container.appendChild(prev);
    this.container.appendChild(next);
  }

  update() {
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev', 'next', 'hidden');
      if (i === this.current) {
        slide.classList.add('active');
      } else if (i === this.getPrevIndex()) {
        slide.classList.add('prev');
      } else if (i === this.getNextIndex()) {
        slide.classList.add('next');
      } else {
        slide.classList.add('hidden');
      }
    });

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.current);
    });
  }

  getPrevIndex() {
    return (this.current - 1 + this.slides.length) % this.slides.length;
  }

  getNextIndex() {
    return (this.current + 1) % this.slides.length;
  }

  goTo(index) {
    this.current = index;
    this.update();
    this.resetAutoplay();
  }

  next() {
    this.current = this.getNextIndex();
    this.update();
    this.resetAutoplay();
  }

  prev() {
    this.current = this.getPrevIndex();
    this.update();
    this.resetAutoplay();
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => this.next(), 5000);
  }

  resetAutoplay() {
    clearInterval(this.autoplayInterval);
    this.startAutoplay();
  }

  bindEvents() {
    this.container.addEventListener('mouseenter', () => clearInterval(this.autoplayInterval));
    this.container.addEventListener('mouseleave', () => this.startAutoplay());

    this.container.addEventListener('touchstart', e => {
      this.touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.container.addEventListener('touchend', e => {
      const diff = this.touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
      }
    }, { passive: true });
  }
}
