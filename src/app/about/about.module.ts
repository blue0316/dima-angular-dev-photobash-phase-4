import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: '',
    component: AboutComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [AboutComponent]
})
export class AboutModule { }
