import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UpdateService {

  updateSubs = new BehaviorSubject<string>(null); // updateCartData listner
  getUpdateCusCreSub = new BehaviorSubject<string>(null); // getAndUpdateCustomCredits listner
  updUsrDatSub = new BehaviorSubject<string>(null); // updateUserData listner

  showModalView = new BehaviorSubject<string>(null); // show modal details

  constructor() { }

  updatingTheCart(value: string) {
    this.updateSubs.next(value);
  }

  getAndUpdatingCustomerCredits(value: string) {
    this.getUpdateCusCreSub.next(value);
  }

  updatingUserData(value: string) {
    this.updUsrDatSub.next(value);
  }

  showingModal(value: string) {
    this.showModalView.next(value);
  }

}
