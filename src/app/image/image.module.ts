import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ImagesComponent } from './images/images.component';
const routes: Routes = [
  {
    path: '',
    component: ImagesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
  declarations: [ImagesComponent]
})
export class ImageModule {}
