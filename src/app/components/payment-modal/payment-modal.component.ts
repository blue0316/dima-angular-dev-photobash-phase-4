import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AppSettings } from '../../app.setting';
import { ISubscription } from 'rxjs/Subscription';
import { CommonSevice, IErrorModel } from '../../services/common.service';
import { WindowSevice } from '../../services/window.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  @Input('amount') amount: number;
  @Input('isRecurring') isRecurring: boolean;
  @Input('planId') planId: string;
  @Input('paymentFor') paymentFor: number;
  @Input('creditData') creditData: any;
  @Input('bonus') bonus: any;
  @Input('checkCredit') checkCredit: any;
  @Input('credit') credit: any;
  @Input('cartData') cartData: any;
  @Output('onCreditCardPaymentDone')
  onCreditCardPaymentDone: EventEmitter<any> = new EventEmitter();
  paymentData: IPaymentModel = {};
  expiryMonthYear: string;
  isTermsAccepted: boolean;
  isPaymentTypeSelected: boolean;
  isLoading: boolean;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  countries: any[] = [];
  randomString: string;
  payementType: string;
  applicableTax: number;
  storeCardData: boolean;
  dateMask = [/[0-9]/, /\d/, '/', /\d/, /\d/];
  cardMask = [
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
    /[0-9]/,
    ' ',
    /[0-9]/,
    /[0-9]/
  ];
  isTaxFetched: boolean;
  isCountryDisabled: boolean;
  donationAmount: number | string;
  paymentError: IPaymentErrorModel = {};
  getCountriesReq: ISubscription;
  processCardSubscription: ISubscription;
  processPayPalSubscription: ISubscription;
  getTaxByCountrySubscription: ISubscription;
  check3DSecureSubscription: ISubscription;
  constructor(
    private apiService: CommonSevice,
    private winServ: WindowSevice,
    private router: Router
  ) {}

  ngOnInit() {
    this.isPaymentTypeSelected = true;
    this.randomString = Math.random().toString();
    this.getCountries();
    let userData = JSON.parse(this.winServ.getLocalItem('userData'));
    if (userData) {
      this.paymentData = {
        name: userData.name || [userData.first_name, userData.last_name].join(' ').trim(),
        email: userData.email,
        country: userData.country
      };
    }
    if (!this.paymentData.country) {
      this.paymentData.country = '';
    } else {
      this.isCountryDisabled = true;
    }
    /* Set Stored Card Details for faster checkout */
    if (this.winServ.getLocalItem('storeCardData')) {
      this.storeCardData = true;
      this.paymentData.number = this.winServ.getLocalItem('cardNumber');
      this.expiryMonthYear = this.winServ.getLocalItem('expiryMonthYear');
    }
  }
  getCountries = (): void => {
    this.getCountriesReq = this.apiService
      .get(`webservices/getAllCountries?token=${localStorage.getItem('token')}`)
      .subscribe(data => {
        this.countries = data.data;
        this.applicableTax = data.applicableTax;
        if (this.paymentData.country && !this.paymentData.country.isNullOrWhitespace()) {
          this.onCountryChange(true);
        }
      });
  };
  pay = (): void => {
    if (!this.validateFields()) {
      this.removeErrorAfterDelay();
      return;
    }
    const { payementType, paymentData, expiryMonthYear } = this;
    switch (payementType) {
      case 'CC':
        if (this.storeCardData) {
          this.winServ.setLocalItem('storeCardData', true);
          this.winServ.setLocalItem('cardNumber', paymentData.number.trimAllSpace());
          this.winServ.setLocalItem('expiryMonthYear', expiryMonthYear);
        } else {
          this.winServ.removeItem('storeCardData');
          this.winServ.removeItem('cardNumber');
          this.winServ.removeItem('expiryMonthYear');
        }
        const exp = expiryMonthYear.split('/');
        paymentData.expiryMonth = exp[0];
        paymentData.expiryYear = '20' + exp[1];
        paymentData.number = paymentData.number.trimAllSpace();
        this.payByCard();
        break;
      case 'PP':
        this.payByPayPal();
        break;
      default:
        if (this.paymentFor == 3 && !this.donationAmount) {
          this.purchseForFree();
        }
        break;
    }
  };
  removeErrorAfterDelay = (): void => {
    setTimeout(() => {
      this.paymentError = {};
      this.isPaymentTypeSelected = true;
    }, 5000);
  };
  payByCard = (): void => {
    const { paymentData } = this;
    this.isLoading = true;
    this.check3DSecureSubscription = this.apiService
      .post('Payment3dSecure/paySecurely', {
        ...paymentData,
        paymentFor: this.paymentFor,
        amount: this.amount
          ? (this.amount + (this.amount * this.applicableTax) / 100).toFixed(2)
          : this.donationAmount,
        isRecurring: this.isRecurring ? 1 : 0,
        planId: this.planId,
        token: localStorage.getItem('token'),
        creditData: {
          ...this.creditData,
          bonus: this.bonus,
          credit: this.checkCredit == 0 ? this.credit : this.creditData ? this.creditData.credit : 0
        },
        cartData: this.cartData,
        applicableTax: this.applicableTax
      })
      .subscribe(
        data => {
          console.log('====================================');
          console.log(data);
          console.log('====================================');
          if (data.redirect_url) {
            window.location.href = data.redirect_url;
          } else if (data.notEnrolled) {
            this.apiService.notify('Info!', data.message, 'info');
            this.processCardSubscription = this.apiService
              .post('Payment/payByCard', {
                ...paymentData,
                amount: this.amount
                  ? this.amount + (this.amount * this.applicableTax) / 100
                  : this.donationAmount,
                isRecurring: this.isRecurring ? 1 : 0,
                planId: this.planId,
                token: localStorage.getItem('token')
              })
              .subscribe(
                data => {
                  this.isLoading = false;
                  this.onCreditCardPaymentDone.emit({
                    ...data,
                    applicableTax: this.applicableTax,
                    userEmail: this.paymentData.email,
                    amount: this.amount ? this.amount.toFixed(2) : this.donationAmount
                  });
                  if (data.success && this.isRecurring) {
                    this.router.navigate(['/payment-success'], {
                      queryParams: {
                        status: 200,
                        message: 'Payment successfull',
                        type: 3,
                        id: data.invoiceId
                      }
                    });
                  }
                },
                err => {
                  console.log(err);
                  const result: IErrorModel = this.apiService.getError(err);
                  this.paymentError = result.errors as IPaymentErrorModel;
                  this.isLoading = false;
                  if (result.code != 400) {
                    this.apiService.notify('Error!', result.message, 'error');
                  }
                  this.removeErrorAfterDelay();
                }
              );
          } else {
            this.isLoading = false;
            console.log(data);
            this.apiService.notify('Error!', data.message, 'error');
          }
        },
        err => {
          this.isLoading = false;
          const result: IErrorModel = this.apiService.getError(err);
          this.paymentError = result.errors as IPaymentErrorModel;
          this.removeErrorAfterDelay();
        }
      );
    /* */
  };
  validateFields = (): boolean => {
    let isError: boolean;
    isError = false;
    this.paymentError = {};
    this.isPaymentTypeSelected = true;
    let isDonationNotSet: boolean;
    isDonationNotSet =
      this.donationAmount === undefined ||
      this.donationAmount === '' ||
      this.donationAmount == null;
    const { paymentData, expiryMonthYear, isTermsAccepted, payementType } = this;
    if (!this.amount && !this.donationAmount) {
      this.payementType = undefined;
    }
    if (!payementType && (this.amount || this.donationAmount > 0)) {
      this.isPaymentTypeSelected = false;
      return false;
    }
    if (!isTermsAccepted) {
      isError = true;
      this.paymentError.term = 'You must accept our terms and policies to proceed.';
    }
    if (!paymentData.country || paymentData.country.isNullOrWhitespace()) {
      isError = true;
      this.paymentError.country = 'Please select your billing country.';
    }
    if (!paymentData.name || paymentData.name.isNullOrWhitespace()) {
      isError = true;
      this.paymentError.name = 'Please enter your name.';
    }
    if (
      !paymentData.email ||
      paymentData.email.isNullOrWhitespace() ||
      !paymentData.email.isValidEmail()
    ) {
      isError = true;
      this.paymentError.email = 'Please enter a valid email address.';
    }
    if (payementType == 'CC') {
      if (!paymentData.number || paymentData.number.isNullOrWhitespace()) {
        isError = true;
        this.paymentError.number = 'Please enter valid card number.';
      }
      const currentDate: Date = new Date();
      if (
        !expiryMonthYear ||
        expiryMonthYear.isNullOrWhitespace() ||
        (Number(expiryMonthYear.split('/')[0]) > currentDate.getMonth() + 1 &&
          Number(`20${expiryMonthYear.split('/')[1]}`) < currentDate.getFullYear())
      ) {
        isError = true;
        this.paymentError.expiryMonth = 'Please enter valid expiry.';
      }
      if (
        !paymentData.cvv ||
        paymentData.cvv.isNullOrWhitespace() ||
        paymentData.cvv.length < 3 ||
        paymentData.cvv.length > 4
      ) {
        isError = true;
        this.paymentError.cvv = 'Please enter valid 3 or 4 digit cvv.';
      }
    }
    /* For Donation */
    if (this.paymentFor == 3 && !this.amount && isDonationNotSet) {
      this.paymentError.donationAmount = `Please choose a price. If you don't want to donate please enter 0.`;
      isError = true;
    }
    if (!this.isTaxFetched && !isError) {
      isError = true;
      this.apiService.notify(
        'Warning!',
        'Please wait while we fetch tax for selected country.',
        'warning',
        'bottom-right'
      );
    }
    /* For Donation */
    if (isError) {
      return false;
    }
    return true;
  };

  payByPayPal = (): void => {
    const { paymentData } = this;
    this.isLoading = true;
    this.processPayPalSubscription = this.apiService
      .post('Payment/payByPayPal', {
        ...paymentData,
        paymentFor: this.paymentFor,
        amount: this.amount
          ? (this.amount + (this.amount * this.applicableTax) / 100).toFixed(2)
          : this.donationAmount,
        isRecurring: this.isRecurring ? 1 : 0,
        planId: this.planId,
        token: localStorage.getItem('token'),
        creditData: {
          ...this.creditData,
          bonus: this.bonus,
          credit: this.checkCredit == 0 ? this.credit : this.creditData ? this.creditData.credit : 0
        },
        cartData: this.cartData,
        applicableTax: this.applicableTax
      })
      .subscribe(
        data => {
          window.location.href = data.redirect_url;
        },
        err => {
          const result: IErrorModel = this.apiService.getError(err);
          this.paymentError = result.errors as IPaymentErrorModel;
          this.isLoading = false;
          if (result.code != 400) {
            this.apiService.notify('Error!', result.message, 'error');
          }
          this.removeErrorAfterDelay();
        }
      );
  };
  /* Free purchase packs */
  purchseForFree = () => {
    const { paymentData } = this;
    this.isLoading = true;
    this.apiService.post('Payment/purchaseFreePacksKits', { ...paymentData }).subscribe(
      data => {
        this.isLoading = false;
        this.onCreditCardPaymentDone.emit({
          ...data,
          applicableTax: this.applicableTax,
          userEmail: this.paymentData.email
        });
        if (data.success) {
          this.apiService.notify(
            'Succcess!',
            data.message || this.isRecurring
              ? 'Subcribed successfully.'
              : 'Payment made successfully.',
            'success'
          );
        }
      },
      err => {
        const result: IErrorModel = this.apiService.getError(err);
        this.paymentError = result.errors as IPaymentErrorModel;
        this.isLoading = false;
        if (result.code != 400) {
          this.apiService.notify('Error!', result.message, 'error');
        }
        this.removeErrorAfterDelay();
      }
    );
  };
  /* Udpate tax as per the country selected by user */
  onCountryChange = (isFromComponent?: boolean) => {
    this.isTaxFetched = false;
    if (this.getTaxByCountrySubscription) {
      this.getTaxByCountrySubscription.unsubscribe();
    }
    if (this.isCountryDisabled && !isFromComponent) {
      this.apiService.notify('Warning!', 'You can not change the country.', 'warning');
      const userData = JSON.parse(this.winServ.getLocalItem('userData'));
      if (userData) {
        this.paymentData.country = userData.country;
      }
      return;
    }
    this.getTaxByCountrySubscription = this.apiService
      .get(
        `/Payment/getTaxByCountry?token=${localStorage.getItem('token')}&country=${
          this.paymentData.country
        }`
      )
      .subscribe(data => {
        this.applicableTax = data.applicableTax;
        this.isTaxFetched = true;
      });
  };
  parseFloat = amount => {
    return parseFloat(amount);
  };
  ngOnDestroy() {
    if (this.check3DSecureSubscription) {
      this.check3DSecureSubscription.unsubscribe();
    }
    if (this.getCountriesReq) {
      this.getCountriesReq.unsubscribe();
    }
    if (this.processCardSubscription) {
      this.processCardSubscription.unsubscribe();
    }
    if (this.processPayPalSubscription) {
      this.processPayPalSubscription.unsubscribe();
    }
    if (this.getTaxByCountrySubscription) {
      this.getTaxByCountrySubscription.unsubscribe();
    }
  }
}

export interface IPaymentModel {
  number?: string;
  expiryMonth?: number | string;
  expiryYear?: number | string;
  cvv?: string;
  email?: string;
  name?: string;
  country?: string;
  planId?: string;
  isRecurring?: boolean;
}
export interface IPaymentErrorModel {
  number?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  email?: string;
  name?: string;
  country?: string;
  term?: string;
  donationAmount?: string;
}
