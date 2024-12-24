import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../app.setting';
import { PackageService } from '../../services/package.service';
import { WindowSevice } from '../../services/window.service';

@Component({
  selector: 'app-kits-grid-view',
  templateUrl: './kits-grid-view.component.html',
  styleUrls: ['./kits-grid-view.component.css']
})
export class KitsGridViewComponent implements OnInit {
  @Input('kitDetails') kitDetails: any;
  @Input('i') i: any;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  loadingImage: boolean;
  isLoggedIn: boolean;

  constructor(
    private winServ: WindowSevice
  ) { this.userLoginCheck(); }



  userLoginCheck() {
    let token = '';
    if (
      this.winServ.isLocalStoragSupported() &&
      this.winServ.getLocalItem('token')
    ) {
      token = this.winServ.getLocalItem('token');
    }
    if (token) {
      let u = JSON.parse(this.winServ.getLocalItem('userData'));
      if (u) {
        this.isLoggedIn = true;
      }
    } else {
      this.isLoggedIn = false;
    }
  }



  ngOnInit() {
  }
  getThumbnailImage = (img): string => {
    try {
      const images = JSON.parse(this.kitDetails.images);
      return images[1] ? images[1] : '/assets/front/img/no-image.jpg';
    } catch (error) {
      return 'no-image.jpg';
    }
  }
}
