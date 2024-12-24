import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ISubscription } from 'rxjs/Subscription';
import { AppSettings } from './../../app.setting';
import { ImageService } from './../../services/image.service';
import { CommonSevice } from './../../services/common.service';
import { HeaderSevice } from './../../services/header.service';
import { HeaderComponent } from './../../components/header/header.component';
import { WindowSevice } from './../../services/window.service';
import * as $ from 'jquery';

import swal from 'sweetalert2';
declare const addAutoComplete: any;
@Component({
  selector: 'app-mages-page',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css'],
  providers: [ImageService, CommonSevice, WindowSevice, HeaderSevice]
})
export class ImagesComponent implements OnInit, OnDestroy {
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  SiteUrl = AppSettings.SITE_ENDPOINT;
  Images = [];
  isDataLoaded: boolean;
  toggleIndex: -1;
  dataLoading: boolean;
  offset: number;
  dataLimit: number = AppSettings.IMG_PER_PAGE;
  totalImagesToShow: number = AppSettings.TOTAL_IMAGES_TO_SHOW;
  catId: number;
  isMoreDataAvail: boolean;
  urlToSend: any;
  filters: Array<any> = [];
  filteredArray: Array<any> = [];
  categories: Array<any> = [];
  tags: Array<any> = [];
  resolution: Array<any> = [];
  catName: string;
  resolId: number;
  resolName: string;
  searchKeyword: string;
  sortyBy: number;
  allParams: any;
  showSearchBox: boolean;
  imageWidthToDownload: number;
  imageHeightToDownload: number;
  isUserLoggedIn: boolean;
  widthError: boolean;
  selectedSize: any = [];
  downloadingImage: boolean;
  token: string;
  collections: Array<any> = [];
  addBtnDis: boolean;
  isAddError: boolean;
  AddError: string;
  isAddSuccess: boolean;
  AddSuccess: string;
  newColName: string;
  isShowMain: boolean;
  Errors: {
    name: '';
    addname: '';
  };
  selImage: string;
  suggestedTags: any = [];
  // suggestedTagsTemp: CompleterData;

  successMessage: string;
  section_order: number;
  infoMessage: string;
  warningMessage: string;
  errorMessage: string;
  downloadUrl: string;
  planFacilities: any = {};
  planfacilitiesToolTip: any = {};
  allPacks: any = [];
  packName: string = null;
  packId: any;
  collectionCoundReq: ISubscription;
  getFilterItemReq: ISubscription;
  getImageReq: ISubscription;
  getMoreImageReq: ISubscription;
  downloadReq: ISubscription;
  addCollectionReq: ISubscription;
  purchaseImageReq: ISubscription;
  addToSearchHistoryReq: ISubscription;
  fetchTagReq: ISubscription;
  showFilterActiveClass: any = [];
  userData: any = {};
  isFilterApplied: boolean;
  numberOfPurchasedPacks: number;
  isPreviewLoaded: Array<boolean> = [];
  isPreviousCallComplete: boolean;
  isThumbnailLoaded: Array<string> = [];
  selectedFilters: Array<any> = [];
  pageParams: any;

  allToCollId: Array<any> = [];
  imageIdsToAdd: Array<number> = [];
  downloadImageName: string = null;

