import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { WindowSevice } from './../../services/window.service';
import { AppSettings } from './../../app.setting';
import { PackageService } from './../../services/package.service';
import { CommonSevice } from './../../services/common.service';
import { HeaderSevice } from './../../services/header.service';
import { HeaderComponent } from './../../components/header/header.component';
import { ISubscription } from 'rxjs/Subscription';
import * as $ from 'jquery';
import swal from 'sweetalert2';
import { CartService } from '../../services/cart.service';
declare const addAutoComplete: any;
declare const gallerForPack: any;
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css'],
  providers: [PackageService, CommonSevice, WindowSevice, HeaderSevice, CartService]
})
export class PackageComponent implements OnInit, OnDestroy {
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  packages = [];
  isDataLoaded = false;
  dataLoading = false;
  offset = 0;
  dataLimit: number = AppSettings.PACKS_PER_PAGE;
  catId = 0;
  isMoreDataAvail: boolean;
  showSearchBox = false;
  urlToSend: any;
  filters: Array<any> = [];
  filteredArray: Array<any> = [];
  categories: Array<any> = [];
  tags: Array<any> = [];
  section_order = 0;
  catName: string;
  allParams: any;
  searchKeyword = '';
  sortyBy = 1;
  packindex = 0;
  signlePackDetails: any;
  isUserLoggedIn = false;
  currentPackPrice: any;
  purchasingImage = false;
  loadingImage = [];
  plansDetail: any = [];
  userData: any = {};
  suggestedTags: any = [];
  getFilterReq: ISubscription;
  getPackageReq: ISubscription;
  getMorePackageReq: ISubscription;
  getCategoryReq: ISubscription;
  checkUserCreditsReq: ISubscription;
  purchasePackReq: ISubscription;
  getPlanReq: ISubscription;
  fetchTagReq: ISubscription;
  isFilterApplied = false;
  isPreviousCallComplete = false;
  queryParams: any;
  routerEvent;
  queryParamEvent;
  windowWidth = 0;
  planFacilities: any = {};
  planfacilitiesToolTip: any = {};
  selectedFilters: Array<any> = [];
  pageParams: any;
  clickedOn: string = null;
  showFilterToggle: boolean;
  totalItems: number;
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  @HostListener('touchstart', [])
  @HostListener('window:scroll', [])
  onWindowScroll($event: any) {
    var currentPosition = window.pageYOffset ? window.pageYOffset : 0;
    currentPosition = this.parseInt(currentPosition);
    var eleHeight = this.parseInt($('.pictureView.package-viewchange').height());
    var footerHeight = this.parseInt($('footer').height());
    if (
      this.isDataLoaded &&
      this.isPreviousCallComplete &&
      currentPosition >= eleHeight - (footerHeight + 1500)
    ) {
      // console.log(eleHeight, footerHeight, 'Webservice called!');
      this.isPreviousCallComplete = false;
      this.loadMoreData();
    }
  }

