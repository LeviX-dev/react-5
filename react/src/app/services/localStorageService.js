class localStorageService {
  ls = window.localStorage;

  setItem(key, value) {
    value = JSON.stringify(value);
    this.ls.setItem(key, value);
    return true;
  }

  getItem(key) {
    let value = this.ls.getItem(key);
    if (!value) return null;
    return JSON.parse(value);
  }
}

const service = new localStorageService();
export default service;
