import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { SubscriptionComponent } from './subcription/subcription.component';
const routes: Routes = [
  {
    path: '',
    component: SubscriptionComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [SubscriptionComponent]
})
export class SubscriptionModule { }
