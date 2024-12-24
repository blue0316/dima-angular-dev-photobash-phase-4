import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { Http } from '@angular/http';
import { Title } from '@angular/platform-browser';
import { AppSettings } from './../../app.setting';
import { WindowSevice } from './../../services/window.service';
import { ISubscription } from 'rxjs/Subscription';
import * as $ from 'jquery';
import swal from 'sweetalert2';
import { CommonSevice } from '../../services/common.service';
import { HeaderComponent } from '../../components/header/header.component';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-subscription-page',
  templateUrl: './subscription.component.html',
  styleUrls: [],
  providers: [WindowSevice, CommonSevice]
})
export class SubscriptionComponent implements OnInit, OnDestroy, AfterViewInit {
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  SiteUrl = AppSettings.SITE_ENDPOINT;
  // tslint:disable-next-line: no-inferrable-types
  customCredit: number = 0;
  amount: number;
  credit: number;
  plans: Array<any> = [];
  creditList: Array<any> = [];
  // tslint:disable-next-line: no-inferrable-types
  planType: number = 3;
  checkCredit: any = '';
  // tslint:disable-next-line: no-inferrable-types
  index: number = 0;
  planReq: ISubscription;
  selectPlanReq: ISubscription;
  addCreditSuccessReq: ISubscription;
  planId: string;
  // tslint:disable-next-line: no-inferrable-types
  isDataLoaded: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  isUserLoggedIn: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  isLoggedIn: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  isRedirectingToPayment: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  highlightedPlanIndex: number = 1;
  selectedPlan: any;
  selectedCustomCredits: any = {
    amount: 0,
    bonus: 0,
    credit: 0,
    applicableTax: 0
  };
  planAmount: number;
  planActualAmount: number;
  userData: any;
  customAmount: number;
  payPalClickedCustom: boolean;
  payPalClicked: boolean;
  customPlanErrors: any = [];
  successMessage = null;
  errorMessage = null;
  // tslint:disable-next-line: no-inferrable-types
  requestingCustomPlan: boolean = false;
  activationError: string = null;
  // tslint:disable-next-line: no-inferrable-types
  activationCode: string = '';
  // tslint:disable-next-line: no-inferrable-types
  getingActivationCodeDetails: boolean = false;
  userPlanDataBonus: any;
  // tslint:disable-next-line: no-inferrable-types
  customBonus: number = 0;
  // tslint:disable-next-line: no-inferrable-types
  planDivider: number = 1;
  message: string = null;
  companyName: string = null;
  // tslint:disable-next-line: no-inferrable-types
  accMultiplier: number = 1;
  @ViewChild('subscriptionPay') stripeObject: PaymentModalComponent;
  @ViewChild('customPay') stripeObjectCustom: PaymentModalComponent;
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  private fragment: string;
  // tslint:disable-next-line: no-inferrable-types
  isCustomPlanUser: boolean = false;
  fragmentReq;
  // tslint:disable-next-line: no-inferrable-types
  applicableTaxPer: number = 0;

