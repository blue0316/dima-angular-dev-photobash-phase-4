import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
  NgZone,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ISubscription } from 'rxjs/Subscription';
import { AppSettings } from './../../app.setting';
import { CommonSevice } from './../../services/common.service';
import { HeaderSevice } from './../../services/header.service';
import { WindowSevice } from './../../services/window.service';
import swal from 'sweetalert2';
import { ModelService } from '../../services/model.service';
import { UpdateService } from '../../services/update.service';
declare const $: any;
declare const addAutoComplete: any;
@Component({
  selector: 'app-models-grid',
  templateUrl: './models-grid.component.html',
  styleUrls: ['./models-grid.component.css'],
  providers: [ModelService, CommonSevice, WindowSevice, HeaderSevice]
})
export class ModelsGridComponent implements OnInit, OnDestroy {
  @Input('modelList') modelList: any[];
  @Input('isLoading') isLoading: boolean;
  @Input('isLoaded') isLoaded: boolean;
  @Input('isUserLoggedIn') isUserLoggedIn: boolean;
  @Input('showFilterToggle') showFilterToggle: boolean;

  isLoggedIn: boolean;
  threeDImgLoading: boolean;
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  SiteUrl = AppSettings.SITE_ENDPOINT;
  // Images = [];
  // tslint:disable-next-line: no-inferrable-types
  isDataLoaded: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  dataLoading: boolean = false;
  // tslint:disable-next-line: no-inferrable-types
  offset: number = 0;
  dataLimit: number = AppSettings.IMG_PER_PAGE;
  totalModelsToShow: number = AppSettings.TOTAL_MODELS_TO_SHOW;
  // tslint:disable-next-line: no-inferrable-types
  catId: number = 0;
  isMoreDataAvail: boolean;
  urlToSend: any;
  filters: Array<any> = [];
  filteredArray: Array<any> = [];
  categories: Array<any> = [];
  tags: Array<any> = [];
  resolution: Array<any> = [];
  catName: string;
  // tslint:disable-next-line: no-inferrable-types
  resolId: number = 0;
  // tslint:disable-next-line: no-inferrable-types
  resolName: string = '';
  // tslint:disable-next-line: no-inferrable-types
  searchKeyword: string = '';
  // tslint:disable-next-line: no-inferrable-types
  sortyBy: number = 2;
  allParams: any;
  // tslint:disable-next-line: no-inferrable-types
  showSearchBox: boolean = false;
  // modelWidthToDownload: number = 0;
  // modelHeightToDownload: number = 0;
  widthError = false;
  selectedSize: any = [];
  downloadingImage = false;
  token = '';
  collections: Array<any> = [];
  addBtnDis = false;
  isAddError = false;
  AddError = '';
  isAddSuccess = false;
  AddSuccess = '';
  newColName = '';
  isShowMain = false;
  Errors: {
    name: '';
    addname: '';
  };
  selImage = '';
  suggestedTags: any = [];
  successMessage = '';
  section_order = 0;
  infoMessage = '';
  warningMessage = '';
  errorMessage = '';
  downloadUrl = '';
  planFacilities: any = {};
  planfacilitiesToolTip: any = {};
  allPacks: any = [];
  packName: string = null;
  packId = 0;
  collectionCoundReq: ISubscription;
  getFilterItemReq: ISubscription;
  getModelReq: ISubscription;
  getMoreModelReq: ISubscription;
  downloadReq: ISubscription;
  addCollectionReq: ISubscription;
  purchaseImageReq: ISubscription;
  addToSearchHistoryReq: ISubscription;
  fetchTagReq: ISubscription;
  showFilterActiveClass: any = [];
  userData: any = {};
  isFilterApplied = false;
  numberOfPurchasedPacks = 0;
  isPreviewLoaded: Array<boolean> = [];
  isPreviousCallComplete = false;
  isThumbnailLoaded: Array<string> = [];
  selectedFilters: Array<any> = [];
  pageParams: any;

