import { Component } from '@angular/core';
import { AppSettings } from './../../app.setting';

@Component({
  selector: 'loader',
  templateUrl: './loading.component.html',
  styleUrls: [],
  providers:[]
})
export class LoadingContentComponent {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  SiteUrl = AppSettings.SITE_ENDPOINT;

  constructor(){

  }
}

@Component({
  selector: 'loader-infinite',
  templateUrl: './loading.component-infinite.html',
  styleUrls: [],
  providers:[]
})
export class LoadingInfiniteComponent {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  SiteUrl: string = AppSettings.SITE_ENDPOINT;
  constructor(){}
}