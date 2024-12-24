import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { SiteAuthComponent } from './site-auth/site-auth.component';
import { CommonSevice } from '../services/common.service';

const routes: Routes = [
  {
    path: '',
    component: SiteAuthComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    SharedModule
  ],
  declarations: [SiteAuthComponent],
  providers:[ CommonSevice ]
})
export class SiteAuthModule { }
