import { Injectable } from '@angular/core';

@Injectable()
export class WindowSevice {
  constructor() {}
  isLocalStoragSupported() {
    try {
      localStorage.setItem('whatever', 'something');
      localStorage.removeItem('whatever');
      return true;
    } catch (e) {
      return false;
    }
  }

  setLocalItem(name, value) {
    value = typeof value == 'object' ? JSON.stringify(value) : value;
    try {
      localStorage.setItem(name, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  getLocalItem(name) {
    var val = null;
    try {
      val = localStorage.getItem(name);
    } catch (E) {}

    return val;
  }

  removeItem(name) {
    try {
      localStorage.removeItem(name);
    } catch (E) {}

    return true;
  }
  read(name: string) {
    var result = new RegExp(
      '(?:^|; )' + encodeURIComponent(name) + '=([^;]*)',
    ).exec(document.cookie);
    return result ? result[1] : null;
  }

  write(name: string, value: string, days?: number) {
    if (!days) {
      days = 365 * 20;
    }

    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    var expires = '; expires=' + date.toUTCString();

    document.cookie = name + '=' + value + expires + '; path=/';
  }

  remove(name: string) {
    this.write(name, '', -1);
  }
}
