import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PackageComponent } from './package/package.component';
import { SinglePackageComponent } from './package/single/single.package.component';

const routes: Routes = [
  {
    path: '',
    component: PackageComponent
  },
  {
    path: ':packId',
    component: SinglePackageComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
  declarations: [PackageComponent, SinglePackageComponent]
})
export class PackageModule {
  constructor() {}
}
