import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { AppSettings } from '../../app.setting';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';

export interface IFilter {
  categories: Array<any>;
  filters: Array<any>;
  resolution?: Array<any>;
}

@Component({
  selector: 'app-aside-filter',
  templateUrl: './aside-filter.component.html',
  styleUrls: ['./aside-filter.component.css']
})
export class AssideFilterComponent implements OnInit, OnDestroy, AfterViewInit {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  section: number;
  routeSubscription: ISubscription;
  routeChangeSubcripition: ISubscription;
  selectedFilters: any;
  isOpen: boolean[] = [];
  // input values
  @Input() filters: IFilter;
  @Input() totalItems: number;
  @Input() selectedSort: number;
  // event emitters
  @Output() catFilterAdded: EventEmitter<any> = new EventEmitter();
  @Output() filterUpdated: EventEmitter<any> = new EventEmitter();
  @Output() resolutionFilterAdded: EventEmitter<any> = new EventEmitter();
  @Output() clearFilter: EventEmitter<any> = new EventEmitter();
  @Output() updateSortOption: EventEmitter<number> = new EventEmitter();

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}
  /**
   *
   */
  ngOnInit() {
    this.setFilters();
    this.routeChangeSubcripition = this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.setFilters();
      }
    });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.section = 1;
    }, 0);
  }
  /**
   *
   */
  setFilters = () => {
    this.routeSubscription = this.activatedRoute.queryParams.subscribe(param => {
      this.selectedFilters = {
        category: '',
        subcat: '',
        angle: [],
        mlight: [],
        loc: [],
        pack: [],
        kit: [],
        resol: '',
        sort: null
      };
      for (const key in param) {
        if (param.hasOwnProperty(key)) {
          const element = param[key];
          switch (key) {
            case 'category':
              const cat = element.split('-');
              this.selectedFilters[key] = cat[cat.length - 1];
              break;
            case 'subcat':
              const subcat = element.split('-');
              this.selectedFilters[key] = subcat[subcat.length - 1];
              break;
            case 'angle' || 'mlight' || 'loc' || 'pack':
              this.selectedFilters[key] = element.split(',');
              break;
            case 'mlight':
              this.selectedFilters[key] = element.split(',');
              break;
            case 'loc' || 'pack':
              this.selectedFilters[key] = element.split(',');
              break;
            case 'pack':
              this.selectedFilters[key] = element.split(',');
              break;
            case 'kit':
              this.selectedFilters[key] = element.split(',');
              break;
            default:
              this.selectedFilters[key] = element;
              break;
          }
        }
      }
    });
  };
  /**
   *
   */
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.routeChangeSubcripition) {
      this.routeChangeSubcripition.unsubscribe();
    }
  }
  /**
   *
   */
  totalCatImages = (): number => {
    let total: number;
    total = 0;
    if (this.filters && this.filters.categories) {
      this.filters.categories.forEach((cat: any) => {
        total = total + (parseInt(cat.total) || 0);
      });
    }

    return total;
  };
  /**
   *
   */
  newSection = (section: number) => {
    this.section = section;
  };
  /**
   *
   */
  onCatFilterAdded = (catId, index, otherIndex) => {
    this.catFilterAdded.emit({
      catId,
      index,
      otherIndex
    });
  };
  /**
   *
   */
  onFilterUpdate = (i: any, j: any) => {
    this.filterUpdated.emit({
      i,
      j
    });
    console.log(this.filters.filters[i].data[j]);

    this.isOpen[this.filters.filters[i].reqParam] = true;
  };
  /**
   *
   */
  onResolutionFilterAdded = i => {
    this.resolutionFilterAdded.emit(i);
  };
  /**
   *
   */
  onClearFilter = () => {
    this.clearFilter.emit();
  };
  /**
   *
   */
  isFilterSelected = () => {
    const { angle, mlight, loc, pack, kit } = this.selectedFilters;

    return !!angle.length || !!mlight.length || !!loc.length || !!pack.length || !!kit.length;
  };
  /**
   *
   */
  onSort = (option: number) => {
    this.updateSortOption.emit(option);
  };
  /**
   *
   */
  isLoggedIn = (): boolean => {
    return localStorage.getItem('userData') != null;
  };
  /**
   *
   */
  getUserDetails = (): any => {
    try {
      return JSON.parse(localStorage.getItem('userData'));
    } catch (error) {
      return {};
    }
  };
  /**
   *
   */
  getUserPlanDetails = (): any => {
    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      let planDetails = user.user_plan_details;
      return planDetails.facilities || {};
    } catch (error) {
      return {};
    }
  };
}