  constructor(
    private http: Http,
    private winServ: WindowSevice,
    private titleService: Title,
    private comServ: CommonSevice,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fragmentReq = this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
    });
    this.selectedPlan = {
      facilities: {}
    };
    this.titleService.setTitle('Pricing');
    const fade_element = $('.fade-load-banner');
    setTimeout(() => {
      fade_element.addClass('banner-fade');
    }, 800);
    // this.getPlans();
  }
  ngAfterViewInit(): void {
    try {
      document.querySelector('#' + this.fragment).scrollIntoView(true);
    } catch (e) {}
  }
  getPlans() {
    this.isDataLoaded = false;
    let token = this.winServ.getLocalItem('token');
    let addUrl = '';
    if (token) {
      addUrl += '?token=' + token;
    }
    this.planReq = this.http.get(this.host + 'webservices/plans' + addUrl).subscribe(data => {
      let res = data.json();
      if (res.status) {
        switch (res.status) {
          case 200:
            this.plans = res.data.plans ? res.data.plans : [];
            this.creditList = res.data.custom_credit ? res.data.custom_credit : [];
            this.planDivider = res.data.planDivider ? res.data.planDivider : 1;
            if (this.creditList && this.creditList[0] && this.creditList[0].credit_id) {
              this.customCreditSelect(this.creditList[0]);
            }
            if (
              this.plans &&
              this.plans[0] &&
              this.plans[0]['plan_details'] &&
              this.plans[0]['plan_details'][this.highlightedPlanIndex]
            ) {
              this.selectedPlan = this.plans[0]['plan_details'][this.highlightedPlanIndex];
              this.selectedPlan.facilities = this.selectedPlan.facilities
                ? typeof this.selectedPlan.facilities == 'object'
                  ? this.selectedPlan.facilities
                  : JSON.parse(this.selectedPlan.facilities)
                : {};
            }
            this.customCredit = res.data.credit ? res.data.credit : 0;

            if (this.userData) {
              let mainIndex = this.plans.findIndex(d => this.userData.user_plan == d.account_id);
              if (mainIndex > -1) {
                let index = this.plans[mainIndex].plan_details.findIndex(
                  d => d.plan_id == this.userData.user_plan_details.planId
                );
                this.planChanged(mainIndex);
                if (index > -2) {
                  this.setSelectedPlanIndex(index, mainIndex);
                }
                if (this.userData.user_plan_details.planId && index <= -1) {
                  this.isCustomPlanUser = true;
                  this.selectedPlan = this.userData.user_plan_details;
                }
              } else {
                this.planChanged(0);
              }
            } else {
              this.planChanged(0);
            }
            this.applicableTaxPer = res.data.applicableTaxPer ? res.data.applicableTaxPer : 0;
            break;
          default:
            this.plans = [];
            break;
        }
      } else {
        this.plans = [];
      }
      this.isDataLoaded = true;
      this.zone.run(() => {
        if (!this.changeRef['destroyed']) {
          this.changeRef.detectChanges();
        }
      });
    });
  }
  planSelected(planId: number, amount: number) {
    this.isDataLoaded = false;
    let dataToSend = {
      type: this.planType,
      amount: amount,
      id: planId,
      token: '',
      success: this.SiteUrl + 'payment-success',
      cancel: this.SiteUrl + 'payment-cancel',
      failed: this.SiteUrl + 'payment-fail'
    };
    let credits = this.checkCredit == 0 ? this.credit : this.selectedCustomCredits.credit;
    let bonus =
      this.checkCredit == 0
        ? this.customBonus
        : this.getBonusCredits(this.selectedCustomCredits.credit, this.selectedCustomCredits.bonus);
    dataToSend['credits'] = credits;
    dataToSend['bonus'] = bonus;
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      dataToSend.token = this.winServ.getLocalItem('token');
    } else {
      // swal('Warning', 'You need to login to subscribe!', 'info');
      this.$header.headerNotifyalert('Warning!', 'You need to login to subscribe!', 'info');
      this.payPalClickedCustom = false;
      return;
    }
    this.selectPlanReq = this.comServ
      .post('webservices/paymentByPaypal', dataToSend)
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              if (data.redirect_url) {
                window.location.href = data.redirect_url;
              } else {
                this.isDataLoaded = true;
              }
              break;
            default:
              this.isDataLoaded = true;
              break;
          }
        }
        this.payPalClicked = false;
      });
  }
  checkLogin(isLoggedIn: boolean) {
    this.getPlans();
    this.isUserLoggedIn = isLoggedIn;
    if (isLoggedIn) {
      this.userData = JSON.parse(this.winServ.getLocalItem('userData'));
      if (this.stripeObject) {
        this.stripeObject.paymentData.number =
          this.userData && this.userData.cardNumber ? this.userData.cardNumber : null;
        this.stripeObject.expiryMonthYear =
          this.userData && this.userData.expiryMonthYear ? this.userData.expiryMonthYear : null;
        this.stripeObject.paymentData.email =
          this.userData && this.userData.email ? this.userData.email : null;
      }
      if (this.stripeObjectCustom) {
        this.stripeObjectCustom.paymentData.number =
          this.userData && this.userData.cardNumber ? this.userData.cardNumber : null;
        this.stripeObjectCustom.expiryMonthYear =
          this.userData && this.userData.expiryMonthYear ? this.userData.expiryMonthYear : null;
        this.stripeObjectCustom.paymentData.email =
          this.userData && this.userData.email ? this.userData.email : null;

        this.userPlanDataBonus =
          this.userData.user_plan_details &&
          this.userData.user_plan_details.facilities &&
          this.userData.user_plan_details &&
          this.userData.user_plan_details.facilities.bonusCredit
            ? this.userData.user_plan_details.facilities.bonusCredit
            : 0;
      }

      if (this.userData) {
        let mainIndex = this.plans.findIndex(d => this.userData.user_plan == d.account_id);
        if (mainIndex > -1) {
          let index = this.plans[mainIndex].plan_details.findIndex(
            d => d.plan_id == this.userData.user_plan_details.planId
          );
          this.planChanged(mainIndex);
          if (index > -2) {
            this.setSelectedPlanIndex(index, mainIndex);
          }
          if (this.userData.user_plan_details.planId && index <= -1) {
            this.isCustomPlanUser = true;
            this.selectedPlan = this.userData.user_plan_details;
            // console.log(this.selectedPlan);
          }
        }
      }
    } else {
      // this.planDivider =
    }
    this.zone.run(() => {
      if (!this.changeRef['destroyed']) {
        this.changeRef.detectChanges();
      }
    });
  }
  customCreditPuch() {
    this.checkCredit = 0;
    // this.amountError = (this.amount>0) ? false : true;
    this.amount = this.amount && this.amount > 4 ? this.amount : 5;
    if (this.amount) {
      this.credit = Math.floor(
        this.amount ? (this.amount * this.customCredit) / this.planDivider : 0
      );
      this.customBonus = Math.floor(this.getBonusCredits(this.amount * this.customCredit));
      this.selectedCustomCredits.totalCredits = this.credit;
      this.selectedCustomCredits.amount = parseInt(this.amount.toString());
    } else {
      this.credit = 0;
      this.customBonus = 0;
      this.selectedCustomCredits.totalCredits = 0;
      this.selectedCustomCredits.amount = 0;
    }
    this.selectedCustomCredits.applicableTax =
      (this.selectedCustomCredits.amount / 100) * this.applicableTaxPer;
  }
  customCreditSelect(list) {
    this.customBonus = 0;
    this.selectedCustomCredits = Object.assign({}, list);
    this.selectedCustomCredits.totalCredits =
      parseInt(list.credit) + this.getBonusCredits(list.credit, list.bonus);
    this.checkCredit = list.credit_id;
    this.amount = 0;
    this.credit = 0;
  }
  getBonusCredits(credits, bonus = 1) {
    this.userPlanDataBonus = this.userPlanDataBonus || this.$header.userPlanDataBonus || 0;
    return Math.floor((credits * this.userPlanDataBonus * bonus) / 100);
  }
  customCreditPurchase() {
    this.payPalClickedCustom = true;
    this.planType = 4;
    if (this.checkCredit == 0) {
      this.planSelected(this.checkCredit, this.amount);
    } else {
      this.index = this.creditList
        .map(function(o) {
          return o.credit_id;
        })
        .indexOf(this.checkCredit);
      if (this.creditList && this.creditList[this.index].amount) {
        this.planSelected(this.checkCredit, this.creditList[this.index].amount);
      }
    }
  }
  setSelectedPlanIndex(index, mainIndex) {
    this.highlightedPlanIndex = index;
    if (
      this.plans &&
      this.plans[mainIndex]['plan_details'] &&
      this.plans[mainIndex]['plan_details'][this.highlightedPlanIndex]
    ) {
      this.selectedPlan = this.plans[mainIndex]['plan_details'][this.highlightedPlanIndex];
      this.selectedPlan.facilities = this.selectedPlan.facilities
        ? typeof this.selectedPlan.facilities == 'object'
          ? this.selectedPlan.facilities
          : JSON.parse(this.selectedPlan.facilities)
        : {};
      if (
        !this.isUserLoggedIn ||
        (this.userData &&
          (!this.userData.user_plan_details || !this.userData.user_plan_details.planId))
      ) {
        this.userPlanDataBonus =
          this.selectedPlan.facilities && this.selectedPlan.facilities.bonusCredit
            ? this.selectedPlan.facilities.bonusCredit
            : 0;
      }
    }
  }
  planChanged(index) {
    this.highlightedPlanIndex = 1;
    if (
      this.plans &&
      this.plans[index]['plan_details'] &&
      this.plans[index]['plan_details'][this.highlightedPlanIndex]
    ) {
      this.selectedPlan = this.plans[index]['plan_details'][this.highlightedPlanIndex];
      this.selectedPlan.facilities = this.selectedPlan.facilities
        ? typeof this.selectedPlan.facilities == 'object'
          ? this.selectedPlan.facilities
          : JSON.parse(this.selectedPlan.facilities)
        : {};
      if (
        !this.isUserLoggedIn ||
        (this.userData &&
          (!this.userData.user_plan_details || !this.userData.user_plan_details.planId))
      ) {
        this.planDivider = index == 0 ? 1 : index == 1 ? 2 : index == 2 ? 5 : 1;
        for (let i = 0; i < this.creditList.length; i++) {
          const list = this.creditList[i];
          list.amountTemp = list.amount * this.planDivider;
        }
        this.customCreditSelect(this.creditList[0]);
        this.userPlanDataBonus =
          this.selectedPlan.facilities && this.selectedPlan.facilities.bonusCredit
            ? this.selectedPlan.facilities.bonusCredit
            : 0;
      }
      // this.planDivider = (index == 0) ? 1 : (index == 1) ? 2 : (index == 2) ? 5 : 1;
    }
  }
  parseJSON(data) {
    if (data && typeof data == 'object') {
      return data;
    } else if (data) {
      return JSON.parse(data);
    }
    return {};
  }
  subscribeToThisPlan(plan) {
    let planD = this.userData.user_plan_details;
    if (
      planD &&
      planD.subscriptionName &&
      (planD.subscriptionStatus == '1' || planD.subscriptionStatus == '2')
    ) {
      let subName = planD.subscriptionName;
      let status = 'an active';
      if (planD.subscriptionStatus == '2') {
        status = 'a cancelled';
      }
      let message =
        '<div class="delete-modal-body"><div class="credit-spend-confirm text-left clearfix"><p>You already have ' +
        status +
        '<br> <span class="text-blue">' +
        planD.planName +
        ' - ' +
        subName +
        '</span> plan.</p><p>Continue will cancel your current plan.</p> </div></div>';
      this.showAlert('Warning!', message, 'Continue', 'Cancel').then(result => {
        if (result.value) {
          $('body')
            .find('#subscribe-modal-btn')
            .click();
          $('body').addClass('modal-open-checkout');
        }
      });
    } else {
      $('body')
        .find('#subscribe-modal-btn')
        .click();
      $('body').addClass('modal-open-checkout');
    }
    this.planAmount = parseFloat(plan.amount);
    this.planActualAmount = plan.actualAmount;
    this.planId = plan.plan_id;
  }
  plandPurchasedSuccess = event => {
    this.$header.updateUserData();
    $('body')
      .find('#subscribe-modal')
      .find('.close')
      .click();
  };
  planTransactionSuccess(data: any) {
    let token = this.winServ.getLocalItem('token');
    if (token && data.payId && data.id && this.planId) {
      let dataToSend = {
        token: token,
        planId: this.planId,
        paymentId: data.payId,
        paymentUsing: 'stripe',
        subscriptionId: data.id
      };
      this.comServ.post('webservices/userSubscription', dataToSend).subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.stripeObject.isLoading = false;
                this.$header.updateUserData();
                // swal('Success', data.message, 'success');
                this.subscriptionNotifyAlert('Success!', data.message, 'success');
                break;
              case 400:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                break;
              case 401:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                break;
              case 403:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                break;
              case 404:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                break;
              case 500:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                break;
              default:
                // swal('Error', 'An unkown error occure while subscribing to photobash. Please try again after some time.', 'error');
                this.subscriptionNotifyAlert(
                  'Error!',
                  'An unkown error occure while subscribing to photobash. Please try again after some time.',
                  'error'
                );
                break;
            }
            $('body')
              .find('#subscribe-modal')
              .find('.close')
              .click();
          } else {
            // swal('Error', 'An unkown error occure while subscribing to photobash. Please try again after some time.', 'error');
            this.subscriptionNotifyAlert(
              'Error!',
              'An unkown error occure while subscribing to photobash. Please try again after some time.',
              'error'
            );
            return;
          }
        },
        err => {
          console.log(err);
        }
      );
    } else {
      // swal('Error', 'Invalid request for subscription!', 'error');
      this.subscriptionNotifyAlert('Error!', 'Invalid request for subscription.', 'error');
      return;
    }
  }
  customCreditTransactionSuccess(data: any) {
    let credits =
      this.checkCredit == 0
        ? this.credit + this.customBonus
        : this.selectedCustomCredits.totalCredits;
    let token = this.winServ.getLocalItem('token');
    let credit = this.checkCredit == 0 ? this.credit : this.selectedCustomCredits.credit;
    let bonus =
      this.checkCredit == 0
        ? this.customBonus
        : this.getBonusCredits(this.selectedCustomCredits.credit, this.selectedCustomCredits.bonus);
    if (token) {
      let dataToSend = {
        token: token,
        credits: credits,
        paymentId: data.payId,
        subscriptionId: data.id,
        credit: credit,
        bonus: bonus,
        planId:
          this.userData && this.userData.user_plan_details && this.userData.user_plan_details.planId
            ? this.userData.user_plan_details.planId
            : 0
      };
      this.comServ.post('webservices/customCreditsByCard', dataToSend).subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.stripeObjectCustom.isLoading = false;
              this.$header.updateUserData();
              $('body')
                .find('#custom-credit-modal')
                .find('.close')
                .click();
              // swal('Success', data.message, 'success');
              this.$header.headerNotifyalert('Success!', data.message, 'success');
              break;
            case 400:
              // swal('Error', data.message, 'error');
              this.$header.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 401:
              // swal('Error', data.message, 'error');
              this.$header.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 403:
              // swal('Error', data.message, 'error');
              this.$header.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 404:
              // swal('Error', data.message, 'error');
              this.$header.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 500:
              // swal('Error', data.message, 'error');
              this.$header.headerNotifyalert('Error!', data.message, 'error');
              break;
            default:
              // swal('Error', 'An unkown error occure while subscribing to photobash. Please try again after some time.', 'error');
              this.$header.headerNotifyalert(
                'Error!',
                'An unkown error occure while subscribing to photobash. Please try again after some time.',
                'error'
              );
              break;
          }
        }
      });
    } else {
      // swal('Error', 'You need to login to purchase credits.', 'error');
      this.$header.headerNotifyalert('Error!', 'You need to login to purchase credits.', 'error');
    }
  }
  payByPaypalForSubscription() {
    let token = this.winServ.getLocalItem('token');
    if (
      !this.userData.paypalEmail ||
      this.userData.paypalEmail == '' ||
      this.userData.paypalEmail == null
    ) {
      $('body')
        .find('#subscribe-modal')
        .find('.close')
        .click();
      swal({
        customClass: 'delete-modal-box paypal-subscription-alert',
        title: '<img src="' + this.ImgPath + 'paypal-logo.svg" width="90">',
        padding: 0,
        html:
          '<div class="delete-modal-body"><div class="credit-spend-confirm text-left clearfix"><p>Confirm your PayPal email address.</p></div></div>',
        input: 'text',
        showCloseButton: true,
        showCancelButton: false,
        buttonsStyling: false,
        confirmButtonText: 'Continue',
        confirmButtonClass: 'btn btn-theme-white confirm-paypal-btn',
        // cancelButtonClass: 'btn btn-cancle',
        animation: false,
        showLoaderOnConfirm: true,
        allowEscapeKey: false,
        inputPlaceholder: 'Email address',
        preConfirm: email => {
          return new Promise(resolve => {
            let res = this.comServ.isValidEmail(email);
            if (res) {
              this.comServ
                .post('webservices/updatePaypalEmail', {
                  token: token,
                  email: email
                })
                .subscribe(data => {
                  if (data.status) {
                    switch (data.status) {
                      case 200:
                        resolve();
                        break;
                      case 400:
                        swal.showValidationError(data.message);
                        resolve();
                        break;
                      case 403:
                        swal.showValidationError(data.message);
                        resolve();
                        break;
                      case 503:
                        swal.showValidationError(data.message);
                        resolve();
                        break;
                      default:
                        swal.showValidationError('An unknown error occure.');
                        resolve();
                        break;
                    }
                  }
                });
            } else {
              swal.showValidationError('Please enter valid email.');
              resolve();
            }
          });
        },
        allowOutsideClick: false
      }).then(result => {
        if (result && result.value) {
          this.paypalCallback();
        }
      });
    } else {
      this.paypalCallback();
    }
  }
  paypalCallback() {
    let token = this.winServ.getLocalItem('token');
    $('body')
      .find('#subscribe-modal-btn')
      .click();
    this.payPalClicked = true;
    this.comServ
      .post('webservices/payByPaypalForSubscription', {
        token: token,
        planId: this.planId
      })
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                window.location.href = data.approvedLink;
                break;
              case 400:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                this.payPalClicked = false;
                break;
              case 401:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                this.payPalClicked = false;
                break;
              case 403:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                this.payPalClicked = false;
                break;
              case 404:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                this.payPalClicked = false;
                break;
              case 500:
                // swal('Error', data.message, 'error');
                this.subscriptionNotifyAlert('Error!', data.message, 'error');
                this.payPalClicked = false;
                break;
              default:
                // swal('Error', 'An unkown error occure while subscribing to photobash. Please try again after some time.', 'error');
                this.subscriptionNotifyAlert(
                  'Error!',
                  'An unkown error occure while subscribing to photobash. Please try again after some time.',
                  'error'
                );
                this.payPalClicked = false;
                break;
            }
          }
          // this.payPalClicked = false;
        },
        err => {
          this.payPalClicked = false;
        }
      );
  }
  userDataUpdated(user) {
    this.userData = user;
    this.getPlans();
  }
  submitCustomPlanRequest(form: NgForm) {
    let formValue = form.value;
    this.customPlanErrors = [];
    this.successMessage = null;
    this.errorMessage = null;
    if (!this.winServ.getLocalItem('token')) {
      this.errorMessage = 'You need to login to request a new plan.';
      setTimeout(() => {
        this.errorMessage = null;
      }, 5000);
      return;
    }
    if (!form.valid) {
      for (let i in formValue) {
        if (!formValue[i]) {
          this.customPlanErrors[i] = this.comServ.ucfirst(i) + ' is required.';
        }
      }
      return;
    }
    this.requestingCustomPlan = true;
    formValue.user_id = this.userData.id;
    this.comServ.post('webservices/customSubscriptionRequest', formValue).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            this.successMessage = data.message;
            form.reset();
            break;
          case 400:
            this.errorMessage = data.message;
            break;
          case 401:
            this.errorMessage = data.message;
            break;
          case 403:
            this.errorMessage = data.message;
            break;
          case 404:
            this.errorMessage = data.message;
            break;
          case 500:
            this.errorMessage = data.message;
            break;
          default:
            this.errorMessage = 'An unknown error occure while requesting for custom subscription.';
            break;
        }
      }
      this.requestingCustomPlan = false;
      setTimeout(() => {
        this.successMessage = null;
        this.errorMessage = null;
      }, 5000);
    });
  }
  clearErrorMessage(field) {
    this.customPlanErrors[field] = null;
  }
  clearActviationError() {
    this.activationError = null;
  }
  activateCustomPlan(form: NgForm) {
    this.activationError = null;
    if (!this.winServ.getLocalItem('token')) {
      this.activationError = 'You need to login to activate plan.';
      setTimeout(() => {
        this.activationError = null;
      }, 5000);
      return;
    }
    if (!form.valid) {
      if (form.control && form.control.controls) {
        for (let i in form.control.controls) {
          if (!form.control.controls[i].valid) {
            this.activationError = i + ' is required.';
          }
        }
      }
      return;
    }
    this.getingActivationCodeDetails = true;
    let dataToSend = {
      activation_code: this.activationCode
    };
    this.comServ.post('webservices/activatePlan', dataToSend).subscribe(
      data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.selectedPlan = data.plan;
              if ($('body').find('#plan-modal-btn').length > 0) {
                $('body')
                  .find('#plan-modal-btn')[0]
                  .click();
              }
              if ($('body').find('#modal-custom-subscription').length > 0) {
                $('body')
                  .find('#modal-custom-subscription')
                  .find('.close')
                  .click();
              }
              form.reset();
              break;
            case 400:
              this.activationError = data.message;
              break;
            case 403:
              this.activationError = data.message;
              break;
            case 404:
              this.activationError = data.message;
              break;
            case 500:
              this.activationError = data.message;
              break;
            default:
              this.activationError =
                'An unknown error occure while fetching details about plan. Please try again after some time.';
              break;
          }
        } else {
          this.activationError =
            'An unknown error occure while fetching details about plan. Please try again after some time.';
        }
        this.getingActivationCodeDetails = false;
      },
      err => {
        console.log(err);
        this.activationError =
          'An unknown error occure while fetching details about plan. Please try again after some time.';
        this.getingActivationCodeDetails = false;
      }
    );
  }
  getAccountType() {
    this.$header.selectAccountTypes();
  }
  showAlert(title, messageHTML, confirmButtonText, cancelButtonText) {
    //
    let obj = {
      customClass: 'delete-modal-box comman-modal',
      titleText: title,
      padding: 0,
      html: '<div>' + messageHTML + '</div>',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      background: '#f3f3f5',
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-theme-white',
      cancelButtonClass: 'btn btn-cancle',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      animation: false
    };
    return swal(obj);
  }
  subscriptionNotifyAlert(title, messageHTML, type, position = null, timer = 5000) {
    return this.comServ.notify(title, messageHTML, type, position, timer);
  }
  numberType(number) {
    return parseInt(number);
  }
  headerNotifyalert(title, messageHTML, type, position = null, timer = 5000) {
    return this.comServ.notify(title, messageHTML, type, position, timer);
  }

  /* Phase 4 Code */
  onCreditCardPaymentDoneForAddCredit = (payemntData: any) => {
    this.addCreditSuccessReq = this.comServ
      .post('accountupdates', {
        ...payemntData,
        creditData: {
          ...this.selectedCustomCredits,
          bonus: this.customBonus,
          credit: this.checkCredit == 0 ? this.credit : this.selectedCustomCredits.credit
        },
        token: localStorage.getItem('token')
      })
      .subscribe(
        data => {
          switch (data.status) {
            case 200:
              $('body')
                .find('#custom-credit-modal-subsc')
                .find('.close')
                .click();
              if (data.invoiceId) {
                this.router.navigate(['/payment-success'], {
                  queryParams: {
                    status: 200,
                    message: 'Payment successfull',
                    type: 1,
                    id: data.invoiceId
                  }
                });
              }
              break;

            default:
              this.headerNotifyalert(
                'Error!',
                data.message || 'An unexpected error occure while generating your request',
                'error'
              );
              break;
          }
        },
        () => {
          this.headerNotifyalert(
            'Error!',
            'An unexpected error occure while generating your request',
            'error'
          );
        }
      );
  };
  /* Phase 4 Code */

  ngOnDestroy() {
    if (this.selectPlanReq) {
      this.selectPlanReq.unsubscribe();
    }
    if (this.addCreditSuccessReq) {
      this.addCreditSuccessReq.unsubscribe();
    }
    if (this.planReq) {
      this.planReq.unsubscribe();
    }
    if (this.fragmentReq) {
      this.fragmentReq.unsubscribe();
    }
  }
}
