import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../app.setting';

import 'rxjs/add/operator/map';
import { log } from 'util';
import { CommonSevice } from './common.service';

@Injectable()
export class ModelService {
  host: string = AppSettings.API_ENDPOINT;
  constructor(private http: Http, private commonSevice: CommonSevice) {
    // code...
  }
  getModels(offset, limit, catId, otherParamas, token, modelIds = []) {
    let url = this.host + 'webservices/models';
    var dataToSend = {};
    if (otherParamas) {
      var otherP = otherParamas.split('&');
      for (let i = 0; i < otherP.length; i++) {
        const el = otherP[i];
        var p = el.split('=');
        dataToSend[p[0]] = p[p.length - 1];
      }
    }
    if (limit) {
      dataToSend['limit'] = limit;
    }
    if (catId) {
      dataToSend['category'] = catId;
    }
    if (token) {
      dataToSend['token'] = token;
    }
    if (modelIds.length) {
      dataToSend['models'] = modelIds.join(',');
    }
    return this.http.post(url, dataToSend).map(res => res.json());
  }
  getSingleModel(modelId) {
    return this.http
      .get(this.host + 'webservices/modelDetails/' + modelId)
      .map(res => res.json());
  }
  downloadModel(token, modelId, width, height, type = '') {
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        this.host + 'webservices/downloadModel',
        JSON.stringify({
          token: token,
          id: modelId,
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
  purchaseModelByCredits(modelId, loginToken, credits, hideConfirmBox) {

    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    let data = {
      modelId: modelId,
      token: loginToken,
      credits: credits,
      hideConfirmBox: hideConfirmBox ? 1 : 0,
    };
    return this.http
      .post(this.host + 'webservices/purchaseModelByCredits', data)
      .map(res => res.json());
  }
  addToSearchHistory(loginToken, modelId) {
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    let data = {
      modelId: modelId,
      token: loginToken,
    };
    return this.http
      .post(this.host + 'webservices/manageUserSearchHistory', data)
      .map(res => res.json());
  }
  getMainModelImg(loginToken, modelId) {
    let url = this.host + 'webservices/getMainModelImg?modelId=' + modelId;
    if (loginToken) {
      url += '&token=' + loginToken;
    }
    return this.http.get(url).map(res => res.json());
  }
}
