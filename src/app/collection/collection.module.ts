import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { CollectionsComponent } from './collections/collections.component';
import { ModelService } from '../services/model.service';
import { CommonSevice } from '../services/common.service';
const routes: Routes = [
  {
    path: '',
    component: CollectionsComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [CollectionsComponent],
  providers: [ModelService, CommonSevice]
})
export class CollectionModule {
  constructor() { }
 }