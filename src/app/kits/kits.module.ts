import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { KitsGridComponent } from './kits-grid/kits-grid.component';
import { KitsGridViewComponent } from './kits-grid-view/kits-grid-view.component';
import { KitsGridDetailsComponent } from './kits-grid-details/kits-grid-details.component';
import { KitsGridFilterComponent } from './kits-grid-filter/kits-grid-filter.component';
import { KitsComponent } from './kits.component';
import { CommonSevice } from '../services/common.service';
import { PackageService } from '../services/package.service';
import { WindowSevice } from '../services/window.service';
import { CartService } from '../services/cart.service';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { KitService } from '../services/kit.service';
import { SlickModule } from 'ngx-slick';

const routes: Routes = [
  {
    path: '',
    component: KitsComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CarouselModule,
    SlickModule.forRoot(),
    RouterModule.forChild(routes),
  ],
  declarations: [KitsGridComponent, KitsGridViewComponent, KitsGridDetailsComponent, KitsGridFilterComponent, KitsComponent],
  providers: [CommonSevice, PackageService, WindowSevice, CartService, KitService]
})
export class KitsModule { }
