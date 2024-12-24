import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../app.setting';

import 'rxjs/add/operator/map';

@Injectable()
export class ModelsService {
  host: string = AppSettings.API_ENDPOINT;
  constructor(private http: Http) {
    // code...
  }

  getModelImages(params, token) {
    let url = this.host + 'webservices/models';
    var dataToSend = {};
    for (var i in params) {
      dataToSend[i] = params[i];
    }
    /*if (params.search) {
      dataToSend['search'] = params.search;
    }
    if (params.offset) {
      dataToSend['offset'] = params.offset;
    } else {
      dataToSend['offset'] = 0;
    }
    if (params.limit) {
      dataToSend['limit'] = params.limit;
    } else {
      dataToSend['limit'] = AppSettings.IMG_PER_PAGE;
    }
    if (params.category) {
      dataToSend['category'] = params.category;
    }
    if (params.kit) {
      dataToSend['kit'] = params.kit;
    }*/
    if (token) {
      dataToSend['token'] = token;
    }
    return this.http.post(url, dataToSend).map(res => res.json());
  }
  getSingleImage(imageId) {
    return this.http
      .get(this.host + 'webservices/imageDetails/' + imageId)
      .map(res => res.json());
  }
  downloadImage(token, imageId, width, height, type = '') {
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        this.host + 'webservices/downloadImage',
        JSON.stringify({
          token: token,
          id: imageId,
          width: width,
          height: height,
          type: type,
        }),
        options,
      )
      .map(res => res.json());
  }
  collectionsCount(token) {
    let url = this.host + 'webservices/collectionsCount/' + token;
    return this.http.get(url).map(res => res.json());
  }
  addnameCol(data) {
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(this.host + 'webservices/addCollection', data, options)
      .map(res => res.json());
  }
  purchaseImageByCredits(imageId, loginToken, credits, hideConfirmBox) {
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    let data = {
      imageId: imageId,
      token: loginToken,
      credits: credits,
      hideConfirmBox: hideConfirmBox ? 1 : 0,
    };
    return this.http
      .post(this.host + 'webservices/purchaseImageByCredits', data)
      .map(res => res.json());
  }
  addToSearchHistory(loginToken, imageId) {
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    let data = {
      imageId: imageId,
      token: loginToken,
    };
    return this.http
      .post(this.host + 'webservices/manageUserSearchHistory', data)
      .map(res => res.json());
  }
}
