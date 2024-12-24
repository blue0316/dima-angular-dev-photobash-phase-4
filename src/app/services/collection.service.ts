import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../app.setting';

import 'rxjs/add/operator/map';

@Injectable()
export class CollectionService {

    host: string = AppSettings.API_ENDPOINT;
	constructor(private http: Http) {
		// code...
	}
    getCollections(token, offset, limit, isMore = false, searchKey = null, colId = 0){
        let url = this.host+'webservices/collections/'+token+'?offset='+offset+'&limit='+limit;
        if (isMore) {
            url +='&getMore=1';
        }
        if (searchKey) {
            url += '&search='+searchKey;
        }
        if (colId) {
            url += '&collection=' + colId;
        }
        return this.http.get(url).map(res => res.json());
    }
    renameCol(data){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host+'webservices/renameCollection',data,options).map(res => res.json());
    }
    deleteCol(token,id){
        return this.http.get(this.host+'webservices/deleteCollection?token='+token+'&id='+id).map(res => res.json());
    }
    deleteColImg(token,id, col_id, collDetailId, type){
        return this.http.get(this.host + 'webservices/deleteImgCollection?token=' + token + '&id=' + id + '&col_id=' + col_id + '&col_detail_id=' + collDetailId + '&type=' + type).map(res => res.json());
    }
    addnameCol(data){
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host+'webservices/addCollection', data,options).map(res => res.json());
    }
}
