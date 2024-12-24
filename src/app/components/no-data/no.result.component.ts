import { Component } from '@angular/core';
import { AppSettings } from './../../app.setting';
@Component({
  selector: 'no-data',
  templateUrl: './no.result.component.html',
  providers: []
})
export class NoDataComponent{
  ImgPath: string = AppSettings.IMG_ENDPOIT;
}
