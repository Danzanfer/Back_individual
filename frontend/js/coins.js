const Coins = {
  INICIAL: 40,

  get() {
    const v = localStorage.getItem('coins');
    return v !== null ? parseInt(v) : this.INICIAL;
  },

  set(n) {
    localStorage.setItem('coins', Math.max(0, n));
    this._sync();
  },

  sumar(n) { 
    this.set(this.get() + n); 
  },

  restar(n) { 
    this.set(this.get() - n); 
    if (typeof registrarMetricaTienda === 'function') {
      registrarMetricaTienda(n);
    }
  },

  _sync() {
    // Usamos data-wallet. El optional chaining (?.) evita que el código muera si no existe el elemento
    const walletElements = document.querySelectorAll('[data-wallet]');
    walletElements.forEach(el => {
      el.textContent = this.get();
    });
    
    const badges = document.querySelectorAll('.coins-badge');
    badges.forEach(b => b.classList.toggle('low', this.get() < 20));
  },

  init() { 
    this._sync(); 
  }
};
