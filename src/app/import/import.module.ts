import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { VerifyRequestComponent } from './verify-request/verify-request.component';

const routes: Routes = [
  {
    path: '',
    component: VerifyRequestComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [VerifyRequestComponent]
})
export class ImportModule { }
