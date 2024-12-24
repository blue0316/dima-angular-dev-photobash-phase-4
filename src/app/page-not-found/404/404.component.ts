import { Component } from '@angular/core';
import { AppSettings } from './../../app.setting';
import { WindowSevice } from './../../services/window.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'not-found',
  templateUrl: './404.component.html',
  providers: [WindowSevice]
})
export class PageNotFoundComponent {
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  showLoginPopup: boolean = false;
  homeClass: boolean = false;
  showSearchBox: boolean = true;
  currentUrl: string; 
  
  constructor(private winServ : WindowSevice, private router: Router, private activeRoute: ActivatedRoute){

  }
  
}
