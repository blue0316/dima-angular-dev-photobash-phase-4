import { ModelsGridFilterComponent } from './models-grid-filter/models-grid-filter.component';
import { ModelsGridComponent } from './models-grid/models-grid.component';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonSevice } from '../services/common.service';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { ModelsService } from '../services/models.service';
import { WindowSevice } from '../services/window.service';
import { UpdateService } from '../services/update.service';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.css'],
  providers: [ModelsService]
})
export class ModelsComponent implements OnInit, OnDestroy {
  @ViewChild('modelGrid') modelGrid: ModelsGridComponent;
  isLoggedIn: boolean;
  models: any[] = [];
  isLoading: boolean;
  isLoaded: boolean;
  getModelsSubscription: ISubscription;
  userToken: string;
  showFilterToggle: boolean;
  @ViewChild(ModelsGridFilterComponent) gridFilter: ModelsGridFilterComponent;
  constructor(
    private router: Router,
    // private apiService: CommonSevice,
    private modelsService: ModelsService,
    private eleRef: ElementRef,
    private winServ: WindowSevice,
    private updateServ: UpdateService
  ) {
    this.isLoading = true;
    this.isLoaded = false;
  }

  ngOnInit() {
    if (localStorage.getItem('open')) {
      this.showFilterToggle = true;
    }
  }
  /**
   *
   */
  onCatFilterAdd = data => {
    this.gridFilter.onCategoryChange(data.catId, data.index, data.otherIndex);
  };
  /**
   *
   */
  onFilterUpdate = data => {
    this.gridFilter.updateFilter(data.i, data.j);
  };
  checkLogin = isLoggedIn => {
    this.isLoggedIn = isLoggedIn;
  };
  updateFilter = (params: ModelFilterParams) => {
    // this.isLoading = true;
    this.router.navigate(['/models'], { queryParams: params });
    this.getModelsList(params);
  };
  clearAllFilter = () => {
    this.router.navigate(['/models']);
  };
  getModelsList = (params: any) => {
    this.isLoading = true;
    this.isLoaded = false;
    if (this.getModelsSubscription) {
      this.getModelsSubscription.unsubscribe();
    }
    this.getModelsSubscription = this.modelsService
      .getModelImages(params, this.winServ.getLocalItem('token'))
      .subscribe(data => {
        this.models = data.data;
        this.isLoading = false;
        this.isLoaded = true;
        let _that = this;
        setTimeout(function() {
          this.InitializeGoogleGallary();
          _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
            ele.removeEventListener('click', () => {
              console.log('erer');
            });
            ele.addEventListener('click', _that.onModelView.bind(_that));
          });
        }, 500);
      });
  };
  onModelView = event => {
    this.updateServ.showingModal('yes');
    this.modelGrid.onModelView(event);
  };

  ngOnDestroy() {
    localStorage.removeItem('open');
    if (this.getModelsSubscription) {
      this.getModelsSubscription.unsubscribe();
    }
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
}

export interface ModelFilterParams {
  search?: string;
  category?: number;
  sort?: number;
  kit?: string;
}
