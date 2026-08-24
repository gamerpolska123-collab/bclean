/* ========== BEFORE/AFTER SLIDER ========== */
class BeforeAfterSlider {
  constructor(container) {
    this.container = container;
    this.before = container.querySelector('.ba-slider__before');
    this.handle = container.querySelector('.ba-slider__handle');
    this.divider = container.querySelector('.ba-slider__divider');
    this.isDragging = false;

    if (!this.before || !this.handle) return;

    this.init();
  }

  init() {
    // Set initial position (50%)
    this.setPosition(50);

    // Mouse events
    this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
    this.container.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.stopDrag());

    // Touch events
    this.handle.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
    this.container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.onDrag(e.touches[0]);
    });
    document.addEventListener('touchend', () => this.stopDrag());

    // Click to jump
    this.container.addEventListener('click', (e) => {
      if (e.target === this.handle || e.target.closest('.ba-slider__handle')) return;
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      this.setPosition(pct);
    });

    // Keyboard
    this.handle.setAttribute('tabindex', '0');
    this.handle.setAttribute('role', 'slider');
    this.handle.setAttribute('aria-label', 'Przesuń aby zobaczyć efekt przed i po');
    this.handle.setAttribute('aria-valuemin', '0');
    this.handle.setAttribute('aria-valuemax', '100');
    this.handle.addEventListener('keydown', (e) => this.onKey(e));
  }

  startDrag(e) {
    this.isDragging = true;
    this.handle.style.cursor = 'grabbing';
  }

  onDrag(e) {
    if (!this.isDragging) return;
    const rect = this.container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const pct = (x / rect.width) * 100;
    this.setPosition(pct);
  }

  stopDrag() {
    this.isDragging = false;
    this.handle.style.cursor = 'grab';
  }

  setPosition(pct) {
    pct = Math.max(2, Math.min(98, pct));
    this.before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    this.handle.style.left = `${pct}%`;
    if (this.divider) this.divider.style.left = `${pct}%`;
    this.handle.setAttribute('aria-valuenow', Math.round(pct));
  }

  onKey(e) {
    let current = parseFloat(this.handle.getAttribute('aria-valuenow')) || 50;
    if (e.key === 'ArrowLeft') current -= 5;
    else if (e.key === 'ArrowRight') current += 5;
    else if (e.key === 'Home') current = 0;
    else if (e.key === 'End') current = 100;
    else return;
    e.preventDefault();
    this.setPosition(current);
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ba-slider').forEach(el => new BeforeAfterSlider(el));
});