  constructor(
    private packSer: PackageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    private comServ: CommonSevice,
    private winServ: WindowSevice,
    private headerServ: HeaderSevice,
    private cartService: CartService,
    private eleRef: ElementRef
  ) {
    // this.metaService.addTag({ property: 'og:video', content: 'http://example.com/movie.swf' });
    this.titleService.setTitle('Packs');
    window.scrollTo(0, 0);
    this.queryParamEvent = this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.allParams = params;
      this.pageParams = params;
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
  /**
   *
   */
  toggleSidebar = () => {
    this.showFilterToggle = !this.showFilterToggle;
    if (localStorage.getItem('open')) {
      localStorage.removeItem('open');
    } else {
      localStorage.setItem('open', 'true');
    }
    const _that = this;
    setTimeout(function() {
      _that.windowWidth = $(this).width();
      this.gallerForPack();
    }, 0);
  };
  /**
   *
   */
  clearSearchInput = () => {
    this.searchKeyword = '';
    $('#suggestion-tags').focus();
  };
  /**
   *
   */
  ngOnInit() {
    if (localStorage.getItem('open')) {
      this.showFilterToggle = true;
    }
    this.routerEvent = this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.offset = 0;
        setTimeout(function() {
          this.closeSuggestionMenu();
        }, 0);
        this.loadPackages();
      }

      this.activatedRoute.queryParams.subscribe((params: Params) => {
        this.queryParams = params;
      });
    });
    this.getPlans();
    addAutoComplete(1, search => {
      console.log('search', search);
      this.searchKeyword = search;
      this.searchPacks();
    });

    this.windowWidth = $(window).width();

    $(window).on('resize', () => {
      this.windowWidth = $(window).width();
      gallerForPack();
    });
  }
  getPlans() {
    this.getPlanReq = this.packSer.getPlans().subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            let $d = data.data.plans ? data.data.plans : [];
            for (let i in $d) {
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
      catSlug = catSlug.split('-');
      catSlugT = catSlug[0] ? catSlug[0] : null;
      catId = catSlug[catSlug.length - 1] ? catSlug[catSlug.length - 1] : 0;
      this.searchKeyword = params['search'] ? decodeURIComponent(params['search']) : '';
      this.sortyBy = params['sort'] ? params['sort'] : 1;
      this.catId = catId;
    });
    this.getFilterReq = this.headerServ.getFilterItemForPack().subscribe(data => {
      this.selectedFilters = [];
      if (data.status == 200) {
        this.categories = data.data.category ? data.data.category : [];
        this.filters = data.data.filter ? data.data.filter : [];
        this.totalItems = data.data.totalPacks;
        this.tags = data.data.tags ? data.data.tags : [];
        this.setSelectedCategory(catId);
        if (catId) {
          this.selectedFilters.push({
            name: this.catName,
            param: 'category',
            type: 1,
            id: catSlugT
          });
        }
      } else {
        this.categories = [];
        this.filters = [];
        this.tags = [];
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
      this.initializeTags();
    });
  }
  /*Initialize tags*/
  initializeTags() {}
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
      this.router.navigate(['/packs'], { queryParams: paramsToSend });
    }
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
    /*window.name = catId;
    this.outgoingData.emit(catId);*/
    this.catId = catId ? catId : 0;
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
    let temp = this.router.url.split('?');
    let urlToRedirect = temp[0];
    let count = 0;
    if (temp[1]) {
      let tempD = temp[1].split('&');
      // tslint:disable-next-line: forin
      for (let c in tempD) {
        let aleadyIn = false;
        // tslint:disable-next-line: forin
        for (let i in this.filteredArray) {
          if (tempD[c].indexOf(i) > -1) {
            aleadyIn = true;
          }
          if (aleadyIn) {
            break;
          }
        }
        if (tempD[c].indexOf(reqParam) == -1 && !aleadyIn) {
          if (!this.searchKeyword && tempD[c].indexOf('search') > -1) {
          } else {
            urlToRedirect += count > 0 ? '&' + tempD[c] : '?' + tempD[c];
            count++;
          }
        }
      }
    }
    let tempUrl = '';
    let count1 = 0;
    for (let i in this.filteredArray) {
      if (this.filteredArray[i].length > 0) {
        tempUrl +=
          (count1 > 0 && count > 0) || (count1 == 0 && count > 0)
            ? '&' + i + '=' + this.filteredArray[i]
            : count1 == 0
            ? '?' + i + '=' + this.filteredArray[i]
            : '&' + i + '=' + this.filteredArray[i];
        count1++;
      }
    }
    urlToRedirect += tempUrl;
    this.router.navigateByUrl(urlToRedirect);
  }

  /*Fires when all filter are clear*/
  clearFilter() {
    this.isFilterApplied = false;
    var obj = {};
    for (var i in this.queryParams) {
      if (i != 'mlight' && i != 'loc') {
        obj[i] = this.queryParams[i];
      } else {
        delete this.filteredArray[i];
      }
    }
    this.router.navigate(['/packs'], { queryParams: obj });
  }
  /**/
  searchPacks() {
    let temp = this.router.url.split('?');
    let urlToRedirect = '/packs';
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
  clearAllFilter() {
    this.isFilterApplied = false;
    this.filteredArray = [];
    this.selectedFilters = [];
    this.router.navigate(['/packs']);
  }
  /**/
  sortPack(sortBy) {
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
    urlToRedirect += count == 0 && sortBy != 1 ? '?sort=' + sortBy : '&sort=' + sortBy;
    this.router.navigateByUrl(urlToRedirect);
  }
  loadPackages() {
    if (this.getPackageReq) {
      this.getPackageReq.unsubscribe();
    }
    this.getPackageReq = this.packSer
      .getPackages(
        this.offset,
        this.dataLimit,
        this.catId,
        this.urlToSend,
        this.winServ.getLocalItem('token')
      )
      .subscribe(data => {
        if (data.status == 200) {
          let tempData = data.data;
          for (let i in tempData) {
            if (tempData[i].images) {
              tempData[i].images = JSON.parse(tempData[i].images);
            }
            // tempData[i].slug = this.comServ.createSlugFromString(tempData[i].pack_name);
          }
          this.packages = data.data;
          this.offset = this.offset + data.data.length;
          this.isMoreDataAvail = data.data.length >= this.dataLimit ? true : false;
          // this.dataLimit = 15;
          let _that = this;
          setTimeout(function() {
            this.gallerForPack();
            _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
              ele.addEventListener('click', _that.onPackView.bind(_that));
            });
          }, 500);
          this.isPreviousCallComplete = true;
        } else if (data.status == 404) {
          this.packages = [];
          this.offset = 0;
          this.isMoreDataAvail = false;
        }
        this.isDataLoaded = true;
        this.dataLoading = false;
      });
  }
  onPackView(event) {
    let index = -1;
    if (event.target) {
      index = parseInt($(event.target).attr('data-index'));
      if (this.packages[index]) {
        this.packages[index].showQuickViewImage = true;
      }
    }
  }
  loadMoreData() {
    if (!this.dataLoading && this.isMoreDataAvail) {
      this.dataLoading = true;
      this.getMorePackageReq = this.packSer
        .getPackages(
          this.offset,
          this.dataLimit,
          this.catId,
          this.urlToSend,
          this.winServ.getLocalItem('token')
        )
        .subscribe(data => {
          if (data.status == 200) {
            setTimeout(() => {
              let tempData = data.data;
              // tslint:disable-next-line: forin
              for (let i in tempData) {
                tempData[i].images = JSON.parse(tempData[i].images);
                // tempData[i].slug = this.comServ.createSlugFromString(tempData[i].pack_name);
                this.packages.push(tempData[i]);
              }
              this.offset = this.offset + data.data.length;
              this.isMoreDataAvail = data.data.length >= this.dataLimit ? true : false;
              this.dataLoading = false;
              setTimeout(function() {
                this.gallerForPack();
              }, 500);
              this.isPreviousCallComplete = true;
            }, 1000);
          } else if (data.status == 404) {
            this.isMoreDataAvail = false;
            this.dataLoading = false;
          }
        });
    }
  }
  getCategoryId(catId: any) {
    this.offset = 0;
    this.isDataLoaded = false;
    this.getPackageReq = this.packSer
      .getPackages(
        this.offset,
        this.dataLimit,
        catId,
        this.urlToSend,
        this.winServ.getLocalItem('token')
      )
      .subscribe(data => {
        if (data.status == 200) {
          let tempData = data.data;
          // tslint:disable-next-line: forin
          for (let i in tempData) {
            tempData[i].slug = this.comServ.createSlugFromString(tempData[i].pack_name);
          }
          this.packages = data.data;
          this.offset = this.offset + data.data.length;
          this.isMoreDataAvail = data.data.length <= this.dataLimit ? true : false;
        } else if (data.status == 404) {
          this.packages = [];
          this.offset = 0;
          this.isMoreDataAvail = false;
        }
        this.isDataLoaded = true;
      });
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
    this.loadPackages();
  }
  setvalueVer(section: any) {
    this.section_order = section;
  }
  setNextSection(section: any) {
    this.section_order = section;
  }
  purchasePack(index) {
    let $token = this.winServ.getLocalItem('token');
    let $pack = this.packages[index];
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
                    '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm clearfix"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-purchase" id="do-not-show-purchase"/> <label for="do-not-show-purchase">Don\'t show this again.</label></div></div><div class="clearfix"></div></div><div class="clearfix"></div></div>';
                  let _that = this;
                  let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
                  alertRes.then(result => {
                    if (result.value) {
                      let hideConfirm = _that.winServ.getLocalItem('hidePurchaseConfirm')
                        ? true
                        : false;
                      _that.addToPurchasePack($pack, $token, hideConfirm);
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
                      _that.$header.getAndUpdateCustomCredits();
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                      // _that.router.navigateByUrl('/subscriptions');
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
      this.router.navigateByUrl('/404');
    }
  }
  getTags(tag: string) {
    this.suggestedTags = [];
    if (tag.length <= 2) {
      return;
    }
    if (this.fetchTagReq) {
      this.fetchTagReq.unsubscribe();
    }
    this.fetchTagReq = this.comServ
      .get('webservices/tags?tag=' + tag + '&tag_for=1')
      .subscribe(data => {
        if (data.status && data.status == 200) {
          let $d = data.data ? data.data : [];
          for (let i = 0; i < $d.length; i++) {
            const e = $d[i];
            let str = e.tag_name.toLowerCase();
            e.tag_name = str.replace(tag.toLowerCase(), '<b>' + tag.toLocaleLowerCase() + '</b>');
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
      confirmButtonClass: 'btn btn-ok btn-theme-white',
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
                let index = this.packages.findIndex(d => d.id == pack.id);
                if (index > -1) {
                  this.packages[index].isPurchased = 1;
                }
                this.$header.updateUserData();
                this.$header.updateCartData();
                this.purchasingImage = false;
                // swal('Success!', "Pack purchased successfully !", 'success');
                this.packageNotifyAlert('Success!', 'Pack purchased successfully.', 'success');
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
                      _that.$header.getAndUpdateCustomCredits();
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                      // _that.router.navigateByUrl('/subscriptions');
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
  addToCart(pack, plan) {
    let cartData = {
      packId: pack.id,
      packName: pack.pack_name,
      packPrice: pack.price,
      packPriceInCredits: pack.price_credits,
      multiplier: 1,
      type: 'pack'
    };
    if (plan && plan.account_type && plan.account_type == '2') {
      cartData.packPrice = cartData.packPrice * plan.indieMultiply;
      cartData['multiplier'] = plan.indieMultiply;
    } else if (plan && plan.account_type && plan.account_type == '3') {
      cartData.packPrice = cartData.packPrice * plan.studioMultiply;
      cartData['multiplier'] = plan.studioMultiply;
    }
    if (!this.isUserLoggedIn) {
      let cd = this.cartService.get();
      if (cd.data) {
        let isInCart = cd.data.findIndex(d => d.packId == cartData.packId);
        if (isInCart > -1) {
          // swal('Error', 'Pack is already in cart!', 'info');
          this.packageNotifyAlert('Warning!', 'Pack is already in cart.', 'info');
          return;
        }
      }
      let selectedPlan = this.winServ.getLocalItem('seletedPlan');
      if (!selectedPlan) {
        this.winServ.setLocalItem('seletedPlan', plan.plan_id);
        this.cartService.add(cartData);
        this.$header.updateCartData();
      } else if (selectedPlan != plan.plan_id) {
        let index = this.plansDetail.findIndex(d => d.plan_id == selectedPlan);
        if (index > -1) {
          // swal('Warning', 'You have previously selected ' + this.plansDetail[index].account_type_name + ' plan.', 'error');
          $('body').addClass('multipackage-notification-alert');
          this.packageNotifyAlert(
            'Error!',
            '<div class="">Multiple license types.<br />You have previously selected ' +
              this.plansDetail[index].account_type_name +
              '.</div>',
            'error'
          );
          setTimeout(() => {
            $('body').removeClass('multipackage-notification-alert');
          }, 3100);
        } else {
          // swal('Error', 'You have selected an invalid plan, please try again!', 'error');
          this.packageNotifyAlert(
            'Error!',
            'You have selected an invalid plan, please try again.',
            'error'
          );
          this.winServ.removeItem('seletedPlan');
        }
      } else if (selectedPlan) {
        this.cartService.add(cartData);
        this.$header.updateCartData();
      }
    } else {
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
  }
  cartPurchased(event) {
    this.offset = 0;
    this.loadPackages();
  }
  packageNotifyAlert(title, messageHTML, type, position = null, timer = 5000) {
    return this.comServ.notify(title, messageHTML, type, position, timer);
  }
  parseInt(name) {
    return parseInt(name);
  }
  ngOnDestroy() {
    localStorage.removeItem('open');
    if (this.getFilterReq) {
      this.getFilterReq.unsubscribe();
    }
    if (this.getPackageReq) {
      this.getPackageReq.unsubscribe();
    }
    if (this.getMorePackageReq) {
      this.getMorePackageReq.unsubscribe();
    }
    if (this.getCategoryReq) {
      this.getCategoryReq.unsubscribe();
    }
    if (this.checkUserCreditsReq) {
      this.checkUserCreditsReq.unsubscribe();
    }
    if (this.purchasePackReq) {
      this.purchasePackReq.unsubscribe();
    }
    if (this.getPlanReq) {
      this.getPlanReq.unsubscribe();
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
}
