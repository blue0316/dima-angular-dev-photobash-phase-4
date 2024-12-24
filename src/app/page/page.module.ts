import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { PageComponentComponent } from './page-component/page-component.component';
const routes: Routes = [
  {
    path: '',
    component: PageComponentComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [PageComponentComponent]
})
export class PageModule { }
