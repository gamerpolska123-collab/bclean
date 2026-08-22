/* ========== STACK CARD CAROUSEL ========== */
class CarouselStack {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;
    this.track = this.container.querySelector('.carousel-stack__track');
    this.cards = Array.from(this.container.querySelectorAll('.carousel-stack__card'));
    this.current = 0;
    this.autoplayInterval = null;
    this.init();
  }

  init() {
    this.createControls();
    this.update();
    this.startAutoplay();
    this.bindEvents();
  }

  createControls() {
    const controls = document.createElement('div');
    controls.className = 'carousel-stack__controls';

    const prev = document.createElement('button');
    prev.className = 'carousel-stack__btn carousel-stack__btn--prev';
    prev.innerHTML = '‹';
    prev.addEventListener('click', () => this.prev());

    const next = document.createElement('button');
    next.className = 'carousel-stack__btn carousel-stack__btn--next';
    next.innerHTML = '›';
    next.addEventListener('click', () => this.next());

    controls.appendChild(prev);
    controls.appendChild(next);
    this.container.appendChild(controls);
  }

  update() {
    this.cards.forEach((card, i) => {
      card.classList.remove('active', 'next', 'prev', 'hidden');
      const diff = i - this.current;
      if (diff === 0) {
        card.classList.add('active');
        card.style.transform = 'translateX(-50%) translateY(0) scale(1)';
        card.style.zIndex = 10;
        card.style.opacity = 1;
        card.style.filter = 'brightness(1)';
      } else if (diff === 1 || (diff === -(this.cards.length - 1))) {
        card.classList.add('next');
        card.style.transform = 'translateX(20%) translateY(-30px) scale(0.85)';
        card.style.zIndex = 5;
        card.style.opacity = 0.6;
        card.style.filter = 'brightness(0.6)';
      } else if (diff === -1 || (diff === (this.cards.length - 1))) {
        card.classList.add('prev');
        card.style.transform = 'translateX(-120%) translateY(-30px) scale(0.85)';
        card.style.zIndex = 5;
        card.style.opacity = 0.6;
        card.style.filter = 'brightness(0.6)';
      } else {
        card.classList.add('hidden');
        card.style.transform = 'translateX(-50%) translateY(0) scale(0.7)';
        card.style.zIndex = 0;
        card.style.opacity = 0;
      }
    });
  }

  next() {
    this.current = (this.current + 1) % this.cards.length;
    this.update();
    this.resetAutoplay();
  }

  prev() {
    this.current = (this.current - 1 + this.cards.length) % this.cards.length;
    this.update();
    this.resetAutoplay();
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => this.next(), 4000);
  }

  resetAutoplay() {
    clearInterval(this.autoplayInterval);
    this.startAutoplay();
  }

  bindEvents() {
    this.container.addEventListener('mouseenter', () => clearInterval(this.autoplayInterval));
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
  }
}
