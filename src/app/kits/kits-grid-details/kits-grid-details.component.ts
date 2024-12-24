import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { AppSettings } from '../../app.setting';
import { ISubscription } from 'rxjs/Subscription';
import { PackageService } from '../../services/package.service';
import { WindowSevice } from '../../services/window.service';
import { CartService } from '../../services/cart.service';
import { CommonSevice } from '../../services/common.service';
import { HeaderComponent } from '../../components/header/header.component';
import { UpdateService } from '../../services/update.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { KitService } from '../../services/kit.service';

@Component({
  selector: 'app-kits-grid-details',
  templateUrl: './kits-grid-details.component.html',
  styleUrls: ['./kits-grid-details.component.css']
})
export class KitsGridDetailsComponent implements OnInit, OnDestroy {
  @Input('kitDetails') kitDetails: any;
  @Input('kitIndex') kitIndex: any;
  @Input('kitLength') kitLength: any;
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  offset: number;
  slideInterval: number;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  plansDetail: any[] = [];
  windowWidth: number;
  images = [1, 2, 3].map(() => `https://picsum.photos/900/500?random&t=${Math.random()}`);
  isUserLoggedIn: boolean;
  userData: any = {};
  planFacilities: any = {};
  planfacilitiesToolTip: any = {};
  user: any;
  isLoggedIn: boolean;
  userPlanDetails: any;
  oldEmail: any;
  checkLoginReq: ISubscription;
  purchasingImage: boolean;
  checkUserCreditsReq: ISubscription;
  purchasePackReq: ISubscription;
  kits = [];
  noImgUrl: string;
  getPlanReq: ISubscription;
  intializeCarasoul: boolean;
  // kenwheelere ngx slick config
  public slideConfig = {
    dots: true,
    slidesToShow: 1,
    infinite: true,
    speed: 300,
    fade: true,
    autoplay: true,
    autoplaySpeed: 200000,
    cssEase: 'linear',
    // adaptiveHeight: false,
    pauseOnHover: false
  };

  constructor(
    private packSer: PackageService,
    private kitSer: KitService,
    private winServ: WindowSevice,
    private cartService: CartService,
    private comServ: CommonSevice,
    private updateService: UpdateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.noImgUrl = 'no-image.jpg';
    this.offset = 0;
    this.slideInterval = 10000;
    this.userLoginCheck();
    this.windowWidth = $(window).width();
    const _that = this;
    $(window).on('resize', () => {
      _that.windowWidth = $(window).width();
      this.intializeCarasoul = false;
      setTimeout(function() {
        this.gallerForPack();
        /*_that.hoverImage();
        _that.removeCarasoul();*/
      }, 0);
    });
    this.getPlans();
  }

  getBoxCoverImage = () => {
    try {
      const images = JSON.parse(this.kitDetails.images);
      return images[2] ? images[2] : '/assets/front/img/no-image.jpg';
    } catch (error) {
      return 'no-image.jpg';
    }
  };

