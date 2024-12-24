import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home/home.component';
import { ImageModelPuchasesComponent } from './image-model-puchases/image-model-puchases.component';
const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
  declarations: [HomeComponent, ImageModelPuchasesComponent]
})
export class HomeModule {}