  routerEvent;
  queryParamEvent;
  clickedOn: string = null;
  lastCollectionId: string = null;
  showFilterToggle: boolean;
  totalItems: number;
  tempPacks = [];
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  @HostListener('document:keyup', ['$event'])
  onEvent($event: any) {
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
      this.isDataLoaded &&
      this.isPreviousCallComplete &&
      this.Images.length <= this.totalImagesToShow - 50 &&
      currentPosition >= eleHeight - (footerHeight + 1800)
    ) {
      this.isPreviousCallComplete = false;
      setTimeout(() => {
        this.loadMoreData();
      }, 500);
    }
  }
  constructor(
    private imageSer: ImageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private comServ: CommonSevice,
    private winServ: WindowSevice,
    private headerServ: HeaderSevice,
    private eleRef: ElementRef,
    private zone: NgZone,
    private changeRef: ChangeDetectorRef
  ) {
    this.titleService.setTitle('Images');
    this.numberOfPurchasedPacks = 0;
    this.packId = 0;
    this.section_order = 0;
    this.sortyBy = 2;
    this.queryParamEvent = this.activatedRoute.queryParams.subscribe((p: Params) => {
      let params = {};
      try {
        params = JSON.parse(JSON.stringify(p));
      } catch (error) {}
      this.searchKeyword = params['search'] ? params['search'] : '';
      this.sortyBy = params['sort'] ? params['sort'] : 1;
      this.isFilterApplied = false;
      this.tempPacks = params['pack'] ? params['pack'].split(',') : [];
      let user = JSON.parse(this.winServ.getLocalItem('userData'));
      this.userData = user;
      if (user) {
        let planDetails = user.user_plan_details;
        if (
          (!planDetails || !planDetails.facilities || !planDetails.facilities.viewAllPacks) &&
          params['pack']
        ) {
          delete params['pack'];
        }
      } else {
        if (params['pack']) {
          delete params['pack'];
        }
      }
      // this.resolId = params['resol'] ? params['resol'] : 0;
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
      // this.getCategories();
    });
  }
  /**
   *
   */
  onSearchInputChange = event => {
    this.searchKeyword = event.target.value;
  };
  /**
   *
   */
  clearSearchInput = () => {
    this.searchKeyword = '';
    $('#suggestion-tags')
      .val('')
      .focus();
  };
  ngOnInit() {
    if (localStorage.getItem('open')) {
      this.showFilterToggle = true;
    }
    this.totalItems = 0;
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
    this.imageIdsToAdd = [];
    this.routerEvent = this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.offset = 0;
        this.imageIdsToAdd = [];
        this.allToCollId = [];
        setTimeout(function() {
          this.closeSuggestionMenu();
        }, 0);
        // this.searchImages();
        this.loadImages();
        // this.getCategories();
      }
    });
    setTimeout(() => {
      addAutoComplete(2, search => {
        this.searchKeyword = search;
        this.zone.run(() => {
          if (!this.changeRef['destroyed']) {
            this.changeRef.detectChanges();
          }
        });
        setTimeout(() => {
          this.searchImages();
        }, 100);
      });
    }, 0);
  }
  onImageView(event) {
    let img_id = null;
    let index = -1;
    if (event.target) {
      img_id = $(event.target).attr('data-id');
      index = parseInt($(event.target).attr('data-index'));
      this.Images[index].sformat = this.Images[index].format
        ? this.Images[index].format.match(/[^ ,]+/g).join(', ')
        : null; // to create gap in format
      setTimeout(() => {
        if (
          $(event.target)
            .parent()
            .hasClass('disabled-view')
        ) {
          this.updateImageForCollection(this.allToCollId[img_id], index);
          return;
        }
        if (img_id) {
          this.imageViewedByUser(img_id);
          const img = this.Images[index];
          if (
            img &&
            (!img.image_thumbnail_main || img.image_thumbnail_main == img.image_thumbnail)
          ) {
            let token = this.token ? this.token : '';
            this.comServ
              .get('webservices/getMainImage?img=' + img_id + '&token=' + token)
              .subscribe(data => {
                if (data.status) {
                  switch (data.status) {
                    case 200:
                      if (data.data && data.data.url) {
                        this.Images[index].image_thumbnail_main = this.trustAsURL(data.data.url);
                        this.Images[index].image_preview_zoom = data.data.image_preview_zoom;
                        this.Images[index].ratio = data.data.ratio;
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
    const img = this.Images[index];
    if (img) {
      let token = this.token ? this.token : '';
      this.comServ
        .get('webservices/getMainImage?img=' + img.image_id + '&token=' + token)
        .subscribe(data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (data.data && data.data.url) {
                  this.Images[index].image_thumbnail_main = this.trustAsURL(data.data.url);
                  this.Images[index].image_preview_zoom = data.data.image_preview_zoom;
                  this.Images[index].ratio = data.data.ratio;
                }
                break;
              default:
                break;
            }
          }
        });
    }
  }
  trustAsURL(url: string) {
    return this.comServ.trustAsDataURI(url);
  }
  thumnailLoaded(index) {
    this.isThumbnailLoaded[index] = '1';
  }
  collectionsCount() {
    this.collectionCoundReq = this.imageSer.collectionsCount(this.token).subscribe(data => {
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
  getCategories() {
    let catId = 0;
    var catSlugT = null;
    const testSubscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
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
    if (testSubscription) {
      testSubscription.unsubscribe();
    }
    this.selectedFilters = [];
    this.getFilterItemReq = this.headerServ
      .getFilterItemForImages(this.winServ.getLocalItem('token'))
      .subscribe(data => {
        const purchasedPacks = [];
        if (data.status == 200) {
          this.totalItems = data.data.totalImages;
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
              purchasedPacks.push(e);
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
        /*  */
        const packsPurchased = [];
        let planDetails = this.userData ? this.userData.user_plan_details : undefined;
        if (!planDetails || !planDetails.facilities || !planDetails.facilities.viewAllPacks) {
          purchasedPacks.forEach(element => {
            if (this.tempPacks.indexOf(element.id) > -1) {
              packsPurchased.push(element.id);
              this.selectedFilters.push({
                name: element.name,
                param: 'pack',
                type: 6,
                id: element
              });
            }
          });
          if (packsPurchased.length) {
            this.packId = packsPurchased.join(',');
            this.allParams['pack'] = packsPurchased.join(',');
            this.isFilterApplied = true;
            if (this.urlToSend) {
              this.urlToSend = `&pack=${this.packId}`;
            } else {
              this.urlToSend = `pack=${this.packId}`;
            }
          }
        }
        console.log(purchasedPacks, this.tempPacks);
        this.loadImages();
      });
  }
  /*Initialize tags*/
  initializeTags() {
    setTimeout(function() {
      this.InitializeTagFilter();
    }, 0);
  }
  /*
   */
  onCatFilterAdd = data => {
    this.catFilterAdded(data.catId, data.index, data.otherIndex);
  };
  /**
   *
   */
  onFilterUpdate = data => {
    this.filterUpdated(data.i, data.j);
  };
  /*Fires when category filter is applied*/
  catFilterAdded(catId, index, otherIndex) {
    this.catId = catId ? catId : 0;
    this.packId = 0;
    this.packName = null;
    if (this.catId && this.categories[index].id == catId) {
      this.catName =
        typeof index != 'undefined' && this.categories[index].category_name
          ? this.categories[index].category_name
          : '';
      let catSlug = this.comServ.createSlugFromString(this.catName);
      let temp = this.router.url.split('?');
      let urlToRedirect = temp[0];
      let count = 0;
      if (temp[1]) {
        let tempD = temp[1].split('&');
        for (let c in tempD) {
          if (tempD[c].indexOf('category') == -1 && tempD[c].indexOf('subcat') == -1) {
            if (!this.searchKeyword && tempD[c].indexOf('search') > -1) {
            } else {
              urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
              count++;
            }
          }
        }
      }
      urlToRedirect +=
        count == 0
          ? '?category=' + catSlug + '-' + this.catId
          : '&category=' + catSlug + '-' + this.catId;
      const ind = Object.assign([], this.selectedFilters).findIndex(d => d.type == 1);
      if (ind > -1) {
        this.selectedFilters[ind] = {
          name: this.catName,
          param: 'category',
          type: 1,
          id: `${catSlug}-${this.catId}`
        };
      } else {
        this.selectedFilters.push({
          name: this.catName,
          param: 'category',
          type: 1,
          id: `${catSlug}-${this.catId}`
        });
      }
      this.router.navigateByUrl(urlToRedirect);
    } else if (this.catId) {
      this.catName =
        typeof otherIndex != 'undefined' &&
        typeof index != 'undefined' &&
        this.categories[index].subCategory[otherIndex].category_name
          ? this.categories[index].subCategory[otherIndex].category_name
          : '';
      let catSlug = this.comServ.createSlugFromString(this.categories[index].category_name);
      let subCatSlug = this.comServ.createSlugFromString(this.catName);
      let temp = this.router.url.split('?');
      let urlToRedirect = temp[0];
      let count = 0;
      if (temp[1]) {
        let tempD = temp[1].split('&');
        for (let c in tempD) {
          if (tempD[c].indexOf('category') == -1 && tempD[c].indexOf('subcat') == -1) {
            if (!this.searchKeyword && tempD[c].indexOf('search') > -1) {
            } else {
              urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
              count++;
            }
          }
        }
      }
      urlToRedirect +=
        count == 0
          ? '?category=' +
            catSlug +
            '-' +
            this.categories[index].id +
            '&subcat=' +
            subCatSlug +
            '-' +
            this.catId
          : '&category=' +
            catSlug +
            '-' +
            this.categories[index].id +
            '&subcat=' +
            subCatSlug +
            '-' +
            this.catId;
      const ind = Object.assign([], this.selectedFilters).findIndex(d => d.type == 1);
      if (ind > -1) {
        this.selectedFilters[ind] = {
          name: this.catName,
          param: 'category',
          type: 1,
          id: `${catSlug}-${this.catId}`
        };
      } else {
        this.selectedFilters.push({
          name: this.catName,
          param: 'category',
          type: 1,
          id: `${catSlug}-${this.catId}`
        });
      }
      this.router.navigateByUrl(urlToRedirect);
    } else {
      this.catName = '';
      let temp = this.router.url.split('?');
      let urlToRedirect = temp[0];
      let count = 0;
      if (temp[1]) {
        let tempD = temp[1].split('&');
        for (let c in tempD) {
          if (tempD[c].indexOf('category') == -1 && tempD[c].indexOf('subcat') == -1) {
            if (!this.searchKeyword && tempD[c].indexOf('search') > -1) {
            } else {
              urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
              count++;
            }
          }
        }
      }
      this.router.navigateByUrl(urlToRedirect);
    }
  }
  /*Fires when route loaded and set selected category if any*/
  setSelectedCategory(catId) {
    if (catId != 0) {
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
  /*Fires when change in filter option occure*/
  filterUpdated(mainIndex, subIndex) {
    let reqParam = this.filters[mainIndex].reqParam;
    this.clickedOn = reqParam;
    this.filteredArray[reqParam] = this.filteredArray[reqParam] ? this.filteredArray[reqParam] : [];
    let indexOfFilter = this.filteredArray[reqParam].indexOf(
      this.filters[mainIndex].data[subIndex].id
    );
    if (indexOfFilter <= -1) {
      this.filteredArray[reqParam].push(this.filters[mainIndex].data[subIndex].id);
    } else {
      this.filteredArray[reqParam].splice(indexOfFilter, 1);
    }
    var id = this.filters[mainIndex].data[subIndex].id;
    var p = this.pageParams;
    var paramsToSend = JSON.parse(JSON.stringify(p));
    var ele = paramsToSend[reqParam] ? paramsToSend[reqParam] : '';
    var eleArr = [];
    if (ele != '') {
      eleArr = ele.split(',');
    }
    var tempArr = [];
    if (eleArr.indexOf(id) > -1) {
      eleArr.splice(eleArr.indexOf(id), 1);
      tempArr = eleArr;
    } else {
      eleArr.push(id);
      tempArr = eleArr;
    }
    if (tempArr.length > 0) {
      paramsToSend[reqParam] = tempArr.join(',');
    } else {
      delete paramsToSend[reqParam];
    }
    const name = this.filters[mainIndex].data[subIndex].name;
    const index = this.selectedFilters.findIndex(d => d.id === id);
    switch (reqParam) {
      case 'loc':
        if (index > -1) {
          this.selectedFilters.splice(index, 1);
        } else {
          this.selectedFilters.push({
            name,
            param: reqParam,
            type: 5,
            id: id
          });
        }
        break;
      case 'angle':
        if (index > -1) {
          this.selectedFilters.splice(index, 1);
        } else {
          this.selectedFilters.push({
            name,
            param: reqParam,
            type: 2,
            id: id
          });
        }
        break;
      case 'mlight':
        if (index > -1) {
          this.selectedFilters.splice(indexOfFilter, 1);
        } else {
          this.selectedFilters.push({
            name,
            param: reqParam,
            type: 4,
            id: id
          });
        }
        break;
      case 'pack':
        if (index > -1) {
          this.selectedFilters.splice(indexOfFilter, 1);
        } else {
          this.selectedFilters.push({
            name,
            param: reqParam,
            type: 6,
            id: id
          });
        }
        break;
      default:
        break;
    }
    if (!this.searchKeyword) {
      paramsToSend.search = '';
    }
    this.router.navigate(['/images'], { queryParams: paramsToSend });
  }
  /*Fires when all filter are clear*/
  clearFilter() {
    let temp = this.router.url.split('?');
    let urlToRedirect = temp[0];
    let count = 0;
    this.isFilterApplied = false;
    if (temp[1]) {
      let tempD = temp[1].split('&');
      for (let c in tempD) {
        if (tempD[c].indexOf('category') > -1 || tempD[c].indexOf('subcat') > -1) {
          urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
          count++;
        }
      }
    }
    const tempSelectedFilters = Object.assign([], this.selectedFilters);
    this.selectedFilters = tempSelectedFilters.filter(d => [2, 4, 5, 5].indexOf(d.type) === -1);
    this.router.navigateByUrl(urlToRedirect);
  }
  /**/
  resolutionFilterAdded(index) {
    this.resolName =
      typeof index != 'undefined' && this.resolution[index].name ? this.resolution[index].name : '';
    this.resolId =
      typeof index != 'undefined' && this.resolution[index].id ? this.resolution[index].id : 0;
    if (this.resolId) {
      let temp = this.router.url.split('?');
      let urlToRedirect = temp[0];
      let count = 0;
      if (temp[1]) {
        let tempD = temp[1].split('&');
        for (let c in tempD) {
          if (tempD[c].indexOf('resol') == -1) {
            if (!this.searchKeyword && tempD[c].indexOf('search') > -1) {
            } else {
              urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
              count++;
            }
          }
        }
      }
      urlToRedirect += count == 0 ? '?resol=' + this.resolId : '&resol=' + this.resolId;
      this.router.navigateByUrl(urlToRedirect);
    } else {
      let temp = this.router.url.split('?');
      let urlToRedirect = temp[0];
      let count = 0;
      if (temp[1]) {
        let tempD = temp[1].split('&');
        for (let c in tempD) {
          if (tempD[c].indexOf('resol') == -1) {
            if (!this.searchKeyword && tempD[c].indexOf('search') > -1) {
            } else {
              urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
              count++;
            }
          }
        }
      }
      this.router.navigateByUrl(urlToRedirect);
    }
  }
  /**/
  searchImages() {
    let temp = this.router.url.split('?');
    let urlToRedirect = '/images';
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
  /**/
  sortImage(sortBy) {
    let temp = this.router.url.split('?');
    let urlToRedirect = temp[0];
    let count = 0;
    if (temp[1]) {
      let tempD = temp[1].split('&');
      for (let c in tempD) {
        if (tempD[c].indexOf('sort') == -1) {
          if (!this.searchKeyword && tempD[c].indexOf('search') > -1) {
          } else {
            urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
            count++;
          }
        }
      }
    }
    this.sortyBy = sortBy;
    urlToRedirect += count == 0 && sortBy != 2 ? '?sort=' + sortBy : '&sort=' + sortBy;
    this.router.navigateByUrl(urlToRedirect);
  }
  clearAllFilter() {
    this.isFilterApplied = false;
    this.selectedFilters = [];
    this.router.navigate(['/images']);
  }
  /**/
  getImageSize() {}
  /**/
  loadImages() {
    console.log('fasdfa', this.urlToSend);
    if (this.getImageReq) {
      this.getImageReq.unsubscribe();
    }
    this.imageIdsToAdd = [];
    this.getImageReq = this.imageSer
      .getImages(
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
          this.Images = data.data;
          this.offset = this.offset + data.data.length;
          this.isMoreDataAvail = data.data.length >= this.dataLimit ? true : false;
          this.isPreviousCallComplete = true;
          let _that = this;
          setTimeout(function() {
            this.InitializeGoogleGallary();
            _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
              ele.addEventListener('click', _that.onImageView.bind(_that));
            });
          }, 500);
        } else if (data.status == 404) {
          this.Images = [];
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
        this.imageIdsToAdd = [];
        this.allToCollId = [];
      });
  }
  loadMoreData() {
    this.isPreviousCallComplete = false;
    this.isDataLoaded = true;
    if (this.isMoreDataAvail) {
      this.dataLoading = true;
      if (this.getMoreImageReq) {
        this.getMoreImageReq.unsubscribe();
      }
      var imageIds = [];
      for (let index = 0; index < this.Images.length; index++) {
        const ele = this.Images[index];
        imageIds.push(ele.image_id);
      }
      this.getMoreImageReq = this.imageSer
        .getImages(
          this.offset,
          50 || this.dataLimit,
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
                tempData[i].slug = this.comServ.createSlugFromString(tempData[i].image_name);
                this.Images.push(tempData[i]);
              }
            }
            let len = this.offset;
            let _that = this;
            setTimeout(function() {
              this.InitializeGoogleGallary();
              let i = 1;
              _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                if (i > len) {
                  ele.addEventListener('click', _that.onImageView.bind(_that), false);
                }
                i++;
              });
            }, 500);
            this.offset = this.offset + data.data.length;
            this.isMoreDataAvail = data.data.length >= 50 ? true : false;
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
  checkLogin(isLoggedIn: boolean) {
    this.isUserLoggedIn = isLoggedIn;
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      this.token = this.winServ.getLocalItem('token');
      if (this.collectionCoundReq) {
        this.collectionCoundReq.unsubscribe();
      }
      this.collectionsCount();
      if (this.getFilterItemReq) {
        this.getFilterItemReq.unsubscribe();
      }
      // this.getCategories();
    }
    if (this.isUserLoggedIn) {
      let user = JSON.parse(this.winServ.getLocalItem('userData'));
      this.userData = user;
      console.log(this.userData);
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
    if (this.getImageReq) {
      this.getImageReq.unsubscribe();
    }
    this.getCategories();
  }
  onlyPurchaseThisImage(index) {
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = this.Images[index];
    let price_credits = this.Images[index].price_credits;
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
    if (this.userData.is_download == '0') {
      this.userData.is_download = 0;
      this.onlyPurchaseImage($image, this.winServ.getLocalItem('token'), 1);
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
          _that.onlyPurchaseImage($image, _that.winServ.getLocalItem('token'), hideConfirm);
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }
  onlyPurchaseImage(imageDetails, token, hideConfirm) {
    let index = this.Images.findIndex(d => d.image_id == imageDetails.image_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
    }
    this.purchaseImageReq = this.imageSer
      .purchaseImageByCredits(imageDetails.image_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (index > -1) {
                  this.Images[index].isPurchased = 1;
                  this.getMainImage(index);
                }
                this.$header.updateUserData();
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
            'An unknown error occure, please try after some time!',
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
  downloadThisImage(index, width, height, reCalled) {
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = this.Images[index];
    let ratio = this.Images[index].ratio;
    let price_credits = this.Images[index].price_credits;
    if (parseInt(price_credits) > parseInt(remainingCredits) && !this.Images[index].isPurchased) {
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
    this.imageHeightToDownload = Math.round(this.imageWidthToDownload * ratio);
    let token = this.winServ.getLocalItem('token');
    let imageWidth =
      width == 'custom_width'
        ? this.imageWidthToDownload
        : width == 'width'
        ? 'width'
        : this.Images[index][width];
    let imageHeight =
      height == 'custom_height'
        ? this.imageHeightToDownload
        : height == 'height'
        ? 'height'
        : this.Images[index][height];
    let imageId = this.Images[index]['image_id'];
    if (!token) {
      this.imageCollectionalert('Info!', 'You need to login to download image.', 'info');
    }
    if (!imageHeight || !imageWidth || !imageId) {
      this.imageCollectionalert('Error!', 'Unknown Error.', 'error');
      return;
    }
    this.downloadingImage = true;
    let imageName = this.Images[index].image_name;
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
                  this.downloadImageName = data.data.image_name;
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
                  this.imageCollectionalert(
                    'Error!',
                    data.message
                      ? data.message
                      : 'An unknown error occure while downloading image!',
                    'error'
                  );
                  this.downloadingImage = false;
                }
                break;
              case 401:
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
                    '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
                  let _that = this;
                  let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
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
                this.imageWidthToDownload = 0;
                this.imageHeightToDownload = 0;
                this.selectedSize = [];
                this.imageCollectionalert(
                  'Error!',
                  'An unknown error occure while downloading image!',
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
                let index = this.Images.findIndex(d => d.image_id == imageDetails.image_id);
                if (index > -1) {
                  this.Images[index].isPurchased = 1;
                  this.isPreviewLoaded[index] = false;
                  this.getMainImage(index);
                }
                this.downloadThisImage(index, width, height, true);
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
  setvalueVer(section: any) {
    this.section_order = section;
  }
  setNextSection(section: any) {
    this.section_order = section;
  }
  addnameCol(newColName, isNew, form) {
    this.addBtnDis = true;
    this.isAddError = false;
    this.AddError = '';
    this.isAddSuccess = false;
    this.AddSuccess = '';
    let data = {
      token: this.token,
      img_id: this.imageIdsToAdd,
      name: newColName
    };
    this.addCollectionReq = this.imageSer.addnameCol(data).subscribe(data => {
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
            $('body').removeAttr('style');
            $('body').addClass('check-it');
            $('body').addClass('collection-notification-alert');
            this.imageCollectionalert('Added!', data.message, 'success', undefined, 7000, () => {
              console.log('Callback called for sw2');
              this.lastCollectionId = null;
            });
          }, 500);
        } else {
          this.successMessage = data.message;
          $('body').addClass('collection-notification-alert');
          this.imageCollectionalert('Added!', data.message, 'success', undefined, 7000, () => {
            this.lastCollectionId = null;
          });
          setTimeout(() => {
            $('body').removeClass('collection-notification-alert');
          }, 7000);
        }
        this.lastCollectionId = data.data.id;
        this.imageIdsToAdd = [];
        this.allToCollId = [];
        this.collectionsCount();
        // this.toastServ.showNotification(data.message);

        // swal('Added!', data.message, 'success');
        $('#btnCloseAdd').click();
      } else {
        /* if (isNew) {
          if (data.errors) {
            this.Errors = data.errors;
          }
        } else {
          this.errorMessage = data.message;
        } */
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
  getTags(tag: string) {
    this.suggestedTags = [];
    // if (tag.length<=2){
    //   return;
    // }
    if (this.fetchTagReq) {
      this.fetchTagReq.unsubscribe();
    }
    this.fetchTagReq = this.comServ
      .get('webservices/tags?tag=' + tag + '&tag_for=2')
      .subscribe(data => {
        let tags = [];
        if (data.status && data.status == 200) {
          let $d = data.data ? data.data : [];
          for (let i = 0; i < $d.length; i++) {
            const e = $d[i];
            let str = e.tag_name.toLowerCase();
            e.tag_name = str.replace(tag.toLowerCase(), '<b>' + tag.toLocaleLowerCase() + '</b>');
            tags.push(str);
            /* + ' (' + e.result_count+')' + */
          }
          this.suggestedTags = $d;
        } else {
          this.suggestedTags = [];
        }
      });
  }
  setSeachKeyword(keyword: any) {
    this.searchKeyword = keyword.replace(/<\/?[^>]+(>|$)/g, '');
    this.suggestedTags = [];
    $('body')
      .find(`[name='search']`)
      .focus();
  }
  parseInt(name) {
    return parseInt(name);
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
  imageCollectionalert(title, messageHTML, type, position = null, timer = 5000, cb = null) {
    return this.comServ.notify(title, messageHTML, type, position, timer, cb);
  }
  imageViewedByUser(imageId) {
    let token = this.winServ.getLocalItem('token');
    if (token && imageId) {
      imageId = typeof imageId == 'number' ? imageId : parseInt(imageId);
      this.addToSearchHistoryReq = this.imageSer
        .addToSearchHistory(token, imageId)
        .subscribe(data => {});
    }
  }
  selectText(element) {
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
    const element = $('body').find(ele);
    element.attr('contenteditable', 'true');
    if (element.get(0)) {
      let res = _that.selectText(element.get(0));
      try {
        let success = document.execCommand('copy');
        if (success) {
          console.log('Image copied!');
        } else {
          throw new Error('Error while copying image!');
        }
        window.getSelection().removeAllRanges();
        $(ele).removeAttr('contenteditable');
        this.imageCollectionalert('Copied!', 'Image copied to clipboard.', 'success');
      } catch (error) {
        console.log(error);
        this.imageCollectionalert('Error!', error, 'error');
      }
    } else {
      this.imageCollectionalert('Error!', 'Unable to find image.', 'error');
    }
  }
  zoomImage(id, event) {
    setTimeout(function() {
      this.zoomThisImage(id, event);
    }, 0);
  }
  removeZoom(id) {
    setTimeout(function() {
      this.removeZoomFromImage(id);
    }, 0);
  }
  replacePreviews(string: string, search: string, replace: string) {
    return string.replace(search, replace);
  }
  downloadPreview(index: number) {
    let $d = this.Images[index];
    if ($d) {
      /* this.comServ.urlToDataURI(this.ServerImgPath+$d.image_thumbnail_main).subscribe(res=>{
        console.log(res);

      }); */
      this.downloadUrl = $d.image_thumbnail_main;
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
      }
      this.downloadImageName = $d.image_name + ' Preview.' + ext;
      let img = $('body .downloadImg');
      if (img && img[0]) {
        setTimeout(() => {
          img[0].click();
          this.$header.updateUserData();
          this.downloadingImage = false;
        }, 1000);
      }
    }
  }
  previewLoaded(index) {
    // $('body').find('#remove-ele-' + index).remove();
    this.isPreviewLoaded[index] = true;
    setTimeout(function() {
      this.zoomImage('xzoom-' + index, true);
    }, 10);
  }
  encodeToURL(str) {
    return encodeURIComponent(str);
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
      const tempSelectedFilters = Object.assign([], this.selectedFilters);
      this.selectedFilters = tempSelectedFilters.filter(d => d.id !== filter.id);
      this.router.navigate(['/images'], { queryParams: paramsToSend });
    }
  }
  updateImageForCollection(e, index) {
    var ind = this.imageIdsToAdd.indexOf(this.Images[index].image_id);
    if (ind > -1) {
      this.allToCollId[this.Images[index].image_id] = false;
      this.imageIdsToAdd.splice(ind, 1);
    } else {
      this.allToCollId[this.Images[index].image_id] = 1;
      this.imageIdsToAdd.push(this.Images[index].image_id);
    }
  }
  uncheckAllImages() {
    this.imageIdsToAdd = [];
    this.allToCollId = [];
  }
  selectImage(image_id) {
    this.imageIdsToAdd.push(image_id);
    this.allToCollId[image_id] = true;
    setTimeout(function() {
      this.imageCollectionHeadFixed();
      this.closeDetails();
    }, 0);
  }
  ngOnDestroy() {
    $('body').off('click', '.swal2-container', e => {});
    localStorage.removeItem('open');
    if (this.collectionCoundReq) {
      this.collectionCoundReq.unsubscribe();
    }
    if (this.getFilterItemReq) {
      this.getFilterItemReq.unsubscribe();
    }
    if (this.getImageReq) {
      this.getImageReq.unsubscribe();
    }
    if (this.getMoreImageReq) {
      this.getMoreImageReq.unsubscribe();
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
    if (this.routerEvent) {
      this.routerEvent.unsubscribe();
    }
    if (this.queryParamEvent) {
      this.queryParamEvent.unsubscribe();
    }
  }
  /**
   *
   */
  isSubcatSelected(subCategory = []) {
    return subCategory.findIndex(d => d.id == this.catId) > -1;
  }
  /**
   *
   */
  toggleFilter = () => {
    this.showFilterToggle = !this.showFilterToggle;
    if (localStorage.getItem('open')) {
      localStorage.removeItem('open');
    } else {
      localStorage.setItem('open', 'true');
    }
  };
  /**
   *
   */
  showActualOption = (): boolean => {
    return (
      this.userData &&
      this.userData.user_plan_details &&
      (this.userData.user_plan_details.subscriptionStatus == 1 ||
        this.userData.user_plan_details.subscriptionStatus == 2)
    );
  };
}
