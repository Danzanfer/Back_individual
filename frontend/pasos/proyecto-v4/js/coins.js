const Coins = {
  INICIAL: 100,

  get() {
    const v = localStorage.getItem('coins');
    return v !== null ? parseInt(v) : this.INICIAL;
  },

  set(n) {
    localStorage.setItem('coins', Math.max(0, n));
    this._sync();
  },

  sumar(n)  { this.set(this.get() + n); },
  restar(n) { this.set(this.get() - n); },

  _sync() {
    document.querySelectorAll('[data-coins]').forEach(el => {
      el.textContent = this.get();
    });
    const badges = document.querySelectorAll('.coins-badge');
    badges.forEach(b => b.classList.toggle('low', this.get() < 20));
  },

  init() { this._sync(); }
};
