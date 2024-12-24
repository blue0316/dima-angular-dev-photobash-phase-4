import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { AppSettings } from '../../app.setting';
import { ISubscription } from 'rxjs/Subscription';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { CommonSevice } from '../../services/common.service';

@Component({
  selector: 'app-kits-grid-filter',
  templateUrl: './kits-grid-filter.component.html',
  styleUrls: ['./kits-grid-filter.component.css']
})
export class KitsGridFilterComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output('onSearch') onSearch: EventEmitter<KitFilterParams> = new EventEmitter();
  @Output('onClearAllFilter') onClearAllFilter: EventEmitter<boolean> = new EventEmitter();
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  searchKey: string;
  categories: any[] = [];
  sectionOrder: number;
  selectedCategory: number | null;
  selectedCategoryName: string | null;
  sortyBy: number;
  isFirstLoad: boolean;
  routerSubscription: ISubscription;
  routeInitSubscription: ISubscription;
  selectedFilters: Array<any> = [];
  pageParams: any;
  catId: number;
  totalItems: number;
  constructor(
    private activateRoutes: ActivatedRoute,
    private apiService: CommonSevice,
    private eleRef: ElementRef // private router: Router
  ) {}

  ngOnInit() {
    this.isFirstLoad = false;
    this.setInitialValues();
    this.getCategories();
    this.handleRouteChangeEvent();
    const _that = this;
    setTimeout(function() {
      this.addAutoComplete(3, search => {
        _that.searchKey = search;
        // _that.router.navigate(['/kits'], {
        //   queryParams: {
        //     search
        //   }
        // });
        let url = `/kits?search=${search}`;
        for (const i in this.pageParams) {
          if (this.pageParams.hasOwnProperty(i)) {
            const val = this.pageParams[i];
            url = `${url}&${i}=${val}`;
          }
        }
        location.href = url;
      });
    }, 0);
  }
  ngAfterViewInit() {
    this.eleRef.nativeElement
      .querySelector('#suggestion-tags')
      .addEventListener('change', this.onSearchValueChange.bind(this));
  }
  onSearchValueChange(event) {
    let v = $('#suggestion-tags').val();
    this.searchKey = v.toString();
  }
  setInitialValues = () => {
    this.searchKey = '';
    this.selectedCategory = 0;
    this.sortyBy = 1;
    this.selectedFilters = [];
  };
  getCategories = () => {
    let catId = 0;
    let catSlugT = null;
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

    this.apiService.get('webservices/kitFilters').subscribe(data => {
      switch (data.status) {
        case 200:
          this.categories = data.data ? data.data : [];
          this.totalItems = data.totalKits;
          this.setSelectedCategoryName(catId);
          break;

        default:
          this.categories = [];
          break;
      }
    });
  };
  setSelectedCategoryName = catId => {
    if (catId && catId > -1) {
      for (let i = 0; i < this.categories.length; i++) {
        const cat = this.categories[i];
        if (cat.id.toString() === catId.toString()) {
          this.selectedCategoryName = cat.category_name;
          this.selectedFilters = [];
          this.selectedFilters.push({
            name: cat.category_name,
            type: '1',
            param: 'category',
            id: catId
          });
          break;
        } else {
          if (cat.subCategory && cat.subCategory.length > 0) {
            for (let j = 0; j < cat.subCategory.length; j++) {
              const subCat = cat.subCategory[j];
              if (subCat.id.toString() === catId.toString()) {
                this.selectedCategoryName = subCat.category_name;
                this.selectedFilters = [];
                this.selectedFilters.push({
                  name: subCat.category_name,
                  type: '1',
                  param: 'category',
                  id: catId
                });
                break;
              }
            }
          }
        }
      }
    } else {
      this.selectedCategoryName = 'All Categories';
      this.selectedCategory = null;
      this.selectedFilters = [];
    }
  };

  handleRouteChangeEvent = () => {
    this.routeInitSubscription = this.activateRoutes.queryParams.subscribe((params: Params) => {
      this.pageParams = params;
      // this.searchKey = params.search;
      this.searchKey = params.search ? decodeURIComponent(params.search) : '';
      this.sortyBy = params.sort ? params.sort : 1;
      this.selectedCategory = params.category ? params.category : 0;
      this.setSelectedCategoryName(params.category);
      this.emitData();
    });
  };
  /**
   *
   */
  clearSearchInput = () => {
    this.searchKey = '';
    $('#suggestion-tags').focus();
  };
  onSearchKit = () => {
    this.emitData();
  };
  onCategoryChange = (catId: string, index: number | null, subIndex?: number | null) => {
    this.catId = parseInt(catId);
    if (index !== null && index > -1) {
      if (subIndex !== null && subIndex > -1) {
        this.selectedCategory = parseInt(catId);
        this.selectedFilters = [];
        this.selectedFilters.push({
          name: this.categories[index].subCategory[subIndex].category_name,
          type: '1',
          param: 'category',
          id: catId
        });
      } else {
        this.selectedCategory = parseInt(catId);
        this.selectedFilters = [];
        this.selectedFilters.push({
          name: this.categories[index].category_name,
          type: '1',
          param: 'category',
          id: catId
        });
      }
    } else {
      this.selectedCategoryName = 'All Categories';
      this.selectedCategory = null;
      this.selectedFilters = [];
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

  emitData = () => {
    const dataToEmit = {};
    if (this.searchKey) {
      dataToEmit['search'] = this.searchKey;
    }
    if (this.selectedCategory) {
      dataToEmit['category'] = this.selectedCategory;
    }
    if (this.sortyBy && this.sortyBy != 1) {
      dataToEmit['sort'] = this.sortyBy;
    }
    this.onSearch.emit(dataToEmit);
  };

  removeFilterByClickingCross(filter) {
    this.selectedFilters = [];
    this.selectedCategory = null;
    this.emitData();
  }

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

export interface KitFilterParams {
  search?: string;
  category?: number;
  sort?: number;
}
