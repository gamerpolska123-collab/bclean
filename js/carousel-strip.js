/* ========== INFINITE STRIP CAROUSEL ========== */
class CarouselStrip {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;
    this.track = this.container.querySelector('.carousel-strip__track');
    this.items = Array.from(this.container.querySelectorAll('.carousel-strip__item'));
    this.speed = parseFloat(this.container.dataset.speed) || 0.5;
    this.direction = parseFloat(this.container.dataset.direction) || -1;
    this.position = 0;
    this.paused = false;
    this.init();
  }

  init() {
    // Clone items for seamless loop
    this.items.forEach(item => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });
    this.animate();
    this.bindEvents();
  }

  animate() {
    if (!this.paused) {
      this.position += this.speed * this.direction;
      const firstItem = this.track.children[0];
      const itemWidth = firstItem.offsetWidth + 24; // gap
      if (Math.abs(this.position) >= itemWidth * this.items.length) {
        this.position = 0;
      }
      this.track.style.transform = `translateX(${this.position}px)`;
    }
    requestAnimationFrame(() => this.animate());
  }

  bindEvents() {
    this.container.addEventListener('mouseenter', () => this.paused = true);
    this.container.addEventListener('mouseleave', () => this.paused = false);
  }
}
