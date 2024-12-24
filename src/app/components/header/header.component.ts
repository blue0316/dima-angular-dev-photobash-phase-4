import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, state, style } from '@angular/animations';

import { NgForm } from '@angular/forms';
import * as $ from 'jquery';
import swal from 'sweetalert2';
import { ISubscription } from 'rxjs/Subscription';
import { AppSettings } from './../../app.setting';
import { WindowSevice } from './../../services/window.service';
import { UserSevice } from './../../services/user.service';
import { HeaderSevice } from './../../services/header.service';
import { CommonSevice } from './../../services/common.service';

import { CartService } from '../../services/cart.service';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { UpdateService } from '../../services/update.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/operator/takeUntil';
import * as querString from 'query-string';
declare var window: any;
declare var gapi: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [WindowSevice, UserSevice, HeaderSevice, CommonSevice, CartService],
  animations: [
    trigger('toggleAnimation', [
      state(
        'show',
        style({
          visibility: 'visible'
        })
      ),
      state('hide', style({}))
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  SiteURL: string = AppSettings.SITE_ENDPOINT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  private SiteUrl: string = AppSettings.SITE_ENDPOINT;
  showLoginPopup: boolean;
  homeClass: boolean;
  showSearchBox: boolean;
  currentUrl: string;
  isLoggedIn: boolean;
  showRememberMe: boolean;
  user: any;
  loginUser = {
    email: '',
    password: ''
  };
  signupUser = {
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };
  isLoginError: boolean;
  loginError: string;
  loggingIn: boolean;
  isSignupError: boolean;
  signupError: string;
  signingUp: boolean;
  settingUpdate: boolean;
  changePasswordUpdate: boolean;
  accountDeleteUpdate: boolean;
  errorClass: boolean;
  uemail: string;
  sendingLink: boolean;
  isForgetError: boolean;
  forgetError: string;
  forgetErrorClass: boolean;
  isSettingError: boolean;
  settingError: string;
  settingErrorClass: boolean;
  isChangePasswordError: boolean;
  changePasswordError: string;
  changePasswordErrorClass: boolean;
  isaccountDeleteError: boolean;
  accountDeleteError: string;
  accountDeleteErrorClass: boolean;
  accountLicense: string;
  countries: string;
  settingInfo = {};
  chnagePassword = {
    oldpassword: '',
    newpassword: '',
    confpassword: ''
  };
  importMessage: string = null;
  number_of_logins: any;
  selectedPlan: any = {};
  selectedCustomCredits: any = {
    amount: 0,
    bonus: 0,
    credit: 0
  };
  timeZone: string;
  vatNumberError: string;
  vatPostalCodeError: string;
  firstNameError: string;
  lastNameError: string;
  UsernameError: string;
  hideModal: boolean;
  serverError = {
    vat_number: ''
  };
  changeError = {
    oldpassword: '',
    newpassword: '',
    confpassword: ''
  };
  serverLoginError: any = {};
  isValidVatNumber: boolean;
  aciveSection = '';
  isTermsAccept = true;
  isTermsAcceptFinal: boolean;
  signUperror: any = {
    first_name: null,
    last_name: null,
    email: null,
    password: null
  };
  cartActive: boolean;
  state = 'hide';
  purchasingCart: boolean;
  cartData = {
    data: []
  };
  payPalClicked: boolean;
  userPlanDetails: any = {};
  userBillingDetails: any = {};
  userBillingDetailsConst: any = {};
  billingError: any = {};
  allCountries: any = [];
  savingBillingDetails: boolean;
  billingMessage: string;
  cancellingSubscription: boolean;
  adminLoggingin: boolean;
  photoLoginError: string = null;
  loginData: any = [];
  messageForLogin = 'No Data Availiable.';
  checkCredit: number;
  credit: number;
  amount: number;
  customCredit: number;
  creditList: any = [];
  payPalClickedCustom: boolean;
  planType: number;
  isDataLoaded: boolean;
  index: number;
  loadingCustomCredit: boolean;
  userId: any;
  retryLogin: boolean;
  userPlanDataBonus: any;
  customBonus = 0;
  planDivider = 0;
  amountError: boolean;
  accountTypes: Array<any> = [];
  selectedAccType: any = '';
  accountTypeError: string = null;
  changingAccType: boolean;
  selectedAccountIndex = -1;
  lastUser: string = null;
  isFirstTimeLogin: boolean;
  sendingImportRequest: boolean;
  applicableTaxPer = 0;
  rememberMe: boolean;
  packQueryParams = {};
  imageQueryParams = {};
  kitQueryParams = {};
  modelQueryParams = {};
  /*Generate emmiters*/
  // tslint:disable-next-line: no-output-rename
  @Output('categoryId') outgoingData: EventEmitter<string> = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('isLoggedIn') isUserLoggedIn: EventEmitter<boolean> = new EventEmitter();
  @Output('cartPurchased') cartPurchased: EventEmitter<boolean> = new EventEmitter();
  @Output('userDataUpdated') userDataUpdated: EventEmitter<boolean> = new EventEmitter();
  @Output('isFirstLogin') isFirstLogin: EventEmitter<boolean> = new EventEmitter();
  @Output('oneUserLoggedOut') oneUserLoggedOut: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('customPay') customPaymentObject: PaymentModalComponent;
  // Request Instance
  checkLoginReq: ISubscription;
  signOutReq: ISubscription;
  loginReq: ISubscription;
  signUpReq: ISubscription;
  sendResetLinkReq: ISubscription;
  getSettingReq: ISubscription;
  updateSettingReq: ISubscription;
  deleteAccountReq: ISubscription;
  changePassReq: ISubscription;
  checkVATReq: ISubscription;
  purchaseFromCartReq: ISubscription;
  photoLoginReq: ISubscription;
  getCustomSubscriptionReq: ISubscription;
  selectPlanReq: ISubscription;
  getAccountTypeReq: ISubscription;
  setAccountTypeReq: ISubscription;
  importReq: ISubscription;
  getCountryReq: ISubscription;
  addCreditSuccessReq: ISubscription;
  forgetErrorSer: any = {};
  oldEmail: string = null;
  importReqError: any = {};
  auth2: any;
  selectedAccountType = {
    id: 0,
    name: 'Almost done...',
    description:
      'Choose your <span class="text-blue">Account Type</span>.<br>Select the option which best fits your situation.',
    image: 'assets/image/AT_SelectType.jpg'
  };
  numberOfLoggedInArray: Array<number> = [];
  adminRememberDisplay: boolean;

  ngUnsubscrbe = new Subject<boolean>();
  openDetails = false;
  currentFullURL: string;
  routerEvent: ISubscription;
  /*Constructor of class/component*/
  constructor(
    private winServ: WindowSevice,
    private headerServ: HeaderSevice,
    private router: Router,
    private comServ: CommonSevice,
    private cartService: CartService,
    private elementRef: ElementRef,
    private updateService: UpdateService
  ) {
    this.currentFullURL = this.router.url;
    this.currentUrl = this.currentFullURL.split('?')[0];
    this.homeClass = this.currentUrl == '/' || this.currentUrl == '' ? true : false;
    this.showSearchBox = this.currentUrl == '/' || this.currentUrl == '' ? true : false;
    this.cartActive = this.currentUrl == '/packs' ? true : false;
    this.errorClass = true;
    this.forgetErrorClass = true;
    this.settingErrorClass = true;
    this.changePasswordErrorClass = true;
    this.accountDeleteErrorClass = true;
  }
  ngOnInit() {
    // test
    // ._5h0i._88va

    //
    this.updateService.updateSubs.takeUntil(this.ngUnsubscrbe).subscribe(res => {
      if (res === 'yes') {
        this.updateCartData();
      }
    });

    this.updateService.getUpdateCusCreSub.takeUntil(this.ngUnsubscrbe).subscribe(res => {
      if (res === 'yes') {
        this.getAndUpdateCustomCredits();
      }
    });

    this.updateService.updUsrDatSub.takeUntil(this.ngUnsubscrbe).subscribe(res => {
      if (res === 'yes') {
        this.updateUserData();
      }
    });
    this.userLoginCheck();
    var _that = this;
    if (this.winServ.getLocalItem('adminRememberMe') == '1') {
      this.adminRememberDisplay = true;
    }
    window.addEventListener('storage', function(e) {
      if (e.key && e.key == 'token') {
        if (!e.newValue) {
          $('.logout').show();
          $('.login').hide();
          _that.winServ.removeItem('userData');
          window.location.href = '/';
        } else {
          $('.login').show();
          $('.logout').hide();
          window.location.reload();
        }
      }
    });
    this.getCountryReq = this.comServ.get('webservices/getAllCountries').subscribe(data => {
      this.allCountries = data.data ? data.data : [];
      this.applicableTaxPer = data.applicableTax ? data.applicableTax : 0;
    });
    setTimeout(() => {
      if (window['FB']) {
        window['FB'].XFBML.parse();
      }
      this.elementRef.nativeElement
        .querySelector('#logged-in-details-modal-btn')
        .addEventListener('click', this.onLoggedInModalBtnClick.bind(this));
      this.elementRef.nativeElement
        .querySelector('#set-account-type-btn')
        .addEventListener('click', this.selectAccountTypes.bind(this));
    }, 2000);

    /* Set Credentital for faster login */
    if (this.winServ.removeItem('rememberLoginCredentials')) {
      this.rememberMe = true;
      this.loginUser = {
        email: this.winServ.getLocalItem('email'),
        password: this.winServ.getLocalItem('password')
      };
    }
    /*  */
    this.routerEvent = this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        console.log(this.router.url);
        this.currentFullURL = this.router.url;
      }
    });
  }
  ngAfterViewInit() {
    this.setQueryParams();
  }

  onAccoountTrigger(event) {
    this.selectAccountTypes();
  }
  onLoggedInModalBtnClick(event) {
    let id = $('body')
      .find('#logged-in-details-modal-btn')
      .attr('data-id');
    let accessToken = $('body')
      .find('#logged-in-details-modal-btn')
      .attr('data-token');
    let email = $('body')
      .find('#logged-in-details-modal-btn')
      .attr('data-email');
    if (accessToken && email) {
      this.retryLogin = true;
      this.loginUser['password'] = '***********';
      this.loginUser['email'] = email;
      this.loginUser['accessToken'] = accessToken;
    }
    if (id) {
      this.userId = parseInt(id);
      this.getLoggedInDetails(parseInt(this.userId));
    }
  }
  userLoginCheck() {
    if (this.winServ.isLocalStoragSupported()) {
      this.showRememberMe = true;
    }
    this.loggingIn = false;
    let token = '';
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      token = this.winServ.getLocalItem('token');
    }
    if (token) {
      let u = JSON.parse(this.winServ.getLocalItem('userData'));
      let loggedInId = '';
      if (u) {
        this.user = u;
        this.isLoggedIn = true;
        this.userPlanDetails = u.user_plan_details;
        loggedInId = u.loginId;
        this.oldEmail = u.email;
      }
      setTimeout(() => {
        this.checkLoginReq = this.headerServ
          .checkUserLoginStatus(token, loggedInId)
          .subscribe(data => {
            if (data.status) {
              switch (data.status) {
                case 200:
                  this.setUserData(data.data, token);
                  this.isLoggedIn = true;
                  this.isUserLoggedIn.emit(true);
                  break;
                default:
                  this.isUserLoggedIn.emit(false);
                  this.isLoggedIn = false;
                  this.winServ.removeItem('token');
                  this.winServ.removeItem('userData');
                  break;
              }
              this.updateCartData();
            }
          });
      }, 1000);
    } else {
      this.isUserLoggedIn.emit(false);
      this.updateCartData();
    }
  }
  signInWithGoogle(): void {
    var myParams = {
      client_id: AppSettings.GOOGLE_PROVIDER_ID, // You need to set client id
      scope: 'email'
    };
    let _that = this;
    _that.auth2 = gapi.auth2.init(myParams);

    _that.auth2.then(function() {
      if (_that.auth2.isSignedIn.get()) {
        let profile = _that.auth2.currentUser.get().getBasicProfile();
        let name = profile.getName().split(' ');
        let responseData = {
          first_name: profile.getGivenName(),
          last_name: profile.getFamilyName(),
          email: profile.getEmail(),
          social_type: 'GOOGLE'
        };
        setTimeout(function() {
          this.saveUserData(responseData);
        }, 10);
      } else {
        _that.auth2.signIn(myParams).then(function(data) {
          let profile = _that.auth2.currentUser.get().getBasicProfile();
          let name = profile.getName().split(' ');
          let responseData = {
            first_name: profile.getGivenName(),
            last_name: profile.getFamilyName(),
            email: profile.getEmail(),
            social_type: 'GOOGLE'
          };
          setTimeout(function() {
            this.saveUserData(responseData);
          }, 10);
        });
      }
    });
  }
  saveUseDetails(user) {
    this.headerServ.saveUserDetails(user).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            this.isLoginError = false;
            this.loginError = '';
            setTimeout(() => {
              this.isLoginError = false;
            }, 3000);
            this.setUserData(data.data, data.token);
            this.isLoggedIn = true;
            this.isUserLoggedIn.emit(true);
            break;
          case 404:
            this.isLoginError = true;
            this.loginError = 'User not found';
            this.isLoggedIn = false;
            this.isUserLoggedIn.emit(false);
            break;
          case 401:
            this.isLoginError = true;
            this.loginError = data.error_message;
            this.isLoggedIn = false;
            this.isUserLoggedIn.emit(false);
            break;
          case 500:
            this.isLoginError = true;
            this.isLoggedIn = false;
            this.loginError = 'Some Error occure, please try after some time';
            this.isUserLoggedIn.emit(false);
            break;
          case 503:
            this.userId = data.user_id;
            this.getLoggedInDetails(data.user_id);
            $('body')
              .find('#logged-in-details-modal-btn')[0]
              .click();
            this.isLoggedIn = false;
            this.retryLogin = true;
            break;
          default:
            this.isLoginError = true;
            this.loginError = 'An unexpected error occure, please try again after some time';
            this.isLoggedIn = false;
            this.isUserLoggedIn.emit(false);
            break;
        }
      } else {
        this.isLoggedIn = false;
        this.isUserLoggedIn.emit(false);
      }
    });
  }

  checkLogin() {
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      this.userLoginCheck();
      setTimeout(() => {
        $('body')
          .find('.modal')
          .find('.close:first')
          .click();
      }, 100);
    }
  }

  updateUserData() {
    let token = '';
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      token = this.winServ.getLocalItem('token');
    }
    if (token) {
      let u = JSON.parse(this.winServ.getLocalItem('userData'));
      let loggedInId = '';
      if (u) {
        this.user = u;
        this.isLoggedIn = true;
        this.userPlanDetails = u.user_plan_details;
        loggedInId = u.loginId;
      }
      this.checkLoginReq = this.headerServ
        .checkUserLoginStatus(token, loggedInId)
        .subscribe(data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.setUserData(data.data, token);
                break;
              default:
                break;
            }
          }
        });
    }
    this.updateService.updatingUserData(null);
  }
  signOut(): void {
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      this.setPage();
      this.signOutReq = this.headerServ
        .logoutUser(this.winServ.getLocalItem('token'), this.user.loginId)
        .subscribe(data => {
          this.winServ.removeItem('userData');
          this.winServ.removeItem('adminRememberMe');
          this.isLoggedIn = false;
          this.winServ.removeItem('token');
          /*  */
          if (
            this.isLoggedIn &&
            this.user &&
            this.user.id &&
            ['/packs', '/images', '/kits', '/models'].indexOf(this.currentUrl) > -1
          ) {
            this.comServ.setNewUserURL(this.user.id, this.currentFullURL, this.currentUrl);
          }
          /*  */
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        });
    }
  }

  login() {
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('userData')) {
      this.winServ.removeItem('userData');
      this.winServ.removeItem('token');
      $('body')
        .find('#logged-in-details-modal-btn')
        .removeAttr('data-id');
      $('body')
        .find('#logged-in-details-modal-btn')
        .removeAttr('data-token');
      $('body')
        .find('#logged-in-details-modal-btn')
        .removeAttr('data-email');
      $('body')
        .find('#logged-in-details-modal-btn')
        .removeAttr('data-nologin');
      $('body')
        .find('#set-account-type-btn')
        .removeAttr('data-id');
      $('body')
        .find('#set-account-type-btn')
        .removeAttr('data-token');
      $('body')
        .find('#set-account-type-btn')
        .removeAttr('data-email');
    }
    this.isLoginError = false;
    this.loginError = '';
    this.loggingIn = true;
    this.serverLoginError = {};
    this.retryLogin = false;
    this.loginReq = this.headerServ.loginUser(this.loginUser).subscribe(data => {
      switch (data.status) {
        case 200:
          if (this.rememberMe) {
            this.winServ.setLocalItem('rememberLoginCredentials', true);
            this.winServ.setLocalItem('email', this.loginUser.email);
            this.winServ.setLocalItem('password', this.loginUser.password);
          } else {
            this.winServ.removeItem('rememberLoginCredentials');
            this.winServ.removeItem('email');
            this.winServ.removeItem('password');
          }
          this.isSignupError = false;
          this.loginError = '';
          this.setUserData(data.data, data.token);
          this.updateCartData();
          this.isLoggedIn = true;
          setTimeout(() => {
            this.isUserLoggedIn.emit(true);
            // console.log('fds', $('body').find('#open-welcome-modal-btn'));
            if (data.is_first_login && data.is_first_login == '1') {
              // this.router.navigateByUrl('/?welcome=true');
              $('body')
                .find('#open-welcome-modal-btn')[0]
                .click();
            } else {
              if (data.homepage == undefined) {
                this.router.navigateByUrl('/');
              } else {
                this.router.navigateByUrl('/' + data.homepage);
              }
              // $('body')
              //   .find('#open-welcome-modal-btn')[0]
              //   .click();
            }
          }, 500);

          break;
        case 404:
          this.isLoginError = true;
          this.loginError = 'User not found';
          this.isLoggedIn = false;
          this.isUserLoggedIn.emit(false);
          break;
        case 401:
          if (data.errors) {
            this.serverLoginError = data.errors;
          } else {
            this.isLoginError = true;
            this.loginError = data.error_message;
          }
          this.isLoggedIn = false;
          this.isUserLoggedIn.emit(false);
          break;
        case 500:
          this.isLoginError = true;
          this.loginError = 'Some Error occure, please try after some time';
          this.isLoggedIn = false;
          this.isUserLoggedIn.emit(false);
          break;
        case 503:
          $('body')
            .find('#logged-in-details-modal-btn')
            .attr('data-nologin', data.nologin ? data.nologin : 0);
          this.userId = data.user_id;
          this.getLoggedInDetails(data.user_id);
          if (
            $('body')
              .find('#login-modal')
              .find('.close')[0]
          ) {
            $('body')
              .find('#login-modal')
              .find('.close')[0]
              .click();
          }
          if ($('body').find('#logged-in-details-modal-btn')[0]) {
            setTimeout(function() {
              $('body')
                .find('#logged-in-details-modal-btn')[0]
                .click();
            }, 500);
          }
          this.isLoggedIn = false;
          this.retryLogin = true;
          break;
        default:
          this.isLoginError = true;
          this.loginError = 'An unexpected error occure, please try again after some time';
          this.isLoggedIn = false;
          this.isUserLoggedIn.emit(false);
          break;
      }
      this.loggingIn = false;
      setTimeout(() => {
        this.isLoginError = false;
      }, 3000);
    });
  }

  setUserData(user, token) {
    this.user = user;
    this.userPlanDetails = user.user_plan_details ? user.user_plan_details : {};
    if (this.winServ.isLocalStoragSupported()) {
      this.winServ.setLocalItem('userData', JSON.stringify(user));
      if (token) {
        this.winServ.setLocalItem('token', token);
      }
      this.userPlanDataBonus =
        this.user.user_plan_details &&
        this.user.user_plan_details.facilities &&
        this.user.user_plan_details &&
        this.user.user_plan_details.facilities.bonusCredit
          ? this.user.user_plan_details.facilities.bonusCredit
          : 0;
      if (this.customPaymentObject) {
        this.customPaymentObject.paymentData = {
          email: this.user && this.user.email ? this.user.email : undefined,
          name: this.user && this.user.name ? this.user.name : undefined,
          country: this.user && this.user.country ? this.user.country : undefined,
          number: this.winServ.getLocalItem('storeCardData')
            ? this.winServ.getLocalItem('cardNumber')
            : undefined
        };
      }
      // this.userDataUpdated.emit(user);
    }
    $('body')
      .find('.modal')
      .find('.close:first')
      .click();
    this.oldEmail = this.user.email ? this.user.email : null;
    this.isLoggedIn = true;
  }
  signUp(form: NgForm) {
    if (!this.isTermsAccept) {
      this.isSignupError = true;
      this.errorClass = true;
      this.signupError = 'Please accept the Terms & Conditions.';
    } else {
      this.signingUp = true;
      this.signUpReq = this.headerServ.signUpUser(this.signupUser).subscribe(data => {
        this.signingUp = false;
        if (data.status) {
          switch (data.status) {
            case 200:
              this.loginUser = {
                email: this.signupUser.email,
                password: this.signupUser.password
              };
              this.isSignupError = true;
              this.errorClass = false;
              this.signupError = 'Signed Up Successfully, try login!';
              this.signUperror = data.errors ? data.errors : {};
              let ele = $('body').find('#set-account-type-btn');
              $('body')
                .find('#signup-modal')
                .find('.close:first')
                .click();
              if (ele[0]) {
                this.selectAccountTypes();
                this.lastUser = data.userId;
                ele[0].click();
              }
              break;
            case 404:
              this.isSignupError = false;
              this.errorClass = true;
              this.signUperror = data.errors ? data.errors : {};
              this.signingUp = false;
              break;
            case 401:
              this.isSignupError = false;
              this.errorClass = true;
              this.signUperror = data.errors ? data.errors : {};
              this.signingUp = false;
              break;
            case 500:
              this.isSignupError = true;
              this.errorClass = true;
              this.signupError = 'Some Error occure, please try after some time';
              this.signingUp = false;
              break;
            default:
              this.isSignupError = true;
              this.errorClass = true;
              this.signupError = 'An unexpected error occure, please try again after some time';
              this.signingUp = false;
              break;
          }
        }
      });
    }
    setTimeout(() => {
      this.isSignupError = false;
    }, 3000);
  }
  sendResetLink(form: NgForm) {
    this.sendingLink = true;
    this.forgetErrorSer = {};
    this.sendResetLinkReq = this.headerServ
      .sendResetLink(this.uemail, this.SiteURL + 'reset-password')
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.forgetErrorClass = false;
              this.forgetError = data.message;
              form.resetForm();
              setTimeout(() => {
                $('body')
                  .find('#forget-modal')
                  .find('.close')
                  .click();
              }, 500);
              break;
            case 404:
              this.forgetErrorClass = true;
              this.forgetError =
                data.errors && data.errors.email
                  ? data.errors.email
                  : data.error_message
                  ? data.error_message
                  : 'Some Error occure, please try after some time';
              this.forgetErrorSer['email'] =
                data.errors && data.errors.email ? data.errors.email : null;
              break;
            case 401:
              this.forgetErrorClass = true;
              this.forgetError =
                data.errors && data.errors.email
                  ? data.errors.email
                  : data.error_message
                  ? data.error_message
                  : 'Some Error occure, please try after some time';
              this.forgetErrorSer['email'] = data.errors.email ? data.errors.email : null;
              break;
            case 500:
              this.forgetErrorClass = true;
              this.forgetError = 'Some Error occure, please try after some time';
              break;
            default:
              this.forgetErrorClass = true;
              this.forgetError = 'An unexpected error occure, please try again after some time';
              break;
          }
          if (!this.forgetErrorSer['email']) {
            this.headerNotifyalert(
              this.forgetErrorClass ? 'Error!' : 'Success!',
              this.forgetError,
              this.forgetErrorClass ? 'error' : 'success'
            );
          }
        }
        setTimeout(() => {
          this.isForgetError = false;
        }, 3000);
        this.sendingLink = false;
      });
  }

  getSettingInfo() {
    this.aciveSection = 'setting';
    this.getSettingReq = this.headerServ
      .getsettingInfo(this.winServ.getLocalItem('token'))
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.isSettingError = false;
              this.settingError = '';
              this.accountLicense = data.data.account_license;
              this.countries = data.data.countries;
              this.settingInfo = data.data.user_info;
              if (this.settingInfo['homepage'] == undefined) {
                this.settingInfo['homepage'] = 'dashboard';
              }

              this.timeZone = data.data.time_zone ? data.data.time_zone : '';
              break;
            case 404:
              this.isSettingError = true;
              this.settingError = 'User not found';
              break;
            case 401:
              this.isSettingError = true;
              this.settingError = data.error_message;
              break;
            case 500:
              this.isSettingError = true;
              this.settingError = 'Some Error occure, please try after some time';
              break;
            default:
              this.isSettingError = true;
              this.settingError = 'An unexpected error occure, please try again after some time';
              break;
          }
        }
      });
  }

  submitAccountDelete(form: NgForm) {
    this.accountDeleteUpdate = true;
    this.deleteAccountReq = this.headerServ
      .accountDelete(this.winServ.getLocalItem('token'))
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.errorClass = false;
              this.accountDeleteError = 'Account Delete successfully.';
              setTimeout(() => {
                $('body')
                  .find('#modal-settings')
                  .find('.close:first')
                  .click();
                this.isaccountDeleteError = false;
                this.signOut();
              }, 3000);
              break;
            case 401:
              this.isaccountDeleteError = true;
              this.errorClass = true;
              this.accountDeleteError = 'User not found';
              break;
            case 500:
              this.isaccountDeleteError = true;
              this.errorClass = true;
              this.accountDeleteError = 'Some Error occure, please try after some time';
              break;
            default:
              this.isaccountDeleteError = true;
              this.errorClass = true;
              this.accountDeleteError =
                'An unexpected error occure, please try again after some time';
              break;
          }
        }
        setTimeout(() => {
          this.isChangePasswordError = false;
        }, 3000);
        this.changePasswordUpdate = false;
      });
  }
  submitChangepassword(form: NgForm) {
    this.changePasswordUpdate = true;
    this.changePassReq = this.headerServ
      .changePassword(this.chnagePassword, this.winServ.getLocalItem('token'))
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.isChangePasswordError = true;
              this.errorClass = false;
              this.changePasswordError = 'Password updated successfully.';
              this.changeError = {
                oldpassword: '',
                newpassword: '',
                confpassword: ''
              };
              form.resetForm();
              setTimeout(() => {
                $('body')
                  .find('#modal-settings')
                  .find('.close:first')
                  .click();
                this.isChangePasswordError = false;
              }, 3000);
              break;
            case 404:
              this.isChangePasswordError = true;
              this.errorClass = true;
              this.changePasswordError = 'Path not found';
              break;
            case 401:
              this.changeError = data.errors ? data.errors : {};
              break;
            case 500:
              this.isChangePasswordError = true;
              this.errorClass = true;
              this.changePasswordError = 'Some Error occure, please try after some time';
              break;
            default:
              this.isChangePasswordError = true;
              this.errorClass = true;
              this.changePasswordError =
                'An unexpected error occure, please try again after some time';
              break;
          }
        }
        setTimeout(() => {
          this.isChangePasswordError = false;
        }, 3000);
        this.changePasswordUpdate = false;
      });
  }
  submitUserData() {
    this.settingUpdate = true;
    this.vatNumberError = '';
    this.vatPostalCodeError = '';
    this.firstNameError = '';
    this.lastNameError = '';
    this.UsernameError = '';
    this.serverError = {
      vat_number: ''
    };
    this.updateSettingReq = this.headerServ
      .updateUserSettingDetails(this.settingInfo, this.winServ.getLocalItem('token'))
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.isSettingError = true;
              this.errorClass = false;
              this.settingError = 'Account Settings Successfully Updated.';
              this.serverError = {
                vat_number: ''
              };
              this.userLoginCheck();
              $('body')
                .find('#modal-settings')
                .find('.close:first')
                .click();
              this.isSettingError = false;
              this.headerNotifyalert('Success!', this.settingError, 'success');
              break;
            case 404:
              this.isSettingError = true;
              this.errorClass = true;
              this.settingError = 'Path not found.';
              this.headerNotifyalert('Success!', this.settingError, 'error');
              break;
            case 401:
              this.serverError = data.errors ? data.errors : {};
              break;
            case 500:
              this.isSettingError = true;
              this.errorClass = true;
              this.settingError = 'Some Error occure, please try after some time.';
              break;
            default:
              this.isSettingError = true;
              this.errorClass = true;
              this.settingError = 'An unexpected error occure, please try again after some time.';
              break;
          }
        }
        setTimeout(() => {
          this.isSettingError = false;
        }, 3000);
        this.settingUpdate = false;
      });
  }
  checkVatNumber(vat_number: any) {
    if (vat_number) {
      this.checkVATReq = this.headerServ.checkVatNumber(vat_number).subscribe(data => {
        if (data.valid) {
          this.serverError.vat_number = '';
          this.isValidVatNumber = true;
          this.billingError['VAT_SUCCESS'] = 'VAT number verified successfully.';
          this.billingError['VAT Number'] = null;
        } else {
          this.serverError.vat_number = 'Invalid VAT Number.';
          this.isValidVatNumber = false;
          this.billingError['VAT Number'] = 'Invalid VAT Number.';
          this.billingError['VAT_SUCCESS'] = null;
        }
      });
    } else {
      this.serverError.vat_number = 'Please Enter VAT Number.';
      this.isValidVatNumber = false;
      this.billingError['VAT Number'] = 'Please Enter VAT Number.';
      this.billingError['VAT_SUCCESS'] = null;
    }
    setTimeout(() => {
      this.serverError.vat_number = '';
      this.billingError['VAT_SUCCESS'] = null;
      this.billingError['VAT Number'] = null;
    }, 5000);
  }
  sectionShow(active) {
    this.changeError = {
      oldpassword: null,
      newpassword: null,
      confpassword: null
    };
    this.aciveSection = active;
  }
  toggleCartActive() {
    this.cartActive = !this.cartActive;
    this.state = this.state === 'show' ? 'hide' : 'show';
  }
  updateCartData() {
    if (this.isLoggedIn) {
      let token = this.winServ.getLocalItem('token');
      if (token) {
        this.headerServ.getLoggedInUserCartItem(token).subscribe(data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.cartData = data.data;
                break;
              default:
                break;
            }
          }
        });
      } else {
        this.cartData = this.cartService.get();
        if (this.cartData['data'] && this.cartData['data'].length == 0) {
          this.winServ.removeItem('seletedPlan');
        }
      }
    } else {
      this.cartData = this.cartService.get();
      if (this.cartData['data'] && this.cartData['data'].length == 0) {
        this.winServ.removeItem('seletedPlan');
      }
    }
    this.updateService.updatingTheCart(null);
  }
  removeFromCart(cartId) {
    if (this.isLoggedIn) {
      let token = this.winServ.getLocalItem('token');
      this.headerServ.removeItemForLoggedInUserFromCart(token, cartId).subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.updateCartData();
                break;
              default:
                break;
            }
          }
        },
        err => {
          console.log(err);
        }
      );
    } else {
      this.cartService.remove(cartId);
      this.updateCartData();
    }
  }
  cartPurchasedSuccess(paymentResponse) {
    if (
      paymentResponse.status == 'succeeded' ||
      paymentResponse.status == 'paid' ||
      paymentResponse.status == 'active'
    ) {
      $('body')
        .find('#purchase-modal')
        .find('.close:first')
        .click();
      this.purchaseMultiplePacksByCard(
        paymentResponse.id,
        paymentResponse.payId,
        paymentResponse.amount,
        paymentResponse.receipt_email
      );
    } else {
      $('body')
        .find('#purchase-modal')
        .find('.close:first')
        .click();
      this.headerNotifyalert('Errror!', 'An unknown error occure while making payment.', 'error');
    }
  }
  purchaseMultiplePacksByCard(paymentId, payId, amount, userEmail) {
    this.purchasingCart = true;
    let packIds = [];
    this.cartData['data'].forEach(value => {
      packIds.push(value.packId);
    });
    this.comServ
      .post('webservices/purchasePackByCard', {
        amount: amount,
        paymentId: paymentId,
        payId: payId,
        userEmail: userEmail,
        packIds: packIds
      })
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.purchasingCart = false;
              this.cartService.destroy();
              this.updateCartData();
              this.headerNotifyalert(
                'Success!',
                'Pack(s) purchased successfully. A download link has been sent to your email.',
                'success'
              );
              break;
            case 400:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 401:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 402:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 403:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 404:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            default:
              this.purchasingCart = false;
              this.headerNotifyalert(
                'Error!',
                'An unknown error occure while purchasing. Please try again after some time.',
                'error'
              );
              break;
          }
        }
      });
  }
  purchaseMultiplePacksByCredits() {
    let token = this.winServ.getLocalItem('token');
    if (this.user && this.isLoggedIn && token) {
      this.purchasingCart = true;
      let packIds = [];
      this.cartData['data'].forEach(value => {
        packIds.push({
          type: value.type,
          itemId: value.itemId,
          multiplier: value.multiplier
        });
      });
      this.purchaseFromCartReq = this.headerServ.purchasePacksFromCart(token, packIds).subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.headerNotifyalert('Success!', data.message, 'success');
                this.cartService.destroy();
                this.updateCartData();
                this.updateUserData();
                this.cartPurchased.emit();
                break;
              case 400:
                this.headerNotifyalert('Error!', data.message, 'error');
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops...', data.message, 'Add Credits', 'Cancel').then(result => {
                  if (result.value) {
                    _that.getAndUpdateCustomCredits();
                    let ele = $('body').find('#add-credit-modal-btn');
                    if (ele[0]) {
                      ele[0].click();
                    }
                  }
                });
                break;
              case 403:
                this.headerNotifyalert('Error!', data.message, 'error');
                break;
              case 404:
                this.headerNotifyalert('Error!', data.message, 'error');
                break;
              case 500:
                this.headerNotifyalert('Error!', data.message, 'error');
                break;
              default:
                this.headerNotifyalert('Error!', 'An unknown error occure.', 'error');
                break;
            }
          }
          this.purchasingCart = false;
        },
        err => {
          console.log(err);
          this.headerNotifyalert('Error!', 'An unknown error occure.', 'error');
          this.purchasingCart = false;
        }
      );
    } else {
      this.headerNotifyalert('Error!', 'You are trying an invalid request.', 'error');
    }
  }
  onPayPalSelection(data) {
    this.payPalClicked = true;
    let cartData = this.cartService.get();
    if (cartData.data) {
      let packs = [];
      let multiplier = 1;
      cartData.data.forEach(cart => {
        packs.push(cart.packId);
        multiplier = cart.multiplier;
      });
      let dataToSend = {
        amount: cartData.price,
        redirectUrl: this.SiteURL + 'payment-success',
        cancelUrl: this.SiteURL + 'payment-cancel',
        packs: packs,
        multiplier: multiplier
      };
      if (cartData.price <= 0) {
        dataToSend['email'] = data.email;
        dataToSend['amount'] = data.price;
      }
      this.comServ.post('webservices/payByPaypalForCart', dataToSend).subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              if (data.redirectLink) {
                window.location.href = data.redirectLink;
              } else {
                this.cartService.destroy();
                this.headerNotifyalert('Success!', data.message, 'success');
                this.payPalClicked = false;
              }
              break;
            default:
              this.headerNotifyalert(
                'Error!',
                data.message
                  ? data.message
                  : 'An unknown error occure while paying with paypal. Try again after some time.',
                'error'
              );
              this.payPalClicked = false;
              break;
          }
        }
      });
    } else {
      this.payPalClicked = false;
    }
  }
  userAccountToggle(useAccount) {
    this.userBillingDetails =
      this.userBillingDetails && useAccount ? this.user : this.userBillingDetailsConst;
    this.userBillingDetails.use_account = useAccount ? true : false;
    this.userBillingDetails.country =
      !this.userBillingDetails.country ||
      this.userBillingDetails.country == '' ||
      this.userBillingDetails.country == 'undefined' ||
      this.userBillingDetails.country == null
        ? ''
        : this.userBillingDetails.country;
  }
  getBillingInfo() {
    let token = this.winServ.getLocalItem('token');
    if (!token) {
      this.headerNotifyalert('Error!', 'You need to login to update any details.', 'info');
      return;
    }
    this.comServ.get('webservices/getUserBillingDetails?token=' + token).subscribe(data => {
      this.userBillingDetails = data.data ? data.data : {};
      this.userBillingDetails.country =
        !this.userBillingDetails.country ||
        this.userBillingDetails.country == '' ||
        this.userBillingDetails.country == 'undefined' ||
        this.userBillingDetails.country == null
          ? ''
          : this.userBillingDetails.country;
      this.userBillingDetailsConst = this.userBillingDetails;
    });
  }
  billingDetailsUpdated(form) {
    this.billingError = {};
    let token = this.winServ.getLocalItem('token');
    if (!token) {
      this.headerNotifyalert('Error!', 'You need to login to update any details.', 'info');
      return;
    }
    if (!form.valid) {
      if (form.control && form.control.controls) {
        for (let i in form.control.controls) {
          if (!form.control.controls[i].valid) {
            this.billingError[i] = i + ' is required.';
          }
        }
      }
      return;
    }
    this.savingBillingDetails = true;
    let dataToSend = {
      first_name: this.userBillingDetails.first_name,
      last_name: this.userBillingDetails.last_name,
      company: this.userBillingDetails.company,
      street_address: this.userBillingDetails.street_address,
      city: this.userBillingDetails.city,
      postal_code: this.userBillingDetails.postal_code,
      country: this.userBillingDetails.country,
      vat_number: this.userBillingDetails.vat_number,
      token: token,
      is_vat_varified:
        this.userBillingDetails.is_vat_varified && this.userBillingDetails.is_vat_varified == '1'
          ? 1
          : 0
    };
    this.comServ.post('webservices/updateUserBillingDetails', dataToSend).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            this.billingMessage = data.message;
            this.errorClass = false;
            break;
          case 400:
            this.billingMessage = data.message;
            this.errorClass = true;
            break;
          case 403:
            this.billingMessage = data.message;
            this.errorClass = true;
            break;
          default:
            this.billingMessage = data.message;
            this.errorClass = true;
            break;
        }
      }
      this.savingBillingDetails = false;

      setTimeout(() => {
        this.billingMessage = null;
        this.errorClass = false;
      }, 5000);
    });
  }
  cancelSubscription() {
    let token = this.winServ.getLocalItem('token');
    if (!token) {
      swal('Error', 'You need to login to update any details.', 'info');
      return;
    }
    let userPlanDetails = this.userPlanDetails;
    if (!userPlanDetails.subscriptionId || userPlanDetails.subscriptionStatus != '1') {
      swal('Error', 'You must have a acitve plan to cancel plan.', 'info');
      return;
    }
    let messageHTML =
      '<div class="credit-spend-confirm text-left clearfix"><p>Are you sure you want to cancel your <span class="text-blue">' +
      userPlanDetails.planName +
      '-' +
      userPlanDetails.subscriptionName +
      '</span>  Subscription? </p></div>';
    this.showAlert('Confirmation', messageHTML, 'Yes', 'No').then(result => {
      if (result.value) {
        this.unsubscribeFromPlan(token);
      }
    });
  }
  unsubscribeFromPlan(token) {
    this.cancellingSubscription = true;
    this.comServ.post('webservices/cancelUsersSubscription', { token: token }).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            this.headerNotifyalert('Success!', data.message, 'success');
            this.updateUserData();
            break;
          case 400:
            this.headerNotifyalert('Error!', data.message, 'error');
            break;
          case 403:
            this.headerNotifyalert('Error!', data.message, 'error');
            break;
          case 404:
            this.headerNotifyalert('Error!', data.message, 'error');
            break;
          case 500:
            this.headerNotifyalert('Error', data.message, 'error');
            break;
          case 503:
            this.headerNotifyalert('Error!', data.message, 'error');
            break;
          default:
            this.headerNotifyalert(
              'Error!',
              'An unknown error occure while unsubscribing from plan, please try again after some time',
              'error'
            );
            break;
        }
      }
      this.cancellingSubscription = false;
    });
  }
  renewSubscription() {
    let token = this.winServ.getLocalItem('token');
    if (!token) {
      this.headerNotifyalert('Error!', 'You need to login to update any details.', 'info');
      return;
    }
    let userPlanDetails = this.userPlanDetails;
    if (!userPlanDetails.subscriptionId || userPlanDetails.subscriptionStatus == '1') {
      this.headerNotifyalert('Error!', 'You already have an active plan.', 'info');
      return;
    }
    this.subscribeToSamePlan(token);
  }
  subscribeToSamePlan(token) {
    this.showAlert(
      'Confirmation',
      'Renew Subscription?<br />Payment for your first month will be charged immediately.',
      'Yes',
      'No'
    ).then(result => {
      if (result.value) {
        this.comServ
          .post('webservices/reactivatePaypalSubscription', {
            token: this.winServ.getLocalItem('token')
          })
          .subscribe(data => {
            if (data.status) {
              switch (data.status) {
                case 200:
                  // this.headerNotifyalert('Success!', data.message, 'success');
                  $('body')
                    .find('#subscriptions-detial-modal')
                    .find('.close:first')
                    .click();
                  if (data.invoiceId) {
                    this.router.navigate(['/payment-success'], {
                      queryParams: {
                        status: 200,
                        message: data.message,
                        type: 2,
                        id: data.invoiceId
                      }
                    });
                  }
                  break;
                case 403:
                  this.headerNotifyalert('Error!', data.message, 'error');
                  $('body')
                    .find('#subscriptions-detial-modal')
                    .find('.close:first')
                    .click();
                  break;
                case 500:
                  this.headerNotifyalert('Error!', data.message, 'error');
                  $('body')
                    .find('#subscriptions-detial-modal')
                    .find('.close:first')
                    .click();
                  break;
                default:
                  $('body')
                    .find('#subscriptions-detial-modal')
                    .find('.close:first')
                    .click();
                  break;
              }
            }
          });
      }
    });
  }
  loginAsPhotographer(form: NgForm) {
    this.adminLoggingin = true;
    this.photoLoginError = null;
    if (form.valid) {
      if (form.value.adminRemember) {
        this.winServ.setLocalItem('adminRememberMe', '1');
      }
      this.photoLoginReq = this.headerServ
        .loginUser({
          email: this.user.email,
          password: form.value.password,
          isPhotographer: 1
        })
        .subscribe(data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                window.location.href =
                  AppSettings.PHOTOGRAPHER_REDIRECT_URL +
                  '?token=' +
                  this.winServ.getLocalItem('token');
                break;
              default:
                this.adminLoggingin = false;
                this.photoLoginError =
                  data.error && data.error.password
                    ? data.error.password
                    : data.error_message
                    ? data.error_message
                    : 'An error occure while logging in';
                break;
            }
          }
        });
    } else {
      this.adminLoggingin = false;
      this.photoLoginError = 'Please enter password';
    }
  }
  goToAdminPanel() {
    window.location.href =
      AppSettings.PHOTOGRAPHER_REDIRECT_URL + '?token=' + this.winServ.getLocalItem('token');
  }
  showAlert(title, messageHTML, confirmButtonText, cancelButtonText) {
    //
    return swal({
      customClass: 'delete-modal-box',
      titleText: title,
      padding: 0,
      html: '<div class="delete-modal-body">' + messageHTML + '</div>',
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
    });
  }
  getLoggedInDetails(userId = 0) {
    if (userId == 0) {
      userId = this.user.id;
    }
    if (!userId) {
      return;
    }
    let nologin = $('body')
      .find('#logged-in-details-modal-btn')
      .attr('data-nologin');
    this.numberOfLoggedInArray = [];
    for (let index = 0; index < parseInt(nologin); index++) {
      this.numberOfLoggedInArray.push(index);
    }
    this.loginData = [];
    this.messageForLogin = 'Fetching details...';
    this.comServ.post('webservices/getLoggedInDetails', { userId: userId }).subscribe(data => {
      this.loginData = data.data;
      this.number_of_logins = data.number_of_logins;
      this.messageForLogin = 'No Data Availiable.';
      this.numberOfLoggedInArray = this.loginData.length ? [] : [0];
    });
  }
  logoutThisUser(data, userId) {
    // if (
    //   $('body')
    //     .find('#logged-in-details-modal')
    //     .find('.close')[0]
    // ) {
    //   $('body')
    //     .find('#logged-in-details-modal')
    //     .find('.close')[0]
    //     .click();
    // }
    if (!userId) {
      userId = this.user.id;
    }
    // this.showAlert('Confirmation', 'Are you sure ?', 'Yes', 'No').then(result => {
    // if (result.value) {
    if (this.user && this.user.loginId && this.user.loginId == data.loginId) {
      $('body')
        .find('#logged-in-details-modal')
        .find('.close:first')
        .click();
      this.signOut();
    } else {
      this.comServ
        .post('webservices/logoutUser', {
          loginId: data.loginId,
          userId: userId
        })
        .subscribe(d => {
          if (d.status == 200) {
            let index = this.loginData.findIndex($d => $d.loginId == data.loginId);
            this.loginData.splice(index, 1);
            if (this.retryLogin) {
              $('body')
                .find('#logged-in-details-modal')
                .find('.close:first')
                .click();
              this.login();
            } else {
              this.oneUserLoggedOut.emit(true);
              // $('body')
              //   .find('#logged-in-details-modal-btn')[0]
              //   .click();
            }
          } else {
            // swal('Error', d.message, 'error');
            this.headerNotifyalert('Error!', d.message, 'error');
          }
        });
    }
    // } else {
    //   $('body')
    //     .find('#logged-in-details-modal-btn')[0]
    //     .click();
    // }
    // });
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
      this.selectedCustomCredits.amount = 5;
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
          this.user && this.user.user_plan_details && this.user.user_plan_details.planId
            ? this.user.user_plan_details.planId
            : 0
      };
      this.comServ.post('webservices/customCreditsByCard', dataToSend).subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.updateUserData();
              $('body')
                .find('#custom-credit-modal')
                .find('.close')
                .click();
              this.headerNotifyalert('Success!', data.message, 'success');
              break;
            case 400:
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 401:
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 403:
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 404:
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 500:
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            default:
              this.headerNotifyalert(
                'Error!',
                'An unkown error occure while subscribing to photobash. Please try again after some time.',
                'error'
              );
              break;
          }
        }
      });
    } else {
      this.headerNotifyalert('Error!', 'You need to login to purchase credits.', 'error');
    }
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
  planSelected(planId: number, amount: number) {
    this.isDataLoaded = false;
    let dataToSend = {
      type: this.planType,
      amount: amount,
      id: planId,
      token: '',
      success: this.SiteURL + 'payment-success',
      cancel: this.SiteURL + 'payment-cancel',
      failed: this.SiteURL + 'payment-fail'
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
      this.headerNotifyalert('Warning!', 'You need to login to subscribe.', 'info');
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

  headerNotifyalert(title, messageHTML, type, position = null, timer = 5000) {
    return this.comServ.notify(title, messageHTML, type, position, timer);
  }

  getAndUpdateCustomCredits() {
    this.creditList = [];
    this.customPaymentObject.paymentData.email =
      this.user && this.user.email ? this.user.email : null;
    this.loadingCustomCredit = true;
    if (this.getCustomSubscriptionReq) {
      this.getCustomSubscriptionReq.unsubscribe();
    }
    this.getCustomSubscriptionReq = this.comServ
      .get('webservices/getCustomSubscription?token=' + this.winServ.getLocalItem('token'))
      .subscribe(data => {
        this.creditList = data.data.custom_credit ? data.data.custom_credit : [];
        if (this.creditList && this.creditList[0] && this.creditList[0].credit_id) {
          this.customCreditSelect(this.creditList[0]);
        }
        this.customCredit = data.data.credit ? data.data.credit : 1;
        this.planDivider = data.data.planDivider ? data.data.planDivider : 1;
        this.applicableTaxPer = data.data.applicableTaxPer ? data.data.applicableTaxPer : 0;
        this.loadingCustomCredit = false;
        this.updateService.getAndUpdatingCustomerCredits(null);
      });
  }
  selectAccountTypes() {
    this.accountTypes = [];
    if (this.getAccountTypeReq) {
      this.getAccountTypeReq.unsubscribe();
    }
    this.getAccountTypeReq = this.comServ.get('webservices/getAccountTypes').subscribe(data => {
      this.accountTypes = data.data;
    });
  }
  accountTypeSelected(index) {
    this.accountTypeError = null;
    if (!this.isTermsAcceptFinal) {
      this.headerNotifyalert('Error!', 'Please accept the Terms & Conditions.', 'error');
      return;
    }
    let d = this.accountTypes[index] ? this.accountTypes[index] : {};
    var tempVal = $('body')
      .find('#set-account-type-btn')
      .attr('data-id');
    d.userId = this.lastUser ? this.lastUser : tempVal ? tempVal : null;
    this.changingAccType = true;
    this.setAccountTypeReq = this.comServ.post('/webservices/setAccountType', d).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            if (tempVal) {
              let accessToken = $('body')
                .find('#set-account-type-btn')
                .attr('data-token');
              let email = $('body')
                .find('#set-account-type-btn')
                .attr('data-email');
              this.loginUser['password'] = '***********';
              this.loginUser['email'] = email;
              this.loginUser['accessToken'] = accessToken;
            }
            this.login();
            this.isFirstTimeLogin = true;
            break;
          default:
            this.accountTypeError = data.message
              ? data.message
              : 'An unexpected error occure while updating account type.';
            this.headerNotifyalert('Error!', this.accountTypeError, 'error');
            break;
        }
        this.changingAccType = false;
      }
    });
  }
  getBonusCredits(credits, bonus = 1) {
    return Math.floor((credits * this.userPlanDataBonus * bonus) / 100);
  }
  setSelectedAccoutType(index) {
    this.selectedAccountIndex = index;
    if (this.accountTypes[index]) {
      this.selectedAccountType = this.accountTypes[index];
    }
    $('.detail-block .fade-load-banner').removeClass('banner-fade');
    setTimeout(() => {
      $('.detail-block .fade-load-banner').addClass('banner-fade');
    }, 10);
  }
  sendPackImportRequest(importReqFrom: NgForm) {
    this.importReqError = {};
    if (!this.user || !this.user.id) {
      this.headerNotifyalert('Error!', 'You need to login to import your old packs.', 'error');
      return;
    }
    this.sendingImportRequest = true;
    this.importReq = this.comServ
      .post('webservices/sendPackImportRequest', {
        id: this.user.id,
        email: this.oldEmail,
        redirectLink: this.SiteUrl + 'import/verify-request/'
      })
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.importMessage = data.message;
                importReqFrom.reset();
                $('body #send-import-request-form')
                  .find('.close:first')
                  .click();
                $('body')
                  .find('#import-request-confirmalert-btn')[0]
                  .click();
                break;
              case 400:
                this.importReqError = data.errors;
                break;
              default:
                this.headerNotifyalert(
                  'Error!',
                  data.error_message
                    ? data.error_message
                    : 'An unexpected error occure while generating your request.',
                  'error'
                );
                break;
            }
          }
          this.sendingImportRequest = false;
        },
        err => {
          this.headerNotifyalert(
            'Error!',
            'An unexpected error occure while generating your request.',
            'error'
          );
          this.sendingImportRequest = false;
        }
      );
  }

  /* Phase 4 Code */
  onCreditCardPaymentDoneForAddCredit = (paymentData: any) => {
    this.addCreditSuccessReq = this.comServ
      .post('accountupdates', {
        ...paymentData,
        creditData: {
          ...this.selectedCustomCredits,
          credit: this.checkCredit == 0 ? this.credit : this.selectedCustomCredits.credit,
          bonus: this.customBonus
        },
        token: localStorage.getItem('token')
      })
      .subscribe(
        data => {
          switch (data.status) {
            case 200:
              this.updateUserData();
              $('body')
                .find('#custom-credit-modal')
                .find('.close')
                .click();
              if (data.invoiceId) {
                this.router.navigate(['/payment-success'], {
                  queryParams: {
                    status: 200,
                    message: 'Payment successfull',
                    type: 2,
                    id: data.invoiceId
                  }
                });
              }
              break;

            default:
              this.headerNotifyalert(
                'Error',
                data.message || 'An unexpected error occure while generating your request',
                'error'
              );
              break;
          }
        },
        () => {
          this.headerNotifyalert(
            'Error',
            'An unexpected error occure while generating your request',
            'error'
          );
        }
      );
  };
  onCreditCardPaymentDoneForCartPurchase = (paymentData: any) => {
    const amount = paymentData.amount ? paymentData.amount : this.cartData['price'];
    const payId = paymentData.payment_id;
    const paymentId = paymentData.id_sale;
    const userEmail = paymentData.userEmail;
    this.purchasingCart = true;
    let packIds = [];
    this.cartData['data'].forEach(value => {
      packIds.push({
        id: value.packId,
        type: value.type.toLowerCase(),
        multiplier: value.multiplier
      });
    });
    this.comServ
      .post('webservices/purchasePackByCard', {
        amount: amount,
        paymentId: paymentId,
        payId: payId,
        userEmail: userEmail,
        packIds: packIds,
        taxPer: paymentData['applicableTax'],
        tax: (amount * paymentData['applicableTax']) / 100,
        account_type: localStorage.getItem('')
      })
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.purchasingCart = false;
              this.cartService.destroy();
              this.updateCartData();
              $('body')
                .find('#purchase-modal')
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
            case 400:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 401:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 402:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 403:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            case 404:
              this.purchasingCart = false;
              this.headerNotifyalert('Error!', data.message, 'error');
              break;
            default:
              this.purchasingCart = false;
              this.headerNotifyalert(
                'Error!',
                'An unknown error occure while purchasing. Please try again after some time.',
                'error'
              );
              break;
          }
        }
      });
  };
  parseInt(data) {
    return parseInt(data);
  }
  /**
   *
   */
  setPage = () => {
    if (
      this.isLoggedIn &&
      this.user &&
      this.user.id &&
      ['/packs', '/images', '/kits', '/models'].indexOf(this.currentUrl) > -1
    ) {
      const user = JSON.parse(this.winServ.getLocalItem('userData'));
      switch (this.currentUrl) {
        case '/packs':
          user.pack_url = this.currentFullURL;
          break;
        case '/images':
          user.image_url = this.currentFullURL;
          break;
        case '/kits':
          user.kit_url = this.currentFullURL;
          break;
        case '/models':
          user.model_url = this.currentFullURL;
          break;
        default:
          break;
      }
      this.winServ.setLocalItem('userData', JSON.stringify(user));
      this.comServ.setNewUserURL(this.user.id, this.currentFullURL, this.currentUrl);
    }
  };
  /* Phase 4 Code */
  ngOnDestroy() {
    /* track route change */
    this.setPage();
    if (this.routerEvent) {
      this.routerEvent.unsubscribe();
    }
    if (this.addCreditSuccessReq) {
      this.addCreditSuccessReq.unsubscribe();
    }
    if (this.checkLoginReq) {
      this.checkLoginReq.unsubscribe();
    }
    if (this.loginReq) {
      this.loginReq.unsubscribe();
    }
    if (this.signUpReq) {
      this.signUpReq.unsubscribe();
    }
    if (this.sendResetLinkReq) {
      this.sendResetLinkReq.unsubscribe();
    }
    if (this.getSettingReq) {
      this.getSettingReq.unsubscribe();
    }
    if (this.updateSettingReq) {
      this.updateSettingReq.unsubscribe();
    }
    if (this.deleteAccountReq) {
      this.deleteAccountReq.unsubscribe();
    }
    if (this.changePassReq) {
      this.changePassReq.unsubscribe();
    }
    if (this.checkVATReq) {
      this.checkVATReq.unsubscribe();
    }
    if (this.purchaseFromCartReq) {
      this.purchaseFromCartReq.unsubscribe();
    }
    if (this.photoLoginReq) {
      this.photoLoginReq.unsubscribe();
    }
    if (this.getCustomSubscriptionReq) {
      this.getCustomSubscriptionReq.unsubscribe();
    }
    if (this.getCustomSubscriptionReq) {
      this.getCustomSubscriptionReq.unsubscribe();
    }
    if (this.importReq) {
      this.importReq.unsubscribe();
    }
    if (this.getCountryReq) {
      this.getCountryReq.unsubscribe();
    }
    if (this.ngUnsubscrbe) {
      this.ngUnsubscrbe.next(true);
      this.ngUnsubscrbe.complete();
      this.ngUnsubscrbe.unsubscribe();
    }
  }
  /**
   *
   */
  goToPack = () => {
    this.setQueryParams();
    this.router.navigate(['/packs'], {
      queryParams: {} // this.packQueryParams
    });
  };
  /**
   *
   */
  goToImage = () => {
    this.setQueryParams();
    this.router.navigate(['/images'], {
      queryParams: {} // this.imageQueryParams
    });
  };
  /**
   *
   */
  goToKit = () => {
    this.setQueryParams();
    this.router.navigate(['/kits'], {
      queryParams: {} // this.kitQueryParams
    });
  };
  /**
   *
   */
  goToModels = () => {
    this.setQueryParams();
    this.router.navigate(['/models'], {
      queryParams: {} // this.modelQueryParams
    });
  };
  /**
   *
   */
  setQueryParams = (): void => {
    if (this.isLoggedIn && this.user && this.user.id) {
      let packURL = this.user.pack_url ? this.user.pack_url.split('?')[1] : '';
      let imageURL = this.user.image_url ? this.user.image_url.split('?')[1] : '';
      let kitURL = this.user.kit_url ? this.user.kit_url.split('?')[1] : '';
      let modelURL = this.user.model_url ? this.user.model_url.split('?')[1] : '';
      if (packURL) {
        this.packQueryParams = querString.parse(packURL);
      }
      if (imageURL) {
        this.imageQueryParams = querString.parse(imageURL);
      }
      if (kitURL) {
        this.kitQueryParams = querString.parse(kitURL);
        console.log(this.kitQueryParams);
      }
      if (modelURL) {
        this.modelQueryParams = querString.parse(modelURL);
      }
    }
  };
}
