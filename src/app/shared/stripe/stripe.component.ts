import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from '@angular/core';
import { AppSettings } from '../../app.setting';
import { Http } from '@angular/http';
import { CommonSevice } from '../../services/common.service';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.css'],
  providers: [CommonSevice]
})
export class StripeComponent implements OnInit, OnDestroy, OnChanges {
  message: string;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  host: string = AppSettings.API_ENDPOINT;

  stripeObject = {
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: ''
  };
  // tslint:disable-next-line: no-inferrable-types
  showDonate: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  randomNumber: number = 0;
  payPalEmail: string = null;
  public dateMask = [/[0-9]/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
  public cardMask = [
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    ' ',
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    ' ',
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    ' ',
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
    /[0-9]/
  ];

  @Input('currentPackPrice') currentPackPrice: string;
  @Input('taxInPer') taxInPer: number;
  @Input('payPalClicked') payPalClicked: boolean;
  @Input('isRecurring') isRecurring: boolean;
  @Input('planId') planId: string;
  @Input('cardNumber') cardNumber: any;
  @Input('expiryMonthYear') expiryMonthYear: any;
  @Input('email') email: any;
  @Input('acceptZero') acceptZero: boolean;
  @Input('loadingReq') loadingReq: boolean;
  @Input('isLoggedIn') isLoggedIn: boolean;
  @Output('transactionSuccess') transactionSuccess: EventEmitter<any> = new EventEmitter();
  @Output('transactionFailed') transactionFailed: EventEmitter<any> = new EventEmitter();
  @Output('onPayPalSelection') onPayPalSelection: EventEmitter<any> = new EventEmitter();
  chargeAmountReq: ISubscription;
  constructor(private http: Http, private comServ: CommonSevice) {
    this.randomNumber = this.shuffle('12345');
  }
  ngOnInit() {
    this.showDonate = parseInt(this.currentPackPrice) > 0;
    this.currentPackPrice = parseInt(this.currentPackPrice) > 0 ? this.currentPackPrice : null;
  }
  ngOnChanges(changes) {
    if (changes.currentPackPrice) {
      if (changes.currentPackPrice.currentValue > 0) {
        this.showDonate = true;
      } else if (changes.currentPackPrice.currentValue <= 0) {
        this.showDonate = false;
      }
      this.currentPackPrice = this.currentPackPrice == '' ? null : this.currentPackPrice;
    }
    if (changes.email) {
      this.email = changes.email.currentValue;
    }
  }
  shuffle(string) {
    var parts = string.split('');
    for (var i = parts.length; i > 0; ) {
      var random = Math.floor(Math.random() * i);
      var temp = parts[--i];
      parts[i] = parts[random];
      parts[random] = temp;
    }
    return parts.join('');
  }
  getToken() {
    this.message = null;
    if (parseInt(this.currentPackPrice) < 0) {
      // tslint:disable-next-line: quotemark
      this.message = "Amount can't be less than zero.";
      return;
    }
    if (!this.email) {
      this.message = 'Please enter email.';
      return;
    }
    if (!this.comServ.isValidEmail(this.email)) {
      this.message = 'Please enter valid email.';
      return;
    }
    if (this.acceptZero && parseInt(this.currentPackPrice) == 0) {
      this.loadingReq = true;
      this.chargeAmountStripe('tok_visa');
    } else {
      if (
        !this.stripeObject ||
        !this.expiryMonthYear ||
        !this.stripeObject.number ||
        !this.stripeObject.cvc ||
        !this.email
      ) {
        this.message = 'All fields are required.';
        return;
      }
      this.stripeObject.number = this.stripeObject.number.split(' ').join('');
      let expire = this.expiryMonthYear.split('/');
      this.stripeObject.exp_month = expire[0] ? expire[0] : null;
      this.stripeObject.exp_year = expire[1] ? expire[1] : null;
      if (
        !this.stripeObject.exp_month ||
        !this.stripeObject.exp_year ||
        expire.length != 2 ||
        this.stripeObject.exp_year.length < 2 ||
        this.stripeObject.exp_year.length > 4
      ) {
        this.message = 'Invalid expiration date.';
        return;
      }
      this.loadingReq = true;
      let data = Object.assign({}, this.stripeObject);
      let _that = this;
      setTimeout(() => {
        document.getElementById('btn-price').click;
      }, 5000);
      (<any>window).Stripe.card.createToken(data, (status: number, response: any) => {
        if (status === 200) {
          _that.chargeAmountStripe(response.id);
          _that.message = null;
        } else if (response.error) {
          _that.message = response.error.message;
          _that.loadingReq = false;
          _that.transactionFailed.emit(_that.message);
        } else {
          _that.message = response.error.message;
          _that.loadingReq = false;
          _that.transactionFailed.emit(_that.message);
        }
      });
    }
  }
  chargeAmountStripe(token) {
    let dataToSend = {
      stripeToken: 'tok_visa',
      amount: this.currentPackPrice,
      email: this.email
    };
    if (this.isRecurring) {
      dataToSend['isRecurring'] = '1';
      dataToSend['planId'] = this.planId;
    }
    if (this.acceptZero) {
      dataToSend['acceptZero'] = 1;
    }
    this.chargeAmountReq = this.http
      .post(this.host + 'webservices/payByCard', dataToSend)
      .map(res => res.json())
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.loadingReq = false;
                this.stripeObject = {
                  number: '',
                  exp_month: '',
                  exp_year: '',
                  cvc: ''
                };
                // this.email = '';
                // this.expiryMonthYear = '';
                this.transactionSuccess.emit(data.data);
                break;
              case 400:
                this.message = data.message;
                this.loadingReq = false;
                this.transactionFailed.emit(this.message);
                break;
              case 402:
                this.message = data.message;
                this.loadingReq = false;
                this.transactionFailed.emit(this.message);
                break;
              default:
                this.message =
                  'An unknown error occure while payment. Please try again after some time.';
                this.loadingReq = false;
                this.transactionFailed.emit(this.message);
                break;
            }
          }
        },
        err => {
          console.log(err);
          this.message = 'An unknown error occure while payment. Please try again after some time.';
          this.transactionFailed.emit(this.message);
          this.loadingReq = false;
        }
      );
  }
  payByPaypal(payPalEmail, currentPackPrice) {
    let data = {
      email: payPalEmail,
      price: currentPackPrice
    };
    this.onPayPalSelection.emit(data);
  }
  ngOnDestroy() {
    if (this.chargeAmountReq) {
      this.chargeAmountReq.unsubscribe();
    }
  }
}
