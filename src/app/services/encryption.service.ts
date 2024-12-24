import { Injectable } from '@angular/core';

/// <reference types="crypto-js" />
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {

  constructor() { }


  // Encrypt the provided string
  encryptString(text) {
    var key = CryptoJS.enc.Utf8.parse('7061737323313233');
    var iv = CryptoJS.enc.Utf8.parse('7061737323313233');

    var crypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return crypted.toString();
  }



  // Decrypt the provided string
  decryptString(encText) {
    var key = CryptoJS.enc.Utf8.parse('7061737323313233');
    var iv = CryptoJS.enc.Utf8.parse('7061737323313233');

    var decrypted = CryptoJS.AES.decrypt(encText, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

}