  allToCollId: Array<any> = [];
  modelIdsToAdd: Array<number> = [];
  downloadImageName: string = null;

  // routerEvent;
  queryParamEvent;
  clickedOn: string = null;
  lastCollectionId: string = null;
  // @ViewChild(HeaderComponent) $header: HeaderComponent;
  @HostListener('document:keyup', ['$event'])
  onEvent($event: any) {
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
      this.isDataLoaded &&
      this.isPreviousCallComplete &&
      this.modelList.length <= this.totalModelsToShow - this.dataLimit &&
      currentPosition >= eleHeight - (footerHeight + 1800)
    ) {
      this.isPreviousCallComplete = false;
      setTimeout(() => {
        this.loadMoreData();
      }, 500);
    }
  }

  constructor(
    private modelService: ModelService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private comServ: CommonSevice,
    private winServ: WindowSevice,
    private headerServ: HeaderSevice,
    private eleRef: ElementRef,
    private zone: NgZone,
    private changeRef: ChangeDetectorRef,
    private updateService: UpdateService,
    private commonSevice: CommonSevice
  ) {
    this.titleService.setTitle('Models');
    this.queryParamEvent = this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.pageParams = params;
      this.allParams = params;
      let catSlug = params['subcat']
        ? params['subcat']
        : params['category']
        ? params['category']
        : '';
      catSlug = catSlug.split('-');

      this.catId = catSlug[catSlug.length - 1] ? catSlug[catSlug.length - 1] : 0;
      let count = 0;
      let count1 = 0;
      if (this.catId) {
        count++;
      }
      let tempUrl = '';
      let filters = [];
      this.selectedFilters = [];
      for (let p in params) {
        if (p != 'subcat' && p != 'category') {
          tempUrl +=
            (count1 > 0 && count > 0) || (count1 == 0 && count > 0)
              ? '&' + p + '=' + params[p]
              : count1 == 0
              ? '?' + p + '=' + encodeURIComponent(params[p])
              : '&' + p + '=' + encodeURIComponent(params[p]);
          count++;
          if (p != 'resol' && p != 'sort' && p != 'search') {
            filters.push({ name: p, value: params[p] });
            this.isFilterApplied = true;
          }
        }
      }
      this.urlToSend = tempUrl ? tempUrl.substr(1) : '';
      this.offset = 0;
      this.isDataLoaded = false;
      this.getCategories();
    });
  }

  getBoxCoverImage = (img: string) => {
    try {
      // const images = JSON.parse(this.modelList.images);
      // return images[2] ? images[2] : '/assets/front/img/no-image.jpg';
      if (img) {
        return img;
      } else {
        return '/assets/front/img/no-image.jpg';
      }
    } catch (error) {
      return 'no-image.jpg';
    }
  };

  getCategories() {
    let catId = 0;
    var catSlugT = null;
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.pageParams = params;
      let catSlug = params['subcat']
        ? params['subcat']
        : params['category']
        ? params['category']
        : '';
      catSlugT = catSlug;
      catSlug = catSlug.split('-');
      catId = catSlug[catSlug.length - 1] ? catSlug[catSlug.length - 1] : 0;
      this.catId = catId;
      if (!catId) {
        this.packId = params['pack'] ? params['pack'] : 0;
      }
      this.resolId = params['resol'] ? params['resol'] : 0;
      this.searchKeyword = params['search'] ? decodeURIComponent(params['search']) : '';
      this.sortyBy = params['sort'] ? params['sort'] : 2;
    });
    this.selectedFilters = [];
    this.getFilterItemReq = this.headerServ
      .getFilterItemForModels(this.winServ.getLocalItem('token'))
      .subscribe(data => {
        if (data.status == 200) {
          this.numberOfPurchasedPacks = 0;
          this.categories = data.data.category ? data.data.category : [];
          this.filters = data.data.filter ? data.data.filter : [];
          this.tags = data.data.tags ? data.data.tags : [];
          this.resolution = data.data.resolution ? data.data.resolution : [];
          this.allPacks =
            this.filters &&
            this.filters[this.filters.length - 1] &&
            this.filters[this.filters.length - 1].data
              ? this.filters[this.filters.length - 1].data
              : [];
          for (let i = 0; i < this.allPacks.length; i++) {
            const e = this.allPacks[i];
            if (e.isPurchased && e.isPurchased == 1) {
              this.numberOfPurchasedPacks++;
            }
          }
          this.setSelectedCategory(catId);
          this.selectedFilters = [];
          if (catId) {
            this.selectedFilters.push({
              name: this.catName,
              param: 'category',
              type: 1,
              id: catSlugT
            });
          }
          if (this.filters && this.filters.length > 0) {
            for (let i = 0; i < this.filters.length; i++) {
              const e = this.filters[i];
              if (e.data) {
                for (let j = 0; j < e.data.length; j++) {
                  const el = e.data[j];
                  if (
                    this.allParams[e.reqParam] &&
                    this.allParams[e.reqParam].split(',').indexOf(el.id) > -1
                  ) {
                    let type = 2; // for camera angle
                    if (e.reqParam == 'mlight') {
                      type = 4; // for mood ligth
                    } else if (e.reqParam == 'loc') {
                      type = 5; // for location
                    } else if (e.reqParam == 'pack') {
                      type = 6; // for pack
                    }
                    this.selectedFilters.push({
                      name: el.name,
                      type: type,
                      param: e.reqParam,
                      id: el.id
                    });
                  }
                }
              }
            }
          }
          this.setSelectedResolution(this.resolId);
          if (this.resolId) {
            this.selectedFilters.push({
              name: this.resolName.split('(')[0],
              param: 'resol',
              type: 3,
              id: this.resolId
            });
          }
        } else {
          this.categories = [];
          this.filters = [];
          this.tags = [];
          this.resolution = [];
          this.selectedFilters = [];
        }
        this.initializeTags();
      });
  }

  setSelectedCategory(catId) {
    if (catId != 0) {
      this.catName = null;
      for (let i in this.categories) {
        if (!this.catName) {
          if (this.categories[i].id == catId) {
            this.catName = this.categories[i].category_name;
          }
          if (this.categories[i].subCategory.length > 0 && !this.catName) {
            for (let j in this.categories[i].subCategory) {
              if (this.categories[i].subCategory[j].id == catId) {
                this.catName = this.categories[i].subCategory[j].category_name;
              }
            }
          }
        } else {
          break;
        }
      }
    }
  }

  setSelectedResolution(resolId) {
    if (resolId != 0) {
      for (let i in this.resolution) {
        if (!this.resolName) {
          if (this.resolution[i].id == resolId) {
            this.resolName = this.resolution[i].name;
          }
        } else {
          break;
        }
      }
    }
  }

  /*Initialize tags*/
  initializeTags() {
    setTimeout(function() {
      this.InitializeTagFilter();
    }, 0);
  }

  parseInt(name) {
    return parseInt(name);
  }

  trustAsURL(url: string) {
    return this.comServ.trustAsDataURI(url);
  }

  thumnailLoaded(index) {
    this.isThumbnailLoaded[index] = '1';
  }

  previewLoaded(index) {
    // $('body').find('#remove-ele-' + index).remove();
    this.isPreviewLoaded[index] = true;
    setTimeout(function() {
      this.zoomImage('xzoom-' + index, true);
    }, 10);
  }

  zoomImage(id, event) {
    setTimeout(function() {
      this.zoomThisImage(id, event);
    }, 0);
  }

  checkLogin() {
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      this.token = this.winServ.getLocalItem('token');
      if (this.token) {
        this.isUserLoggedIn = true;
      } else {
        this.isUserLoggedIn = false;
      }
      if (this.collectionCoundReq) {
        this.collectionCoundReq.unsubscribe();
      }
      this.collectionsCount();
      if (this.getFilterItemReq) {
        this.getFilterItemReq.unsubscribe();
      }
      this.getCategories();
    }
    if (this.isUserLoggedIn) {
      let user = JSON.parse(this.winServ.getLocalItem('userData'));
      this.userData = user;
      if (user) {
        let planDetails = user.user_plan_details;
        if (planDetails && planDetails.facilities) {
          this.planFacilities = planDetails.facilities;
        }
        if (planDetails && planDetails.facilitiesToolTip) {
          this.planfacilitiesToolTip = planDetails.facilitiesToolTip;
        }
      }
    }
    this.offset = 0;
    if (this.getModelReq) {
      this.getModelReq.unsubscribe();
    }
    this.loadModels();
  }

  collectionsCount() {
    this.collectionCoundReq = this.modelService.collectionsCount(this.token).subscribe(data => {
      if (data.status == 200) {
        if (data.data.length > 0) {
          this.collections = data.data;
          for (let i = 0; i < this.collections.length; ++i) {
            if (this.collections[i].images) {
              this.collections[i].images = JSON.parse(this.collections[i].images);
            } else {
              this.collections[i].images = [];
            }
          }
        }
      }
    });
  }

  // Load models to show list on page
  loadModels() {
    if (this.getModelReq) {
      this.getModelReq.unsubscribe();
    }
    this.modelIdsToAdd = [];
    this.getModelReq = this.modelService
      .getModels(
        this.offset,
        this.dataLimit,
        this.catId,
        this.urlToSend,
        this.winServ.getLocalItem('token')
      )
      .subscribe(data => {
        this.isDataLoaded = true;
        if (data.status == 200) {
          let tempData = data.data;
          for (let i in tempData) {
            if (tempData[i].slug) {
              tempData[i].slug = this.comServ.createSlugFromString(tempData[i].image_name);
            }
          }
          this.modelList = data.data;
          this.offset = this.offset + data.data.length;
          this.isMoreDataAvail = data.data.length >= this.dataLimit ? true : false;
          this.isPreviousCallComplete = true;
          let _that = this;
          setTimeout(function() {
            this.InitializeGoogleGallary();
            _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
              // ele.addEventListener('click', _that.onModelView.bind(_that));
            });
          }, 500);
        } else if (data.status == 404) {
          this.modelList = [];
          this.offset = 0;
          this.isMoreDataAvail = false;
        }
        this.isDataLoaded = true;
        this.dataLoading = false;
        this.zone.run(() => {
          if (!this.changeRef['destroyed']) {
            this.changeRef.detectChanges();
          }
        });
        this.modelIdsToAdd = [];
        this.allToCollId = [];
      });
  }

  loadMoreData() {
    this.isPreviousCallComplete = false;
    this.isDataLoaded = true;
    if (this.isMoreDataAvail) {
      this.dataLoading = true;
      if (this.getMoreModelReq) {
        this.getMoreModelReq.unsubscribe();
      }
      var imageIds = [];
      for (let index = 0; index < this.modelList.length; index++) {
        const ele = this.modelList[index];
        imageIds.push(ele.model_id);
      }
      this.getMoreModelReq = this.modelService
        .getModels(
          this.offset,
          this.dataLimit,
          this.catId,
          this.urlToSend,
          this.winServ.getLocalItem('token'),
          imageIds
        )
        .subscribe(data => {
          this.dataLoading = false;
          if (data.status == 200) {
            let tempData = data.data;
            for (let i in tempData) {
              if (tempData[i]) {
                if (tempData[i].slug) {
                  tempData[i].slug = this.comServ.createSlugFromString(tempData[i].image_name);
                }
                this.modelList.push(tempData[i]);
              }
            }
            let len = this.offset;
            let _that = this;
            setTimeout(function() {
              this.InitializeGoogleGallary();
              let i = 1;
              _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                console.log(ele);
                if (i > len) {
                  // ele.addEventListener('click', _that.onModelView.bind(_that), false);
                }
                i++;
              });
            }, 500);
            this.offset = this.offset + data.data.length;
            this.isMoreDataAvail = data.data.length >= this.dataLimit ? true : false;
            this.isPreviousCallComplete = true;
          } else if (data.status == 404) {
            this.isMoreDataAvail = false;
          }
          this.zone.run(() => {
            if (!this.changeRef['destroyed']) {
              this.changeRef.detectChanges();
            }
          });
        });
    } else {
      this.isDataLoaded = true;
      this.dataLoading = false;
      this.zone.run(() => {
        if (!this.changeRef['destroyed']) {
          this.changeRef.detectChanges();
        }
      });
    }
  }

  onModelView(event) {
    this.threeDImgLoading = true;
    let model_id = null;
    let index = -1;
    if (event.target) {
      model_id = $(event.target).attr('data-id');
      index = parseInt($(event.target).attr('data-index'));
      if (!this.modelList[index]) {
        this.modelList[index] = {};
      }
      this.modelList[index].sformat = this.modelList[index].format
        ? this.modelList[index].format.match(/[^ ,]+/g).join(', ')
        : null; // to create gap in format
      setTimeout(() => {
        if (
          $(event.target)
            .parent()
            .hasClass('disabled-view')
        ) {
          this.updateModelForCollection(model_id);
          return;
        }
        if (model_id) {
          this.imageViewedByUser(model_id);
          const md = this.modelList[index];
          if (md) {
            let token = this.token ? this.token : '';
            this.modelService.getMainModelImg(token, md.model_id).subscribe(data => {
              if (data.status) {
                switch (data.status) {
                  case 200:
                    if (data.data) {
                      this.modelList[index].image_thumbnail_main = this.trustAsURL(data.data.url);
                      this.modelList[index].available_types = data.data.available_types
                        ? data.data.available_types
                        : [];
                      this.modelList[index].ratio = data.data.ratio;
                      this.modelList[index].preview = [];
                      let tempPreview = data.data.preview ? JSON.parse(data.data.preview) : [];
                      if (tempPreview.length > 0) {
                        for (let i = 0; i < tempPreview.length; i++) {
                          const preViewURL = tempPreview[i];
                          let newPreView = this.ServerImgPath + preViewURL;
                          this.modelList[index].preview.push(newPreView);
                        }
                      }
                      if (
                        this.modelList[index].preview &&
                        this.modelList[index].preview.length > 0
                      ) {
                        this.threeDImgLoading = false;
                        $('#' + `remove-ele-${index}`).spritespin({
                          source: this.modelList[index].preview,
                          width: 550, // width of image
                          height: 550 / data.data.ratio, // heignt of image
                          sense: -1, // touch sesivity
                          senseLane: -1,
                          animate: true, // auto rotate or manual
                          loop: true, // whether to loop animation
                          frameTime: 100 // animation speed
                        });
                      } else {
                        this.threeDImgLoading = false;
                      }
                    } else {
                      // no url and no preview image
                      this.threeDImgLoading = false;
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

  imageViewedByUser(imageId) {
    let token = this.winServ.getLocalItem('token');
    if (token && imageId) {
      imageId = typeof imageId == 'number' ? imageId : parseInt(imageId);
      this.addToSearchHistoryReq = this.modelService
        .addToSearchHistory(token, imageId)
        .subscribe(data => {});
    }
  }

  encodeToURL(str) {
    return encodeURIComponent(str);
  }

  searchModels() {
    let temp = this.router.url.split('?');
    let urlToRedirect = '/models';
    let count = 0;
    if (temp[1]) {
      let tempD = temp[1].split('&');
      for (let c in tempD) {
        if (tempD[c].indexOf('search') == -1) {
          urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
          count++;
        }
      }
    }

    urlToRedirect +=
      count == 0 && this.searchKeyword
        ? '?search=' + encodeURIComponent(this.searchKeyword)
        : '&search=' + encodeURIComponent(this.searchKeyword);
    this.suggestedTags = [];
    setTimeout(function() {
      this.closeDetails();
    }, 0);
    location.href = urlToRedirect;
    // this.router.navigateByUrl(urlToRedirect);
  }

  onSearchValueChange(event) {
    let v = $('#suggestion-tags').val();
    this.searchKeyword = v.toString();
  }

  removeFilterByClickingCross(filter) {
    var p = this.pageParams;
    var parValue = p[filter.param];
    if (parValue) {
      var paramArray = parValue.split(',');
      var pObject = JSON.parse(JSON.stringify(p));
      delete pObject[filter.param];
      if (filter.param == 'category') {
        delete pObject['category'];
        if (pObject['subcat']) {
          delete pObject['subcat'];
        }
      }
      var paramsToSend = pObject;
      for (let i = 0; i < paramArray.length; i++) {
        const e = paramArray[i];
        if (e != filter.id) {
          if (!paramsToSend[filter.param]) {
            paramsToSend[filter.param] = '';
          } else {
            paramsToSend[filter.param] += ',';
          }
          paramsToSend[filter.param] += e;
        }
      }
      this.isFilterApplied = false;
      for (let i = 0; i < this.filters.length; i++) {
        const e = this.filters[i];
        if (paramsToSend.hasOwnProperty(e.reqParam)) {
          this.isFilterApplied = true;
        }
      }
      if (!this.isFilterApplied) {
        this.filteredArray = [];
      }
      if (filter.param == 'category') {
        delete paramsToSend[filter.param];
      }
      this.router.navigate(['/models'], { queryParams: paramsToSend });
    }
  }

  onlyPurchaseThisModel(modelData, ext?: string, showInfo?: boolean) {
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = modelData;
    let price_credits = modelData.price_credits;
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
      this.onlyPurchaseModel($image, this.winServ.getLocalItem('token'), 1, ext, showInfo);
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
          _that.onlyPurchaseModel(
            $image,
            _that.winServ.getLocalItem('token'),
            hideConfirm,
            ext,
            showInfo
          );
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }

  onlyPurchaseModel(imageDetails, token, hideConfirm, ext, showInfo?: boolean) {
    let index = this.modelList.findIndex(d => d.model_id == imageDetails.model_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
      this.modelList[index].image_thumbnail_main =
        this.ServerImgPath + this.modelList[index].image_thumbnail;
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
                  this.modelList[index].isPurchased = 1;

                  if (ext) {
                    // after successfull purchase download the image
                    this.downloadingImage = true;
                    let modelName = this.modelList[index].model_name;
                    var modelId = this.modelList[index].model_id;
                    this.downloadReq = this.commonSevice
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
                                    // this.downloadingImage = false;
                                    // $('#' + `remove-ele-${index}`).spritespin({
                                    //   source: this.modelList[index].preview,
                                    //   width: 550, // width of image
                                    //   height: 550 / data.data.ratio, // heignt of image
                                    //   sense: -1, // touch sesivity
                                    //   senseLane: -1,
                                    //   animate: true, // auto rotate or manual
                                    //   loop: true, // whether to loop animation
                                    //   frameTime: 100 // animation speed
                                    // });
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
                  } else {
                    // setTimeout(() => {
                    //   $('#' + `remove-ele-${index}`).spritespin({
                    //     source: this.modelList[index].preview,
                    //     width: 550, // width of image
                    //     height: 550 / data.data.ratio, // heignt of image
                    //     sense: -1, // touch sesivity
                    //     senseLane: -1,
                    //     animate: true, // auto rotate or manual
                    //     loop: true, // whether to loop animation
                    //     frameTime: 100 // animation speed
                    //   });
                    // }, 100);
                  }
                }
                this.updateService.updatingUserData('yes');
                // this.$header.updateUserData();
                if (showInfo) {
                  this.imageCollectionalert('Success!', data.message, 'success');
                }
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
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }

  getMainImage(index: number) {
    const md = this.modelList[index];
    if (md) {
      let token = this.token ? this.token : '';
      this.modelService.getMainModelImg(token, md.model_id).subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              if (data.data && data.data.url) {
                this.modelList[index].image_thumbnail_main = this.trustAsURL(data.data.url);
                this.modelList[index].image_preview_zoom = data.data.image_preview_zoom;
                this.modelList[index].ratio = data.data.ratio;
              }
              break;
            default:
              break;
          }
        }
      });
    }
  }

  updateModelForCollection(modelId) {
    if (modelId) {
      var ind = this.modelIdsToAdd.indexOf(modelId);
      if (ind == -1) {
        this.allToCollId[modelId] = true;
        this.modelIdsToAdd.push(modelId);
      } else {
        this.allToCollId[modelId] = false;
        this.modelIdsToAdd.splice(ind, 1);
      }
    }
  }

  removeZoom(id) {
    setTimeout(function() {
      this.removeZoomFromImage(id);
    }, 0);
  }

  downloadPreview(index: number) {
    let $d = this.modelList[index];
    if ($d) {
      /* this.comServ.urlToDataURI(this.ServerImgPath+$d.image_thumbnail_main).subscribe(res=>{
        console.log(res);
        
      }); */
      this.downloadUrl = $d.model_thumbnail_main;
      var ext = null;
      if (this.downloadUrl && this.downloadUrl['changingThisBreaksApplicationSecurity']) {
        var urlSpl = this.downloadUrl['changingThisBreaksApplicationSecurity'].split(',');
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
        this.downloadImageName = $d.model_name + ' Preview.' + ext;
        let img = $('body .downloadImg');
        if (img && img[0]) {
          setTimeout(() => {
            img[0].click();
            this.updateService.updatingUserData('yes');
            // this.$header.updateUserData();
            this.downloadingImage = false;
          }, 1000);
        }
      }
    }
  }

  uncheckAllModels() {
    this.modelIdsToAdd = [];
    this.allToCollId = [];
  }

  clearAllFilter() {
    this.isFilterApplied = false;
    this.selectedFilters = [];
    this.router.navigate(['/models']);
  }

  selectModel(model_id) {
    let index = this.modelIdsToAdd.indexOf(model_id);
    if (index == -1) {
      this.modelIdsToAdd.push(model_id);
      this.allToCollId[model_id] = true;
      setTimeout(function() {
        this.imageCollectionHeadFixed();
        this.closeDetails();
      }, 0);
    }
  }

  addnameCol(newColName, isNew, form) {
    this.addBtnDis = true;
    this.isAddError = false;
    this.AddError = '';
    this.isAddSuccess = false;
    this.AddSuccess = '';
    let data = {
      token: this.token,
      img_id: this.modelIdsToAdd,
      name: newColName,
      type: '1'
    };
    this.addCollectionReq = this.modelService.addnameCol(data).subscribe(data => {
      if (data.status == 200) {
        newColName = ' ';
        if (isNew) {
          setTimeout(() => {
            form.resetForm();
            this.isAddSuccess = false;
            this.AddSuccess = '';
            $('body')
              .find('#collection-add')
              .find('.close:first')
              .click();
            this.imageCollectionalert('Added!', data.message, 'success', undefined, 7000, () => {
              console.log('Callback called for sw2 in else');
              this.lastCollectionId = null;
            });
            $('body').removeAttr('style');
          }, 500);
        } else {
          this.successMessage = data.message;
          this.imageCollectionalert('Added!', data.message, 'success', undefined, 7000, () => {
            console.log('Callback called for sw2 in else');
            this.lastCollectionId = null;
          });
        }
        this.lastCollectionId = data.data.id;
        this.modelIdsToAdd = [];
        this.allToCollId = [];
        this.collectionsCount();
        // this.toastServ.showNotification(data.message);

        // swal('Added!', data.message, 'success');
        $('#btnCloseAdd').click();
      } else {
        if (data.errors) {
          this.errorMessage = data.errors.name;
        } else {
          this.errorMessage = data.message;
        }
        if (this.errorMessage) {
          this.imageCollectionalert('Error!', this.errorMessage, 'error');
        }
      }
      setTimeout(() => {
        this.successMessage = '';
        this.infoMessage = '';
        this.warningMessage = '';
        this.errorMessage = '';
      }, 5000);
      this.addBtnDis = false;
    });
  }

  // widthUpdated(ratio) {
  //   this.widthError = false;
  //   let res = /^[0-9]+$/.test(this.modelWidthToDownload.toString());
  //   if (!res) {
  //     this.widthError = true;
  //     let imgWidth = parseInt(this.modelWidthToDownload.toString());
  //     this.modelWidthToDownload = imgWidth ? imgWidth : 0;
  //   }
  //   this.modelHeightToDownload = Math.round(this.modelWidthToDownload * ratio);
  // }

  imageCollectionalert(title, messageHTML, type, position = null, timer = 5000, cb = null) {
    return this.comServ.notify(title, messageHTML, type, position, timer, cb);
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
      confirmButtonClass: 'btn btn-theme-white',
      cancelButtonClass: 'btn btn-cancle',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      animation: false
    });
  }

  downloadThisModel(index, ext) {
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = this.modelList[index];
    let ratio = this.modelList[index].ratio;
    let price_credits = this.modelList[index].price_credits;
    if (
      parseInt(price_credits) > parseInt(remainingCredits) &&
      !this.modelList[index].isPurchased
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
      this.imageCollectionalert('Info!', 'You need to login to download model.', 'info');
    }
    this.downloadingImage = true;
    let modelName = this.modelList[index].model_name;
    var modelId = this.modelList[index].model_id;
    this.downloadReq = this.commonSevice
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

  ngOnInit() {
    /**
     *
     */
    $('body').on('click', '.swal2-container', e => {
      if (this.lastCollectionId) {
        swal.close();
        this.router.navigate(['/collections'], {
          queryParams: {
            collection: this.lastCollectionId
          }
        });
      }
    });
    /**
     *
     */
    this.isFilterApplied = false;
    this.modelIdsToAdd = [];
    this.checkLogin();
    let _that = this;
    addAutoComplete(4, search => {
      this.searchKeyword = search;
      this.searchModels();
    });
    $('body').on('click', '#trigger-img-search', function() {
      setTimeout(function() {
        _that.searchKeyword = $('#trigger-img-search').attr('data-keyword');
        _that.searchModels();
      }, 110);
    });

    this.updateService.showModalView.subscribe(val => {
      if (val === 'yes') {
        for (let p in this.allParams) {
          if (p) {
            this.onModelView(event);
          }
        }
      }
    });
  }
  ngOnDestroy() {
    $('body').off('click', '.swal2-container', e => {});
    if (this.collectionCoundReq) {
      this.collectionCoundReq.unsubscribe();
    }
    if (this.getFilterItemReq) {
      this.getFilterItemReq.unsubscribe();
    }
    if (this.getModelReq) {
      this.getModelReq.unsubscribe();
    }
    if (this.getMoreModelReq) {
      this.getMoreModelReq.unsubscribe();
    }
    if (this.downloadReq) {
      this.downloadReq.unsubscribe();
    }
    if (this.addCollectionReq) {
      this.addCollectionReq.unsubscribe();
    }
    if (this.purchaseImageReq) {
      this.purchaseImageReq.unsubscribe();
    }
    // this.routerEvent.unsubscribe();
    if (this.queryParamEvent) {
      this.queryParamEvent.unsubscribe();
    }
  }
}
