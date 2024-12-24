import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../app.setting';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer } from '@angular/platform-browser';

import swal from 'sweetalert2';
@Injectable()
export class CommonSevice {
  private host: string = AppSettings.API_ENDPOINT;
  constructor(private http: Http, private sanitizer: DomSanitizer) {
    // code...
  }
  createSlugFromString(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  isValidEmail(email: string): boolean {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  dataURItoBlob(dataURI, callback) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new Blob([ab]);
    callback(bb);
  }
  get(url: string, params?: any): Observable<any> {
    let requestUrl: string = this.host + url;
    if (params) {
      let isFirst: boolean;
      isFirst = true;
      for (const k in params) {
        if (params[k]) {
          const p: string | number = params[k];
          let op = '&';
          if (isFirst) {
            isFirst = false;
            op = '?';
          }
          requestUrl += op + k + '=' + p;
        }
      }
    }
    return this.http.get(requestUrl).map(res => res.json());
  }
  post(url: string, data: any): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this.host + url, data, options).map(res => res.json());
  }
  ucfirst(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  notify(title, messageHTML, type, position = null, timer = 3000, cb = null): any {
    const sw2 = swal({
      customClass: 'notification-alert-box',
      title: title,
      html: messageHTML,
      type: type,
      position: position ? position : 'bottom-right',
      showConfirmButton: false,
      showCloseButton: true,
      backdrop: false,
      timer: timer
    });
    if (cb) {
      sw2.then(cb);
    }
    return sw2;
  }
  isObjEmpty(obj): boolean {
    for (var key in obj) {
      // tslint:disable-next-line: curly
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  urlToDataURI(url: string, height: number, width: number, callback) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var base_image = new Image();
    base_image.src = url;
    base_image.onload = function() {
      context.drawImage(base_image, 100, 100);
      var jpegUrl = canvas.toDataURL('image/jpeg');
      callback(canvas.toDataURL());
    };
  }
  trustAsDataURI(url: string) {
    try {
      return this.sanitizer.bypassSecurityTrustUrl(url);
    } catch (error) {
      return url;
    }
  }

  getError = (err: any): IErrorModel => {
    try {
      const errors = JSON.parse(err._body);
      if (errors.error) {
        return {
          message: errors.message,
          errors: errors.error,
          code: err.code || err.status
        };
      } else {
        return {
          message: errors.message,
          errors: {},
          code: err.code || err.status
        };
      }
    } catch (e) {
      return {
        message: 'Oops... An unkown error occure!',
        errors: {},
        code: err.code || 500
      };
    }
  };
  /**
   *
   */
  setNewUserURL = (userId: string, url: string, currentURL: string) => {
    this.post('/webservices/updatePage', {
      userId,
      url,
      currentURL
    }).subscribe(data => {
      console.log(data);
    });
  };
}
export interface IErrorModel {
  errors: any;
  message: string;
  code: number;
}
