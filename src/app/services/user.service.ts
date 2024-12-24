import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { AppSettings } from './../app.setting';

@Injectable()
export class UserSevice {
    host = AppSettings.API_ENDPOINT;

	constructor(private http: Http) {
		// code...
	}
    userLogin(userName, password){
        
    }
}
