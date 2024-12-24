import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { SupportComponent } from './support/support.component';
const routes: Routes = [
  {
    path: '',
    component: SupportComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [SupportComponent]
})
export class SupportModule { }
