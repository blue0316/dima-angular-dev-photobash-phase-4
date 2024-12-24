import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AppSettings } from '../../app.setting';
import { WindowSevice } from './../../services/window.service';
import { CommonSevice } from './../../services/common.service';
import { ISubscription } from 'rxjs/Subscription';
import { ImageService } from './../../services/image.service';
import { SearchPipe } from '../../pipes/search.pipe';

declare var $: any;
import swal from 'sweetalert2';
import { HeaderComponent } from '../../components/header/header.component';
import { UpdateService } from '../../services/update.service';
import { ModelService } from '../../services/model.service';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  providers: [WindowSevice, CommonSevice, ImageService, ModelService]
})
export class DetailsComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;

  dataLoaded: boolean;
  purchasedImages: Array<any> = [];
  purchasedPacks: Array<any> = [];
  purchasedPacksAndKits: Array<any> = [];
  isImageSelected: boolean;
  selectedFilter: string;
  downloadingImage: boolean;
  widthError: boolean;
  imageWidthToDownload: number;
  imageHeightToDownload: number;
  downloadUrl: string;
  donwloadFileName: string = null;
  packId: string = null;
  packDetails: any = {};
  totalKits: number;
  totalPacks: number;
  totalModels: number;
  private purchaseHistoryReq: ISubscription;
  private imgPurchaseHistoryReq: ISubscription;
  private downloadReq: ISubscription;
  private purchaseImageReq: ISubscription;
  filterImages: any = [];
  filterPacks: any = [];
  searchKeyword: string = null;
  packNameSelected: boolean;
  selectedPackName: string = null;
  planFacilities: any = {};
  planfacilitiesToolTip: any = {};
  selectedSize: any = [];
  userData: any;
  imageDataLoaded: boolean;
  isPreviewLoaded: any = [];
  isPreviousCallComplete: boolean;
  offset: number;
  limit: number = AppSettings.IMG_PER_PAGE;
  moreDataLoading: boolean;
  isMoreDataAvail: boolean;
  downloadImageName: string;
  totalImages: number;
  intializeCarasoul: boolean;
  routerEvent;
  queryParamEvent;
  windowWidth: number;
  slideInterval: number;
  public slideConfig = {
    dots: true,
    slidesToShow: 1,
    infinite: true,
    speed: 300,
    fade: true,
    autoplay: true,
    autoplaySpeed: 200000,
    cssEase: 'linear',
    adaptiveHeight: false,
    pauseOnHover: false
  };
  searchPressed: boolean;
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  threeDImgLoading: boolean;
  token: String;
  imgId: string;
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
  @HostListener('touchstart', [])
  @HostListener('window:scroll', [])
  onWindowScroll($event: any) {
    var currentPosition = window.pageYOffset ? window.pageYOffset : 0;
    currentPosition = this.parseInt(currentPosition);
    var eleHeight = this.parseInt($('.pictureView.viewchange').height());
    var footerHeight = this.parseInt($('footer').height());
    if (
      this.imageDataLoaded &&
      this.isMoreDataAvail &&
      this.isPreviousCallComplete &&
      currentPosition >= eleHeight - (footerHeight + 1800)
    ) {
      this.isPreviousCallComplete = false;
      setTimeout(() => {
        this.getImagePurchaseHistoryInfinite();
      }, 500);
    }
  }
  constructor(
    private router: Router,
    private winServ: WindowSevice,
    private commonServ: CommonSevice,
    private imageSer: ImageService,
    private activeRoute: ActivatedRoute,
    private titleService: Title,
    private eleRef: ElementRef,
    private modelService: ModelService,
    private updateService: UpdateService
  ) {
    this.titleService.setTitle('Purchases');
    this.dataLoaded = false;
    this.imageDataLoaded = false;
    this.token = this.winServ.getLocalItem('token');
    this.isMoreDataAvail = true;
  }
  parseInt(name) {
    return parseInt(name);
  }
  ngOnInit() {
    this.offset = 0;
    this.slideInterval = 10000;
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
    this.selectedFilter = 'pack';
    let userData = JSON.parse(this.winServ.getLocalItem('userData'));
    this.userData = userData;
    let planDetails = this.userData['user_plan_details'];
    if (planDetails && planDetails.facilities) {
      this.planFacilities = planDetails.facilities;
    }
    if (planDetails && planDetails.facilitiesToolTip) {
      this.planfacilitiesToolTip = planDetails.facilitiesToolTip;
    }
    this.routerEvent = this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.dataLoaded = false;
        this.totalImages = 0;
        this.totalKits = 0;
        this.totalModels = 0;
        this.totalPacks = 0;
        this.imageDataLoaded = false;
        if (this.packId) {
          this.isImageSelected = true;
        } else if (this.searchKeyword) {
          this.isImageSelected = true;
        } else {
          this.isImageSelected = false;
        }
      }
    });
    this.getQueryParams();
  }

  hoverImage = () => {
    this.intializeCarasoul = true;
  };

  getQueryParams = () => {
    if (this.queryParamEvent) {
      this.queryParamEvent.unsubscribe();
    }
    this.queryParamEvent = this.activeRoute.queryParams.subscribe((params: Params) => {
      this.packId = params.pack ? params.pack : params.kit;
      this.searchKeyword = params.search;
      this.searchPressed = params.search && params.search != '';
      this.selectedFilter = params.type ? params.type : 'pack';
      if (this.packId || this.searchKeyword) {
        this.isImageSelected = true;
        this.selectedFilter = params.type ? params.type : params.pack ? 'image' : 'model';
      } else {
        this.isImageSelected = false;
      }
      this.imageDataLoaded = false;
      this.imgId = params.imgId;
      this.getPackPurchaseHistory();
      this.getImagePurchaseHistory();
    });
  };
  checkLogin(isLoggedIn: boolean) {
    this.isUserLoggedIn = isLoggedIn;
    if (!isLoggedIn) {
      this.router.navigateByUrl('/404');
    }
  }
  clearFilter() {
    this.searchKeyword = null;
    if (this.isImageSelected) {
      this.filterImages = this.purchasedImages;
      setTimeout(function() {
        this.InitializeGoogleGallary();
      }, 0);
    } else {
      this.filterPacks = this.purchasedPacks;
      setTimeout(function() {
        this.gallerForPack();
      }, 0);
    }
    this.router.navigateByUrl('/purchases');
  }
  /**
   *
   */
  clearSearchInput = () => {
    this.searchKeyword = '';
    $('#search-tags').focus();
  };
  getPackPurchaseHistory() {
    let token = this.winServ.getLocalItem('token');
    if (this.purchaseHistoryReq) {
      this.purchaseHistoryReq.unsubscribe();
    }
    this.dataLoaded = false;
    this.purchaseHistoryReq = this.commonServ
      .get(
        'webservices/getPackPurchaseHistory?token=' +
          token +
          '&type=' +
          (this.selectedFilter == 'kit' || this.selectedFilter == 'model' ? 1 : 2)
      )
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.purchasedPacks = data.data ? data.data : [];
                this.purchasedPacksAndKits = data.allPacksKits;
                this.totalKits = data.totalKits;
                this.totalPacks = data.totalPacks;
                this.filterPacks = this.purchasedPacks;
                if (this.packId) {
                  let tempIndex = this.purchasedPacks.findIndex(d => d.id == this.packId);
                  if (tempIndex == -1) {
                    this.router.navigateByUrl('/404');
                  } else {
                    this.packNameSelected = true;
                    this.selectedPackName =
                      this.purchasedPacks[tempIndex].pack_name ||
                      this.purchasedPacks[tempIndex].kit_name;
                  }
                }
                for (let i in this.purchasedPacks) {
                  if (this.purchasedPacks[i]) {
                    let d = this.purchasedPacks[i];
                    d.images = d.images ? JSON.parse(d.images) : null;
                    if (this.packId && d.id == this.packId) {
                      this.packDetails = d;
                    }
                  }
                }
                setTimeout(function() {
                  this.gallerForPack();
                }, 500);
                break;
              default:
                break;
            }
          }
          this.dataLoaded = true;
        },
        err => {
          console.log(err);
          this.dataLoaded = true;
        }
      );
  }
  downloadAllPacks() {
    let ele = document.querySelectorAll('.download-pack');
    if (ele && ele.length > 0) {
      for (let index = 0; index < ele.length; index++) {
        const e = ele[index];
        var oldHref = e['href'].split('/');
        const href = oldHref[oldHref.length - 1];
        e['href'] = atob(href);
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        e.dispatchEvent(evt);
        e['href'] = href;
      }
    }
  }
  downloadThisPack(id) {
    let ele = document.getElementById(id);
    var oldHref = ele['href'].split('/');
    const href = oldHref[oldHref.length - 1];
    ele['href'] = atob(href);
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, false);
    ele.dispatchEvent(evt);
    ele['href'] = href;
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
  /*downloadThisPack(id){
    let ele = document.getElementById(id);
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, false);
    ele.dispatchEvent(evt);
  }*/
  getImagePurchaseHistory() {
    this.imageDataLoaded = false;
    this.isPreviousCallComplete = false;
    let token = this.winServ.getLocalItem('token');
    this.offset = 0;
    let url =
      'webservices/getImagePurchaseHistory?token=' +
      token +
      '&offset=' +
      this.offset +
      '&limit=' +
      this.limit;
    if (this.packId) {
      url += '&pack=' + this.packId;
    }
    if (this.searchKeyword) {
      url += '&search=' + this.searchKeyword;
    }
    if (this.selectedFilter == 'model') {
      url += '&type=1';
    }
    if (this.imgId) {
      url += `&imgId=${this.imgId}`;
    }
    if (this.imgPurchaseHistoryReq) {
      this.imgPurchaseHistoryReq.unsubscribe();
    }
    this.imgPurchaseHistoryReq = this.commonServ.get(url).subscribe(
      data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.purchasedImages = data.data ? data.data : [];
              this.filterImages = this.purchasedImages;
              let _that = this;
              _that.imageDataLoaded = true;
              setTimeout(function() {
                if (_that.selectedFilter == 'image' || _that.selectedFilter == 'model') {
                  _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                    ele.removeEventListener('click', function(ind) {
                      console.log('Removed');
                    });
                  });
                  this.InitializeGoogleGallary();
                  _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                    ele.addEventListener('click', _that.onImageView.bind(_that), false);
                  });
                  if (_that.imgId) {
                    setTimeout(() => {
                      console.log($('body').find(`a[data-id="${_that.imgId}"]`));
                      $('body')
                        .find(`a[data-id="${_that.imgId}"]`)[0]
                        .click();
                    }, 500);
                  }
                }
              }, 500);
              this.offset = this.offset + data.data.length;
              this.isMoreDataAvail = data.data.length >= this.limit ? true : false;
              this.totalImages = data.totalImages;
              this.totalModels = data.totalModels;
              this.isPreviousCallComplete = true;
              break;
            default:
              break;
          }
        }
      },
      err => {
        console.log(err);
        this.imageDataLoaded = true;
      }
    );
  }
  getImagePurchaseHistoryInfinite() {
    this.isPreviousCallComplete = false;
    this.moreDataLoading = true;
    let token = this.winServ.getLocalItem('token');
    let url =
      '/webservices/getImagePurchaseHistory?token=' +
      token +
      '&offset=' +
      this.offset +
      '&limit=' +
      this.limit +
      '&reRequest=1';
    if (this.packId) {
      url += '&pack=' + this.packId;
    }
    if (this.searchKeyword) {
      url += '&search=' + this.searchKeyword;
    }
    if (this.selectedFilter == 'model') {
      url += '&type=1';
    }
    if (this.imgPurchaseHistoryReq) {
      this.imgPurchaseHistoryReq.unsubscribe();
    }
    this.imgPurchaseHistoryReq = this.commonServ.get(url).subscribe(
      data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              var a = data.data ? data.data : [];
              for (let i = 0; i < a.length; i++) {
                const element = a[i];
                this.purchasedImages.push(element);
              }
              this.filterImages = this.purchasedImages;
              let len = this.offset;
              let _that = this;
              setTimeout(function() {
                this.InitializeGoogleGallary(); // this.init('.pictureView.viewchange');
                let i = 1;
                _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                  if (i > len) {
                    ele.addEventListener('click', _that.onImageView.bind(_that), false);
                  }
                  i++;
                });
              }, 500);

              this.offset = this.offset + data.data.length;
              this.isMoreDataAvail = data.data.length >= this.limit ? true : false;
              this.isPreviousCallComplete = true;
              break;
            default:
              break;
          }
        }
        this.imageDataLoaded = true;
        this.moreDataLoading = false;
      },
      err => {
        console.log(err);
        this.imageDataLoaded = true;
        this.moreDataLoading = false;
      }
    );
  }
  onImageView(event) {
    let img_id = null;
    let index = -1;
    let type = '';
    if (event.target) {
      img_id = $(event.target).attr('data-id');
      type = $(event.target).attr('data-type');
      index = parseInt($(event.target).attr('data-index'), 10);
      setTimeout(() => {
        if (type === '2') {
          this.threeDImgLoading = true;
          this.filterImages[index].sformat = this.filterImages[index].format
            ? this.filterImages[index].format.match(/[^ ,]+/g).join(', ')
            : null;
        }
        if (img_id) {
          if (this.filterImages[index] && !this.filterImages[index].image_thumbnail_main) {
            const token = this.token ? this.token : '';
            let url;
            if (type == '1') {
              url = 'webservices/getMainImage?img=' + img_id + '&token=' + token;
            } else {
              url = 'webservices/getMainModelImg?modelId=' + img_id + '&token=' + token;
            }
            this.commonServ.get(url).subscribe(data => {
              if (data.status) {
                switch (data.status) {
                  case 200:
                    if (data.data && data.data.url) {
                      if (type == '1') {
                        this.filterImages[index].image_thumbnail_main = this.trustAsURL(
                          data.data.url
                        );
                        this.filterImages[index].image_preview_zoom = data.data.image_preview_zoom;

                        this.filterImages[index].ratio = data.data.ratio;
                      } else {
                        this.filterImages[index].preview = [];
                        let tempPreview = data.data.preview ? JSON.parse(data.data.preview) : [];
                        if (tempPreview.length > 0) {
                          for (let i = 0; i < tempPreview.length; i++) {
                            const preViewURL = tempPreview[i];
                            let newPreView = this.ServerImgPath + preViewURL;
                            this.filterImages[index].preview.push(newPreView);
                          }
                        }
                        this.filterImages[index].available_types = data.data.available_types;
                        if (
                          this.filterImages[index].preview &&
                          this.filterImages[index].preview.length > 0
                        ) {
                          this.threeDImgLoading = false;
                          $('#' + `purchase-ele-${index}`).spritespin({
                            source: this.filterImages[index].preview,
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
                    }
                    break;
                  default:
                    break;
                }
              }
            });
          }
        } else {
        }
      }, 50);
    }
  }

  trustAsURL(url: string) {
    return this.commonServ.trustAsDataURI(url);
  }
  purchaseTypeChanged = (type: string) => {
    this.packNameSelected = false;
    this.selectedFilter = type;
    this.dataLoaded = false;
    this.router.navigate(['/purchases'], { queryParams: { type: type } });
  };
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
  downloadThisImage(index, width, height, reCalled) {
    let $image = this.filterImages[index];
    let ratio = this.filterImages[index].ratio;
    let price_credits = this.filterImages[index].price_credits;
    this.imageHeightToDownload = Math.round(this.imageWidthToDownload * ratio);
    let token = this.winServ.getLocalItem('token');
    let imageWidth =
      width == 'custom_width'
        ? this.imageWidthToDownload
        : width == 'width'
        ? 'width'
        : this.filterImages[index][width];
    let imageHeight =
      height == 'custom_height'
        ? this.imageHeightToDownload
        : height == 'height'
        ? 'height'
        : this.filterImages[index][height];
    let imageId = this.filterImages[index]['image_id'];
    if (!token) {
      this.imageCollectionalert('Info!', 'You need to login to download image.', 'info');
    }
    if (!imageHeight || !imageWidth || !imageId) {
      this.imageCollectionalert('Error!', 'Unknown Error.', 'error');
      return;
    }
    this.downloadingImage = true;
    let imageName = this.filterImages[index].image_name;
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
                  let d = data.data.url.split('/');
                  this.donwloadFileName = d[d.length - 1] ? d[d.length - 1] : null;
                  let img = $('body .downloadImg');
                  if (img && img[0]) {
                    setTimeout(() => {
                      img[0].click();
                      this.$header.updateUserData();
                      this.downloadingImage = false;
                    }, 1000);
                  } else {
                    this.imageCollectionalert(
                      'Error!',
                      'An error occure while downloading image.',
                      'error'
                    );
                    this.downloadingImage = false;
                  }
                } else {
                  console.log('Invalid Image URL');
                  this.imageCollectionalert('Error!', 'Invalid image download request.', 'error');
                  this.downloadingImage = false;
                }
                break;
              case 401:
                // this.imageCollectionalert('Error!', 'You need to purchase image to download this image.', 'error');
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
                    '<p>You are about to spend <span class="text-blue">' +
                    price_credits +
                    '</span> credits.</p><p>Are you sure ?</p><p><input type="checkbox" class="do-not-show-img-purchase"/>&nbsp;Don\'t show this again.</p>';
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
                this.imageCollectionalert('Error!', data.error_message, 'error');
                this.downloadingImage = false;
                break;
              default:
                this.imageCollectionalert(
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
          this.imageWidthToDownload = 0;
          this.imageHeightToDownload = 0;
          this.selectedSize = [];
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure while downloading image.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  purchaseImage(imageDetails, token, hideConfirm, width, height) {
    this.purchaseImageReq = this.imageSer
      .purchaseImageByCredits(imageDetails.image_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                let index = this.purchasedImages.findIndex(
                  d => d.image_id == imageDetails.image_id
                );
                if (index > -1) {
                  this.purchasedImages[index].isPurchased = 1;
                }
                this.downloadThisImage(index, width, height, true);
                // this.imageCollectionalert('Success!', "Image purchased successfully !", 'success');
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
                this.showAlert('Opps..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      _that.router.navigateByUrl('/subscriptions');
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
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  showAlert(title, messageHTML, type, confirmButtonText, cancelButtonText) {
    //
    return swal({
      customClass: 'delete-modal-box account-modal comman-modal',
      titleText: title,
      padding: 0,
      html: '<div class="modal-body">' + messageHTML + '</div>',
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
  searchImages(keyword) {
    this.searchPressed = keyword != '';
    if (this.selectedFilter == 'pack' || this.selectedFilter == 'kit') {
      this.dataLoaded = false;
      let packs = new SearchPipe().transform(
        this.purchasedPacks,
        ['camera_model', 'pack_description', 'pack_name', 'location', 'line2', 'search_name'],
        keyword,
        'id'
      );
      this.filterPacks = packs;
      setTimeout(function() {
        this.InitializeGoogleGallary();
      }, 500);
      setTimeout(() => {
        this.dataLoaded = true;
      }, 1500);
    } else {
      var query = { search: this.searchKeyword, type: this.selectedFilter };
      if (this.packId) {
        query[
          this.selectedFilter == 'model' || this.selectedFilter == 'kit' ? 'kit' : 'pack'
        ] = this.packId;
      }
      this.router.navigate(['/purchases'], { queryParams: query });
    }
  }
  packFilterAdded(packId, type) {
    this.packId = packId;
    type = type == 1 ? 'pack' : 'kit';
    var query = { [type]: packId };
    // var query = { [type]: packId, type };
    if (this.searchKeyword) {
      query['search'] = this.searchKeyword;
    }
    this.router.navigate(['/purchases'], { queryParams: query });
  }
  zoomImage(id, event) {
    setTimeout(function() {
      this.zoomThisImage(id, event);
    }, 0);
  }
  replacePreviews(string: string, search: string, replace: string) {
    return string.replace(search, replace);
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
          console.log(success);
        } else {
          throw new Error('Error while copying image!');
        }
        // Unselect the content
        window.getSelection().removeAllRanges();
        // Make the container Div uneditable again
        $(ele).removeAttr('contenteditable');
        // Success!!
        // swal('Copied', "Image copied to clipboard.", 'success');
        this.imageCollectionalert('Copied!', 'Image copied to clipboard.', 'success');
      } catch (error) {
        console.log(error);
        // swal('Error', error.responseText, 'error');
        this.imageCollectionalert('Error!', error.responseText, 'error');
      }
    } else {
      // swal('Error', "Unable to find image.", 'error');
      this.imageCollectionalert('Error!', 'Unable to find image.', 'error');
    }
  }
  imageCollectionalert(title, messageHTML, type, position = null, timer = 5000) {
    return this.commonServ.notify(title, messageHTML, type, position, timer);
  }
  downloadPreview(index: number) {
    let $d = this.filterImages[index];
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
  onlyPurchaseThisImage(index) {
    let remainingCredits = this.userData['remainingCredits']
      ? this.userData['remainingCredits']
      : 0;
    let token = this.winServ.getLocalItem('token');
    let $image = this.purchasedImages[index];
    let ratio = this.purchasedImages[index].ratio;
    let price_credits = this.purchasedImages[index].price_credits;
    if ($image.isPurchased == 1) {
      this.imageCollectionalert('Error!', 'You have already purchased this image.', 'error');
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
    if (this.userData['is_download'] == '0') {
      this.userData['is_download'] = 0;
      this.onlyPurchaseImage($image, this.winServ.getLocalItem('token'), 1);
    } else {
      let message =
        '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
        price_credits +
        '</span> credits.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
      let _that = this;
      let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
      alertRes.then(result => {
        if (result.value) {
          let hideConfirm = _that.winServ.getLocalItem('hideImageConfirm') ? true : false;
          _that.userData['is_download'] = hideConfirm ? 0 : 1;
          _that.onlyPurchaseImage($image, _that.winServ.getLocalItem('token'), hideConfirm);
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }
  onlyPurchaseImage(imageDetails, token, hideConfirm) {
    this.purchaseImageReq = this.imageSer
      .purchaseImageByCredits(imageDetails.image_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                let index = this.purchasedImages.findIndex(
                  d => d.image_id == imageDetails.image_id
                );
                if (index > -1) {
                  this.purchasedImages[index].isPurchased = 1;
                }
                this.imageCollectionalert('Success!', data.message, 'success');
                this.downloadingImage = false;
                break;
              case 204:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 400:
                // swal('Error!', data.message, 'error')
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
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
                      // _that.router.navigateByUrl('/subscriptions');
                    }
                  }
                );
                this.downloadingImage = false;
                break;
              case 403:
                // swal('Error!', data.message, 'error');
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 404:
                // swal('Error!', data.message, 'error');
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 500:
                // swal('Error!', data.message, 'error');
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              default:
                // swal('Error!', "An unknown error occure, please try after some time !", 'error');
                this.imageCollectionalert(
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
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  encodeToURL(str) {
    return encodeURIComponent(str);
  }
  previewLoaded(index) {
    $('body')
      .find('#remove-ele-' + index)
      .remove();
    this.isPreviewLoaded[index] = true;
    setTimeout(function() {
      this.zoomImage('xzoom-' + index, true);
    }, 10);
  }

  downloadThisModel(index, ext) {
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = this.filterImages[index];
    let ratio = this.filterImages[index].ratio;
    let price_credits = this.filterImages[index].price_credits;
    if (
      parseInt(price_credits) > parseInt(remainingCredits) &&
      !this.filterImages[index].isPurchased
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
      // swal('Info !','You need to login to download image.','info');
      this.imageCollectionalert('Info !', 'You need to login to download model.', 'info');
    }
    this.downloadingImage = true;
    let modelName = this.filterImages[index].model_name;
    var modelId = this.filterImages[index].model_id;
    this.downloadReq = this.commonServ
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
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = modelData;
    let price_credits = modelData.price_credits;
    if ($image.isPurchased == 1) {
      this.imageCollectionalert('Error !', 'You have already purchased this model', 'error');
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
    if (this.userData.is_download == '0') {
      this.userData.is_download = 0;
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
          _that.userData.is_download = hideConfirm ? 0 : 1;
          _that.onlyPurchaseModel($image, _that.winServ.getLocalItem('token'), hideConfirm, ext);
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }

  onlyPurchaseModel(imageDetails, token, hideConfirm, ext) {
    let index = this.filterImages.findIndex(d => d.model_id == imageDetails.model_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
      this.filterImages[index].image_thumbnail_main =
        this.ServerImgPath + this.filterImages[index].image_thumbnail;
      // this.Images[index].image_thumbnail_main = this.ServerImgPath + this.Images[index].image_thumbnail;
    }
    this.purchaseImageReq = this.modelService
      .purchaseModelByCredits(imageDetails.model_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (index > -1) {
                  this.filterImages[index].isPurchased = 1;
                  this.getMainModel(index);

                  // after successfull purchase download the image
                  this.downloadingImage = true;
                  let modelName = this.filterImages[index].model_name;
                  var modelId = this.filterImages[index].model_id;
                  this.downloadReq = this.commonServ
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
                this.updateService.updatingUserData('yes');
                // this.$header.updateUserData();
                this.imageCollectionalert('Success !', data.message, 'success');
                this.downloadingImage = false;
                break;
              case 204:
                this.imageCollectionalert('Error !', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 400:
                this.imageCollectionalert('Error !', data.message, 'error');
                this.downloadingImage = false;
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
                this.downloadingImage = false;
                break;
              case 403:
                this.imageCollectionalert('Error !', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 404:
                this.imageCollectionalert('Error !', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 500:
                this.imageCollectionalert('Error !', data.message, 'error');
                this.downloadingImage = false;
                break;
              default:
                this.imageCollectionalert(
                  'Error !',
                  'An unknown error occure, please try after some time !',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          swal('Error !', 'An unknown error occure, please try after some time !', 'error');
          this.imageCollectionalert(
            'Error !',
            'An unknown error occure, please try after some time !',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }

  getMainModel(index: number) {
    const md = this.filterImages[index];
    if (md) {
      let token = this.token ? this.token : '';
      this.modelService.getMainModelImg(token, md.model_id).subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              if (data.data && data.data.url) {
                this.filterImages[index].image_thumbnail_main = this.trustAsURL(data.data.url);
                this.filterImages[index].image_preview_zoom = data.data.image_preview_zoom;
                this.filterImages[index].ratio = data.data.ratio;
              }
              break;
            default:
              break;
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.purchaseHistoryReq) {
      this.purchaseHistoryReq.unsubscribe();
    }
    if (this.imgPurchaseHistoryReq) {
      this.imgPurchaseHistoryReq.unsubscribe();
    }
    if (this.downloadReq) {
      this.downloadReq.unsubscribe();
    }
    if (this.purchaseImageReq) {
      this.purchaseImageReq.unsubscribe();
    }
    if (this.routerEvent) {
      this.routerEvent.unsubscribe();
    }
    if (this.queryParamEvent) {
      this.queryParamEvent.unsubscribe();
    }
  }
}
