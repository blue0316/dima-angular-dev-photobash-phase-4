import { KitsGridComponent } from './kits-grid/kits-grid.component';
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  KitFilterParams,
  KitsGridFilterComponent
} from './kits-grid-filter/kits-grid-filter.component';
import { ISubscription } from 'rxjs/Subscription';
import { CommonSevice } from '../services/common.service';
import { WindowSevice } from '../services/window.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-kits',
  templateUrl: './kits.component.html',
  styleUrls: ['./kits.component.css']
})
export class KitsComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean;
  kits: any[] = [];
  isLoading: boolean;
  params: KitFilterParams;
  getKitsSubscription: ISubscription;
  public tokenId: string;
  showFilterToggle: boolean;
  @ViewChild(KitsGridFilterComponent) gridFilter: KitsGridFilterComponent;
  @HostListener('touchstart', [])
  @HostListener('window:scroll', [])
  onWindowScroll($event: any) {
    var currentPosition = window.pageYOffset ? window.pageYOffset : 0;
    currentPosition = this.parseInt(currentPosition);
    var eleHeight = this.parseInt($('.pictureView.package-viewchange').height());
    var footerHeight = this.parseInt($('footer').height());
    console.log('====================================');
    console.log(footerHeight, eleHeight);
    console.log('====================================');
  }

  constructor(
    private router: Router,
    private apiService: CommonSevice,
    private winServ: WindowSevice,
    private titleService: Title
  ) {
    this.titleService.setTitle('Kits');
    this.isLoading = true;
    this.tokenId = this.winServ.getLocalItem('token');
  }

  ngOnInit() {
    if (localStorage.getItem('open')) {
      this.showFilterToggle = true;
    }
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
    setTimeout(function() {
      this.gallerForPack();
    }, 0);
  };
  /**
   *
   */
  onCatFilterAdd = data => {
    this.gridFilter.onCategoryChange(data.catId, data.index, data.otherIndex);
  };
  checkLogin = isLoggedIn => {
    this.isLoggedIn = isLoggedIn;
  };
  updateFilter = (params: KitFilterParams) => {
    this.params = params;
    this.isLoading = true;
    this.getKitList(params);
    this.router.navigate(['/kits'], { queryParams: params });
  };
  clearAllFilter = () => {
    this.router.navigate(['/kits']);
  };

  getKitList = (params: any) => {
    this.isLoading = true;
    const token = this.winServ.getLocalItem('token');
    let dataToSend = { ...params };
    if (token) {
      dataToSend['token'] = token;
    }
    if (this.getKitsSubscription) {
      this.getKitsSubscription.unsubscribe();
    }
    // this.tokenId ? params.token = this.tokenId : null;
    this.getKitsSubscription = this.apiService
      .get('webservices/kits', dataToSend)
      .subscribe(data => {
        this.kits = data.data;
        this.isLoading = false;
        setTimeout(function() {
          this.gallerForPack();
        }, 0);
      });
  };
  parseInt(name) {
    return parseInt(name);
  }
  cartPurchased = e => {
    this.isLoading = true;
    this.getKitList(this.params);
  };
  ngOnDestroy() {
    localStorage.removeItem('open');
    if (this.getKitsSubscription) {
      this.getKitsSubscription.unsubscribe();
    }
  }
}
