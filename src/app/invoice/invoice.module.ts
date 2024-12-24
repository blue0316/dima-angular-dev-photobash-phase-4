import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { InvoiceComponent } from './invoices/invoice.component';
const routes: Routes = [
  {
    path: '',
    component: InvoiceComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  declarations: [InvoiceComponent]
})
export class InvoiceModule { }
