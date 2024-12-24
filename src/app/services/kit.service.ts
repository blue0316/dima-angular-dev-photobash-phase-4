import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../app.setting';

import 'rxjs/add/operator/map';

@Injectable()
export class KitService {
    host: string = AppSettings.API_ENDPOINT;
    constructor(private http: Http) {

    }

    checkUserCreditsForKit(kitId, loginToken) {
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = {
            kitId: kitId,
            token: loginToken,
            type: 2
        }
        return this.http.post(this.host + 'webservices/checkUserCreditForPackPurchase', data).map(res => res.json());
    }

    purchaseKit(kitId, loginToken, credits, hideConfirmBox) {
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = {
            kitId: kitId,
            token: loginToken,
            credits: credits,
            hideConfirmBox: (hideConfirmBox) ? 1 : 0,
            type: 2
        }
        return this.http.post(this.host + 'webservices/purchasePackByCredits', data).map(res => res.json());
    }


}
