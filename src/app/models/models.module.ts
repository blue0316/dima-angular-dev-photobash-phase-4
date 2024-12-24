import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelsGridComponent } from './models-grid/models-grid.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ModelsGridViewComponent } from './models-grid-view/models-grid-view.component';
import { ModelsGridDetailsComponent } from './models-grid-details/models-grid-details.component';
import { ModelsGridFilterComponent } from './models-grid-filter/models-grid-filter.component';
import { ModelsComponent } from './models.component';
import { CommonSevice } from '../services/common.service';
const routes: Routes = [
  {
    path: '',
    component: ModelsComponent,
  },
];
@NgModule({
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [
    ModelsGridComponent,
    ModelsGridViewComponent,
    ModelsGridDetailsComponent,
    ModelsGridFilterComponent,
    ModelsComponent,
  ],
  providers: [CommonSevice],
})
export class ModelsModule {}
