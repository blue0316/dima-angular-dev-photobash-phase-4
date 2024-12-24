import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { DetailsComponent } from './details/details.component';
import { DownloadComponent } from './download/download.component';
import { SlickModule } from 'ngx-slick';

const routes: Routes = [
  {
    path: '',
    component: DetailsComponent
  },
  {
    path: 'download',
    component: DownloadComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    SlickModule.forRoot()
  ],
  declarations: [DetailsComponent, DownloadComponent]
})
export class PurchasesModule { }