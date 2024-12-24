import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { AppSettings } from '../../app.setting';
import { ModelFilterParams } from '../models.component';
import { ISubscription } from 'rxjs/Subscription';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonSevice } from '../../services/common.service';
import { WindowSevice } from '../../services/window.service';

@Component({
  selector: 'app-models-grid-filter',
  templateUrl: './models-grid-filter.component.html',
  styleUrls: ['./models-grid-filter.component.css']
})
export class ModelsGridFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('isUserLoggedIn') isUserLoggedIn: boolean;
  @Output('onSearch') onSearch: EventEmitter<ModelFilterParams> = new EventEmitter();
  @Output('onClearAllFilter') onClearAllFilter: EventEmitter<boolean> = new EventEmitter();
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  searchKeyword: string;
  categories: any[] = [];
  filters: any[] = [];
  filteredArray: Array<any> = [];
  selectedFilters: Array<any> = [];
  sectionOrder: number;
  selectedCategory: number | null;
  selectedCategoryName: string | null;
  sortyBy: number;
  isFirstLoad: boolean;
  allParams: any[] = [];
  clickedOn: string;
  routerSubscription: ISubscription;
  routeInitSubscription: ISubscription;
  isFilterApplied: boolean;
  token: string;
  pageParams: any;
  catId: number;
  totalItems: number;
  constructor(
    private activateRoutes: ActivatedRoute,
    private apiService: CommonSevice,
    private eleRef: ElementRef,
    private router: Router,
    private winServ: WindowSevice
  ) {
    this.token = this.winServ.getLocalItem('token');
    this.catId = 0;
  }

  clearFilter() {
    let temp = this.router.url.split('?');
    this.clickedOn = null;
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
    this.router.navigateByUrl(urlToRedirect);
  }

  ngOnInit() {
    this.isFirstLoad = false;
    this.setInitialValues();
    this.getCategories();
    this.handleRouteChangeEvent();
    this.activateRoutes.queryParams.subscribe(params => {
      this.searchKeyword = params.search;
      this.sortyBy = params.sort ? params.sort : 1;
      this.selectedCategory = params.category ? params.category : 0;
      this.filteredArray['kit'] = params.kit ? params.kit.split(',') : undefined;
      this.allParams['kit'] = this.filteredArray['kit'];
      this.clickedOn = this.allParams['kit'] ? 'kit' : undefined;
    });
  }
  /**
   *
   */
  clearSearchInput = () => {
    this.searchKeyword = '';
    $('#suggestion-tags').focus();
  };
  ngAfterViewInit() {
    this.eleRef.nativeElement
      .querySelector('#suggestion-tags')
      .addEventListener('change', this.onSearchValueChange.bind(this));
  }
  onSearchValueChange(event) {
    let v = $('#suggestion-tags').val();
    this.searchKeyword = v.toString();
  }
  setInitialValues = () => {
    this.searchKeyword = '';
    this.selectedCategory = 0;
    this.sortyBy = 1;
    this.allParams['kit'] = [];
    this.filteredArray = [];
  };
  getCategories = () => {
    let catId = 0;
    var catSlugT = null;
    this.activateRoutes.queryParams.subscribe((params: Params) => {
      this.pageParams = params;
      let catSlug = params['subcat']
        ? params['subcat']
        : params['category']
        ? params['category']
        : '';
      catSlug = catSlug.split('-');
      catSlugT = catSlug[0] ? catSlug[0] : null;
      catId = catSlug[catSlug.length - 1] ? catSlug[catSlug.length - 1] : 0;
      this.sortyBy = params['sort'] ? params['sort'] : 1;
      this.catId = catId;
    });
    this.apiService.get('webservices/modelFilters', { token: this.token }).subscribe(data => {
      switch (data.status) {
        case 200:
          this.categories = data.data ? data.data.category : [];
          this.filters = data.data ? data.data.filter : [];
          this.totalItems = data.data.totalmodels;
          this.setSelectedCategoryName(catId);
          break;

        default:
          this.categories = [];
          break;
      }
    });
  };
  setSelectedCategoryName = catId => {
    if (catId && catId > 0) {
      for (let i = 0; i < this.categories.length; i++) {
        const cat = this.categories[i];
        if (cat.id.toString() === catId.toString()) {
          this.selectedCategoryName = cat.category_name;
          break;
        } else {
          if (cat.subCategory && cat.subCategory.length > 0) {
            for (let j = 0; j < cat.subCategory.length; j++) {
              const subCat = cat.subCategory[j];
              if (subCat.id.toString() === catId.toString()) {
                this.selectedCategoryName = subCat.category_name;
                break;
              }
            }
          }
        }
      }
    }
  };
  handleRouteChangeEvent = () => {
    this.routeInitSubscription = this.activateRoutes.queryParams.subscribe((params: Params) => {
      this.searchKeyword = params.search;
      this.sortyBy = params.sort ? params.sort : 1;
      this.selectedCategory = params.category ? params.category : 0;
      this.filteredArray['kit'] = params.kit ? params.kit.split(',') : undefined;
      this.allParams['kit'] = this.filteredArray['kit'];
      this.setSelectedCategoryName(params.category);
      this.emitData();
    });
  };
  onSearchModel = () => {
    this.emitData();
  };
  onCategoryChange = (catId: string, index: number | null, subIndex?: number) => {
    this.catId = parseInt(catId);
    if (index > -1) {
      if (subIndex > -1) {
        this.selectedCategory = parseInt(catId);
      }
      this.selectedCategory = parseInt(catId);
    } else {
      this.selectedCategory = null;
    }
    this.emitData();
  };
  sortKits = (sortNumber: number) => {
    this.sortyBy = sortNumber;
    this.emitData();
  };
  clearAllFilter = () => {
    this.setInitialValues();
    this.onClearAllFilter.emit(true);
  };
  setvalueSeprator(section: any) {
    this.sectionOrder = section;
  }
  setNextSection(section: any) {
    this.sectionOrder = section;
  }
  updateFilter(mainIndex: number, subIndex: number) {
    let reqParam = this.filters[mainIndex].reqParam;
    this.clickedOn = reqParam;

    this.filteredArray[reqParam] = this.filteredArray[reqParam] ? this.filteredArray[reqParam] : [];
    this.allParams[reqParam] = this.allParams[reqParam] ? this.allParams[reqParam] : [];
    let indexOfFilter = this.filteredArray[reqParam].indexOf(
      this.filters[mainIndex].data[subIndex].id
    );
    if (indexOfFilter <= -1) {
      this.filteredArray[reqParam].push(this.filters[mainIndex].data[subIndex].id);
      this.allParams[reqParam].push(this.filters[mainIndex].data[subIndex].id);
    } else {
      this.filteredArray[reqParam].splice(indexOfFilter, 1);
      this.allParams[reqParam].splice(indexOfFilter, 1);
    }
    this.emitData();
  }
  emitData = () => {
    const dataToEmit = {};
    if (this.searchKeyword) {
      dataToEmit['search'] = this.searchKeyword;
    }
    if (this.selectedCategory) {
      dataToEmit['category'] = this.selectedCategory;
    }
    if (this.filteredArray && this.filteredArray['kit']) {
      dataToEmit['kit'] = this.filteredArray['kit'].join(',');
    }
    if (this.sortyBy && this.sortyBy != 1) {
      dataToEmit['sort'] = this.sortyBy;
    }
    this.onSearch.emit(dataToEmit);
  };
  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.routeInitSubscription) {
      this.routeInitSubscription.unsubscribe();
    }
  }
  /**
   *
   */
  isSubcatSelected(subCategory = []) {
    return subCategory.findIndex(d => d.id == this.catId) > -1;
  }
}
