import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { PaymentContentComponent } from './payment/payment.component';
const routes: Routes = [
  {
    path: '',
    component: PaymentContentComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [PaymentContentComponent]
})
export class PaymentModule { }
