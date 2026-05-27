class SimpleCache {
  constructor() {
    this.map = new Map();
  }

  set(key, value, ttlMs = 30_000) {
    const expires = Date.now() + ttlMs;
    this.map.set(key, { value, expires });
  }

  get(key) {
    const e = this.map.get(key);
    if (!e) return null;
    if (Date.now() > e.expires) {
      this.map.delete(key);
      return null;
    }
    return e.value;
  }

  del(key) { this.map.delete(key); }
}

module.exports = new SimpleCache();