  getPlans() {
    this.getPlanReq = this.packSer.getPlans().subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            let $d = data.data.plans ? data.data.plans : [];
            for (const i in $d) {
              if ($d[i]) {
                let tempObj =
                  $d[i].plan_details && $d[i].plan_details[$d[i].plan_details.length - 1]
                    ? $d[i].plan_details[$d[i].plan_details.length - 1]
                    : {};
                tempObj['indieMultiply'] = data.data.indieMultiply;
                tempObj['studioMultiply'] = data.data.studioMultiply;
                this.plansDetail.push(tempObj);
              }
            }
            break;
          default:
            break;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.getPlanReq) {
      this.getPlanReq.unsubscribe();
    }
  }

  addToCart(kit, plan) {
    let cartData = {
      packId: kit.id,
      packName: kit.kit_name,
      packPrice: kit.price,
      packPriceInCredits: kit.price_credits,
      multiplier: 1,
      type: null
    };

    if (plan && plan.account_type && plan.account_type == '2') {
      cartData.packPrice = cartData.packPrice * plan.indieMultiply;
      cartData['multiplier'] = plan.indieMultiply;
    } else if (plan && plan.account_type && plan.account_type == '3') {
      cartData.packPrice = cartData.packPrice * plan.studioMultiply;
      cartData['multiplier'] = plan.studioMultiply;
    }

    if (!this.isUserLoggedIn) {
      cartData['type'] = 'Kit';
      let cd = this.cartService.get();
      if (cd.data) {
        let isInCart = cd.data.findIndex(d => d.packId == cartData.packId);
        if (isInCart > -1) {
          this.kitNotifyAlert('Warning!', 'Kit is already in cart.', 'info');
          return;
        }
      }
      let selectedPlan = this.winServ.getLocalItem('seletedPlan');
      if (!selectedPlan) {
        this.winServ.setLocalItem('seletedPlan', plan.plan_id);
        this.cartService.add(cartData);
        this.updateService.updatingTheCart('yes');
      } else if (selectedPlan != plan.plan_id) {
        let index = this.plansDetail.findIndex(d => d.plan_id == selectedPlan);
        if (index > -1) {
          this.kitNotifyAlert(
            'Error!',
            'Multiple license types.<br /> You have previously selected ' +
              this.plansDetail[index].account_type_name +
              '.',
            'error'
          );
        } else {
          this.kitNotifyAlert(
            'Error!',
            'You have selected an invalid plan, please try again.',
            'error'
          );
          this.winServ.removeItem('seletedPlan');
        }
      } else if (selectedPlan) {
        this.cartService.add(cartData);
        this.updateService.updatingTheCart('yes');
      }
    } else {
      this.winServ.removeItem('seletedPlan');
      this.cartService.destroy();
      cartData['token'] = this.winServ.getLocalItem('token');
      cartData['kitId'] = kit.id;
      cartData['type'] = 2;
      this.comServ.post('webservices/addToCart', cartData).subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.updateService.updatingTheCart('yes');
              // this.$header.updateCartData();
              break;
            case 503:
              // swal('Error', data.message, 'error');
              this.kitNotifyAlert('Error!', data.message, 'error');
              break;
            default:
              break;
          }
        }
      });
    }
  }

  kitNotifyAlert(title, messageHTML, type, position = null, timer = 5000) {
    return this.comServ.notify(title, messageHTML, type, position, timer);
  }

  userLoginCheck() {
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
        this.isUserLoggedIn = true;
        this.checkLogin(true);
      }
    } else {
      this.isUserLoggedIn = false;
      this.checkLogin(false);
    }
  }

  checkLogin(isLoggedIn: boolean) {
    this.isUserLoggedIn = isLoggedIn;
    if (isLoggedIn) {
      this.userData = JSON.parse(this.winServ.getLocalItem('userData'));
      if (this.userData) {
        const planDetails = this.userData.user_plan_details;
        if (planDetails && planDetails.facilities) {
          this.planFacilities = planDetails.facilities;
        }
        if (planDetails && planDetails.facilitiesToolTip) {
          this.planfacilitiesToolTip = planDetails.facilitiesToolTip;
        }
      }
    }
    this.offset = 0;
  }

  purchaseKit(kit) {
    let $token = this.winServ.getLocalItem('token');
    let $kit = kit;
    this.purchasingImage = true;
    if ($kit && $token) {
      this.checkUserCreditsReq = this.kitSer.checkUserCreditsForKit($kit.id, $token).subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (data.hideConfirm == '1') {
                  this.addToPurchaseKit($kit, $token, data.hideConfirm);
                } else {
                  let message =
                    '<div class=""><div class="credit-spend-confirm text-left clearfix"><p>You are about to spend <span class="text-blue">' +
                    $kit.price_credits +
                    '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm clearfix"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-purchase" id="do-not-show-purchase"/> <label for="do-not-show-purchase">Don\'t show this again.</label></div></div><div class="clearfix"></div></div><div class="clearfix"></div></div>';
                  let _that = this;
                  let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
                  alertRes.then(result => {
                    if (result.value) {
                      let hideConfirm = _that.winServ.getLocalItem('hidePurchaseConfirm')
                        ? true
                        : false;
                      _that.addToPurchaseKit($kit, $token, hideConfirm);
                      _that.winServ.removeItem('hidePurchaseConfirm');
                    } else {
                      _that.purchasingImage = false;
                    }
                  });
                }
                break;
              case 204:
                // swal('Error!', data.message, 'error');
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error');
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      const updateServ = new UpdateService();
                      updateServ.getAndUpdatingCustomerCredits('yes');
                      // _that.$header.getAndUpdateCustomCredits();
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                    }
                  }
                );
                this.purchasingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.kitNotifyAlert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                this.purchasingImage = false;
                break;
            }
          }
        },
        err => {
          console.log(err);
          // swal('Error!', "An unknown error occure, please try after some time !", 'error');
          this.kitNotifyAlert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.purchasingImage = false;
        }
      );
    } else {
      this.router.navigateByUrl('/404');
    }
  }

  addToPurchaseKit(kit, token, hideConfirm) {
    this.purchasePackReq = this.kitSer
      .purchaseKit(kit.id, token, kit.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                let index = this.kits.findIndex(d => d.id == kit.id);
                if (index > -1) {
                  this.kits[index].isPurchased = 1;
                }
                this.updateService.updatingUserData('yes');
                this.updateService.updatingTheCart('yes');
                // this.$header.updateUserData();
                // this.$header.updateCartData();
                this.purchasingImage = false;
                // swal('Success!', "Pack purchased successfully !", 'success');
                this.kitNotifyAlert('Success!', 'Kit purchased successfully.', 'success');
                // window.location.reload(); // to refresh the page
                this.kitDetails.isPurchased = 1;
                break;
              case 204:
                // swal('Error!', data.message, 'error')
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error')
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      const updateServ = new UpdateService();
                      updateServ.getAndUpdatingCustomerCredits('yes');
                      // _that.$header.getAndUpdateCustomCredits();
                      // let ele = $('body').find('#add-credit-modal-btn');
                      // if (ele[0]) {
                      //   ele[0].click();
                      // }
                      _that.router.navigateByUrl('/subscriptions');
                    }
                  }
                );
                this.purchasingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 500:
                // swal('Error!', data.message, 'error');
                this.kitNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.kitNotifyAlert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                this.purchasingImage = false;
                break;
            }
          }
        },
        err => {
          console.log(err);
          // swal('Error!', "An unknown error occure, please try after some time !", 'error');
          this.kitNotifyAlert(
            'Error',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.purchasingImage = false;
        }
      );
  }

  showAlert(title, messageHTML, type, confirmButtonText, cancelButtonText) {
    return swal({
      customClass: 'delete-modal-box credit-spend-modal',
      titleText: title,
      padding: 0,
      html: '<div class="delete-modal-body">' + messageHTML + '</div>',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      background: '#f3f3f5',
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-ok btn-theme-white',
      cancelButtonClass: 'btn btn-cancle',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      animation: false
    });
  }

  hoverImage = () => {
    this.intializeCarasoul = true;
  };
  removeCarasoul = () => {
    this.intializeCarasoul = false;
  };
}
