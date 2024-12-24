import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { EncryptionService } from './encryption.service';
import { AppSettings } from '../app.setting';

@Injectable()
export class AuthService {

  public isAuthenticated = new BehaviorSubject<boolean>(false); // auth listner
  public sitePasswd: string = AppSettings.SITE_PASSWORD;

  constructor(
    private cookieService: CookieService,
    private encService: EncryptionService,
  ) { }


  updateAuthenticationStatus() {
    const encryptedToken = this.cookieService.get('siteAuthToken');
    if (encryptedToken) {
      const decToken = this.encService.decryptString(encryptedToken);
      if (decToken === this.sitePasswd) {
        this.cookieService.set('siteAuthToken', encryptedToken, new Date(new Date().setMinutes(new Date().getMinutes() + 30)));
        this.isAuthenticated.next(true);
      } else {
        this.cookieService.delete('siteAuthToken');
        this.isAuthenticated.next(false);
      }
    } else {
      this.cookieService.delete('siteAuthToken');
      this.isAuthenticated.next(false);
    }
  }

  

}
