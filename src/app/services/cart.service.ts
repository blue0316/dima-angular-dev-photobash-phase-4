import { Injectable } from '@angular/core';
import { WindowSevice } from './window.service';

@Injectable()
export class CartService {

  constructor(private winServ: WindowSevice) { }

  add(dataToAdd): boolean{
    if (this.winServ.isLocalStoragSupported()) {
      let data = this.winServ.getLocalItem('cartData');
      let $d = [];
      if (data) {
        data = JSON.parse(data);
        for (let index = 0; index < data.length; index++) {
          const d = data[index];
          if (d.packId != dataToAdd.packId){
            $d.push(d);
          }
        }    
      }
      dataToAdd.cartItemId = this.generateCartItemId(dataToAdd.packId);
      $d.push(dataToAdd)
      this.winServ.setLocalItem('cartData', $d);
      return true;  
    }else{
      throw "Browser not supported !";
    }
  }
  get(): any{
    //this.winServ.removeItem('cartData');
    try {
      let data = this.winServ.getLocalItem('cartData');
      data = JSON.parse(data);
      let $d = {
        data: data,
        priceInCredits: 0,
        price: 0
      };
      for(let i in data){
        let price = data[i].packPrice, priceInCredits = data[i].packPriceInCredits;
        $d.price += parseFloat(price);
        $d.priceInCredits += parseFloat(priceInCredits);
      }
      return $d;
    } catch (error) {
      return {
        data: [],
        priceInCredits: 0,
        price: 0
      };
    }
  }
  update():boolean{
    return true;
  }
  remove(cartItemId):boolean{
    try {
      let data = this.winServ.getLocalItem('cartData');
      data = JSON.parse(data);
      let index = data.findIndex(d => d.cartItemId == cartItemId);
      if (index > -1) {
        data.splice(index, 1);  
      }
      this.winServ.setLocalItem('cartData', data);
      return true;
    } catch (error) {
      return false;
    }
  }
  destroy():boolean{
    try {
      this.winServ.removeItem('cartData');
      return true;
    } catch (error) {
      return false;
    }
  }

  generateCartItemId(uniqueId): string{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text+'_'+btoa(uniqueId);
  }
}