import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { PageNotFoundComponent } from './404/404.component';
const routes: Routes = [
  {
    path: '',
    component: PageNotFoundComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [PageNotFoundComponent]
})
export class PageNotFoundModule { }
