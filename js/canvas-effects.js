/* ========== RIPPLE EFFECT ON CLICK ========== */
const RippleFX = {
  init() {
    document.addEventListener('click', e => {
      this.create(e.clientX, e.clientY);
    });
  },
  create(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:0; height:0; border-radius:50%;
      border:2px solid rgba(0,212,255,0.5);
      pointer-events:none; z-index:9999;
      transform:translate(-50%,-50%);
      animation:ripple-expand 0.8s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  }
};

// Add ripple keyframe dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple-expand {
    to { width:300px; height:300px; opacity:0; border-width:0; }
  }
`;
document.head.appendChild(rippleStyle);
