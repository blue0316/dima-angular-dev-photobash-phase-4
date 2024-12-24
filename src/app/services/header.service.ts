import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../app.setting';

import 'rxjs/add/operator/map';

@Injectable()
export class HeaderSevice {
    host: string = AppSettings.API_ENDPOINT;
    vatValidatioUrl: string = AppSettings.VAT_VALIDATE_URL;
	constructor(private http: Http) {
		// code...
	}
    getFilterItemForPack(){
        return this.http.get(this.host+'webservices/filterPackages').map(res => res.json());
    }
    getFilterItemForImages(token){
        let url = this.host + 'webservices/filterImages';
        if (token) {
            url +='?token='+token;
        }
        return this.http.get(url).map(res => res.json());
    }
    getFilterItemForModels(token){
        let url = this.host + 'webservices/modelFilters';
        if (token) {
            url +='?token='+token;
        }
        return this.http.get(url).map(res => res.json());
    }
    loginUser(userData){
    	let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host+'webservices/login', JSON.stringify(userData), options).map(res => res.json());
    }
    checkUserLoginStatus(token, loggedInId){
        return this.http.get(this.host + 'webservices/checkLogin?token=' + token + '&loginId=' + loggedInId).map(res => res.json());   
    }
    logoutUser(token, loginId){
        return this.http.get(this.host + 'webservices/Logout?token=' + token + '&loginId=' + loginId).map(res => res.json()); 
    }
    saveUserDetails(user){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let userData = {
            email: (user.email)? user.email : '',
            first_name:(user.firstName) ? user.firstName : '',
            last_name: (user.lastName) ? user.lastName : '',
            social_type: (user.provider) ? user.provider : '' 
        }       
        return this.http.post(this.host+'webservices/loginSocial', JSON.stringify(userData), options).map(res => res.json());
    }
    signUpUser(userData){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host+'webservices/signup', JSON.stringify(userData), options).map(res => res.json());
    }
    sendResetLink(email, url){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host+'webservices/forgotPassword', JSON.stringify({email: email, base: url}), options).map(res => res.json());
    }
    verifyToken(token){
        /*webservices/checkFtoken/*/
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host+'webservices/checkFtoken', JSON.stringify({token: token}), options).map(res => res.json()); 
    }
	
    updatePassword(password, cpassword, token){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host + 'webservices/changePassword', JSON.stringify({ token: token, c_password: cpassword, password: password}), options).map(res => res.json());   
    }
	getsettingInfo(token){ 
         return this.http.get(this.host+'webservices/getSetting/?token='+token).map(res => res.json()); 
    }
    updateUserSettingDetails(userData, token){
       let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
       let options = new RequestOptions({ headers: headers });
       userData.token=token;
       return this.http.post(this.host+'webservices/updateSetting', JSON.stringify(userData), options).map(res => res.json());   
    } 
    changePassword(userData, token){
       let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
       let options = new RequestOptions({ headers: headers });
       userData.token=token;
       return this.http.post(this.host+'webservices/chnagePassword', JSON.stringify(userData), options).map(res => res.json());   
    } 
    checkVatNumber(vatNumber){ 
       return this.http.get(this.vatValidatioUrl+vatNumber).map(res => res.json()); 
    }
    accountDelete(token){
       return this.http.get(this.host+'webservices/accountDelete/?token='+token).map(res => res.json()); 
    } 
    purchasePacksFromCart(token, packIds){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = {
            token: token,
            packIds: packIds
        }
        return this.http.post(this.host + 'webservices/purchaseMuliplePacksByCredits', JSON.stringify(data), options).map(res => res.json());  
    }
    getLoggedInUserCartItem(token){
        return this.http.get(this.host + 'webservices/getCartData/?token=' + token).map(res => res.json()); 
    }
    removeItemForLoggedInUserFromCart(token, cartId){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let data = {
            token: token,
            cartId: cartId
        }
        return this.http.post(this.host + 'webservices/removeFromCart', JSON.stringify(data), options).map(res => res.json()); 
    }
}