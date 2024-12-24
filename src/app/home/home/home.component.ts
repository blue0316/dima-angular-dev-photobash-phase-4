import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http } from '@angular/http';
import { ISubscription } from 'rxjs/Subscription';
import { AppSettings } from './../../app.setting';
import { Title } from '@angular/platform-browser';
import { WindowSevice } from './../../services/window.service';
import { PackageService } from './../../services/package.service';
import { HeaderComponent } from './../../components/header/header.component';
import { ImageService } from './../../services/image.service';
import { CollectionService } from './../../services/collection.service';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { CommonSevice } from '../../services/common.service';
import { CartService } from '../../services/cart.service';
import { ModelService } from '../../services/model.service';
import { UpdateService } from '../../services/update.service';
import { KitService } from '../../services/kit.service';
declare const $: any;

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: [],
  styles: [],
  providers: [
    WindowSevice,
    PackageService,
    ImageService,
    CollectionService,
    CommonSevice,
    CartService,
    ModelService,
    KitService
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  SiteUrl = AppSettings.SITE_ENDPOINT;
  ImgPathser = AppSettings.SERVER_IMG_PATH;
  ServerImgPath = AppSettings.SERVER_IMG_PATH;
  SerPath = AppSettings.API_ENDPOINT;
  searchButtonAction = '';
  search = '';
  searchError = '';
  isDataLoaded: boolean;
  isUserLoggedIn: boolean;
  homes = {
    banner_image: null
  };
  user: any;
  latestPacks = [];
  // tslint:disable-next-line: no-inferrable-types
  packIndex: number = 0;
  purchasedPacks: any = [];
  purchasingImage: boolean;
  recentSearchData: any = [];
  recentSearchDataModel: any = [];
  isSearchLoaded: boolean;
  downloadingImage: boolean;
  widthError: boolean;
  // tslint:disable-next-line: no-inferrable-types
  imageWidthToDownload: number = 0;
  // tslint:disable-next-line: no-inferrable-types
  imageHeightToDownload: number = 0;
  downloadUrl: string;
  newColName: string;
  isAddSuccess: boolean;
  AddSuccess: string;
  isAddError: boolean;
  AddError: string;
  Errors: any = {};
  isAdding: boolean;
  suggestedTags: any = [];
  planFacilities: any = {};
  planfacilitiesToolTip: any = {};
  getHomeDataWithoutLoginReq: ISubscription;
  getHomeDataWithLoginReq: ISubscription;
  checkUserCreditsReq: ISubscription;
  purchasePackReq: ISubscription;
  recentSearchReq: ISubscription;
  recentSearchReqModel: ISubscription;
  downloadReq: ISubscription;
  purchaseImageReq: ISubscription;
  fetchTagReq: ISubscription;
  selectedSize: any = [];
  isAlreadyCalled: boolean;
  isFirstLogin: boolean;
  isImportConfirm: boolean;
  homeParams: any = {};
  importReqMsg: string = null;
  downloadImageName: string = null;
  isPreviewLoaded: Array<boolean> = [];
  searchPlaceHolder: String = 'Search Reference Images...';

  routerEvent;
  queryParamEvent;
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  threeDImgLoading: boolean;
  token: any;
  plansDetail: any[] = [];
  getPlanReq: ISubscription;
  lastCollectionId: string = null;
  @HostListener('document:keyup', ['$event']) onEvent($event: any) {
    // console.log($event);
    if ($event.key && $event.key == 'ArrowRight') {
      // for right keypress
      let ele = $('body')
        .find('.open-grid-info.resultitem')
        .next()
        .find('.clickevent');
      if (ele[0]) {
        ele[0].click();
      }
    } else if ($event.key && $event.key == 'ArrowLeft') {
      // for left keypress
      let ele = $('body')
        .find('.open-grid-info.resultitem')
        .prev()
        .find('.clickevent');
      if (ele[0]) {
        ele[0].click();
      }
    } else if ($event.key && $event.key == 'Escape') {
      // for esc keypress
      let ele = $('body')
        .find('.open-grid-info.resultitem')
        .find('.detailClose');
      if (ele[0]) {
        ele[0].click();
      }
    }
  }
  constructor(
    private http: Http,
    private winServ: WindowSevice,
    private titleService: Title,
    private _router: Router,
    private packSer: PackageService,
    private imageSer: ImageService,
    private colService: CollectionService,
    private comServ: CommonSevice,
    private cartService: CartService,
    private eleRef: ElementRef,
    private zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private changeRef: ChangeDetectorRef,
    private modelService: ModelService,
    private updateService: UpdateService,
    private kitSer: KitService
  ) {
    this.titleService.setTitle('Photobash - Royalty Free Reference Photos For Artists');
    this.token = this.winServ.getLocalItem('token');
  }

  mouseHovering(e, index) {
    e.stopPropagation();
    this.recentSearchDataModel[index].isHovering = true;
  }
  mouseLeft(e, index) {
    e.stopPropagation();
    this.recentSearchDataModel[index].isHovering = false;
  }

  ngOnInit() {
    /**
     *
     */
    $('body').on('click', '.swal2-container', e => {
      if (this.lastCollectionId) {
        swal.close();
        this._router.navigate(['/collections'], {
          queryParams: {
            collection: this.lastCollectionId
          }
        });
      }
    });
    /**
     *
     */
    this.getPlans();
    this.queryParamEvent = this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params.welcome && params.welcome == 'true') {
        this.isFirstLogin = true;
      }
      if (params.confirm && params.imp && params.verToken && params.user) {
        this.homeParams = {
          confirm: params.confirm,
          imp: params.imp,
          verToken: params.verToken,
          oldUser: params.user
        };
        // this.verifyImportReq();
      }
    });
    let _that = this;
    this.searchButtonAction = 'images';
    $('body').on('click', '[data-routes="true"]', function(argument) {
      let src = $(this).data('src');
      if (src) {
        _that._router.navigateByUrl(src);
      }
    });
  }
  onItemSelect = searchString => {
    this._router.navigateByUrl(`/${this.searchButtonAction}?search=${searchString}`);
  };
  ngAfterViewInit() {
    setTimeout(() => {
      var ele = this.eleRef.nativeElement.querySelector('#suggestion-tags');
      if (ele) {
        ele.addEventListener('change', this.onSearchValueChange.bind(this));
      }
    }, 1000);
  }
  onSearchValueChange(event) {
    console.log(event);
    // setTimeout(() => {
    //   let v = $("#suggestion-tags").val();
    //   this.search = v.toString();
    // }, 110);
  }
  withlogin(token: any) {
    this.isDataLoaded = true;
    if (this.getHomeDataWithLoginReq) {
      this.getHomeDataWithLoginReq.unsubscribe();
    }
    $('.homepage-loader').css({ display: 'block' });
    this.getHomeDataWithLoginReq = this.http
      .get(this.host + 'webservices/homepage_after_login?token=' + token)
      .subscribe(data => {
        let res = data.json();
        if (res.status) {
          switch (res.status) {
            case 200:
              this.homes = res.data ? res.data : [];
              this.latestPacks = res.data.latest_packs ? res.data.latest_packs : [];
              this.purchasedPacks = res.data.purchasedPacks ? res.data.purchasedPacks : [];
              this.latestPacksImage();
              this.getRecentSearch(token);
              this.getRecentSearchModel(token);

              break;
            default:
              this.homes = {
                banner_image: null
              };
              break;
          }
        } else {
          this.homes = {
            banner_image: null
          };
        }
        this.isDataLoaded = false;
        if (this.eleRef.nativeElement.querySelector('#suggestion-tags')) {
          this.eleRef.nativeElement
            .querySelector('#suggestion-tags')
            .addEventListener('change', this.onSearchValueChange.bind(this));
        }
        setTimeout(function() {
          this.getHomePageResize();
          const fade_element = $('.fade-load-banner');
          fade_element.addClass('banner-fade');
        }, 500);
        const _that = this;
        setTimeout(function() {
          this.addAutoComplete(2, _that.onItemSelect);
        }, 0);
        this.zone.run(() => {
          if (!this.changeRef['destroyed']) {
            this.changeRef.detectChanges();
          }
        });
      });
  }
  withOutLogin() {
    this.isDataLoaded = true;
    if (this.getHomeDataWithoutLoginReq) {
      this.getHomeDataWithoutLoginReq.unsubscribe();
    }
    $('.homepage-loader').show();
    this.getHomeDataWithoutLoginReq = this.http
      .get(this.host + 'webservices/homepage')
      .subscribe(data => {
        const res = data.json();
        if (res.status) {
          switch (res.status) {
            case 200:
              this.homes = res.data ? res.data : [];
              this.isDataLoaded = false;
              $('.homepage-loader').hide();
              break;
            default:
              this.homes = {
                banner_image: null
              };
              this.isDataLoaded = false;
              break;
          }
        } else {
          this.homes = { banner_image: null };
        }
        this.isDataLoaded = false;
        if (this.eleRef.nativeElement.querySelector('#suggestion-tags')) {
          this.eleRef.nativeElement
            .querySelector('#suggestion-tags')
            .addEventListener('change', this.onSearchValueChange.bind(this));
        }
        setTimeout(() => {
          const fade_element = $('.fade-load-banner');
          fade_element.addClass('banner-fade');
        }, 500);
        const _that = this;
        setTimeout(function() {
          this.addAutoComplete(2, _that.onItemSelect);
        }, 0);
      });
    this.zone.run(() => {
      if (!this.changeRef['destroyed']) {
        this.changeRef.detectChanges();
      }
    });
  }
  checkLogin(isLoggedIn: boolean) {
    this.isUserLoggedIn = isLoggedIn;
    if (this.isUserLoggedIn && this.winServ.getLocalItem('token')) {
      this.user = JSON.parse(this.winServ.getLocalItem('userData'));
      $('.homepage-loader').show();
      this.withlogin(this.winServ.getLocalItem('token'));
      if (this.user) {
        let planDetails = this.user['user_plan_details'];
        if (planDetails && planDetails.facilities) {
          this.planFacilities = planDetails.facilities;
        }
        if (planDetails && planDetails.facilitiesToolTip) {
          this.planfacilitiesToolTip = planDetails.facilitiesToolTip;
        }
      }
      if (
        this.homeParams.confirm &&
        this.homeParams.imp &&
        this.homeParams.verToken &&
        this.homeParams.oldUser
      ) {
        this.isImportConfirm = false;
        this.verifyImportReq();
      }
    } else if (isLoggedIn === false) {
      this.withOutLogin();
    }
    // setTimeout(function() {
    //   this.addAutoComplete(2);
    // }, 0);
    this.zone.run(() => {
      if (!this.changeRef['destroyed']) {
        this.changeRef.detectChanges();
      }
    });
  }
  getTags(tag: string) {
    this.suggestedTags = [];
    if (tag.length <= 2) {
      return;
    }
    if (this.fetchTagReq) {
      this.fetchTagReq.unsubscribe();
    }
    let tag_for = 1;
    if (this.searchButtonAction == 'images') {
      tag_for = 2;
    }
    this.fetchTagReq = this.comServ
      .get('webservices/tags?tag=' + tag + '&tag_for=' + tag_for)
      .subscribe(data => {
        if (data.status && data.status == 200) {
          let $d = data.data ? data.data : [];
          for (let i = 0; i < $d.length; i++) {
            const e = $d[i];
            let str = e.tag_name.toLowerCase();
            e.tag_name = str.replace(
              tag.toLocaleLowerCase(),
              '<b>' + tag.toLocaleLowerCase() + '</b>'
            );
          }
          this.suggestedTags = $d;
        } else {
          this.suggestedTags = [];
        }
      });
  }

  searchActive(activebutton) {
    this.searchButtonAction = activebutton;
    this.search = '';
    this.suggestedTags = [];
    activebutton === 'packs'
      ? (this.searchPlaceHolder = 'Search Photo Packs...')
      : activebutton === 'images'
      ? (this.searchPlaceHolder = 'Search Reference Images...')
      : activebutton === 'kits'
      ? (this.searchPlaceHolder = 'Search 3D Kits...')
      : activebutton === 'models'
      ? (this.searchPlaceHolder = 'Search 3D Models...')
      : '';
    const _that = this;
    setTimeout(function() {
      this.addAutoComplete(
        activebutton == 'packs'
          ? 1
          : activebutton == 'images'
          ? 2
          : activebutton == 'kits'
          ? 3
          : activebutton == 'models'
          ? 4
          : null,
        _that.onItemSelect
      );
    }, 0);
  }

  setSeachKeyword(keyword: any) {
    this.search = keyword.replace(/<\/?[^>]+(>|$)/g, '');
    this.suggestedTags = [];
    $('body')
      // tslint:disable-next-line: quotemark
      .find("[name='search']")
      .focus();
  }
  submitSearch() {
    setTimeout(() => {
      this._router.navigateByUrl(
        this.searchButtonAction + '?search=' + encodeURIComponent(this.search)
      );
    }, 200);
  }
  activePack(index) {
    this.packIndex = index;
  }
  latestPacksImage() {
    // tslint:disable-next-line: forin
    for (let i in this.latestPacks) {
      this.latestPacks[i].images = JSON.parse(this.latestPacks[i].images);
    }
  }

  // pack purchase
  purchasePack(index) {
    let $token = this.winServ.getLocalItem('token');
    let $pack = this.latestPacks[index];
    this.purchasingImage = true;
    if ($pack && $token) {
      this.checkUserCreditsReq = this.packSer.checkUserCreditsForPack($pack.id, $token).subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (data.hideConfirm == '1') {
                  this.addToPurchasePack($pack, $token, data.hideConfirm);
                } else {
                  let message =
                    '<div class=""><div class="credit-spend-confirm text-left clearfix"><p>You are about to spend <span class="text-blue">' +
                    $pack.price_credits +
                    '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-purchase" id="do-not-show-pack-purchase"/><label for="do-not-show-pack-purchase" id="">Don\'t show this again.</label></div></div></div></div>';
                  let _that = this;
                  let alertRes = this.showAlert('Confirmation', message, 'success', 'Ok', 'Cancel');
                  alertRes
                    .then(result => {
                      if (result.value) {
                        let hideConfirm = _that.winServ.getLocalItem('hidePurchaseConfirm')
                          ? true
                          : false;
                        _that.addToPurchasePack($pack, $token, hideConfirm);
                        _that.winServ.removeItem('hidePurchaseConfirm');
                      } else {
                        _that.purchasingImage = false;
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }
                break;
              case 204:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      _that.$header.getAndUpdateCustomCredits();
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                      // _that._router.navigateByUrl('/subscriptions');
                    }
                  }
                );
                this.purchasingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.packageNotifyAlert(
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
          this.packageNotifyAlert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.purchasingImage = false;
        }
      );
    } else {
      this._router.navigateByUrl('/404');
    }
  }

  // kit purchase
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
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
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
                      _that._router.navigateByUrl('/subscriptions');
                    }
                  }
                );
                this.purchasingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.packageNotifyAlert(
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
          this.packageNotifyAlert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.purchasingImage = false;
        }
      );
    } else {
      this._router.navigateByUrl('/404');
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
                let index = this.latestPacks.findIndex(d => d.id == kit.id);
                if (index > -1) {
                  this.latestPacks[index].isPurchased = 1;
                }
                this.updateService.updatingUserData('yes');
                this.updateService.updatingTheCart('yes');
                // this.$header.updateUserData();
                // this.$header.updateCartData();
                this.purchasingImage = false;
                // swal('Success!', "Pack purchased successfully !", 'success');
                this.packageNotifyAlert('Success!', 'Kit purchased successfully.', 'success');
                // window.location.reload(); // to refresh the page
                this.latestPacks[index].isPurchased = 1;
                break;
              case 204:
                // swal('Error!', data.message, 'error')
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error')
                this.packageNotifyAlert('Error!', data.message, 'error');
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
                      _that._router.navigateByUrl('/subscriptions');
                    }
                  }
                );
                this.purchasingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              case 500:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.purchasingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.packageNotifyAlert(
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
          this.packageNotifyAlert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.purchasingImage = false;
        }
      );
  }

  onlyPurchaseThisImage(index) {
    let remainingCredits = this.user['remainingCredits'] ? this.user['remainingCredits'] : 0;
    let token = this.winServ.getLocalItem('token');
    let $image = this.recentSearchData[index];
    let ratio = this.recentSearchData[index].ratio;
    let price_credits = this.recentSearchData[index].price_credits;
    if ($image.isPurchased == 1) {
      this.packageNotifyAlert('Error!', 'You have already purchased this image.', 'error');
      return;
    }
    if (parseInt(price_credits) > parseInt(remainingCredits)) {
      let _that = this;
      this.showAlert(
        'Oops..',
        '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some?</p></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          _that.$header.getAndUpdateCustomCredits();
          let ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }
    if (this.user['is_download'] == '0') {
      this.user['is_download'] = 0;
      this.onlyPurchaseImage($image, this.winServ.getLocalItem('token'), 1);
    } else {
      let message =
        '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
        price_credits +
        '</span> credits.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
      const _that = this;
      const alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
      alertRes.then(result => {
        if (result.value) {
          const hideConfirm = _that.winServ.getLocalItem('hideImageConfirm') ? true : false;
          _that.user['is_download'] = hideConfirm ? 0 : 1;
          _that.onlyPurchaseImage($image, _that.winServ.getLocalItem('token'), hideConfirm);
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }
  onlyPurchaseImage(imageDetails, token, hideConfirm) {
    const index = this.recentSearchData.findIndex(d => d.image_id == imageDetails.image_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
      // this.recentSearchData[index].image_thumbnail_main = this.ServerImgPath + this.recentSearchData[index].image_thumbnail;
    }
    this.purchaseImageReq = this.imageSer
      .purchaseImageByCredits(imageDetails.image_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (index > -1) {
                  this.recentSearchData[index].isPurchased = 1;
                  this.isPreviewLoaded[index] = false;
                  // this.recentSearchData[index].image_thumbnail_main = this.ServerImgPath + this.recentSearchData[index].image_thumbnail;
                  this.getMainImage(index);
                }
                this.packageNotifyAlert('Success!', data.message, 'success');
                this.downloadingImage = false;
                break;
              case 204:
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error')
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 401:
                const _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      _that.$header.getAndUpdateCustomCredits();
                      const ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                      // _that.router.navigateByUrl('/subscriptions');
                    }
                  }
                );
                this.downloadingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 500:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.packageNotifyAlert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          console.log(err);
          this.packageNotifyAlert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  downloadImage(index, selected) {
    if (!selected || selected == 'original') {
      this.downloadThisImage(index, 'width', 'height', false);
    } else if (selected == 'large') {
      this.downloadThisImage(index, 'large_width', 'large_height', false);
    } else if (selected == 'medium') {
      this.downloadThisImage(index, 'medium_width', 'medium_height', false);
    } else if (selected == 'small') {
      this.downloadThisImage(index, 'small_width', 'small_height', false);
    } else if (selected == 'custom') {
      this.downloadThisImage(index, 'custom_width', 'custom_height', false);
    }
  }
  showAlert(title, messageHTML, type, confirmButtonText, cancelButtonText) {
    //
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
      confirmButtonClass: 'btn btn-theme-white',
      cancelButtonClass: 'btn btn-cancle',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      animation: false
    });
  }
  addToPurchasePack(pack, token, hideConfirm) {
    this.purchasePackReq = this.packSer
      .purchasePack(pack.id, token, pack.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                let index = this.latestPacks.findIndex(d => d.id == pack.id);
                // swal('Success!', "Pack purchased successfully !", 'success');
                this.packageNotifyAlert('Success!', 'Pack purchased successfully.', 'success');
                this.$header.updateUserData();
                this.withlogin(token);
                break;
              case 204:
                // swal('Error!', data.message, 'error')
                this.packageNotifyAlert('Error!', data.message, 'error');
                break;
              case 400:
                // swal('Error!', data.message, 'error')
                this.packageNotifyAlert('Error!', data.message, 'error');
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      _that.$header.getAndUpdateCustomCredits();
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                    }
                  }
                );
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                break;
              case 500:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.packageNotifyAlert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                break;
            }
            this.purchasingImage = false;
          }
        },
        err => {
          console.log(err);
          // swal('Error!', "An unknown error occure, please try after some time !", 'error');
          this.packageNotifyAlert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.purchasingImage = false;
        }
      );
  }
  getRecentSearch(token) {
    if (this.recentSearchReq) {
      this.recentSearchReq.unsubscribe();
    }
    if (token) {
      this.recentSearchReq = this.http
        .get(this.host + 'webservices/getSearchHistory?token=' + token)
        .map(res => res.json())
        .subscribe(data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.recentSearchData = data.data ? data.data : [];
                let _that = this;
                setTimeout(function() {
                  this.InitializeGoogleGallary();
                  _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                    ele.addEventListener('click', _that.onImageView.bind(_that));
                  });
                }, 500);
                break;
              default:
                this.recentSearchData = [];
                break;
            }
          }
          this.isSearchLoaded = true;
        });
    }
  }

  getRecentSearchModel(token) {
    if (this.recentSearchReqModel) {
      this.recentSearchReqModel.unsubscribe();
    }

    if (token) {
      this.recentSearchReqModel = this.http
        .get(this.host + 'webservices/getSearchHistoryModel?token=' + token)
        .map(res => res.json())
        .subscribe(data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.recentSearchDataModel = data.data ? data.data : [];
                let _that = this;
                setTimeout(function() {
                  this.InitializeGoogleGallary();
                  _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                    ele.addEventListener('click', _that.onModelView.bind(_that));
                  });
                }, 500);
                break;
              default:
                this.recentSearchDataModel = [];
                break;
            }
          }
          this.isSearchLoaded = true;
        });
    }
  }

  onImageView(event) {
    let img_id = null;
    let index = -1;
    if (event.target) {
      img_id = $(event.target).attr('data-id');
      index = parseInt($(event.target).attr('data-index'));
      setTimeout(() => {
        this.recentSearchData[index].simage_format = this.recentSearchData[index].format
          ? this.recentSearchData[index].format.match(/[^ ,]+/g).join(', ')
          : null;
        if (img_id) {
          if (this.recentSearchData[index] && !this.recentSearchData[index].image_thumbnail_main) {
            const token = this.winServ.getLocalItem('token')
              ? this.winServ.getLocalItem('token')
              : '';
            this.comServ
              .get('webservices/getMainImage?img=' + img_id + '&token=' + token)
              .subscribe(data => {
                if (data.status) {
                  switch (data.status) {
                    case 200:
                      if (data.data && data.data.url) {
                        this.recentSearchData[index].image_thumbnail_main = this.trustAsURL(
                          data.data.url
                        ); // ;
                        this.recentSearchData[index].image_preview_zoom =
                          data.data.image_preview_zoom;
                        this.recentSearchData[index].ratio = data.data.ratio;
                      }
                      break;
                    default:
                      break;
                  }
                }
              });
          }
        }
      }, 50);
    }
  }
  getMainImage(index: number) {
    const img = this.recentSearchData[index];
    if (img) {
      const token = this.winServ.getLocalItem('token') ? this.winServ.getLocalItem('token') : '';
      this.comServ
        .get('webservices/getMainImage?img=' + img.image_id + '&token=' + token)
        .subscribe(data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (data.data && data.data.url) {
                  this.recentSearchData[index].image_thumbnail_main = this.trustAsURL(
                    data.data.url
                  );
                  this.recentSearchData[index].image_preview_zoom = data.data.image_preview_zoom;
                  this.recentSearchData[index].ratio = data.data.ratio;
                }
                break;
              default:
                break;
            }
          }
        });
    }
  }
  previewLoaded(index) {
    // $('body').find('#remove-ele-' + index).remove();
    this.isPreviewLoaded[index] = true;
    setTimeout(function() {
      this.zoomImage('xzoom-' + index, true);
    }, 10);
  }
  addnameCol(form: NgForm) {
    this.isAdding = true;
    let token = this.winServ.getLocalItem('token');
    let data = { token: token, img_id: 0, name: this.newColName };
    this.colService.addnameCol(data).subscribe(data => {
      if (data.status == 200) {
        // this.isAddSuccess = true;
        this.AddSuccess = data.message;
        setTimeout(() => {
          form.resetForm();
          this.isAddSuccess = false;
          this.AddSuccess = '';
        }, 1000);
        $('body')
          .find('#collection-add')
          .find('.close:first')
          .click();
        this.newColName = ' ';
        // this.packageNotifyAlert("Success!", data.message, "success");
        this.packageNotifyAlert('Added!', data.message, 'success', undefined, 7000, () => {
          console.log('Callback called for sw2 in else');
          this.lastCollectionId = null;
        });
        this.lastCollectionId = data.data.id;
        $('body #btnCloseAdd').click();
        this.withlogin(token);
      } else if (data.status == 402) {
        this.packageNotifyAlert('Error!', data.error_message, 'error');
      } else {
        this.isAddError = true;
        this.AddError = data.error_message;
        if (data.errors) {
          this.Errors = data.errors;
        }
      }
      this.isAdding = false;
      setTimeout(() => {
        this.Errors = {};
      }, 2000);
    });
  }
  widthUpdated(ratio) {
    this.widthError = false;
    let res = /^[0-9]+$/.test(this.imageWidthToDownload.toString());
    if (!res) {
      this.widthError = true;
      let imgWidth = parseInt(this.imageWidthToDownload.toString());
      this.imageWidthToDownload = imgWidth ? imgWidth : 0;
    }
    this.imageHeightToDownload = Math.round(this.imageWidthToDownload * ratio);
  }
  downloadThisImage(index, width, height, reCalled) {
    let $image = this.recentSearchData[index];
    let ratio = this.recentSearchData[index].ratio;
    let price_credits = this.recentSearchData[index].price_credits;
    this.imageHeightToDownload = Math.round(this.imageWidthToDownload * ratio);
    let token = this.winServ.getLocalItem('token');
    let imageWidth =
      width == 'custom_width'
        ? this.imageWidthToDownload
        : width == 'width'
        ? 'width'
        : this.recentSearchData[index][width];
    let imageHeight =
      height == 'custom_height'
        ? this.imageHeightToDownload
        : height == 'height'
        ? 'height'
        : this.recentSearchData[index][height];
    let imageId = this.recentSearchData[index]['image_id'];
    if (!token) {
      swal('Info!', 'You need to login to download image.', 'info');
    }
    if (!imageHeight || !imageWidth || !imageId) {
      // swal('Error!', 'Unknown Error', 'error');
      this.packageNotifyAlert('Error!', 'Unknown Error.', 'error');
      return;
    }
    let remainingCredits = this.user['remainingCredits'] ? this.user['remainingCredits'] : 0;
    if (parseInt(price_credits) > parseInt(remainingCredits)) {
      let _that = this;
      this.showAlert(
        'Oops..',
        '<div class=""><div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some ?</p></div></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          _that.$header.getAndUpdateCustomCredits();
          let ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }

    this.downloadingImage = true;
    let imageName = this.recentSearchData[index].image_name;
    var type = this.selectedSize[index];
    this.downloadReq = this.imageSer
      .downloadImage(token, imageId, imageWidth, imageHeight, type)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.imageWidthToDownload = 0;
                this.imageHeightToDownload = 0;
                this.selectedSize = [];
                if (data.data && data.data.url) {
                  this.downloadUrl = data.data.url;
                  let img = $('body .downloadImg');
                  if (img && img[0]) {
                    setTimeout(() => {
                      img[0].click();
                      this.$header.updateUserData();
                      this.downloadingImage = false;
                    }, 1000);
                  } else {
                    // swal('Error!', 'An error occure while downloading image.', 'error');
                    this.packageNotifyAlert(
                      'Error!',
                      'An error occure while downloading image.',
                      'error'
                    );
                    this.downloadingImage = false;
                  }
                } else {
                  // swal('Error!', 'Invalid image download request', 'error');
                  this.packageNotifyAlert('Error!', 'Invalid image download request', 'error');
                  this.downloadingImage = false;
                }
                break;
              case 401:
                // swal('Error!', 'You need to purchase image to download this image.', 'error');
                if (reCalled || data.isHideConfirm == '1') {
                  this.purchaseImage(
                    $image,
                    this.winServ.getLocalItem('token'),
                    true,
                    width,
                    height
                  );
                } else {
                  let message =
                    '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
                    price_credits +
                    '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-dashboardimg-purchase"/><label for="do-not-show-dashboardimg-purchase">Don\'t show this again.</label></div></div></div>';
                  let _that = this;
                  let alertRes = this.showAlert('Confirmation', message, 'success', 'Ok', 'Cancel');
                  alertRes.then(result => {
                    if (result.value) {
                      let hideConfirm = _that.winServ.getLocalItem('hideImageConfirm')
                        ? true
                        : false;
                      _that.purchaseImage(
                        $image,
                        _that.winServ.getLocalItem('token'),
                        hideConfirm,
                        width,
                        height
                      );
                      _that.winServ.removeItem('hideImageConfirm');
                    } else {
                      _that.downloadingImage = false;
                    }
                  });
                }
                break;
              case 400:
                // swal('Error!', data.error_message, 'error');
                this.packageNotifyAlert('Error!', data.error_message, 'error');
                this.downloadingImage = false;
                break;
              default:
                // swal('Error!', 'An unknown error occure while downloading image.', 'error');
                this.packageNotifyAlert(
                  'Error!',
                  data.message ? data.message : 'An unknown error occure while downloading image.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          // swal('Error!', 'An unknown error occure while downloading image.', 'error');
          this.packageNotifyAlert(
            'Error!',
            'An unknown error occure while downloading image.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  purchaseImage(imageDetails, token, hideConfirm, width, height) {
    const index = this.recentSearchData.findIndex(d => d.image_id == imageDetails.image_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
      // this.recentSearchData[index].image_thumbnail_main = this.ServerImgPath + this.recentSearchData[index].image_thumbnail;
    }
    this.purchaseImageReq = this.imageSer
      .purchaseImageByCredits(imageDetails.image_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (index > -1) {
                  this.recentSearchData[index].isPurchased = 1;
                  this.isPreviewLoaded[index] = false;
                  // this.recentSearchData[index].image_thumbnail_main = this.ServerImgPath + this.recentSearchData[index].image_thumbnail;
                  this.getMainImage(index);
                }
                this.downloadThisImage(index, width, height, true);
                // swal('Success!', "Image purchased successfully !", 'success');
                break;
              case 204:
                // swal('Error!', data.message, 'error')
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error')
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      // _that._router.navigateByUrl('/subscriptions');
                      _that.$header.getAndUpdateCustomCredits();
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                    }
                  }
                );
                this.downloadingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 500:
                // swal('Error!', data.message, 'error');
                this.packageNotifyAlert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.packageNotifyAlert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          console.log(err);
          // swal('Error!', "An unknown error occure, please try after some time !", 'error');
          this.packageNotifyAlert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  SelectText(element) {
    if (window.getSelection) {
      var selection = window.getSelection();
      var range: any = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } else {
      return false;
    }
  }
  copyImage(ele) {
    let _that = this;
    // Make the container Div contenteditable
    let element = $('body').find(ele);
    element.attr('contenteditable', 'true');
    // Select the image
    if (element.get(0)) {
      let res = _that.SelectText(element.get(0));
      try {
        let success = document.execCommand('copy');
        if (success) {
        } else {
          throw new Error('Error while copying image.');
        }
        // Unselect the content
        window.getSelection().removeAllRanges();
        // Make the container Div uneditable again
        $(ele).removeAttr('contenteditable');
        // Success!!
        // swal('Copied', "Image copied to clipboard.", 'success');
        this.packageNotifyAlert('Copied!', 'Image copied to clipboard.', 'success');
      } catch (error) {
        console.log(error);
        // swal('Error', error, 'error');
        this.packageNotifyAlert('Error!', error, 'error');
      }
    } else {
      // swal('Error', "Unable to find image.", 'error');
      this.packageNotifyAlert('Error!', 'Unable to find image.', 'error');
    }
  }
  customCreditPopup() {
    this.$header.getAndUpdateCustomCredits();
    let ele = $('body').find('#add-credit-modal-btn');
    if (ele[0]) {
      ele[0].click();
    }
  }
  userDataUpdated(user) {
    if (this.winServ.getLocalItem('token')) {
      this.withlogin(this.winServ.getLocalItem('token'));
    }
  }
  oneUserLoggedOut(data) {
    if (this.winServ.getLocalItem('token')) {
      this.homes['active_login'] = this.homes['active_login'] - 1;
    }
  }
  getLoginDetails() {
    $('body')
      .find('#logged-in-details-modal-btn')
      .attr('data-nologin', this.homes['active_login'] ? this.homes['active_login'] : 0);
    if ($('body').find('#logged-in-details-modal-btn')[0]) {
      setTimeout(function() {
        $('body')
          .find('#logged-in-details-modal-btn')[0]
          .click();
      }, 500);
    }
    this.$header.getLoggedInDetails();
  }

  // pack add to cart
  addToCart(pack) {
    let cartData = {
      packId: pack.id,
      packName: pack.pack_name,
      packPrice: pack.price,
      packPriceInCredits: pack.price_credits
    };
    this.winServ.removeItem('seletedPlan');
    this.cartService.destroy();
    cartData['token'] = this.winServ.getLocalItem('token');
    this.comServ.post('webservices/addToCart', cartData).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            this.$header.updateCartData();
            break;
          case 503:
            // swal('Error', data.message, 'error');
            this.packageNotifyAlert('Error!', data.message, 'error');
            break;
          default:
            break;
        }
      }
    });
  }

  // add to cart for kits
  addToCartKit(kit, plan) {
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
          this.packageNotifyAlert('Warning!', 'Kit is already in cart.', 'info');
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
          this.packageNotifyAlert(
            'Error!',
            'YMultiple license types. You have previously selected ' +
              this.plansDetail[index].account_type_name +
              '.',
            'error'
          );
        } else {
          this.packageNotifyAlert(
            'Error!',
            'You have selected an invalid plan, please try again!',
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
              this.packageNotifyAlert('Error!', data.message, 'error');
              break;
            default:
              break;
          }
        }
      });
    }
  }

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

  packageNotifyAlert(title, messageHTML, type, position = null, timer = 5000, cb = null) {
    return this.comServ.notify(title, messageHTML, type, position, timer, cb);
  }
  replacePreviews(string: string, search: string, replace: string) {
    return string.replace(search, replace);
  }
  downloadPreview(index: number) {
    let $d = this.recentSearchData[index];
    if ($d) {
      this.downloadUrl = $d.image_thumbnail_main;
      var ext = null;
      if (this.downloadUrl) {
        if (this.downloadUrl['changingThisBreaksApplicationSecurity']) {
          this.downloadUrl = this.downloadUrl['changingThisBreaksApplicationSecurity'];
        }
        var urlSpl = this.downloadUrl.split(',');
        if (urlSpl[0]) {
          var urlSpl2 = urlSpl[0].split(':');
          if (urlSpl2[1]) {
            var urlSpl3 = urlSpl2[1].split(';');
            if (urlSpl3[0]) {
              var urlSpl4 = urlSpl3[0].split('/');
              if (urlSpl4[1]) {
                ext = urlSpl4[1];
              }
            }
          }
        }
      }
      this.downloadImageName = $d.image_name + ' Preview.' + ext;
      let img = $('body .downloadImg');
      if (img && img[0]) {
        setTimeout(() => {
          img[0].click();
          // this.$header.updateUserData();
          this.downloadingImage = false;
        }, 1000);
      }
    }
  }
  firstTimeLoggedIn(isFirstLogin: boolean) {
    this.isFirstLogin = isFirstLogin;
  }
  goToDashboard() {
    this.isFirstLogin = false;
    $('.homepage-loader').css('display', 'block');
    this.withlogin(this.winServ.getLocalItem('token'));
    this._router.navigateByUrl('/');
  }
  zoomImage(id, event) {
    setTimeout(function() {
      this.zoomThisImage(id, event);
    }, 0);
  }
  verifyImportReq() {
    this.homeParams['currentUser'] = this.user['id'];
    this.comServ.post('webservices/confirmImportRequest', this.homeParams).subscribe(data => {
      if (data.status == 200) {
        this.importReqMsg = data.message;
        $('body')
          .find('#import-confirm-modal-btn')[0]
          .click();
      } else {
        $('body #import-confirm-modal')
          .find('.close:first')
          .click();
      }
    });
  }
  encodeToURL(str) {
    return encodeURIComponent(str);
  }
  trustAsURL(url: string) {
    return this.comServ.trustAsDataURI(url);
  }

  onModelView(event) {
    this.threeDImgLoading = true;
    let model_id = null;
    let index = -1;
    if (event.target) {
      model_id = $(event.target).attr('data-id');
      index = parseInt($(event.target).attr('data-index'));
      this.recentSearchDataModel[index].sformat = this.recentSearchDataModel[index].format
        ? this.recentSearchDataModel[index].format.match(/[^ ,]+/g).join(', ')
        : null;
      setTimeout(() => {
        if (model_id) {
          const md = this.recentSearchDataModel[index];
          if (md && (!md.image_thumbnail_main || md.image_thumbnail_main == md.image_thumbnail)) {
            let token = this.token ? this.token : '';
            this.modelService.getMainModelImg(token, md.model_id).subscribe(data => {
              if (data.status) {
                switch (data.status) {
                  case 200:
                    if (data.data && data.data.url) {
                      this.recentSearchDataModel[index].preview = [];
                      let tempPreview = data.data.preview ? JSON.parse(data.data.preview) : [];
                      this.recentSearchDataModel[index].available_types = data.data.available_types;
                      if (tempPreview.length > 0) {
                        for (let i = 0; i < tempPreview.length; i++) {
                          const preViewURL = tempPreview[i];
                          let newPreView = this.ServerImgPath + preViewURL;
                          this.recentSearchDataModel[index].preview.push(newPreView);
                        }
                      }
                      this.recentSearchDataModel[index].ratio = data.data.ratio;
                      if (
                        this.recentSearchDataModel[index].preview &&
                        this.recentSearchDataModel[index].preview.length > 0
                      ) {
                        this.threeDImgLoading = false;
                        $('#' + `home-remove-ele-${index}`).spritespin({
                          source: this.recentSearchDataModel[index].preview,
                          width: 550, // width of image
                          height: 550 / data.data.ratio, // heignt of image
                          sense: -1, // touch sesivity
                          animate: true, // auto rotate or manual
                          loop: true, // whether to loop animation
                          frameTime: 100 // animation speed
                        });
                      } else {
                        this.threeDImgLoading = false;
                      }
                    }
                    break;
                  default:
                    break;
                }
              }
            });
          }
        }
      }, 50);
    }
  }

  // downloadThisModel(index, ext) {
  //   if (this.recentSearchDataModel[index].isPurchased == '0') {
  //     this.showAlert(
  //       'Oops..',
  //       '<div class="credit-spend-confirm text-left clearfix"><p>Please purchase this Model first.</p></div>',
  //       'warning',
  //       'Purchase Model',
  //       'Cancel',
  //     );
  //   } else {
  //     this.downloadingImage = true;
  //     var modelId = this.recentSearchDataModel[index].model_id;
  //     var token = this.winServ.getLocalItem('token');
  //     this.comServ
  //       .get('webservices/downloadModel', { token: token, modelId, ext })
  //       .subscribe(
  //         res => {
  //           this.downloadUrl = res.url;
  //           this.downloadImageName = Math.random().toString();
  //           let img = $('body .downloadImg');
  //           if (img && img[0]) {
  //             setTimeout(() => {
  //               img[0].click();
  //               this.downloadingImage = false;
  //               this.downloadingImage = false;
  //             }, 1000);
  //           }
  //         },
  //         () => {
  //           this.downloadingImage = false;
  //         },
  //       );
  //   }
  // }

  downloadThisModel(index, ext) {
    let remainingCredits = this.user['remainingCredits'] ? this.user['remainingCredits'] : 0;
    let $image = this.recentSearchDataModel[index];
    let ratio = this.recentSearchDataModel[index].ratio;
    let price_credits = this.recentSearchDataModel[index].price_credits;
    if (
      parseInt(price_credits) > parseInt(remainingCredits) &&
      !this.recentSearchDataModel[index].isPurchased
    ) {
      let _that = this;
      this.showAlert(
        'Oops..',
        '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some?</p></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          _that.updateService.getAndUpdatingCustomerCredits('yes');
          // _that.$header.getAndUpdateCustomCredits();
          let ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }
    let token = this.winServ.getLocalItem('token');
    if (!token) {
      // swal('Info!','You need to login to download image.','info');
      this.imageCollectionalert('Info!', 'You need to login to download model.', 'info');
    }
    this.downloadingImage = true;
    let modelName = this.recentSearchDataModel[index].model_name;
    var modelId = this.recentSearchDataModel[index].model_id;
    this.downloadReq = this.comServ
      .get('webservices/downloadModel', { token: token, modelId, ext })
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (data && data.url) {
                  this.downloadUrl = data.url;
                  this.downloadImageName = data.model_name;
                  let img = $('body .downloadImg');
                  if (img && img[0]) {
                    setTimeout(() => {
                      img[0].click();
                      this.updateService.updatingUserData('yes');
                      // this.$header.updateUserData();
                      this.downloadingImage = false;
                    }, 1000);
                  } else {
                    // swal('Error!', 'An error occure while downloading image.', 'error');
                    this.imageCollectionalert(
                      'Error!',
                      'An error occure while downloading model.',
                      'error'
                    );
                    this.downloadingImage = false;
                  }
                } else {
                  // swal('Error!', 'Invalid image download request', 'error');
                  this.imageCollectionalert(
                    'Error!',
                    data.message
                      ? data.message
                      : 'An unknown error occure while downloading model.',
                    'error'
                  );
                  this.downloadingImage = false;
                }
                break;
              case 401:
                // swal('Error!', 'You need to purchase image to download this image.', 'error');
                if (data.isHideConfirm == true) {
                  this.onlyPurchaseThisModel($image, ext);
                } else {
                  let message =
                    '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
                    price_credits +
                    '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
                  let _that = this;
                  let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
                  alertRes.then(result => {
                    if (result.value) {
                      let hideConfirm = _that.winServ.getLocalItem('hideImageConfirm')
                        ? true
                        : false;
                      _that.onlyPurchaseThisModel($image, ext);
                      _that.winServ.removeItem('hideImageConfirm');
                    } else {
                      _that.downloadingImage = false;
                    }
                  });
                }
                break;
              case 400:
                // swal('Error!', data.error_message, 'error');
                this.imageCollectionalert('Error!', data.error_message, 'error');
                this.downloadingImage = false;
                break;
              default:
                // swal('Error!', 'An unknown error occure while downloading image.', 'error');
                this.selectedSize = [];
                this.imageCollectionalert(
                  'Error!',
                  'An unknown error occure while downloading model.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          // swal('Error!', 'An unknown error occure while downloading image.', 'error');
          this.selectedSize = [];
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure while downloading model.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }

  onlyPurchaseThisModel(modelData, ext) {
    let remainingCredits = this.user['remainingCredits'] ? this.user['remainingCredits'] : 0;
    let $image = modelData;
    let price_credits = modelData.price_credits;
    if ($image.isPurchased == 1) {
      this.imageCollectionalert('Error!', 'You have already purchased this image', 'error');
      return;
    }
    if (parseInt(price_credits) > parseInt(remainingCredits)) {
      let _that = this;
      this.showAlert(
        'Oops..',
        '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some?</p></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          const updateServ = new UpdateService();
          updateServ.getAndUpdatingCustomerCredits('yes');
          // _that.$header.getAndUpdateCustomCredits();
          let ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }
    if (this.user['is_download'] == '0') {
      this.user['is_download'] = 0;
      this.onlyPurchaseModel($image, this.winServ.getLocalItem('token'), 1, ext);
    } else {
      let message =
        '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
        price_credits +
        '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
      let _that = this;
      let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
      alertRes.then(result => {
        if (result.value) {
          let hideConfirm = _that.winServ.getLocalItem('hideImageConfirm') ? true : false;
          _that.user['is_download'] = hideConfirm ? 0 : 1;
          _that.onlyPurchaseModel($image, _that.winServ.getLocalItem('token'), hideConfirm, ext);
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }

  onlyPurchaseModel(modelDetails, token, hideConfirm, ext) {
    let index = this.recentSearchDataModel.findIndex(d => d.model_id == modelDetails.model_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
      this.recentSearchDataModel[index].image_thumbnail_main =
        this.ServerImgPath + this.recentSearchDataModel[index].image_thumbnail;
    }
    this.purchaseImageReq = this.modelService
      .purchaseModelByCredits(modelDetails.model_id, token, modelDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (index > -1) {
                  this.recentSearchDataModel[index].isPurchased = 1;
                  if (ext) {
                    // after successfull purchase download the image
                    this.downloadingImage = true;
                    var modelId = this.recentSearchDataModel[index].model_id;
                    this.downloadReq = this.comServ
                      .get('webservices/downloadModel', {
                        token: token,
                        modelId,
                        ext
                      })
                      .subscribe(data => {
                        if (data.status) {
                          switch (data.status) {
                            case 200:
                              if (data && data.url) {
                                this.downloadUrl = data.url;
                                this.downloadImageName = data.model_name;
                                let img = $('body .downloadImg');
                                if (img && img[0]) {
                                  setTimeout(() => {
                                    img[0].click();
                                    this.updateService.updatingUserData('yes');
                                    // this.$header.updateUserData();
                                    this.downloadingImage = false;
                                    $('#' + `remove-ele-${index}`).spritespin({
                                      source: this.recentSearchDataModel[index].preview,
                                      width: 550, // width of image
                                      height: 550 / data.data.ratio, // heignt of image
                                      sense: -1, // touch sesivity
                                      senseLane: -1,
                                      animate: true, // auto rotate or manual
                                      loop: true, // whether to loop animation
                                      frameTime: 100 // animation speed
                                    });
                                  }, 100);
                                } else {
                                  // swal('Error!', 'An error occure while downloading image.', 'error');
                                  this.imageCollectionalert(
                                    'Error!',
                                    'An error occure while downloading model.',
                                    'error'
                                  );
                                  this.downloadingImage = false;
                                }
                              }
                              break;
                            default:
                              this.selectedSize = [];
                              this.imageCollectionalert(
                                'Error!',
                                'An unknown error occure while downloading model.',
                                'error'
                              );
                              this.downloadingImage = false;
                              break;
                          }
                        }
                      });
                  }
                }
                let updateServ = new UpdateService();
                updateServ.updatingUserData('yes');
                this.imageCollectionalert('Success!', data.message, 'success');
                this.downloadingImage = false;
                break;
              case 204:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 400:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      const updateServ = new UpdateService();
                      updateServ.getAndUpdatingCustomerCredits('yes');
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                    }
                  }
                );
                this.downloadingImage = false;
                break;
              case 403:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 404:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 500:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              default:
                this.imageCollectionalert(
                  'Error!',
                  'An unknown error occure, please try after some time!',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          swal('Error!', 'An unknown error occure, please try after some time!', 'error');
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure, please try after some time!',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }

  imageCollectionalert(title, messageHTML, type, position = null, timer = 5000) {
    return this.comServ.notify(title, messageHTML, type, position, timer);
  }
  goToPurchase = pack => {
    const type = pack.type == 1 ? 'pack' : 'kit';
    this._router.navigate(['/purchases'], {
      queryParams: {
        [type]: pack.type == 1 ? pack.packId : pack.kitId,
        type: type == 'kit' ? 'model' : 'kit'
      }
    });
  };
  /**
   *
   */

  clearSearchInput = () => {
    this.search = '';
    $('#suggestion-tags').focus();
  };
  ngOnDestroy() {
    if (this.getHomeDataWithoutLoginReq) {
      this.getHomeDataWithoutLoginReq.unsubscribe();
    }
    if (this.getHomeDataWithLoginReq) {
      this.getHomeDataWithLoginReq.unsubscribe();
    }
    if (this.getHomeDataWithoutLoginReq) {
      this.getHomeDataWithoutLoginReq.unsubscribe();
    }
    if (this.checkUserCreditsReq) {
      this.checkUserCreditsReq.unsubscribe();
    }
    if (this.purchasePackReq) {
      this.purchasePackReq.unsubscribe();
    }
    if (this.recentSearchReq) {
      this.recentSearchReq.unsubscribe();
    }
    if (this.queryParamEvent) {
      this.queryParamEvent.unsubscribe();
    }
  }
  renderNoImage = event => {
    event.target.src = this.ImgPath + 'no_image.svg';
  };
  /**
   *
   */
  showActualOption = (): boolean => {
    return (
      this.user &&
      this.user.user_plan_details &&
      (this.user.user_plan_details.subscriptionStatus == 1 ||
        this.user.user_plan_details.subscriptionStatus == 2)
    );
  };
}
