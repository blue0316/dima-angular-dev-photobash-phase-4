import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../app.setting';

import 'rxjs/add/operator/map';

@Injectable()
export class PackageService {
    host: string = AppSettings.API_ENDPOINT;
	constructor(private http: Http) {
		
	}
    getPackages(offset, limit, catId, otherParamas, loginToken){
        let url = this.host+'webservices/packimage?offset='+offset;
        if (limit) {
            url +='&limit='+limit;
        }
        if (catId) {
            url +='&category='+catId;   
        }
        if(otherParamas){
            url +='&'+otherParamas;
        }
        if (loginToken) {
            url +='&token='+loginToken;
        }
        return this.http.get(url).map(res => res.json());
    }
    getSinglePackage(packId){
        return this.http.get(this.host+'webservices/packdetails/'+packId).map(res => res.json());
    }
    checkUserCreditsForPack(packId, loginToken){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = {
            packId: packId,
            token: loginToken
        }
        return this.http.post(this.host+'webservices/checkUserCreditForPackPurchase', data).map(res=>res.json());
    }
    checkUserCreditsForKit(kitId, loginToken){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = {
            kitId: kitId,
            token: loginToken,
            type: 2
        }
        return this.http.post(this.host+'webservices/checkUserCreditForPackPurchase', data).map(res=>res.json());
    }
    purchasePack(packId, loginToken, credits, hideConfirmBox) {
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = {
            packId: packId,
            token: loginToken,
            credits: credits,
            hideConfirmBox: (hideConfirmBox) ? 1 : 0
        }
        return this.http.post(this.host + 'webservices/purchasePackByCredits', data).map(res => res.json());
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
    getPlans(){
        return this.http.get(this.host + 'webservices/plans').map(res => res.json());
    }
}
